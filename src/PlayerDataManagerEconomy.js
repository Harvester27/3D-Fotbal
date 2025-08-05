// src/PlayerDataManagerEconomy.js - 💰 Ekonomická logika
export class PlayerEconomyManager {
    constructor(dataManager) {
      this.dataManager = dataManager;
      
      // 💰 Ekonomika
      this.virtualCoins = 100000000; // 🚀 RICH START! - Startovní virtuální mince
      this.premiumGems = 1000000;    // 💎 Premium start - Premium měna (za skutečné peníze)
      this.realMoneyBalance = 0;     // Skutečný zůstatek v CZK
      
      // 🎁 Daily rewards tracker
      // Načti uložený stav z localStorage, aby se po F5 nezresetoval
      const savedRewards = typeof window !== 'undefined'
        ? JSON.parse(localStorage.getItem('dailyRewards') || 'null')
        : null;

      this.dailyRewards = savedRewards || {
        lastClaim: null,
        streak: 0,
        nextReward: 500000       // 🚀 Vyšší denní odměny pro bohaté hráče!
      };
      
      // Cache pro rychlý přístup
      this._coinFormatted = '100,000,000';
    }
    
    // 💰 Základní ekonomické metody
    get coins() {
      return this.virtualCoins;
    }
    
    get gems() {
      return this.premiumGems;
    }
    
    addCoins(amount, reason = 'unknown') {
      this.virtualCoins += amount;
      this._coinFormatted = this.virtualCoins.toLocaleString('cs-CZ');
      console.log(`💰 +${amount} coins (${reason}). Total: ${this.virtualCoins}`);
      this.dataManager.notifyListeners('coinsChanged', { amount, total: this.virtualCoins, reason });
      this.dataManager.saveToFirebase();
    }
    
    spendCoins(amount, item = 'unknown') {
      if (this.virtualCoins < amount) {
        console.warn(`❌ Not enough coins! Have: ${this.virtualCoins}, Need: ${amount}`);
        this.dataManager.notifyListeners('insufficientCoins', { have: this.virtualCoins, need: amount });
        return false;
      }
      
      this.virtualCoins -= amount;
      this._coinFormatted = this.virtualCoins.toLocaleString('cs-CZ');
      console.log(`💸 -${amount} coins (${item}). Remaining: ${this.virtualCoins}`);
      this.dataManager.notifyListeners('coinsChanged', { amount: -amount, total: this.virtualCoins, item });
      this.dataManager.saveToFirebase();
      return true;
    }
    
    addGems(amount, source = 'purchase') {
      this.premiumGems += amount;
      console.log(`💎 +${amount} gems (${source}). Total: ${this.premiumGems}`);
      this.dataManager.notifyListeners('gemsChanged', { amount, total: this.premiumGems, source });
      this.dataManager.saveToFirebase();
    }
    
    spendGems(amount, item = 'unknown') {
      if (this.premiumGems < amount) {
        console.warn(`❌ Not enough gems! Have: ${this.premiumGems}, Need: ${amount}`);
        this.dataManager.notifyListeners('insufficientGems', { have: this.premiumGems, need: amount });
        return false;
      }
      
      this.premiumGems -= amount;
      console.log(`💎 -${amount} gems (${item}). Remaining: ${this.premiumGems}`);
      this.dataManager.notifyListeners('gemsChanged', { amount: -amount, total: this.premiumGems, item });
      this.dataManager.saveToFirebase();
      return true;
    }
    
    // 🎁 Daily rewards systém
    claimDailyReward() {
      const now = new Date();
      const lastClaim = this.dailyRewards.lastClaim ? new Date(this.dailyRewards.lastClaim) : null;
      
      if (lastClaim) {
        const hoursSinceLastClaim = (now - lastClaim) / (1000 * 60 * 60);
        
        if (hoursSinceLastClaim < 24) {
          const hoursRemaining = Math.ceil(24 - hoursSinceLastClaim);
          console.warn(`⏰ Daily reward available in ${hoursRemaining} hours`);
          return { success: false, hoursRemaining };
        }
        
        // Check if streak continues (claimed within 48 hours)
        if (hoursSinceLastClaim <= 48) {
          // 30denní cyklus - po 30 dnech se vrátí na den 1
          this.dailyRewards.streak = (this.dailyRewards.streak % 30) + 1;
        } else {
          this.dailyRewards.streak = 1;
        }
      } else {
        this.dailyRewards.streak = 1;
      }
      
      // Calculate reward based on streak
      const baseReward = 500000;  // 🚀 Vyšší základní odměna pro bohaté hráče!
      const streakBonus = Math.min(this.dailyRewards.streak * 100000, 2000000); // Max 2M bonus
      const totalReward = baseReward + streakBonus;
      
      // Bonus gems every 7 days
      let gemReward = 0;
      if (this.dailyRewards.streak % 7 === 0) {
        gemReward = 5 * Math.floor(this.dailyRewards.streak / 7);
      }
      
      // Bonus training point každý 3. den
      let trainingPointBonus = 0;
      if (this.dailyRewards.streak % 3 === 0) {
        trainingPointBonus = 1;
        this.dataManager.attributesManager.training.dailyTrainingPoints += 1;
      }
      
      this.dailyRewards.lastClaim = now;
      this.dailyRewards.nextReward = baseReward + Math.min((this.dailyRewards.streak + 1) * 100000, 2000000);

      // Ulož stav do localStorage, aby se po restartu zachoval
      if (typeof window !== 'undefined') {
        localStorage.setItem('dailyRewards', JSON.stringify(this.dailyRewards));
      }
      
      this.addCoins(totalReward, `Daily reward (${this.dailyRewards.streak} day streak)`);
      if (gemReward > 0) {
        this.addGems(gemReward, `Weekly streak bonus`);
      }
      
      this.dataManager.saveToFirebase();
      
      return { 
        success: true, 
        reward: totalReward,
        gemReward: gemReward,
        trainingPointBonus: trainingPointBonus,
        streak: this.dailyRewards.streak,
        nextReward: this.dailyRewards.nextReward
      };
    }
    
    getDailyRewardStatus() {
      if (!this.dailyRewards.lastClaim) {
        return { available: true, hoursRemaining: 0, streak: 0 };
      }
      
      const now = new Date();
      const lastClaim = new Date(this.dailyRewards.lastClaim);
      const hoursSinceLastClaim = (now - lastClaim) / (1000 * 60 * 60);
      const hoursRemaining = Math.max(0, Math.ceil(24 - hoursSinceLastClaim));
      
      return {
        available: hoursSinceLastClaim >= 24,
        hoursRemaining: hoursRemaining,
        streak: this.dailyRewards.streak,
        nextReward: this.dailyRewards.nextReward
      };
    }
    
    // 🎮 Rewards za různé akce
    rewardMatchWin(goals = 0) {
      const baseReward = 100000;    // 🚀 Vyšší odměna za výhru!
      const goalBonus = goals * 20000; // 20k za gól!
      const totalReward = baseReward + goalBonus;
      
      this.addCoins(totalReward, `Match win (${goals} goals)`);
      
      return { coins: totalReward };
    }
    
    rewardMatchDraw() {
      this.addCoins(50000, 'Match draw'); // 🚀 50k za remízu!
      return { coins: 50000 };
    }
    
    rewardMatchLoss() {
      this.addCoins(25000, 'Match participation'); // 🚀 25k za účast!
      return { coins: 25000 };
    }
    
    rewardGoal() {
      this.addCoins(20000, 'Goal scored'); // 🚀 20k za gól!
      return { coins: 20000 };
    }
    
    rewardStadiumCreated() {
      this.addCoins(2000000, 'Stadium created'); // 🚀 2M za stadion!
      return { coins: 2000000 };
    }
    
    // 🏪 Inventory management - purchase metody
    purchaseItem(itemType, itemId, cost, currency = 'coins') {
      let purchaseSuccess = false;
      
      if (currency === 'coins') {
        purchaseSuccess = this.spendCoins(cost, `${itemType}: ${itemId}`);
      } else if (currency === 'gems') {
        purchaseSuccess = this.spendGems(cost, `${itemType}: ${itemId}`);
      }
      
      if (!purchaseSuccess) {
        return false;
      }
      
      // Přidej do inventory přes customization manager
      return this.dataManager.customizationManager.addToInventory(itemType, itemId, cost, currency);
    }
    
    // 📊 Gettery pro UI
    getFormattedMoney() {
      return {
        coins: this.virtualCoins.toLocaleString('cs-CZ'),
        gems: this.premiumGems.toLocaleString('cs-CZ'),
        real: `${this.realMoneyBalance.toFixed(2)} Kč`
      };
    }
    
    // 💾 Export/Import
    exportData() {
      return {
        virtualCoins: this.virtualCoins,
        premiumGems: this.premiumGems,
        realMoneyBalance: this.realMoneyBalance,
        dailyRewards: this.dailyRewards
      };
    }
    
    importData(data) {
      this.virtualCoins = data.virtualCoins ?? this.virtualCoins;
      this.premiumGems = data.premiumGems ?? this.premiumGems;
      this.realMoneyBalance = data.realMoneyBalance ?? this.realMoneyBalance;
      if (data.dailyRewards) {
        const localLast = this.dailyRewards.lastClaim ? new Date(this.dailyRewards.lastClaim) : null;
        const remoteLast = data.dailyRewards.lastClaim ? new Date(data.dailyRewards.lastClaim) : null;

        // Ponech si novější záznam - nevracej se k starším odměnám
        if (remoteLast && (!localLast || remoteLast > localLast)) {
          this.dailyRewards = { ...this.dailyRewards, ...data.dailyRewards };
        } else {
          this.dailyRewards = { ...data.dailyRewards, ...this.dailyRewards };
        }
      }

      // Aktualizuj localStorage, aby se data zachovala mezi relacemi
      if (typeof window !== 'undefined') {
        localStorage.setItem('dailyRewards', JSON.stringify(this.dailyRewards));
      }

      this._coinFormatted = this.virtualCoins.toLocaleString('cs-CZ');
    }
    
    // 🛠️ Debug metody
    debugAddCoins(amount) {
      if (process.env.NODE_ENV === 'development') {
        this.addCoins(amount, 'DEBUG');
      }
    }
    
    debugAddGems(amount) {
      if (process.env.NODE_ENV === 'development') {
        this.addGems(amount, 'DEBUG');
      }
    }
  }