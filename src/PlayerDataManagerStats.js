// src/PlayerDataManagerStats.js - 📊 Statistiky, level systém a achievementy
export class PlayerStatsManager {
    constructor(dataManager) {
      this.dataManager = dataManager;
      
      // 📊 Progrese
      this.level = 1;
      this.experience = 0;
      this.nextLevelExp = 100;      // EXP potřebné pro další level
      
      // 🎮 Statistiky
      this.stats = {
        matchesPlayed: 0,
        matchesWon: 0,
        goalsScored: 0,
        stadiumsCreated: 0,
        totalPlayTime: 0,           // v minutách
        achievements: []
      };
      
      // 🏆 Achievementy
      this.achievements = {
        unlocked: [],              // ID odemčených achievementů
        progress: {}               // Progres k jednotlivým achievementům
      };
      
      // Cache pro rychlý přístup
      this._levelProgress = 0;
    }
    
    // 📊 Level systém
    addExperience(amount, action = 'unknown') {
      this.experience += amount;
      console.log(`⭐ +${amount} EXP (${action})`);
      
      // Check level up
      while (this.experience >= this.nextLevelExp) {
        this.experience -= this.nextLevelExp;
        this.level++;
        this.nextLevelExp = this.calculateNextLevelExp(this.level);
        
        // Level up rewards!
        const levelReward = this.level * 100;
        const gemReward = Math.floor(this.level / 5) * 10; // Každý 5. level dává gemy
        
        this.dataManager.economy.addCoins(levelReward, `Level ${this.level} reward`);
        if (gemReward > 0) {
          this.dataManager.economy.addGems(gemReward, `Level ${this.level} bonus`);
        }
        
        // Training points bonus každý level
        this.dataManager.attributesManager.training.dailyTrainingPoints += 1; // Extra training point
        
        console.log(`🎉 LEVEL UP! Now level ${this.level}`);
        this.dataManager.notifyListeners('levelUp', { 
          newLevel: this.level, 
          coinReward: levelReward,
          gemReward: gemReward,
          nextLevelExp: this.nextLevelExp,
          bonusTrainingPoint: true
        });
        
        // Odemkni nové předměty na určitých levelech
        this.dataManager.customizationManager.checkLevelUnlocks(this.level);
      }
      
      this._levelProgress = this.experience / this.nextLevelExp;
      
      this.dataManager.notifyListeners('experienceChanged', { 
        amount, 
        total: this.experience, 
        level: this.level,
        progress: this._levelProgress 
      });
      
      this.dataManager.saveToFirebase();
    }
    
    calculateNextLevelExp(level) {
      // Exponenciální růst EXP potřebných pro level
      return Math.floor(100 * Math.pow(1.5, level - 1));
    }
    
    // 📊 Statistiky management
    updateStats(statName, value = 1) {
      if (typeof this.stats[statName] === 'number') {
        this.stats[statName] += value;
      } else if (Array.isArray(this.stats[statName])) {
        this.stats[statName].push(value);
      }
      
      // Check achievements
      this.checkAchievements(statName, this.stats[statName]);
      
      this.dataManager.notifyListeners('statsUpdated', { statName, value, newTotal: this.stats[statName] });
      this.dataManager.saveToFirebase();
    }
    
    getWinRate() {
      return this.stats.matchesPlayed > 0 ? 
        (this.stats.matchesWon / this.stats.matchesPlayed * 100).toFixed(1) : 0;
    }
    
    // 🏆 Achievement system
    checkAchievements(stat, value) {
      const achievementCriteria = {
        goalsScored: [
          { id: 'first_goal', threshold: 1, reward: { coins: 100 }, title: 'První gól!' },
          { id: 'goal_10', threshold: 10, reward: { coins: 500 }, title: 'Střelec' },
          { id: 'goal_50', threshold: 50, reward: { coins: 1000, gems: 10 }, title: 'Kanonýr' },
          { id: 'goal_100', threshold: 100, reward: { coins: 2000, gems: 25 }, title: 'Legenda' }
        ],
        matchesWon: [
          { id: 'first_win', threshold: 1, reward: { coins: 150 }, title: 'První výhra!' },
          { id: 'win_10', threshold: 10, reward: { coins: 750 }, title: 'Vítěz' },
          { id: 'win_50', threshold: 50, reward: { coins: 2000, gems: 20 }, title: 'Šampion' }
        ],
        stadiumsCreated: [
          { id: 'first_stadium', threshold: 1, reward: { coins: 200 }, title: 'Architekt' },
          { id: 'stadium_5', threshold: 5, reward: { coins: 1000, gems: 15 }, title: 'Stavitel' }
        ],
        level: [
          { id: 'level_5', threshold: 5, reward: { coins: 500 }, title: 'Začátečník' },
          { id: 'level_10', threshold: 10, reward: { coins: 1000, gems: 10 }, title: 'Hráč' },
          { id: 'level_25', threshold: 25, reward: { coins: 2500, gems: 25 }, title: 'Veterán' },
          { id: 'level_50', threshold: 50, reward: { coins: 5000, gems: 50 }, title: 'Mistr' }
        ]
      };
      
      const criteria = achievementCriteria[stat];
      if (!criteria) return;
      
      criteria.forEach(achievement => {
        if (value >= achievement.threshold && !this.achievements.unlocked.includes(achievement.id)) {
          this.achievements.unlocked.push(achievement.id);
          
          // Vyplať odměny
          if (achievement.reward.coins) {
            this.dataManager.economy.addCoins(achievement.reward.coins, `Achievement: ${achievement.title}`);
          }
          if (achievement.reward.gems) {
            this.dataManager.economy.addGems(achievement.reward.gems, `Achievement: ${achievement.title}`);
          }
          
          this.dataManager.notifyListeners('achievementUnlocked', {
            id: achievement.id,
            title: achievement.title,
            reward: achievement.reward
          });
        }
      });
      
      // Zkontroluj level achievementy
      if (stat === 'level') {
        this.checkAchievements('level', this.level);
      }
    }
    
    // Získat všechny odemčené achievementy
    getUnlockedAchievements() {
      return [...this.achievements.unlocked];
    }
    
    // Zkontrolovat jestli má achievement
    hasAchievement(achievementId) {
      return this.achievements.unlocked.includes(achievementId);
    }
    
    // Získat progres k achievementu
    getAchievementProgress(achievementId, stat) {
      const currentValue = this.stats[stat] || this.level;
      // Zde by byla logika pro výpočet progresu
      return {
        current: currentValue,
        target: 100, // Toto by se mělo načítat z criteria
        percentage: Math.min((currentValue / 100) * 100, 100)
      };
    }
    
    // 🎮 Rewards za akce (kombinuje rewards s experience)
    rewardMatchWin(goals = 0) {
      const economyReward = this.dataManager.economy.rewardMatchWin(goals);
      this.addExperience(50 + goals * 10, 'Match win');
      this.updateStats('matchesWon');
      this.updateStats('matchesPlayed');
      
      return { ...economyReward, experience: 50 + goals * 10 };
    }
    
    rewardMatchDraw() {
      const economyReward = this.dataManager.economy.rewardMatchDraw();
      this.addExperience(25, 'Match draw');
      this.updateStats('matchesPlayed');
      
      return { ...economyReward, experience: 25 };
    }
    
    rewardMatchLoss() {
      const economyReward = this.dataManager.economy.rewardMatchLoss();
      this.addExperience(15, 'Match participation');
      this.updateStats('matchesPlayed');
      
      return { ...economyReward, experience: 15 };
    }
    
    rewardGoal() {
      const economyReward = this.dataManager.economy.rewardGoal();
      this.addExperience(10, 'Goal scored');
      this.updateStats('goalsScored');
      
      // Micro-training za gól
      const microGain = this.dataManager.attributesManager.rewardGoalMicroTraining();
      
      return { ...economyReward, experience: 10, microTraining: microGain };
    }
    
    rewardStadiumCreated() {
      const economyReward = this.dataManager.economy.rewardStadiumCreated();
      this.addExperience(100, 'Stadium created');
      this.updateStats('stadiumsCreated');
      
      return { ...economyReward, experience: 100 };
    }
    
    // 📊 Gettery pro UI
    getPlayerSummary() {
      return {
        level: this.level,
        levelProgress: this._levelProgress,
        experience: this.experience,
        nextLevelExp: this.nextLevelExp,
        winRate: this.getWinRate(),
        totalGoals: this.stats.goalsScored,
        matchesPlayed: this.stats.matchesPlayed,
        matchesWon: this.stats.matchesWon,
        stadiumsCreated: this.stats.stadiumsCreated,
        achievementsCount: this.achievements.unlocked.length
      };
    }
    
    // 💾 Export/Import
    exportData() {
      return {
        level: this.level,
        experience: this.experience,
        nextLevelExp: this.nextLevelExp,
        stats: this.stats,
        achievements: this.achievements
      };
    }
    
    importData(data) {
      this.level = data.level ?? this.level;
      this.experience = data.experience ?? this.experience;
      this.nextLevelExp = data.nextLevelExp ?? this.nextLevelExp;
      this.stats = { ...this.stats, ...data.stats };
      this.achievements = { ...this.achievements, ...data.achievements };
      
      this._levelProgress = this.experience / this.nextLevelExp;
    }
    
    // 🔄 Reset functions
    resetProgress() {
      this.level = 1;
      this.experience = 0;
      this.nextLevelExp = 100;
      this.stats = {
        matchesPlayed: 0,
        matchesWon: 0,
        goalsScored: 0,
        stadiumsCreated: 0,
        totalPlayTime: 0,
        achievements: []
      };
      this.achievements = {
        unlocked: [],
        progress: {}
      };
      
      this._levelProgress = 0;
    }
    
    // 🛠️ Debug metody
    debugSetLevel(level) {
      if (process.env.NODE_ENV === 'development') {
        this.level = level;
        this.nextLevelExp = this.calculateNextLevelExp(level);
        this.experience = 0;
        this._levelProgress = 0;
        this.dataManager.saveToFirebase();
        this.dataManager.notifyListeners('levelChanged', { level });
        console.log(`🛠️ DEBUG: Set level to ${level}`);
      }
    }
    
    debugAddExperience(amount) {
      if (process.env.NODE_ENV === 'development') {
        this.addExperience(amount, 'DEBUG');
      }
    }
    
    debugUnlockAllAchievements() {
      if (process.env.NODE_ENV === 'development') {
        const allAchievements = [
          'first_goal', 'goal_10', 'goal_50', 'goal_100',
          'first_win', 'win_10', 'win_50',
          'first_stadium', 'stadium_5',
          'level_5', 'level_10', 'level_25', 'level_50'
        ];
        
        this.achievements.unlocked = [...allAchievements];
        this.dataManager.saveToFirebase();
        console.log('🛠️ DEBUG: All achievements unlocked');
      }
    }
  }