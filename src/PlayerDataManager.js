// src/PlayerDataManager.js - 🎮 Hlavní koordinátor všech hráčských dat (v3.0 - modularized)
import { PlayerEconomyManager } from './PlayerDataManagerEconomy.js';
import { PlayerAttributesManager } from './PlayerDataManagerAttributes.js';
import { PlayerCustomizationManager } from './PlayerDataManagerCustomization.js';
import { PlayerStatsManager } from './PlayerDataManagerStats.js';
import { PlayerFirebaseManager } from './PlayerDataManagerFirebase.js';
import { PlayerProfileManager } from './PlayerDataManagerProfile.js';
import { PlayerEventsManager } from './PlayerDataManagerEvents.js';
import { PlayerStadiumManager } from './PlayerDataManagerStadium.js';

export class PlayerDataManager {
  constructor() {
    // Singleton pattern
    if (PlayerDataManager.instance) {
      return PlayerDataManager.instance;
    }
    
    console.log('🚀 Initializing PlayerDataManager v3.0 (Modular)...');
    
    // 🔔 Nejdříve event systém (ostatní managery ho potřebují)
    this.events = new PlayerEventsManager(this);
    
    // 💰 Ekonomika
    this.economy = new PlayerEconomyManager(this);
    
    // ⚽ Atributy a trénink
    this.attributesManager = new PlayerAttributesManager(this);
    
    // 🎨 Customizace a inventory
    this.customizationManager = new PlayerCustomizationManager(this);
    
    // 📊 Statistiky a level systém
    this.statsManager = new PlayerStatsManager(this);
    
    // 👤 Profil a nastavení
    this.profileManager = new PlayerProfileManager(this);
    
    // 🏟️ Stadium management
    this.stadiumManager = new PlayerStadiumManager(this);
    
    // 💾 Firebase synchronizace (inicializuje se později)
    this.firebaseManager = new PlayerFirebaseManager(this);
    
    PlayerDataManager.instance = this;
    
    // Nastav cross-odkazy mezi managery pro snadnější přístup
    this.setupCrossReferences();
    
    // Inicializuj Firebase až po vytvoření všech managerů
    this.initializeFirebase();
    
    console.log('✅ PlayerDataManager v3.0 initialized');
  }
  
  // Nastav cross-odkazy pro backward compatibility
  setupCrossReferences() {
    // Zkratky pro často používané vlastnosti
    Object.defineProperty(this, 'virtualCoins', {
      get: () => this.economy.virtualCoins,
      set: (value) => { this.economy.virtualCoins = value; }
    });
    
    Object.defineProperty(this, 'premiumGems', {
      get: () => this.economy.premiumGems,
      set: (value) => { this.economy.premiumGems = value; }
    });
    
    Object.defineProperty(this, 'level', {
      get: () => this.statsManager.level,
      set: (value) => { this.statsManager.level = value; }
    });
    
    Object.defineProperty(this, 'experience', {
      get: () => this.statsManager.experience,
      set: (value) => { this.statsManager.experience = value; }
    });
    
    // Direct access properties pro backward compatibility
    Object.defineProperty(this, 'attributes', {
      get: () => this.attributesManager.attributes,
      set: (value) => { Object.assign(this.attributesManager.attributes, value); }
    });
    
    Object.defineProperty(this, 'playerProfile', {
      get: () => this.profileManager.playerProfile,
      set: (value) => { Object.assign(this.profileManager.playerProfile, value); }
    });
    
    Object.defineProperty(this, 'playerCustomization', {
      get: () => this.customizationManager.playerCustomization,
      set: (value) => { Object.assign(this.customizationManager.playerCustomization, value); }
    });
    
    Object.defineProperty(this, 'inventory', {
      get: () => this.customizationManager.inventory,
      set: (value) => { Object.assign(this.customizationManager.inventory, value); }
    });
    
    Object.defineProperty(this, 'settings', {
      get: () => this.profileManager.settings,
      set: (value) => { Object.assign(this.profileManager.settings, value); }
    });
    
    Object.defineProperty(this, 'dailyRewards', {
      get: () => this.economy.dailyRewards,
      set: (value) => { Object.assign(this.economy.dailyRewards, value); }
    });
    
    Object.defineProperty(this, 'training', {
      get: () => this.attributesManager.training,
      set: (value) => { Object.assign(this.attributesManager.training, value); }
    });
    
    Object.defineProperty(this, 'traits', {
      get: () => this.attributesManager.traits,
      set: (value) => { Object.assign(this.attributesManager.traits, value); }
    });
    
    Object.defineProperty(this, 'stats', {
      get: () => this.statsManager.stats,
      set: (value) => { Object.assign(this.statsManager.stats, value); }
    });
    
    Object.defineProperty(this, 'mainStadiumId', {
      get: () => this.stadiumManager.mainStadium.id,
      set: (value) => { this.stadiumManager.mainStadium.id = value; }
    });
  }
  
  // Inicializuj Firebase
  async initializeFirebase() {
    try {
      await this.firebaseManager.initialize();
    } catch (error) {
      console.error('❌ Failed to initialize Firebase:', error);
    }
  }
  
  // 🔔 Event systém - deleguj na events manager
  addEventListener(event, callback) {
    return this.events.addEventListener(event, callback);
  }
  
  removeEventListener(event, callback) {
    this.events.removeEventListener(event, callback);
  }
  
  notifyListeners(event, data) {
    this.events.notifyListeners(event, data);
  }
  
  // 💾 Firebase operace - deleguj na firebase manager
  async saveToFirebase() {
    return this.firebaseManager.saveToFirebase();
  }
  
  async loadFromFirebase() {
    return this.firebaseManager.loadFromFirebase();
  }
  
  // 📊 Gettery pro UI - kombinuj data ze všech managerů
  getPlayerSummary() {
    const economyData = this.economy?.getFormattedMoney() || { coins: '0', gems: '0', real: '0 Kč' };
    const statsData = this.statsManager?.getPlayerSummary() || {};
    const profileData = this.profileManager?.getProfileStats() || { displayName: 'Loading...', preferredPosition: 'CAM' };
    
    return {
      // Profile info
      name: profileData.displayName,
      avatar: profileData.avatarUrl,
      country: profileData.country,
      
      // Stats & progress
      ...statsData,
      
      // Economy
      coins: this.economy?.virtualCoins || 0,
      coinsFormatted: economyData.coins,
      gems: this.economy?.premiumGems || 0,
      realMoney: this.economy?.realMoneyBalance || 0,
      
      // Attributes
      overallRating: this.attributesManager?.getOverallRating() || 1,
      positionRating: this.attributesManager?.getPositionRating(profileData.preferredPosition || 'CAM') || 1,
      trainingPoints: this.attributesManager?.training?.dailyTrainingPoints || 0,
      
      // Rewards
      dailyStreak: this.economy?.dailyRewards?.streak || 0,
      
      // Stadium
      stadiumElementCount: this.stadiumManager?.mainStadium?.elements?.length || 0
    };
  }
  
  getFormattedMoney() {
    return this.economy.getFormattedMoney();
  }
  
  // 🔥 Hlavní API metody - deleguj na správné managery
  
  // Economy
  get coins() { return this.economy.coins; }
  get gems() { return this.economy.gems; }
  addCoins(amount, reason) { return this.economy.addCoins(amount, reason); }
  spendCoins(amount, item) { return this.economy.spendCoins(amount, item); }
  addGems(amount, source) { return this.economy.addGems(amount, source); }
  spendGems(amount, item) { return this.economy.spendGems(amount, item); }
  claimDailyReward() { return this.economy.claimDailyReward(); }
  getDailyRewardStatus() { return this.economy.getDailyRewardStatus(); }
  
  // Attributes
  getAttribute(category, attributeName) { return this.attributesManager.getAttribute(category, attributeName); }
  setAttribute(category, attributeName, value) { return this.attributesManager.setAttribute(category, attributeName, value); }
  trainAttribute(category, attributeName, intensity) { return this.attributesManager.trainAttribute(category, attributeName, intensity); }
  getOverallRating() { return this.attributesManager.getOverallRating(); }
  getPositionRating(position) { return this.attributesManager.getPositionRating(position); }
  
  // Traits
  addTrait(traitId, type) { return this.attributesManager.addTrait(traitId, type); }
  removeTrait(traitId, type) { return this.attributesManager.removeTrait(traitId, type); }
  hasTrait(traitId, type) { return this.attributesManager.hasTrait(traitId, type); }
  getAllTraits() { return this.attributesManager.getAllTraits(); }
  
  // Stats & Level
  addExperience(amount, action) { return this.statsManager.addExperience(amount, action); }
  updateStats(statName, value) { return this.statsManager.updateStats(statName, value); }
  
  // Customization
  updateCustomization(category, updates) { return this.customizationManager.updateCustomization(category, updates); }
  ownsItem(itemType, itemId) { return this.customizationManager.ownsItem(itemType, itemId); }
  
  // Profile
  updateProfile(updates) { return this.profileManager.updateProfile(updates); }
  updateSettings(newSettings) { return this.profileManager.updateSettings(newSettings); }
  
  // Stadium management
  async loadMainStadium() { return this.stadiumManager.loadOrCreateMainStadium(); }
  updateStadiumElements(elements) { this.stadiumManager.updateStadiumElements(elements); }
  clearStadium() { this.stadiumManager.clearStadium(); }
  getStadiumInfo() { return this.stadiumManager.getStadiumInfo(); }
  
  // 🎮 Game rewards - kombinuj rewards ze stats manageru
  rewardMatchWin(goals = 0) { return this.statsManager.rewardMatchWin(goals); }
  rewardMatchDraw() { return this.statsManager.rewardMatchDraw(); }
  rewardMatchLoss() { return this.statsManager.rewardMatchLoss(); }
  rewardGoal() { return this.statsManager.rewardGoal(); }
  rewardStadiumCreated() { return this.statsManager.rewardStadiumCreated(); }
  
  // 🏪 Purchase systém
  purchaseItem(itemType, itemId, cost, currency = 'coins') {
    return this.economy.purchaseItem(itemType, itemId, cost, currency);
  }
  
  // 💾 Export/Import - kombinuj ze všech managerů
  exportData() {
    return JSON.stringify({
      version: '3.0',
      exportDate: new Date(),
      data: {
        ...this.economy.exportData(),
        ...this.attributesManager.exportData(),
        ...this.customizationManager.exportData(),
        ...this.statsManager.exportData(),
        ...this.profileManager.exportData(),
        ...this.stadiumManager.exportData()
      }
    }, null, 2);
  }
  
  importData(jsonString) {
    try {
      const imported = JSON.parse(jsonString);
      if (imported.version && imported.data) {
        // Import do všech managerů
        this.economy.importData(imported.data);
        this.attributesManager.importData(imported.data);
        this.customizationManager.importData(imported.data);
        this.statsManager.importData(imported.data);
        this.profileManager.importData(imported.data);
        this.stadiumManager.importData(imported.data);
        
        this.saveToFirebase();
        this.notifyListeners('dataImported', imported.data);
        console.log('✅ Data successfully imported');
        return true;
      } else {
        console.error('❌ Invalid data format or version');
        return false;
      }
    } catch (error) {
      console.error('❌ Failed to import data:', error);
      return false;
    }
  }
  
  // 🔄 Reset functions
  resetProgress() {
    this.statsManager.resetProgress();
    this.attributesManager.resetAttributes();
    this.saveToFirebase();
    this.notifyListeners('progressReset', {});
  }
  
  resetCustomization() {
    this.customizationManager.resetCustomization();
    this.saveToFirebase();
    this.notifyListeners('customizationReset', {});
  }
  
  resetAll() {
    this.economy.virtualCoins = 100000000; // 🚀 Reset na rich start!
    this.economy.premiumGems = 1000000;     // 💎 Reset na premium start!
    this.economy.realMoneyBalance = 0;
    this.economy.dailyRewards = { lastClaim: null, streak: 0, nextReward: 500000 };
    
    this.statsManager.resetProgress();
    this.attributesManager.resetAttributes();
    this.customizationManager.resetCustomization();
    this.profileManager.resetProfile();
    this.profileManager.resetSettings();
    
    this.saveToFirebase();
    this.notifyListeners('allReset', {});
  }
  
  // 🧹 Cleanup
  dispose() {
    console.log("🧹 Disposing PlayerDataManager...");
    
    // Dispose všech managerů
    this.firebaseManager?.dispose();
    this.events?.dispose();
    this.stadiumManager?.dispose();
    
    console.log("✅ PlayerDataManager disposed");
  }
  
  // 🛠️ Debug metody - kombinuj ze všech managerů
  debugAddCoins(amount) { this.economy.debugAddCoins(amount); }
  debugAddGems(amount) { this.economy.debugAddGems(amount); }
  debugSetLevel(level) { this.statsManager.debugSetLevel(level); }
  debugSetAttribute(category, attr, value) { this.attributesManager.debugSetAttribute(category, attr, value); }
  debugMaxAllAttributes() { this.attributesManager.debugMaxAllAttributes(); }
  debugUnlockAll() { this.customizationManager.debugUnlockAll(); }
  
  // Debug info
  debugGetManagersInfo() {
    if (process.env.NODE_ENV === 'development') {
      console.log('🛠️ DEBUG: Managers info:', {
        economy: !!this.economy,
        attributes: !!this.attributesManager,
        customization: !!this.customizationManager,
        stats: !!this.statsManager,
        profile: !!this.profileManager,
        firebase: !!this.firebaseManager,
        events: !!this.events,
        stadium: !!this.stadiumManager
      });
    }
  }
}

// Singleton instance
export const playerDataManager = new PlayerDataManager();

// Global helper pro rychlý přístup
if (typeof window !== 'undefined') {
  window.playerData = playerDataManager;
  window.playerDataManager = playerDataManager;
  
  // Debug commands v konzoli (pouze development)
  if (process.env.NODE_ENV === 'development') {
    window.debugPlayer = {
      // Economy
      addCoins: (amount) => playerDataManager.debugAddCoins(amount),
      addGems: (amount) => playerDataManager.debugAddGems(amount),
      
      // Stats
      setLevel: (level) => playerDataManager.debugSetLevel(level),
      addExp: (amount) => playerDataManager.addExperience(amount, 'DEBUG'),
      
      // Attributes
      setAttribute: (category, attr, value) => playerDataManager.debugSetAttribute(category, attr, value),
      maxAllAttributes: () => playerDataManager.debugMaxAllAttributes(),
      getOverall: () => playerDataManager.getOverallRating(),
      getPosition: (pos) => playerDataManager.getPositionRating(pos),
      trainAttribute: (cat, attr, intensity) => playerDataManager.trainAttribute(cat, attr, intensity),
      
      // Customization
      unlockAll: () => playerDataManager.debugUnlockAll(),
      
      // Stadium
      stadiumInfo: () => playerDataManager.getStadiumInfo(),
      
      // Info
      info: () => playerDataManager.debugGetManagersInfo(),
      events: () => playerDataManager.events.debugEventStats(),
      
      // Firebase
      save: () => playerDataManager.firebaseManager.debugSaveNow(),
      load: () => playerDataManager.firebaseManager.debugLoadNow(),
      
      // Testing
      testEvent: () => playerDataManager.events.emitTestEvent({ debug: true })
    };
  }
}

console.log('💾 PlayerDataManager v3.0 (Modular) initialized!');