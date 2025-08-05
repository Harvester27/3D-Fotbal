// src/PlayerDataManagerEvents.js - 🔔 Event systém pro komunikaci mezi komponenty
export class PlayerEventsManager {
  constructor(dataManager) {
    this.dataManager = dataManager;
    
    // Event listeners
    this.listeners = new Map();
    
    // Event historie pro debug
    this.eventHistory = [];
    this.maxHistorySize = 100;
  }
  
  // 🔔 Event system
  addEventListener(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
    
    console.log(`🔔 Event listener added for: ${event}`);
    
    return () => {
      this.removeEventListener(event, callback);
    };
  }
  
  removeEventListener(event, callback) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
        console.log(`🔕 Event listener removed for: ${event}`);
      }
    }
  }
  
  notifyListeners(event, data) {
    // Zaloguj event do historie
    this.logEvent(event, data);
    
    const callbacks = this.listeners.get(event);
    if (callbacks && callbacks.length > 0) {
      console.log(`📣 Broadcasting event: ${event}`, data);
      
      callbacks.forEach((callback, index) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`❌ Error in event listener ${index} for ${event}:`, error);
        }
      });
    } else {
      // Warn pokud nikdo neposlouchá důležité eventy
      const importantEvents = ['coinsChanged', 'levelUp', 'achievementUnlocked'];
      if (importantEvents.includes(event)) {
        console.warn(`⚠️ No listeners for important event: ${event}`);
      }
    }
  }
  
  // Event historie
  logEvent(event, data) {
    const eventLog = {
      timestamp: new Date(),
      event: event,
      data: data,
      listeners: this.listeners.get(event)?.length || 0
    };
    
    this.eventHistory.push(eventLog);
    
    // Udržuj maximální velikost historie
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }
  }
  
  // Získat historii eventů
  getEventHistory(eventType = null, limit = 50) {
    let history = [...this.eventHistory];
    
    if (eventType) {
      history = history.filter(log => log.event === eventType);
    }
    
    return history.slice(-limit).reverse(); // Nejnovější první
  }
  
  // Vyčistit historii
  clearEventHistory() {
    this.eventHistory = [];
    console.log('🧹 Event history cleared');
  }
  
  // 📊 Event statistiky
  getEventStats() {
    const stats = {};
    
    this.eventHistory.forEach(log => {
      if (!stats[log.event]) {
        stats[log.event] = {
          count: 0,
          lastTriggered: null,
          averageListeners: 0
        };
      }
      
      stats[log.event].count++;
      stats[log.event].lastTriggered = log.timestamp;
      stats[log.event].averageListeners = 
        (stats[log.event].averageListeners + log.listeners) / 2;
    });
    
    return stats;
  }
  
  // 🎯 Predefined event helpers pro častě používané eventy
  
  // Ekonomické eventy
  emitCoinsChanged(amount, total, reason) {
    this.notifyListeners('coinsChanged', { amount, total, reason });
  }
  
  emitGemsChanged(amount, total, source) {
    this.notifyListeners('gemsChanged', { amount, total, source });
  }
  
  emitInsufficientFunds(currency, have, need) {
    this.notifyListeners(`insufficient${currency.charAt(0).toUpperCase() + currency.slice(1)}`, { have, need });
  }
  
  // Level a progress eventy
  emitLevelUp(newLevel, rewards) {
    this.notifyListeners('levelUp', { newLevel, ...rewards });
  }
  
  emitExperienceChanged(amount, total, level, progress) {
    this.notifyListeners('experienceChanged', { amount, total, level, progress });
  }
  
  // Attribute eventy
  emitAttributeChanged(category, attributeName, value) {
    this.notifyListeners('attributeChanged', { category, attributeName, value });
  }
  
  emitAttributeTrained(trainData) {
    this.notifyListeners('attributeTrained', trainData);
  }
  
  emitTrainingPointsReset(points) {
    this.notifyListeners('trainingPointsReset', { points });
  }
  
  // Achievement eventy
  emitAchievementUnlocked(achievement) {
    this.notifyListeners('achievementUnlocked', achievement);
  }
  
  // Customization eventy
  emitCustomizationChanged(category, updates) {
    this.notifyListeners('customizationChanged', { category, updates });
  }
  
  emitItemPurchased(itemType, itemId, cost, currency) {
    this.notifyListeners('itemPurchased', { itemType, itemId, cost, currency });
  }
  
  emitItemUnlocked(type, item, level) {
    this.notifyListeners('itemUnlocked', { type, item, level });
  }
  
  // Profile eventy
  emitProfileUpdated(profile) {
    this.notifyListeners('profileUpdated', profile);
  }
  
  emitSettingsChanged(settings) {
    this.notifyListeners('settingsChanged', settings);
  }
  
  // Data eventy
  emitDataLoaded(data) {
    this.notifyListeners('dataLoaded', data);
  }
  
  emitDataImported(data) {
    this.notifyListeners('dataImported', data);
  }
  
  emitDataSaved() {
    this.notifyListeners('dataSaved', { timestamp: new Date() });
  }
  
  // 🎮 Game eventy
  emitMatchResult(result, goals, rewards) {
    this.notifyListeners('matchResult', { result, goals, rewards });
  }
  
  emitGoalScored(goalData) {
    this.notifyListeners('goalScored', goalData);
  }
  
  // 🔄 Event batching - pro případy kdy se spouští více eventů najednou
  batchEvents(events) {
    console.log(`📦 Batching ${events.length} events`);
    
    events.forEach(({ event, data }) => {
      this.notifyListeners(event, data);
    });
    
    this.notifyListeners('eventBatchCompleted', { count: events.length });
  }
  
  // 🎯 Event middleware - pro případy kdy chceme event zpracovat před vysláním
  addEventMiddleware(eventType, middleware) {
    const originalListeners = this.listeners.get(eventType) || [];
    
    // Nahraď listenery middlewarem
    this.listeners.set(eventType, []);
    
    this.addEventListener(eventType, (data) => {
      const processedData = middleware(data);
      
      // Pošli zpracovaná data původním listenerům
      originalListeners.forEach(listener => {
        try {
          listener(processedData);
        } catch (error) {
          console.error(`❌ Error in middleware listener for ${eventType}:`, error);
        }
      });
    });
    
    console.log(`🔀 Middleware added for event: ${eventType}`);
  }
  
  // 📊 Event debugging
  getActiveListeners() {
    const activeListeners = {};
    
    this.listeners.forEach((callbacks, event) => {
      if (callbacks.length > 0) {
        activeListeners[event] = callbacks.length;
      }
    });
    
    return activeListeners;
  }
  
  // Test event - pro debugování
  emitTestEvent(data = { test: true }) {
    this.notifyListeners('testEvent', data);
  }
  
  // 🧹 Cleanup
  dispose() {
    console.log("🧹 Disposing Events Manager...");
    
    // Clear all event listeners
    this.listeners.clear();
    
    // Clear history
    this.eventHistory = [];
    
    console.log("✅ Events Manager disposed");
  }
  
  // 🛠️ Debug metody
  debugListAllEvents() {
    if (process.env.NODE_ENV === 'development') {
      console.log('🛠️ DEBUG: All registered events:');
      this.listeners.forEach((callbacks, event) => {
        console.log(`  ${event}: ${callbacks.length} listeners`);
      });
    }
  }
  
  debugEventHistory(limit = 10) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`🛠️ DEBUG: Last ${limit} events:`, this.getEventHistory(null, limit));
    }
  }
  
  debugEventStats() {
    if (process.env.NODE_ENV === 'development') {
      console.log('🛠️ DEBUG: Event statistics:', this.getEventStats());
    }
  }
}