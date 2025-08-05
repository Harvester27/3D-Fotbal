// src/StadiumManager/StadiumManagerPreview.js - 🎯 PREVIEW SYSTEM
import { THREE } from '../three.js';
import { StadiumBuilder } from '../StadiumBuilder.js';

export class StadiumManagerPreview {
  constructor(stadiumManager) {
    this.stadiumManager = stadiumManager;
  }

  // 🌍 Funkce pro vytvoření preview objektu (stadium + terrain)
  createPreviewObject(toolType) {
    if (!toolType) return null;
    
    const previewObj = StadiumBuilder.createElement(toolType, { x: 0, y: 0, z: 0 });
    if (!previewObj) return null;
    
    // Nastav průhlednost a základní barvu pro všechny materiály
    previewObj.traverse((child) => {
      if (child.isMesh && child.material) {
        if (Array.isArray(child.material)) {
          child.material = child.material.map(mat => {
            const newMat = mat.clone();
            newMat.transparent = true;
            newMat.opacity = 0.6;
            newMat.color.setHex(0x00ff00); // Začni se zelenou
            return newMat;
          });
        } else {
          child.material = child.material.clone();
          child.material.transparent = true;
          child.material.opacity = 0.6;
          child.material.color.setHex(0x00ff00); // Začni se zelenou
        }
      }
    });
    
    return previewObj;
  }

  // Funkce pro aktualizaci barvy preview podle validity
  updatePreviewColor(previewObj, isValid) {
    if (!previewObj) return;
    
    const color = isValid ? 0x00ff00 : 0xff0000; // Zelená/Červená
    
    previewObj.traverse((child) => {
      if (child.isMesh && child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach(mat => {
            mat.color.setHex(color);
          });
        } else {
          child.material.color.setHex(color);
        }
      }
    });
  }

  // Funkce pro otáčení preview objektu
  rotatePreviewObject(deltaRotation) {
    if (!this.stadiumManager.previewObject) return;
    
    // Aktualizuj rotaci
    this.stadiumManager.previewRotation += deltaRotation;
    
    // Aplikuj rotaci přímo na Three.js objekt
    this.stadiumManager.previewObject.rotation.y = this.stadiumManager.previewRotation;
    
    console.log(`Preview rotace: ${(this.stadiumManager.previewRotation * 180 / Math.PI).toFixed(0)}°`);
    
    return this.stadiumManager.previewRotation;
  }

  // 🌍 Vytvoření preview objektu na pozici myši (rozšířený grid)
  createPreviewAtMousePosition(mouseScreen, camera, toolType, stadiumElements) {
    if (!toolType) return false;
    
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouseScreen, camera);
    
    const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const intersection = new THREE.Vector3();
    raycaster.ray.intersectPlane(groundPlane, intersection);
    
    if (intersection) {
      // 🌲 RŮZNÉ GRID SIZE podle typu objektu
      let gridSize = this._getGridSizeForElementType(toolType);
      
      // Snap k mřížce
      intersection.x = Math.round(intersection.x / gridSize) * gridSize;
      intersection.z = Math.round(intersection.z / gridSize) * gridSize;
      intersection.y = 0.1; // Trochu nad zemí
      
      // 🎨 Pro terrain brushes, vytvoř preview s akumulovanou výškou
      const terrainPaintingTypes = ['terrain_raise', 'terrain_lower', 'terrain_raise_large', 'terrain_lower_large', 'terrain_flatten', 'terrain_smooth'];
      
      if (terrainPaintingTypes.includes(toolType)) {
        const currentHeight = this.stadiumManager.terrain.getCurrentHeight(intersection, gridSize);
        const heightChange = this.stadiumManager.terrain.getHeightChange(toolType);
        
        const newPreviewObj = this.stadiumManager.terrain.createAccumulatedTerrain(intersection, 
          toolType === 'terrain_flatten' ? 0 : currentHeight + heightChange, toolType);
        
        // Make it transparent for preview
        newPreviewObj.traverse((child) => {
          if (child.isMesh && child.material) {
            child.material = child.material.clone();
            child.material.transparent = true;
            child.material.opacity = 0.6;
          }
        });
        
        newPreviewObj.userData.elementType = toolType;
        this.stadiumManager.scene.add(newPreviewObj);
        this.stadiumManager.previewObject = newPreviewObj;
        
        // Store height info for UI
        this.stadiumManager.currentHeightPreview = currentHeight;
        this.stadiumManager.previewHeightChange = heightChange;
        
        // Zkontroluj validitu
        const valid = this.stadiumManager.validation.isValidPosition(intersection, stadiumElements, toolType);
        this.updatePreviewColor(newPreviewObj, valid);
        
        console.log(`🎨 Terrain brush preview created: ${toolType} at (${intersection.x}, ${intersection.z}), current: ${currentHeight}m, change: ${heightChange}m`);
        return { 
          position: intersection.clone(), 
          isValid: valid,
          currentHeight: currentHeight,
          heightChange: heightChange,
          finalHeight: toolType === 'terrain_flatten' ? 0 : currentHeight + heightChange
        };
      } else {
        // Původní logika pro non-terrain objekty
        const newPreviewObj = this.createPreviewObject(toolType);
        if (newPreviewObj) {
          newPreviewObj.position.copy(intersection);
          newPreviewObj.rotation.y = this.stadiumManager.previewRotation;
          newPreviewObj.userData = { elementType: toolType };
          this.stadiumManager.scene.add(newPreviewObj);
          this.stadiumManager.previewObject = newPreviewObj;
          
          // Zkontroluj validitu a aktualizuj barvu
          const valid = this.stadiumManager.validation.isValidPosition(intersection, stadiumElements, toolType);
          this.updatePreviewColor(newPreviewObj, valid);
          
          console.log(`Preview objekt vytvořen na pozici myši: ${toolType} (grid: ${gridSize}m)`);
          return { position: intersection.clone(), isValid: valid };
        }
      }
    }
    return false;
  }

  // 🌍 Aktualizace pozice preview objektu (rozšířený grid)
  updatePreviewPosition(mouseScreen, camera, stadiumElements) {
    if (!this.stadiumManager.previewObject) return null;
    
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouseScreen, camera);
    
    const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const intersection = new THREE.Vector3();
    raycaster.ray.intersectPlane(groundPlane, intersection);
    
    if (intersection) {
      // 🌲 RŮZNÉ GRID SIZE podle typu objektu - zjisti typ z preview objektu
      const toolType = this.stadiumManager.previewObject.userData?.elementType;
      let gridSize = this._getGridSizeForElementType(toolType);
      
      // Snap k mřížce
      intersection.x = Math.round(intersection.x / gridSize) * gridSize;
      intersection.z = Math.round(intersection.z / gridSize) * gridSize;
      intersection.y = 0.1; // Trochu nad zemí
      
      // 🎨 Pro terrain brushes, aktualizuj preview s akumulovanou výškou
      const terrainPaintingTypes = ['terrain_raise', 'terrain_lower', 'terrain_raise_large', 'terrain_lower_large', 'terrain_flatten', 'terrain_smooth'];
      
      if (terrainPaintingTypes.includes(toolType)) {
        const currentHeight = this.stadiumManager.terrain.getCurrentHeight(intersection, gridSize);
        const heightChange = this.stadiumManager.terrain.getHeightChange(toolType);
        
        // Update preview position
        this.stadiumManager.previewObject.position.copy(intersection);
        
        // Update preview geometry to show accumulated height
        this.stadiumManager.terrain.updatePreviewWithAccumulatedHeight(this.stadiumManager.previewObject, currentHeight, heightChange, toolType);
        
        // Store for UI feedback
        this.stadiumManager.currentHeightPreview = currentHeight;
        this.stadiumManager.previewHeightChange = heightChange;
        
        // Zkontroluj validitu
        const valid = this.stadiumManager.validation.isValidPosition(intersection, stadiumElements, toolType);
        this.updatePreviewColor(this.stadiumManager.previewObject, valid);
        
        return { 
          position: intersection.clone(), 
          isValid: valid,
          currentHeight: currentHeight,
          heightChange: heightChange,
          finalHeight: toolType === 'terrain_flatten' ? 0 : currentHeight + heightChange
        };
      } else {
        // Původní logika pro non-terrain objekty
        // Aktualizuj pozici preview objektu BEZ změny rotace
        this.stadiumManager.previewObject.position.copy(intersection);
        
        // Zkontroluj validitu a aktualizuj barvu
        const valid = this.stadiumManager.validation.isValidPosition(intersection, stadiumElements, this.stadiumManager.previewObject.userData?.elementType);
        this.updatePreviewColor(this.stadiumManager.previewObject, valid);
        
        return { position: intersection.clone(), isValid: valid };
      }
    }
    
    return null;
  }

  // 🎨 Umístění objektu z preview s additivním terrain painting
  placeObjectFromPreview(selectedTool, stadiumElements) {
    if (!this.stadiumManager.previewObject || !selectedTool) return null;
    
    const actualPosition = this.stadiumManager.previewObject.position.clone();
    
    // 🎨 Speciální handling pro terrain brushes
    const terrainPaintingTypes = ['terrain_raise', 'terrain_lower', 'terrain_raise_large', 'terrain_lower_large', 'terrain_flatten', 'terrain_smooth'];
    
    if (terrainPaintingTypes.includes(selectedTool)) {
      const gridKey = this.stadiumManager.terrain.getGridKey(actualPosition, 2);
      const currentHeight = this.stadiumManager.heightMap.get(gridKey) || 0;
      const heightChange = this.stadiumManager.terrain.getHeightChange(selectedTool);
      
      let newHeight;
      if (selectedTool === 'terrain_flatten') {
        newHeight = 0; // Flatten always sets to 0
      } else {
        newHeight = currentHeight + heightChange;
      }
      
      // Clamp height between reasonable bounds
      newHeight = Math.max(-5, Math.min(20, newHeight));
      
      // Update height map
      this.stadiumManager.heightMap.set(gridKey, newHeight);
      
      // Remove old terrain mesh if exists
      const oldMesh = this.stadiumManager.terrainMeshes.get(gridKey);
      if (oldMesh) {
        this.stadiumManager.scene.remove(oldMesh);
        // Dispose geometry and materials
        if (oldMesh.geometry) oldMesh.geometry.dispose();
        if (oldMesh.material) {
          if (Array.isArray(oldMesh.material)) {
            oldMesh.material.forEach(mat => mat.dispose());
          } else {
            oldMesh.material.dispose();
          }
        }
      }
      
      // Create new accumulated terrain mesh
      const newMesh = this.stadiumManager.terrain.createAccumulatedTerrain(actualPosition, newHeight, selectedTool);
      this.stadiumManager.terrainMeshes.set(gridKey, newMesh);
      this.stadiumManager.scene.add(newMesh);
      
      const newElement = {
        id: Date.now() + Math.random(),
        type: selectedTool,
        position: actualPosition.clone(),
        rotation: 0,
        mesh: newMesh,
        // 🎨 Terrain brush specific data
        isTerrainBrush: true,
        gridKey: gridKey,
        currentHeight: newHeight,
        previousHeight: currentHeight
      };
      
      console.log(`🎨 Terrain brush applied: ${selectedTool} at (${actualPosition.x.toFixed(1)}, ${actualPosition.z.toFixed(1)}) - Height: ${currentHeight.toFixed(1)}m → ${newHeight.toFixed(1)}m`);
      return newElement;
      
    } else {
      // Původní logika pro non-terrain objekty
      const element = StadiumBuilder.createElement(selectedTool, actualPosition);

      if (element) {
        // Aplikuj rotaci
        element.rotation.y = this.stadiumManager.previewRotation;
        
        // 🌍 Ulož typ objektu pro pozdější použití
        element.userData = { elementType: selectedTool };
        
        this.stadiumManager.scene.add(element);
        const newElement = {
          id: Date.now() + Math.random(),
          type: selectedTool,
          position: actualPosition.clone(),
          rotation: this.stadiumManager.previewRotation,
          mesh: element
        };
        
        console.log(`Postaveno: ${selectedTool} na pozici (${actualPosition.x.toFixed(1)}, ${actualPosition.z.toFixed(1)}) s rotací ${(this.stadiumManager.previewRotation * 180 / Math.PI).toFixed(0)}°`);
        return newElement;
      }
    }
    
    return null;
  }

  // Vymazání preview objektu
  clearPreview() {
    if (this.stadiumManager.previewObject && this.stadiumManager.scene.children.includes(this.stadiumManager.previewObject)) {
      this.stadiumManager.scene.remove(this.stadiumManager.previewObject);
      this.stadiumManager.previewObject.traverse((child) => {
        if (child.isMesh) {
          if (child.geometry) child.geometry.dispose();
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach(mat => mat.dispose());
            } else {
              child.material.dispose();
            }
          }
        }
      });
      this.stadiumManager.previewObject = null;
    }
    
    // Reset height preview info
    this.stadiumManager.currentHeightPreview = 0;
    this.stadiumManager.previewHeightChange = 0;
  }

  // Reset rotace
  resetPreviewRotation() {
    this.stadiumManager.previewRotation = 0;
    if (this.stadiumManager.previewObject) {
      this.stadiumManager.previewObject.rotation.y = 0;
    }
  }

  // Helper metoda pro určení grid size podle typu elementu
  _getGridSizeForElementType(toolType) {
    const terrainTypes = ['tree_oak', 'tree_pine', 'rock_small', 'rock_large', 'bush_small', 'bush_large', 'flower_patch', 'water_pond', 'path_stone', 'path_dirt', 'fence_wood', 'bench_park'];
    const terrainTileTypes = ['terrain_grass', 'terrain_dirt', 'terrain_sand', 'terrain_snow', 'terrain_concrete', 'terrain_forest', 'terrain_desert', 'terrain_water'];
    const terrainSculptingTypes = ['hill_small', 'hill_large', 'valley_small', 'plateau', 'canyon', 'volcano', 'crater', 'ridge'];
    const terrainPaintingTypes = ['terrain_raise', 'terrain_lower', 'terrain_raise_large', 'terrain_lower_large', 'terrain_flatten', 'terrain_smooth'];
    
    if (terrainTypes.includes(toolType)) {
      return 1; // Jemnější grid pro terrain objekty
    } else if (terrainTileTypes.includes(toolType)) {
      return 20; // Velké 20x20m čtverce pro terrain plochy!
    } else if (terrainSculptingTypes.includes(toolType)) {
      return 5; // Střední grid pro terénní útvary
    } else if (terrainPaintingTypes.includes(toolType)) {
      return 2; // Jemný grid pro terrain brushes
    } else {
      return 2; // Default stadium objekty
    }
  }
}