// src/PlayerDataManagerStadium.js - 🏟️ Správa hlavního stadionu hráče (UPRAVENO PRO MANUÁLNÍ UKLÁDÁNÍ)
export class PlayerStadiumManager {
    constructor(dataManager) {
      this.dataManager = dataManager;
      
      // 🏟️ Hlavní stadion hráče
      this.mainStadium = {
        id: 'main',        // Vždy 'main' pro hlavní stadion
        name: 'Můj stadion',
        elements: [],       // Stadium elements
        lastModified: null,
        isDirty: false      // Příznak, že jsou neuložené změny
      };
      
      // 💾 NOVÉ: Pro sledování změn
      this.lastSavedElements = JSON.stringify([]);
      
      // Už žádný auto-save!
      this.isSaving = false;
    }
    
    // 🏟️ Načti nebo vytvoř hlavní stadion
    async loadOrCreateMainStadium() {
      const firebaseManager = window.firebaseManager;
      const currentUser = firebaseManager?.getCurrentUser();
      
      if (!currentUser) {
        console.warn('⚠️ No user logged in - using local stadium');
        return this.mainStadium.elements;
      }
      
      try {
        console.log('📥 Loading main stadium...');
        const stadiumData = await firebaseManager.loadMainStadium();
        
        if (stadiumData && stadiumData.elements && stadiumData.elements.length > 0) {
          // Stadium existuje a má elementy
          this.mainStadium.elements = stadiumData.elements || [];
          this.mainStadium.name = stadiumData.name || 'Můj stadion';
          this.mainStadium.lastModified = stadiumData.lastModified;
          this.mainStadium.isDirty = false;
          
          // 💾 NOVÉ: Ulož jako last saved state
          this.lastSavedElements = JSON.stringify(this.mainStadium.elements);
          
          console.log('✅ Main stadium loaded:', this.mainStadium.elements.length, 'elements');
          return this.mainStadium.elements;
        } else {
          // Stadium neexistuje nebo je prázdný - NEUKLÁDEJ HO!
          console.log('🆕 No stadium found or empty - starting fresh');
          this.mainStadium.elements = [];
          this.mainStadium.isDirty = false;
          this.lastSavedElements = JSON.stringify([]);
          return this.mainStadium.elements;
        }
        
      } catch (error) {
        console.error('❌ Failed to load stadium:', error);
        return this.mainStadium.elements;
      }
    }
    
    // 🏟️ Aktualizuj elementy stadionu (BEZ auto-save)
    updateStadiumElements(elements) {
      console.log(`🏟️ updateStadiumElements called with ${elements?.length || 0} elements`);
      
      // DŮLEŽITÉ: Ujisti se, že elements je array
      if (!Array.isArray(elements)) {
        console.error('❌ updateStadiumElements: elements is not an array!', typeof elements);
        return;
      }
      
      // Porovnej s aktuálními elementy - pokud jsou jiné, označ jako dirty
      const elementsChanged = JSON.stringify(this.mainStadium.elements) !== JSON.stringify(elements);
      
      if (elementsChanged) {
        // Deep copy array
        this.mainStadium.elements = [...elements];
        this.mainStadium.lastModified = new Date();
        this.mainStadium.isDirty = true; // Označ že jsou neuložené změny
        
        console.log(`✅ Stadium updated: ${this.mainStadium.elements.length} elements (unsaved changes)`);
        
        // Notify listeners
        this.dataManager.notifyListeners('stadiumElementsChanged', {
          count: this.mainStadium.elements.length,
          lastModified: this.mainStadium.lastModified,
          isDirty: true
        });
      }
    }
    
    // 💾 NOVÁ METODA: Zkontroluj jestli jsou neuložené změny
    hasUnsavedChanges() {
      const currentElements = JSON.stringify(this.mainStadium.elements);
      return currentElements !== this.lastSavedElements;
    }
    
    // 💾 Manuální uložení stadionu (UPRAVENO S EVENT DISPATCHING)
    async saveStadium() {
      if (this.isSaving) {
        console.log('⏳ Already saving stadium...');
        return false;
      }
      
      const firebaseManager = window.firebaseManager;
      const currentUser = firebaseManager?.getCurrentUser();
      
      if (!currentUser) {
        console.warn('⚠️ Cannot save stadium - no user logged in');
        return false;
      }
      
      // Neukládej prázdný stadion
      if (this.mainStadium.elements.length === 0) {
        console.log('⚠️ Not saving empty stadium');
        return false;
      }
      
      this.isSaving = true;
      
      // 💾 Dispatch event že začíná ukládání
      window.dispatchEvent(new Event('stadiumSaveStart'));
      
      try {
        console.log('💾 Manually saving stadium...', this.mainStadium.elements.length, 'elements');
        
        // 🔧 DŮLEŽITÉ: Vyčisti elementy před uložením
        const cleanedElements = this.cleanStadiumElementsForFirebase(this.mainStadium.elements);
        
        await firebaseManager.saveMainStadium(
          this.mainStadium.name,
          cleanedElements  // Pošli vyčištěné elementy
        );
        
        console.log('✅ Stadium saved successfully');
        this.mainStadium.isDirty = false; // Vymaž příznak neuložených změn
        
        // 💾 NOVÉ: Aktualizuj lastSavedElements
        this.lastSavedElements = JSON.stringify(this.mainStadium.elements);
        
        // 🔧 DŮLEŽITÉ: Ulož také hlavní player data
        // Stadium se ukládá separátně, ale chceme synchronizovat i ostatní data
        if (this.dataManager.firebaseManager) {
          console.log('💾 Saving player data alongside stadium...');
          await this.dataManager.firebaseManager.saveToFirebase();
        }
        
        // 💾 Dispatch event že ukládání bylo dokončeno
        window.dispatchEvent(new Event('stadiumSaveComplete'));
        
        // Notify UI
        if (window.showGameMessage) {
          window.showGameMessage('💾 Stadion uložen!', 'success', 2000);
        }
        
        this.dataManager.notifyListeners('stadiumSaved', {
          id: this.mainStadium.id,
          elementCount: this.mainStadium.elements.length
        });
        
        return true;
        
      } catch (error) {
        console.error('❌ Failed to save stadium:', error);
        
        // 💾 Dispatch event že ukládání selhalo
        window.dispatchEvent(new Event('stadiumSaveError'));
        
        if (window.showGameMessage) {
          window.showGameMessage('❌ Chyba při ukládání', 'error', 2000);
        }
        return false;
      } finally {
        this.isSaving = false;
      }
    }
    
    // 🔧 NOVÁ METODA: Vyčisti stadium elementy pro Firebase
    cleanStadiumElementsForFirebase(elements) {
      if (!Array.isArray(elements)) {
        console.error('❌ cleanStadiumElementsForFirebase: elements is not an array');
        return [];
      }
      
      return elements.map(element => {
        try {
          // Vytvoř čistou kopii bez Three.js objektů
          const cleaned = {
            // Základní properties
            id: element.id,
            type: element.type,
            
            // Převeď position na prostý objekt
            position: element.position ? {
              x: typeof element.position.x === 'number' ? element.position.x : 0,
              y: typeof element.position.y === 'number' ? element.position.y : 0,
              z: typeof element.position.z === 'number' ? element.position.z : 0
            } : { x: 0, y: 0, z: 0 },
            
            // Základní transformace
            rotation: typeof element.rotation === 'number' ? element.rotation : 0,
            scale: typeof element.scale === 'number' ? element.scale : 1,
            
            // Economy properties
            purchasePrice: element.purchasePrice,
            purchaseCurrency: element.purchaseCurrency,
            
            // Seat properties
            seatOptions: element.seatOptions ? {
              type: element.seatOptions.type,
              color: element.seatOptions.color,
              placementMode: element.seatOptions.placementMode
            } : undefined,
            seatCount: element.seatCount,
            parentStairsId: element.parentStairsId,
          };
          
          // Přidej specifické vlastnosti podle typu
          if (element.type === 'single_seats' || element.type === 'seat_row') {
            if (typeof element.stepIndex === 'number') cleaned.stepIndex = element.stepIndex;
            if (typeof element.rowIndex === 'number') cleaned.rowIndex = element.rowIndex;
            if (typeof element.seatIndex === 'number') cleaned.seatIndex = element.seatIndex;
          }
          
          if (element.type === 'curved_stairs' || element.type === 'concrete_stairs') {
            if (typeof element.angle === 'number') cleaned.angle = element.angle;
            if (element.direction) cleaned.direction = element.direction;
            if (element.pivotPosition) cleaned.pivotPosition = element.pivotPosition;
            if (typeof element.sideSteps === 'number') cleaned.sideSteps = element.sideSteps;
          }
          
          // Stand properties
          if (element.type && element.type.includes('stand')) {
            if (element.variant) cleaned.variant = element.variant;
            if (typeof element.capacity === 'number') cleaned.capacity = element.capacity;
          }
          
          // Odstraň undefined hodnoty
          Object.keys(cleaned).forEach(key => {
            if (cleaned[key] === undefined) {
              delete cleaned[key];
            }
          });
          
          return cleaned;
          
        } catch (error) {
          console.error('❌ Error cleaning element:', element.id, error);
          // Vrať alespoň základní info
          return {
            id: element.id || 'unknown',
            type: element.type || 'unknown',
            position: { x: 0, y: 0, z: 0 },
            rotation: 0
          };
        }
      });
    }
    
    // 🏟️ Vymaž stadion
    clearStadium() {
      console.log('🗑️ Clearing stadium...');
      this.mainStadium.elements = [];
      this.mainStadium.lastModified = new Date();
      this.mainStadium.isDirty = true;
      
      // Notify listeners
      this.dataManager.notifyListeners('stadiumElementsChanged', {
        count: 0,
        lastModified: this.mainStadium.lastModified,
        isDirty: true
      });
    }
    
    // 📊 Gettery
    getStadiumInfo() {
      return {
        id: this.mainStadium.id,
        name: this.mainStadium.name,
        elementCount: this.mainStadium.elements.length,
        lastModified: this.mainStadium.lastModified,
        isSaving: this.isSaving,
        hasUnsavedChanges: this.hasUnsavedChanges() // 💾 UPRAVENO: volej metodu
      };
    }
    
    // 💾 Export/Import
    exportData() {
      return {
        mainStadium: {
          name: this.mainStadium.name,
          // 💾 NOVÉ: Přidej lastSavedElements do exportu
          lastSavedElements: this.lastSavedElements
          // Elementy se načtou z Firebase, neexportujeme je
        }
      };
    }
    
    importData(data) {
      if (data.mainStadium) {
        this.mainStadium.name = data.mainStadium.name || this.mainStadium.name;
        // 💾 NOVÉ: Import lastSavedElements pokud existuje
        if (data.mainStadium.lastSavedElements) {
          this.lastSavedElements = data.mainStadium.lastSavedElements;
        }
      }
    }
    
    // 🧹 Cleanup
    dispose() {
      // Už žádný auto-save timeout k vyčištění
      console.log('🧹 Stadium manager disposed');
    }
  }