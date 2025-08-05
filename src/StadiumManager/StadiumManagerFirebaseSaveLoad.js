// src/StadiumManager/StadiumManagerFirebaseSaveLoad.js - 🔥 Firebase Save/Load System
import { StadiumBuilder } from '../StadiumBuilder.js';
import * as logger from '../utils/logger.js';

export class StadiumManagerFirebaseSaveLoad {
  constructor(stadiumManager) {
    this.stadiumManager = stadiumManager;
    this.SAVE_VERSION = '1.0';
    this.firebaseReady = false;
    
    // Počkej na Firebase
    this.waitForFirebase();
  }

  // 🔥 Počkej až bude Firebase připraven
  async waitForFirebase() {
    return new Promise((resolve) => {
      const checkFirebase = () => {
        if (window.firebaseManager && window.firebaseManager.getCurrentUser) {
          this.firebaseReady = true;
          logger.debug('✅ Firebase ready for stadium saves');
          resolve();
        } else {
          logger.debug('⏳ Waiting for Firebase Manager...');
          setTimeout(checkFirebase, 100);
        }
      };
      checkFirebase();
    });
  }

  // 🔐 Kontrola přihlášení
  isUserLoggedIn() {
    return window.firebaseManager?.getCurrentUser() !== null;
  }

  // 💾 SERIALIZACE - Převod stadium elementů na uložitelný formát
  serializeStadiumData(stadiumElements) {
    logger.debug(`💾 Serializing ${stadiumElements.length} stadium elements...`);
    
    const serializedElements = stadiumElements.map(element => {
      const serialized = {
        id: element.id,
        type: element.type,
        position: {
          x: element.position.x,
          y: element.position.y,
          z: element.position.z
        },
        rotation: element.rotation || 0
      };

      // 🎨 Speciální data pro terrain brushes
      if (element.isTerrainBrush) {
        serialized.isTerrainBrush = true;
        serialized.gridKey = element.gridKey;
        serialized.currentHeight = element.currentHeight;
        serialized.previousHeight = element.previousHeight;
      }

      // 🪑 Speciální data pro sedačky
      if (element.type === 'individual_seat') {
        serialized.parentStairs = element.parentStairs;
        serialized.seatType = element.seatType;
        serialized.seatColor = element.seatColor;
        serialized.stepIndex = element.stepIndex;
        serialized.seatIndex = element.seatIndex;
        serialized.purchasePrice = element.purchasePrice;
        serialized.purchaseCurrency = element.purchaseCurrency;
      }

      // 🏗️ Konfigurace pro schody
      if (element.config) {
        serialized.config = element.config;
      }

      return serialized;
    });

    // 🎨 Serializuj height map pro terrain
    const heightMapData = Array.from(this.stadiumManager.heightMap.entries());

    const saveData = {
      version: this.SAVE_VERSION,
      timestamp: new Date().toISOString(),
      elements: serializedElements,
      heightMap: heightMapData,
      metadata: {
        elementCount: serializedElements.length,
        hasTerrainModifications: heightMapData.length > 0,
        totalSeats: serializedElements.filter(e => e.type === 'individual_seat').length,
        totalValue: this.calculateStadiumValue(serializedElements)
      }
    };

    logger.debug(`✅ Serialization complete. Height map entries: ${heightMapData.length}`);
    return saveData;
  }

  // 💰 Vypočítej hodnotu stadionu
  calculateStadiumValue(elements) {
    // Zde můžeš použít ceny z StadiumBuilderUtils
    return elements.length * 1000; // Placeholder
  }

  // 🔥 ULOŽIT DO FIREBASE
  async saveToFirebase(saveName, stadiumElements) {
    try {
      if (!this.firebaseReady) await this.waitForFirebase();
      
      if (!this.isUserLoggedIn()) {
        logger.error('❌ Cannot save - user not logged in');
        return false;
      }

      const firebaseManager = window.firebaseManager;
      const userId = firebaseManager.getCurrentUser().uid;
      
      const saveData = this.serializeStadiumData(stadiumElements);
      saveData.name = saveName;
      saveData.lastModified = new Date().toISOString();

      // Ulož do Firebase pod user/stadiums/saveId
      const stadiumPath = `users/${userId}/stadiums/${saveName}`;
      await firebaseManager.database.ref(stadiumPath).set(saveData);
      
      // Aktualizuj seznam stadionů
      const stadiumListPath = `users/${userId}/stadiumList/${saveName}`;
      await firebaseManager.database.ref(stadiumListPath).set({
        name: saveName,
        lastModified: saveData.lastModified,
        elementCount: saveData.metadata.elementCount,
        totalSeats: saveData.metadata.totalSeats,
        totalValue: saveData.metadata.totalValue,
        hasTerrainModifications: saveData.metadata.hasTerrainModifications
      });

      logger.debug(`✅ Stadium saved as "${saveName}" to Firebase`);
      return true;
    } catch (error) {
      logger.error('❌ Error saving to Firebase:', error);
      return false;
    }
  }

  // 📂 NAČÍST Z FIREBASE
  async loadFromFirebase(saveName) {
    try {
      if (!this.firebaseReady) await this.waitForFirebase();
      
      if (!this.isUserLoggedIn()) {
        logger.error('❌ Cannot load - user not logged in');
        return null;
      }

      const firebaseManager = window.firebaseManager;
      const userId = firebaseManager.getCurrentUser().uid;
      
      const stadiumPath = `users/${userId}/stadiums/${saveName}`;
      const snapshot = await firebaseManager.database.ref(stadiumPath).once('value');
      const saveData = snapshot.val();
      
      if (!saveData) {
        logger.error(`❌ Save "${saveName}" not found`);
        return null;
      }

      return this.deserializeStadiumData(saveData);
    } catch (error) {
      logger.error('❌ Error loading from Firebase:', error);
      return null;
    }
  }

  // 📋 ZÍSKAT SEZNAM SAVES Z FIREBASE
  async getAllSaves() {
    try {
      if (!this.firebaseReady) await this.waitForFirebase();
      
      if (!this.isUserLoggedIn()) {
        logger.debug('⚠️ User not logged in');
        return {};
      }

      const firebaseManager = window.firebaseManager;
      const userId = firebaseManager.getCurrentUser().uid;
      
      const stadiumListPath = `users/${userId}/stadiumList`;
      const snapshot = await firebaseManager.database.ref(stadiumListPath).once('value');
      const stadiumList = snapshot.val() || {};
      
      logger.debug(`📋 Found ${Object.keys(stadiumList).length} saved stadiums`);
      return stadiumList;
    } catch (error) {
      logger.error('❌ Error reading saves:', error);
      return {};
    }
  }

  // 🗑️ SMAZAT SAVE Z FIREBASE
  async deleteSave(saveName) {
    try {
      if (!this.firebaseReady) await this.waitForFirebase();
      
      if (!this.isUserLoggedIn()) {
        logger.error('❌ Cannot delete - user not logged in');
        return false;
      }

      const firebaseManager = window.firebaseManager;
      const userId = firebaseManager.getCurrentUser().uid;
      
      // Smaž stadium data
      const stadiumPath = `users/${userId}/stadiums/${saveName}`;
      await firebaseManager.database.ref(stadiumPath).remove();
      
      // Smaž ze seznamu
      const stadiumListPath = `users/${userId}/stadiumList/${saveName}`;
      await firebaseManager.database.ref(stadiumListPath).remove();
      
      logger.debug(`✅ Save "${saveName}" deleted from Firebase`);
      return true;
    } catch (error) {
      logger.error('❌ Error deleting save:', error);
      return false;
    }
  }

  // 📤 SDÍLET STADION (bonus funkce)
  async shareStadium(saveName) {
    try {
      if (!this.firebaseReady) await this.waitForFirebase();
      
      if (!this.isUserLoggedIn()) {
        logger.error('❌ Cannot share - user not logged in');
        return null;
      }

      const firebaseManager = window.firebaseManager;
      const userId = firebaseManager.getCurrentUser().uid;
      const userProfile = window.playerData?.profileManager?.playerProfile;
      
      // Načti stadium data
      const stadiumData = await this.loadFromFirebase(saveName);
      if (!stadiumData) return null;

      // Vytvoř sdílený záznam
      const shareId = Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
      const sharedStadium = {
        ...stadiumData,
        sharedBy: {
          userId: userId,
          displayName: userProfile?.displayName || 'Anonymous',
          sharedDate: new Date().toISOString()
        },
        shareId: shareId,
        downloads: 0,
        likes: 0
      };

      // Ulož do veřejné sekce
      const sharePath = `sharedStadiums/${shareId}`;
      await firebaseManager.database.ref(sharePath).set(sharedStadium);
      
      logger.debug(`✅ Stadium shared with ID: ${shareId}`);
      return shareId;
    } catch (error) {
      logger.error('❌ Error sharing stadium:', error);
      return null;
    }
  }

  // 📥 NAČÍST SDÍLENÝ STADION
  async loadSharedStadium(shareId) {
    try {
      if (!this.firebaseReady) await this.waitForFirebase();
      
      const firebaseManager = window.firebaseManager;
      const sharePath = `sharedStadiums/${shareId}`;
      const snapshot = await firebaseManager.database.ref(sharePath).once('value');
      const sharedData = snapshot.val();
      
      if (!sharedData) {
        logger.error(`❌ Shared stadium "${shareId}" not found`);
        return null;
      }

      // Zvyš počet stažení
      await firebaseManager.database.ref(`${sharePath}/downloads`).transaction(count => (count || 0) + 1);
      
      return this.deserializeStadiumData(sharedData);
    } catch (error) {
      logger.error('❌ Error loading shared stadium:', error);
      return null;
    }
  }

  // 🔄 DESERIALIZACE - Převod uložených dat zpět na stadium elementy
  deserializeStadiumData(saveData) {
    logger.debug(`🔄 Deserializing save data...`);
    
    if (!saveData || !saveData.elements) {
      logger.error('❌ Invalid save data');
      return null;
    }

    // 🎨 Obnov height map
    if (saveData.heightMap) {
      this.stadiumManager.heightMap.clear();
      saveData.heightMap.forEach(([key, value]) => {
        this.stadiumManager.heightMap.set(key, value);
      });
      logger.debug(`✅ Restored ${saveData.heightMap.length} height map entries`);
    }

    // 🏗️ Obnov elementy
    const elements = saveData.elements.map(savedElement => {
      const element = {
        id: savedElement.id,
        type: savedElement.type,
        position: {
          x: savedElement.position.x,
          y: savedElement.position.y,
          z: savedElement.position.z
        },
        rotation: savedElement.rotation || 0
      };

      // 🎨 Terrain brush data
      if (savedElement.isTerrainBrush) {
        element.isTerrainBrush = true;
        element.gridKey = savedElement.gridKey;
        element.currentHeight = savedElement.currentHeight;
        element.previousHeight = savedElement.previousHeight;
      }

      // 🪑 Sedačka data
      if (savedElement.type === 'individual_seat') {
        element.parentStairs = savedElement.parentStairs;
        element.seatType = savedElement.seatType;
        element.seatColor = savedElement.seatColor;
        element.stepIndex = savedElement.stepIndex;
        element.seatIndex = savedElement.seatIndex;
        element.purchasePrice = savedElement.purchasePrice;
        element.purchaseCurrency = savedElement.purchaseCurrency;
      }

      // 🏗️ Konfigurace pro schody
      if (savedElement.config) {
        element.config = savedElement.config;
      }

      return element;
    });

    logger.debug(`✅ Deserialized ${elements.length} elements`);
    return {
      elements: elements,
      metadata: saveData.metadata
    };
  }

  // 🎮 APLIKOVAT NAČTENÁ DATA DO HRY
  applyLoadedData(loadedData, setStadiumElements) {
    if (!loadedData || !loadedData.elements) {
      logger.error('❌ No data to apply');
      return false;
    }

    try {
      // Vyčisti současný stadion
      const currentElements = this.stadiumManager.stadiumElements || [];
      this.stadiumManager.utility.clearAllStadiumElements(currentElements);
      
      // Nastav nové elementy
      setStadiumElements(loadedData.elements);
      
      // Počkej na další frame a pak vytvoř mesh objekty
      requestAnimationFrame(() => {
        this.stadiumManager.utility.createExistingElements(loadedData.elements);
        logger.debug(`✅ Stadium loaded successfully with ${loadedData.elements.length} elements`);
      });

      return true;
    } catch (error) {
      logger.error('❌ Error applying loaded data:', error);
      return false;
    }
  }

  // 🎯 HLAVNÍ FUNKCE PRO UI

  // Rychlé uložení
  async quickSave(stadiumElements) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const saveName = `quicksave_${timestamp}`;
    return await this.saveToFirebase(saveName, stadiumElements);
  }

  // Uložit s vlastním jménem
  async saveWithName(name, stadiumElements) {
    // Sanitize název (Firebase klíče nemohou obsahovat určité znaky)
    const sanitizedName = name.replace(/[.#$\[\]]/g, '_');
    return await this.saveToFirebase(sanitizedName, stadiumElements);
  }

  // Načíst poslední quicksave
  async loadLastQuicksave(setStadiumElements) {
    const saves = await this.getAllSaves();
    const quicksaves = Object.entries(saves)
      .filter(([name]) => name.startsWith('quicksave_'))
      .sort(([,a], [,b]) => b.lastModified.localeCompare(a.lastModified));
    
    if (quicksaves.length > 0) {
      const [saveName] = quicksaves[0];
      const loadedData = await this.loadFromFirebase(saveName);
      if (loadedData) {
        return this.applyLoadedData(loadedData, setStadiumElements);
      }
    }
    
    logger.debug('❌ No quicksaves found');
    return false;
  }

  // Získat seznam saves pro UI
  async getSavesList() {
    const saves = await this.getAllSaves();
    return Object.entries(saves).map(([name, data]) => ({
      name: name,
      timestamp: data.lastModified,
      lastModified: data.lastModified,
      elementCount: data.elementCount || 0,
      totalSeats: data.totalSeats || 0,
      totalValue: data.totalValue || 0,
      hasTerrainModifications: data.hasTerrainModifications || false,
      isQuicksave: name.startsWith('quicksave_')
    })).sort((a, b) => b.lastModified.localeCompare(a.lastModified));
  }

  // 📥 Export jako JSON soubor (pro zálohu)
  async exportAsFile(filename, stadiumElements) {
    try {
      const saveData = this.serializeStadiumData(stadiumElements);
      const jsonString = JSON.stringify(saveData, null, 2);
      
      // Vytvoř blob a download link
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = filename.endsWith('.json') ? filename : `${filename}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      
      logger.debug(`✅ Stadium exported as ${link.download}`);
      return true;
    } catch (error) {
      logger.error('❌ Error exporting file:', error);
      return false;
    }
  }

  // 📤 Import z JSON souboru
  async importFromFile(file) {
    try {
      const text = await file.text();
      const saveData = JSON.parse(text);
      
      // Kontrola verze
      if (saveData.version !== this.SAVE_VERSION) {
        logger.warn(`⚠️ Save version mismatch: ${saveData.version} vs ${this.SAVE_VERSION}`);
      }

      return this.deserializeStadiumData(saveData);
    } catch (error) {
      logger.error('❌ Error importing from file:', error);
      return null;
    }
  }

  // 🏆 LEADERBOARD - získej nejlepší stadiony
  async getTopStadiums(limit = 10) {
    try {
      if (!this.firebaseReady) await this.waitForFirebase();
      
      const firebaseManager = window.firebaseManager;
      const snapshot = await firebaseManager.database
        .ref('sharedStadiums')
        .orderByChild('likes')
        .limitToLast(limit)
        .once('value');
      
      const stadiums = [];
      snapshot.forEach(child => {
        stadiums.push({
          shareId: child.key,
          ...child.val()
        });
      });
      
      return stadiums.reverse(); // Nejvíc likes první
    } catch (error) {
      logger.error('❌ Error getting top stadiums:', error);
      return [];
    }
  }
}