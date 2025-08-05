// src/PlayerDataManagerFirebase.js - 💾 Firebase synchronizace
export class PlayerFirebaseManager {
    constructor(dataManager) {
      this.dataManager = dataManager;
      this.authUnsubscribe = null;
      
      // Čekací fronta pro operace (pokud Firebase ještě není ready)
      this.pendingOperations = [];
      this.isFirebaseReady = false;
    }
    
    // 🔐 Inicializace Firebase listeneru
    async initialize() {
      console.log('🔥 Initializing Firebase Manager...');
      
      // Počkej na Firebase Manager
      await this.waitForFirebaseManager();
      
      // Nastav auth listener
      this.setupAuthListener();
      
      console.log('✅ Firebase Manager initialized');
    }
    
    // Počkej až bude Firebase Manager dostupný
    async waitForFirebaseManager() {
      return new Promise((resolve) => {
        const checkFirebase = () => {
          if (window.firebaseManager && window.firebaseManager.onAuthStateChanged) {
            this.isFirebaseReady = true;
            resolve();
          } else {
            console.log('⏳ Waiting for Firebase Manager...');
            setTimeout(checkFirebase, 100);
          }
        };
        checkFirebase();
      });
    }
    
    // 🔐 Auth state listener
    setupAuthListener() {
      const firebaseManager = window.firebaseManager;
      
      if (firebaseManager && firebaseManager.onAuthStateChanged) {
        this.authUnsubscribe = firebaseManager.onAuthStateChanged((user) => {
          if (user) {
            console.log('🔄 PlayerFirebaseManager: User logged in, loading data...');
            this.loadFromFirebase();
          } else {
            console.log('🔄 PlayerFirebaseManager: User logged out');
            // Optionally reset to default values
          }
        });
      } else {
        console.error('❌ Firebase Manager not available for auth listener');
      }
    }
    
    // 💾 Načíst data z Firebase (UPRAVENO)
    async loadFromFirebase() {
      try {
        const firebaseManager = window.firebaseManager;
        const currentUser = firebaseManager.getCurrentUser();
        
        if (!currentUser) {
          console.log('⏳ No user logged in yet');
          return;
        }
        
        console.log('📥 Loading player data for:', currentUser.uid);
        const playerData = await firebaseManager.getPlayerData(currentUser.uid);
        
        if (playerData) {
          console.log('📦 Raw data from Firebase:', playerData);
          
          this.mergePlayerData(playerData);
          
          // 🏟️ NOVÉ: Načti stadion separátně
          console.log('🏟️ Loading stadium separately...');
          try {
            await this.dataManager.stadiumManager.loadOrCreateMainStadium();
            console.log('✅ Stadium loaded');
          } catch (stadiumError) {
            console.warn('⚠️ Failed to load stadium:', stadiumError);
          }
          
          console.log('✅ Player data loaded from Firebase');
          
          this.dataManager.notifyListeners('dataLoaded', playerData);
        } else {
          // První přihlášení - vytvoř nová data s výchozími hodnotami
          console.log('🆕 First login - creating new player data');
          
          // Nastav základní profil
          this.dataManager.profileManager.updateProfile({
            displayName: currentUser.displayName || 'Nový hráč',
            avatarUrl: currentUser.photoURL,
            joinDate: new Date(),
            lastLogin: new Date()
          });
          
          // Přidej základní traits pro nového hráče
          this.dataManager.attributesManager.addTrait('beginner_luck', 'positive');
          this.dataManager.attributesManager.addTrait('rookie_mistakes', 'negative');
          
          await this.saveToFirebase();
        }
      } catch (error) {
        console.error('❌ Failed to load player data:', error);
      }
    }
    
    // Merge načtená data s defaultními hodnotami
    mergePlayerData(loadedData) {
      console.log('🔀 Merging player data...');
      
      // Import do každého manageru
      if (this.dataManager.economy) {
        this.dataManager.economy.importData(loadedData);
      }
      
      if (this.dataManager.attributesManager) {
        this.dataManager.attributesManager.importData(loadedData);
      }
      
      if (this.dataManager.customizationManager) {
        this.dataManager.customizationManager.importData(loadedData);
      }
      
      if (this.dataManager.statsManager) {
        this.dataManager.statsManager.importData(loadedData);
      }
      
      if (this.dataManager.profileManager) {
        this.dataManager.profileManager.importData(loadedData);
      }
      
      console.log('✅ Data merge completed');
    }
    
    // 💾 Uložit data do Firebase (UPRAVENO)
    async saveToFirebase() {
      try {
        // Zkontroluj Firebase Manager
        const firebaseManager = window.firebaseManager;
        if (!firebaseManager) {
          console.warn('⚠️ Firebase Manager not available');
          return;
        }
        
        const currentUser = firebaseManager.getCurrentUser();
        if (!currentUser) {
          console.warn('⚠️ Cannot save - no user logged in');
          return;
        }
        
        // 🔧 DŮLEŽITÉ: Připrav data pro uložení BEZ stadionu
        const dataToSave = {
          // Economy data
          ...this.dataManager.economy?.exportData(),
          
          // Attributes data
          ...this.dataManager.attributesManager?.exportData(),
          
          // Customization data
          ...this.dataManager.customizationManager?.exportData(),
          
          // Stats data
          ...this.dataManager.statsManager?.exportData(),
          
          // Profile data
          ...this.dataManager.profileManager?.exportData(),
          
          // Settings
          settings: this.dataManager.profileManager?.settings || {},
          
          // 🏟️ ZMĚNA: Stadium metadata pouze, ne elementy
          mainStadiumId: this.dataManager.stadiumManager?.mainStadium.id,
          mainStadiumName: this.dataManager.stadiumManager?.mainStadium.name,
          // Stadium elementy se ukládají separátně!
          
          // Metadata
          version: '3.0',
          lastUpdated: new Date()
        };
        
        // Odstraň undefined hodnoty
        Object.keys(dataToSave).forEach(key => {
          if (dataToSave[key] === undefined) {
            delete dataToSave[key];
          }
        });
        
        console.log('💾 Saving to Firebase:', dataToSave);
        
        // 1. Ulož hlavní player data (BEZ stadionu)
        await firebaseManager.savePlayerData(currentUser.uid, dataToSave);
        
        // 2. 🏟️ NOVÉ: Ulož stadion separátně pokud existuje
        const stadiumManager = this.dataManager.stadiumManager;
        if (stadiumManager && stadiumManager.mainStadium.elements.length > 0) {
          console.log('🏟️ Saving stadium separately...');
          
          // Vyčisti elementy před uložením
          const cleanedElements = stadiumManager.cleanStadiumElementsForFirebase(
            stadiumManager.mainStadium.elements
          );
          
          await firebaseManager.saveMainStadium(
            stadiumManager.mainStadium.name,
            cleanedElements
          );
          
          console.log('✅ Stadium saved to Firebase');
        }
        
        console.log('✅ Player data saved to Firebase');
        
      } catch (error) {
        console.error('❌ Failed to save player data:', error);
      }
    }
    
    // 🔄 Auto-save po určitých akcích
    scheduleAutoSave() {
      // Uložit za 2 sekundy (debounce)
      if (this.autoSaveTimeout) {
        clearTimeout(this.autoSaveTimeout);
      }
      
      this.autoSaveTimeout = setTimeout(() => {
        this.saveToFirebase();
      }, 2000);
    }
    
    // 💾 Export/Import celé databáze
    async exportAllData() {
      const firebaseManager = window.firebaseManager;
      const currentUser = firebaseManager?.getCurrentUser();
      
      if (!currentUser) {
        throw new Error('User not logged in');
      }
      
      const playerData = await firebaseManager.getPlayerData(currentUser.uid);
      
      return JSON.stringify({
        version: '3.0',
        exportDate: new Date(),
        userId: currentUser.uid,
        data: playerData
      }, null, 2);
    }
    
    async importAllData(jsonString) {
      try {
        const imported = JSON.parse(jsonString);
        
        if (imported.version && imported.data) {
          this.mergePlayerData(imported.data);
          await this.saveToFirebase();
          
          this.dataManager.notifyListeners('dataImported', imported.data);
          console.log('✅ Data successfully imported');
          return true;
        } else {
          console.error('❌ Invalid data format');
          return false;
        }
      } catch (error) {
        console.error('❌ Failed to import data:', error);
        return false;
      }
    }
    
    // 📊 Backup systém
    async createBackup() {
      try {
        const data = await this.exportAllData();
        const backup = {
          id: Date.now(),
          date: new Date(),
          data: data,
          size: new Blob([data]).size
        };
        
        // Uložit backup lokálně
        const backups = JSON.parse(localStorage.getItem('playerBackups') || '[]');
        backups.push(backup);
        
        // Udržuj pouze posledních 5 backupů
        if (backups.length > 5) {
          backups.shift();
        }
        
        localStorage.setItem('playerBackups', JSON.stringify(backups));
        console.log('💾 Backup created:', backup.id);
        
        return backup;
      } catch (error) {
        console.error('❌ Failed to create backup:', error);
        return null;
      }
    }
    
    getBackups() {
      return JSON.parse(localStorage.getItem('playerBackups') || '[]');
    }
    
    async restoreBackup(backupId) {
      const backups = this.getBackups();
      const backup = backups.find(b => b.id === backupId);
      
      if (!backup) {
        console.error('❌ Backup not found:', backupId);
        return false;
      }
      
      return await this.importAllData(backup.data);
    }
    
    // 🧹 Cleanup
    dispose() {
      console.log("🧹 Disposing Firebase Manager...");
      
      // Zruš auto-save timer
      if (this.autoSaveTimeout) {
        clearTimeout(this.autoSaveTimeout);
        this.autoSaveTimeout = null;
      }
      
      // Odstranit auth listener
      if (this.authUnsubscribe) {
        this.authUnsubscribe();
        this.authUnsubscribe = null;
      }
      
      console.log("✅ Firebase Manager disposed");
    }
    
    // 🛠️ Debug metody
    debugSaveNow() {
      if (process.env.NODE_ENV === 'development') {
        console.log('🛠️ DEBUG: Force saving to Firebase...');
        this.saveToFirebase();
      }
    }
    
    debugLoadNow() {
      if (process.env.NODE_ENV === 'development') {
        console.log('🛠️ DEBUG: Force loading from Firebase...');
        this.loadFromFirebase();
      }
    }
  }