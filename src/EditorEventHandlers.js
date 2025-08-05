// src/EditorEventHandlers.js - ENHANCED: Selection & Delete System + ECONOMY + SEAT PREVIEW + MANUAL SAVE
import { THREE } from './three.js';
import { StadiumBuilder } from './StadiumBuilder.js';

export class EditorEventHandlers {
  constructor(
    renderer, 
    camera, 
    stadiumManager, 
    cameraController,
    gameStateManager
  ) {
    this.renderer = renderer;
    this.camera = camera;
    this.stadiumManager = stadiumManager;
    this.cameraController = cameraController;
    this.gameStateManager = gameStateManager;
    
    // Bind methods
    this.handleEditorClick = this.handleEditorClick.bind(this);
    this.handleEditorWheel = this.handleEditorWheel.bind(this);
    this.handleEditorKeyPress = this.handleEditorKeyPress.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    
    // 🆕 Helper methods for object selection
    this.selectObject = this.selectObject.bind(this);
    this.deleteSelectedObject = this.deleteSelectedObject.bind(this);
    this.findClickedObject = this.findClickedObject.bind(this);
    
    // 💰 NOVÉ: Economy helper methods
    this.canAffordObject = this.canAffordObject.bind(this);
    this.purchaseObject = this.purchaseObject.bind(this);
    this.refundObject = this.refundObject.bind(this);
  }

  setupEventListeners() {
    this.renderer.domElement.addEventListener('mousedown', this.handleEditorClick);
    this.renderer.domElement.addEventListener('wheel', this.handleEditorWheel, { passive: false });
    window.addEventListener('keydown', this.handleEditorKeyPress);
    window.addEventListener('mousemove', this.handleMouseMove);
  }

  removeEventListeners() {
    this.renderer.domElement.removeEventListener('mousedown', this.handleEditorClick);
    this.renderer.domElement.removeEventListener('wheel', this.handleEditorWheel);
    window.removeEventListener('keydown', this.handleEditorKeyPress);
    window.removeEventListener('mousemove', this.handleMouseMove);
  }

  // 💰 NOVÉ: Zkontroluj jestli má hráč dost peněz
  canAffordObject(elementInfo) {
    if (!elementInfo || !elementInfo.price) return true; // Pokud nemá cenu, je zdarma
    
    const playerData = window.playerData;
    if (!playerData) {
      return false;
    }
    
    if (elementInfo.currency === 'coins') {
      return playerData.coins >= elementInfo.price;
    } else if (elementInfo.currency === 'gems') {
      return playerData.gems >= elementInfo.price;
    }
    
    return false;
  }

  // 💰 NOVÉ: Zaplať za objekt
  purchaseObject(elementInfo) {
    if (!elementInfo || !elementInfo.price) return true;
    
    const playerData = window.playerData;
    if (!playerData) return false;
    
    let success = false;
    
    if (elementInfo.currency === 'coins') {
      success = playerData.spendCoins(elementInfo.price, `Stadium: ${elementInfo.name}`);
    } else if (elementInfo.currency === 'gems') {
      success = playerData.spendGems(elementInfo.price, `Stadium: ${elementInfo.name}`);
    }
    
    if (success) {
      // 💰 Zobraz zprávu o nákupu
      // Trigger vizuální feedback
      if (window.gameMessageSystem) {
        window.gameMessageSystem.showMessage(
          `🏗️ Postaveno: ${elementInfo.name}`, 
          'success', 
          `-${elementInfo.price} ${elementInfo.currency === 'coins' ? '🪙' : '💎'}`
        );
      }
    } else {
      // Zobraz zprávu o nedostatku peněz
      if (window.gameMessageSystem) {
        window.gameMessageSystem.showMessage(
          `Nedostatek ${elementInfo.currency === 'coins' ? 'mincí' : 'gemů'}!`, 
          'error',
          `Potřebuješ: ${elementInfo.price} ${elementInfo.currency === 'coins' ? '🪙' : '💎'}`
        );
      }
    }
    
    return success;
  }

  // 💰 NOVÉ: Vrať peníze za objekt (100% refund)
  refundObject(stadiumElement) {
    if (!stadiumElement.purchasePrice || !stadiumElement.purchaseCurrency) {
      return; // Objekt byl postaven před zavedením cen
    }
    
    const playerData = window.playerData;
    if (!playerData) return;
    
    if (stadiumElement.purchaseCurrency === 'coins') {
      playerData.addCoins(stadiumElement.purchasePrice, `Refund: ${stadiumElement.type}`);
      
      if (window.gameMessageSystem) {
        window.gameMessageSystem.showMessage(
          `🔄 Vráceno za ${stadiumElement.type}`, 
          'info',
          `+${stadiumElement.purchasePrice} 🪙`
        );
      }
    } else if (stadiumElement.purchaseCurrency === 'gems') {
      playerData.addGems(stadiumElement.purchasePrice, `Refund: ${stadiumElement.type}`);
      
      if (window.gameMessageSystem) {
        window.gameMessageSystem.showMessage(
          `🔄 Vráceno za ${stadiumElement.type}`, 
          'info',
          `+${stadiumElement.purchasePrice} 💎`
        );
      }
    }
  }

  // 🆕 NOVÁ FUNKCE: Find clicked object from all stadium elements
  findClickedObject(intersects, stadiumElements) {
    if (intersects.length === 0) return null;
    
    // Projdi všechny stadium elements a najdi ten, na který se kliknulo
    for (const element of stadiumElements) {
      if (element.mesh && this.isObjectInIntersects(element.mesh, intersects)) {
        return element;
      }
    }
    return null;
  }

  // 🆕 HELPER: Check if object mesh is in intersects
  isObjectInIntersects(mesh, intersects) {
    for (const intersect of intersects) {
      if (intersect.object === mesh || 
          intersect.object.parent === mesh || 
          mesh.children.includes(intersect.object.parent) ||
          mesh.children.includes(intersect.object)) {
        return true;
      }
    }
    return false;
  }

  // 🆕 NOVÁ FUNKCE: Select object and highlight it
  selectObject(element) {
    const { setSelectedObject } = this.gameStateManager.getState();
    
    if (element) {
      setSelectedObject(element);
      this.stadiumManager.createSelectionOutline(element);
    } else {
      setSelectedObject(null);
      this.stadiumManager.clearSelectionOutline();
    }
  }

  // 🆕 UPDATED: Delete selected object WITH REFUND
  deleteSelectedObject() {
    const { selectedObject, setSelectedObject, stadiumElements, setStadiumElements } = this.gameStateManager.getState();
    
    if (!selectedObject) {
      return false;
    }
    
    // 💰 NOVÉ: Vrať peníze za objekt
    this.refundObject(selectedObject);
    
    // Remove from scene
    if (selectedObject.mesh && this.stadiumManager.scene.children.includes(selectedObject.mesh)) {
      this.stadiumManager.scene.remove(selectedObject.mesh);
    }
    
    // 🔥 OPRAVA: Remove from stadium elements A update PlayerDataManager
    setStadiumElements(prev => {
      const updatedElements = prev.filter(el => el.id !== selectedObject.id);
      
      // 🔥 DŮLEŽITÉ: Aktualizuj PlayerDataManager při mazání
      if (window.playerDataManager?.stadiumManager) {
        window.playerDataManager.stadiumManager.updateStadiumElements(updatedElements);
      }
      
      return updatedElements;
    });
    
    // Clear selection
    setSelectedObject(null);
    this.stadiumManager.clearSelectionOutline();
    
    return true;
  }

  handleEditorClick(event) {
    const { 
      gameState, 
      editMode, 
      selectedTool, 
      placementMode, 
      seatDetailMode, 
      selectedStairs, 
      stadiumElements, 
      setStadiumElements, 
      setSelectedObject, 
      setSeatDetailMode, 
      setSelectedStairs, 
      setOriginalCameraPosition,
      setUserControlledCamera
    } = this.gameStateManager.getState();
    
    if (gameState !== 'editor') return;
    
    // Pouze levé tlačítko myši (button 0)
    if (event.button !== 0) return;
    
    const rect = this.renderer.domElement.getBoundingClientRect();
    const mouse = new THREE.Vector2();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, this.camera);

    // 🆕 VYLEPŠENO: Universal object selection for ALL modes
    const allObjects = stadiumElements.map(el => el.mesh).filter(mesh => mesh);
    const allIntersects = raycaster.intersectObjects(allObjects, true);
    
    if (editMode === 'select') {
      // PŮVODNÍ LOGIKA pro select mode
      const clickedElement = this.findClickedObject(allIntersects, stadiumElements);
      this.selectObject(clickedElement);
      
    } else if (editMode === 'seat') {
      if (!seatDetailMode) {
        // 🔥 PRVNÍ FÁZE: Výběr schodů pro detail + selection highlight
        const stairObjects = stadiumElements
          .filter(el => el.type === 'concrete_stairs')
          .map(el => el.mesh)
          .filter(mesh => mesh);
          
        const stairIntersects = raycaster.intersectObjects(stairObjects, true);
        
        if (stairIntersects.length > 0) {
          // Najdi schody
          let targetStairs = null;
          for (const element of stadiumElements) {
            if (element.type === 'concrete_stairs' && element.mesh && 
                this.isObjectInIntersects(element.mesh, stairIntersects)) {
              targetStairs = element;
              break;
            }
          }
          
          if (targetStairs) {
            // 🆕 HIGHLIGHT selected stairs
            this.selectObject(targetStairs);
            
            // User controlled camera
            setUserControlledCamera(true);
            
            // Ulož původní pozici kamery
            setOriginalCameraPosition({
              x: this.camera.position.x,
              y: this.camera.position.y,
              z: this.camera.position.z,
              lookAtX: 0,
              lookAtY: 0,
              lookAtZ: 0
            });
            
            // Nastav vybrané schody a přepni do detailního režimu
            setSelectedStairs(targetStairs);
            setSeatDetailMode(true);
            
            setUserControlledCamera(true);
            
            // Přiblíž kameru ke schodům
            this.cameraController.focusOnObject(targetStairs, 2.5, 2, this.gameStateManager);
            this.cameraController.setDetailMode(true);
            
            setTimeout(() => {
              setUserControlledCamera(true);
            }, 10);
          }
        } else {
          // 🆕 NOVÉ: Click na jiný objekt = select ho (i v seat mode)
          const clickedElement = this.findClickedObject(allIntersects, stadiumElements);
          if (clickedElement && clickedElement.type !== 'concrete_stairs') {
            this.selectObject(clickedElement);
          } else {
            this.selectObject(null); // Clear selection
          }
        }
      } else {
        // 🔥 DRUHÁ FÁZE: Přidávání sedaček na vybrané schody
        if (selectedStairs && selectedStairs.mesh) {
          const stairIntersects = raycaster.intersectObjects([selectedStairs.mesh], true);
          
          if (stairIntersects.length > 0) {
            setUserControlledCamera(true);
            
            // 🪑 OPRAVA: Získej aktuální seatOptions přímo ze state místo přes neexistující metodu
            const { seatOptions } = this.gameStateManager.getState();
            
            // 💰 NOVÉ: Zkontroluj cenu sedačky
            const seatPrices = StadiumBuilder.getSeatPrices();
            const seatPrice = seatPrices[seatOptions.type];
            
            if (seatPrice && this.canAffordObject(seatPrice)) {
              // Má dost peněz - přidej sedačku a zaplať
              if (this.purchaseObject({ ...seatPrice, name: seatPrice.name })) {
                this.stadiumManager.addSeatsToStairs(
                  selectedStairs, 
                  stairIntersects[0].point, 
                  seatOptions, // 🪑 PŘEDEJ PLNÉ seatOptions!
                  stadiumElements, 
                  (newElements) => {
                    // 💰 Ulož cenu k sedačkám pro refund
                    const updatedElements = newElements(stadiumElements);
                    const newSeats = updatedElements.slice(-1); // Poslední přidané sedačky
                    newSeats.forEach(seat => {
                      seat.purchasePrice = seatPrice.price;
                      seat.purchaseCurrency = seatPrice.currency;
                    });
                    setStadiumElements(updatedElements);
                    
                    // 🔥 DŮLEŽITÉ: Aktualizuj PlayerDataManager po přidání sedaček
                    if (window.playerDataManager?.stadiumManager) {
                      window.playerDataManager.stadiumManager.updateStadiumElements(updatedElements);
                    }
                  }
                );
              }
            } else {
              // Nemá dost peněz
              if (window.gameMessageSystem) {
                window.gameMessageSystem.showMessage(
                  `Nemůžeš si dovolit ${seatPrice.name}!`, 
                  'error',
                  `Potřebuješ: ${seatPrice.price} ${seatPrice.currency === 'coins' ? '🪙' : '💎'}`
                );
              }
            }
          }
        }
      }
    } else if (editMode === 'place' && placementMode && this.stadiumManager.previewObject) {
      // 💰 UPDATED: Kontrola peněz před umístěním
      const availableElements = StadiumBuilder.getAvailableElements();
      const elementInfo = availableElements.find(el => el.id === selectedTool);
      
      if (elementInfo) {
        // Zkontroluj jestli má dost peněz
        if (!this.canAffordObject(elementInfo)) {
          if (window.gameMessageSystem) {
            window.gameMessageSystem.showMessage(
              `Nemůžeš si dovolit ${elementInfo.name}!`, 
              'error',
              `Potřebuješ: ${elementInfo.price} ${elementInfo.currency === 'coins' ? '🪙' : '💎'}`
            );
          }
          return; // Zastav umístění
        }
        
        // Pokus se koupit objekt
        if (this.purchaseObject(elementInfo)) {
          // Platba proběhla úspěšně - umísti objekt
          const newElement = this.stadiumManager.placeObjectFromPreview(selectedTool, stadiumElements);
          if (newElement) {
            // 💰 Ulož cenu do objektu pro pozdější refund
            newElement.purchasePrice = elementInfo.price;
            newElement.purchaseCurrency = elementInfo.currency;
            
            // 🔥 OPRAVA: Update stadium elements A update PlayerDataManager
            setStadiumElements(prev => {
              const updatedElements = [...prev, newElement];
              
              // 🔥 DŮLEŽITÉ: Aktualizuj PlayerDataManager
              if (window.playerDataManager?.stadiumManager) {
                window.playerDataManager.stadiumManager.updateStadiumElements(updatedElements);
              }
              
              return updatedElements;
            });
            
            // 🆕 AUTO-SELECT newly placed object
            this.selectObject(newElement);
          } else {
            // Objekt se nepodařilo umístit - vrať peníze
            this.refundObject({
              purchasePrice: elementInfo.price,
              purchaseCurrency: elementInfo.currency,
              type: elementInfo.name
            });
          }
        }
      } else {
        // Objekt bez ceny - umísti zdarma
        const newElement = this.stadiumManager.placeObjectFromPreview(selectedTool, stadiumElements);
        if (newElement) {
          setStadiumElements(prev => {
            const updatedElements = [...prev, newElement];
            
            // 🔥 DŮLEŽITÉ: Aktualizuj PlayerDataManager i pro free objekty
            if (window.playerDataManager?.stadiumManager) {
              window.playerDataManager.stadiumManager.updateStadiumElements(updatedElements);
            }
            
            return updatedElements;
          });
          this.selectObject(newElement);
        }
      }
    } else {
      // 🆕 NOVÉ: Ve všech ostatních případech - try to select clicked object
      const clickedElement = this.findClickedObject(allIntersects, stadiumElements);
      this.selectObject(clickedElement);
    }
  }

  handleEditorWheel(event) {
    const { gameState, editMode, placementMode } = this.gameStateManager.getState();
    
    if (gameState !== 'editor' || editMode !== 'place' || !placementMode || !this.stadiumManager.previewObject) return;
    
    event.preventDefault();
    
    const rotationStep = Math.PI / 8; // 22.5 stupňů na jeden krok
    const deltaRotation = event.deltaY > 0 ? rotationStep : -rotationStep;
    
    const newRotation = this.stadiumManager.rotatePreviewObject(deltaRotation);
    this.gameStateManager.updatePreviewRotation(newRotation);
  }

  handleEditorKeyPress(event) {
    const { 
      gameState, 
      editMode, 
      placementMode, 
      seatDetailMode, 
      selectedObject, 
      setSelectedObject, 
      stadiumElements, 
      setStadiumElements,
      exitSeatDetailMode,
      resetCameraControl
    } = this.gameStateManager.getState();
    
    if (gameState !== 'editor') return;
    
    // 💾 NOVÉ: Ctrl+S nebo Cmd+S pro uložení stadionu
    if ((event.ctrlKey || event.metaKey) && event.code === 'KeyS') {
      event.preventDefault(); // Zabraň defaultnímu chování prohlížeče
      
      const playerData = window.playerDataManager;
      if (playerData?.stadiumManager) {
        playerData.stadiumManager.saveStadium();
        
        // Zobraz zprávu o uložení
        if (window.gameMessageSystem) {
          window.gameMessageSystem.showMessage(
            '💾 Stadion uložen!', 
            'success',
            `${stadiumElements.length} objektů uloženo`
          );
        }
      } else {
        if (window.gameMessageSystem) {
          window.gameMessageSystem.showMessage(
            '❌ Chyba při ukládání!', 
            'error'
          );
        }
      }
      return;
    }
    
    // 🆕 UNIVERZÁLNÍ DELETE klávesa pro všechny režimy!
    if (event.code === 'Delete' || event.code === 'Backspace') {
      this.deleteSelectedObject();
      event.preventDefault();
      return;
    }
    
    // ESC v detailním režimu sedaček
    if (event.code === 'Escape' && editMode === 'seat' && seatDetailMode) {
      this.cameraController.setDetailMode(false);
      // 🪑 NOVÉ: Vymaž seat preview při výstupu
      this.stadiumManager.clearSeatPreview();
      exitSeatDetailMode();
      event.preventDefault();
      return;
    }
    
    // Otáčení preview objektu šipkami Q/E
    if (editMode === 'place' && placementMode && this.stadiumManager.previewObject) {
      const rotationStep = Math.PI / 8; // 22.5 stupňů
      
      switch (event.code) {
        case 'KeyQ': // Otáčení vlevo
          {
            const newRotation = this.stadiumManager.rotatePreviewObject(-rotationStep);
            this.gameStateManager.updatePreviewRotation(newRotation);
            event.preventDefault();
            return;
          }
        case 'KeyE': // Otáčení vpravo
          {
            const newRotation = this.stadiumManager.rotatePreviewObject(rotationStep);
            this.gameStateManager.updatePreviewRotation(newRotation);
            event.preventDefault();
            return;
          }
      }
    }
    
    // 🆕 VYLEPŠENO: Pokud je vybraný JAKÝKOLI objekt (ne jen v select mode)
    if (selectedObject) {
      const step = event.shiftKey ? 0.1 : 0.5; // Jemné/hrubé pohyby
      let moved = false;
      
      switch (event.code) {
        case 'KeyR': // Otáčení
          selectedObject.rotation = (selectedObject.rotation || 0) + Math.PI / 4;
          selectedObject.mesh.rotation.y = selectedObject.rotation;
          moved = true;
          break;
        case 'ArrowUp': // Pohyb vpřed
          selectedObject.position.z -= step;
          selectedObject.mesh.position.z = selectedObject.position.z;
          moved = true;
          break;
        case 'ArrowDown': // Pohyb vzad
          selectedObject.position.z += step;
          selectedObject.mesh.position.z = selectedObject.position.z;
          moved = true;
          break;
        case 'ArrowLeft': // Pohyb vlevo
          selectedObject.position.x -= step;
          selectedObject.mesh.position.x = selectedObject.position.x;
          moved = true;
          break;
        case 'ArrowRight': // Pohyb vpravo
          selectedObject.position.x += step;
          selectedObject.mesh.position.x = selectedObject.position.x;
          moved = true;
          break;
      }
      
      if (moved) {
        event.preventDefault();
        // Aktualizuj outline
        if (selectedObject.mesh) {
          this.stadiumManager.updateSelectionOutline(selectedObject);
        }
      }
    }
  }

  handleMouseMove(event) {
    const { 
      gameState, 
      editMode, 
      placementMode, 
      seatDetailMode, 
      selectedTool, 
      selectedStairs,
      stadiumElements,
      setPreviewPosition,
      setIsValidPlacement
    } = this.gameStateManager.getState();
    
    // Logika preview objektu v editoru (pouze pokud nejsme v detailním režimu sedaček)
    if (gameState === 'editor' && editMode === 'place' && placementMode && !seatDetailMode) {
      const rect = this.renderer.domElement.getBoundingClientRect();
      const mouseScreen = new THREE.Vector2();
      mouseScreen.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseScreen.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      
      // Pokud preview objekt neexistuje, vytvoř ho na pozici myši
      if (!this.stadiumManager.previewObject) {
        const result = this.stadiumManager.createPreviewAtMousePosition(mouseScreen, this.camera, selectedTool, stadiumElements);
        if (result) {
          setPreviewPosition(result.position);
          setIsValidPlacement(result.isValid);
        }
      } else {
        // Aktualizuj pozici existujícího preview objektu
        const result = this.stadiumManager.updatePreviewPosition(mouseScreen, this.camera, stadiumElements);
        if (result) {
          setPreviewPosition(result.position);
          setIsValidPlacement(result.isValid);
        }
      }
    }
    
    // 🪑 NOVÁ LOGIKA: Preview sedaček v detailním režimu
    if (gameState === 'editor' && editMode === 'seat' && seatDetailMode && selectedStairs) {
      const rect = this.renderer.domElement.getBoundingClientRect();
      const mouseScreen = new THREE.Vector2();
      mouseScreen.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseScreen.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      
      // 🪑 OPRAVA: Získej aktuální seatOptions přímo ze state
      const { seatOptions } = this.gameStateManager.getState();
      
      // Aktualizuj preview sedačky
      const seatPreviewResult = this.stadiumManager.updateSeatPreviewAtMousePosition(
        mouseScreen, 
        this.camera, 
        selectedStairs, 
        seatOptions
      );
    }
  }

  dispose() {
    this.removeEventListeners();
  }
}