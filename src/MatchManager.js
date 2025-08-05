// src/MatchManager.js - Jednoduchý systém časomíry a skóre
import { playerDataManager } from './PlayerDataManager.js';
import * as logger from './utils/logger.js';

class MatchManager {
  constructor() {
    if (MatchManager.instance) {
      return MatchManager.instance;
    }
    
    // === ZÁKLADNÍ NASTAVENÍ ===
    this.matchDuration = 60; // 1 minuta v sekundách
    this.currentTime = 0; // Aktuální čas v sekundách
    this.isRunning = false;
    this.isPaused = false;
    
    // === SKÓRE SYSTÉM ===
    this.score = {
      player: 0,  // Hráč (levá branka x=-20)
      opponent: 0 // Soupeř (pravá branka x=20) 
    };
    
    // === GAME STATES ===
    this.matchState = 'ready'; // ready, playing, paused, ended
    this.matchResult = null; // win, lose, draw
    
    // === EVENT LISTENERS ===
    this.listeners = {
      timeUpdate: [],
      goalScored: [],
      matchEnd: [],
      stateChange: []
    };
    
    // === GOAL DETECTION ===
    this.lastGoalTime = 0;
    this.celebrationDuration = 3000; // 3 sekundy oslava
    this.isInCelebration = false;
    
    logger.info('⚽ MatchManager initialized - 1 minute match ready!');
    MatchManager.instance = this;
  }
  
  // === ČASOMÍRA METODY ===
  
  startMatch() {
    if (this.matchState === 'ended') {
      logger.warn('❌ Cannot start - match already ended');
      return false;
    }
    
    this.isRunning = true;
    this.isPaused = false;
    this.matchState = 'playing';
    
    logger.info('🚀 Match started! Duration: 1 minute');
    this.notifyListeners('stateChange', { 
      state: 'playing', 
      time: this.currentTime,
      score: this.score 
    });
    
    return true;
  }
  
  pauseMatch() {
    if (this.matchState !== 'playing') return false;
    
    this.isPaused = true;
    this.matchState = 'paused';
    
    logger.info('⏸️ Match paused');
    this.notifyListeners('stateChange', { 
      state: 'paused', 
      time: this.currentTime,
      score: this.score 
    });
    
    return true;
  }
  
  resumeMatch() {
    if (this.matchState !== 'paused') return false;
    
    this.isPaused = false;
    this.matchState = 'playing';
    
    logger.info('▶️ Match resumed');
    this.notifyListeners('stateChange', { 
      state: 'playing', 
      time: this.currentTime,
      score: this.score 
    });
    
    return true;
  }
  
  endMatch() {
    this.isRunning = false;
    this.matchState = 'ended';
    
    // Určení výsledku
    if (this.score.player > this.score.opponent) {
      this.matchResult = 'win';
    } else if (this.score.player < this.score.opponent) {
      this.matchResult = 'lose';
    } else {
      this.matchResult = 'draw';
    }
    
    logger.info(`🏁 Match ended! Result: ${this.matchResult}`, this.score);
    
    // PlayerData rewards
    this.giveMatchRewards();
    
    this.notifyListeners('matchEnd', {
      result: this.matchResult,
      score: this.score,
      duration: this.currentTime
    });
    
    return this.matchResult;
  }
  
  // === SKÓRE METODY ===
  
  scoreGoal(team) {
    if (this.matchState !== 'playing' || this.isInCelebration) return false;
    
    // Zabránění duplikátním gólům
    const now = Date.now();
    if (now - this.lastGoalTime < 1000) return false;
    
    this.lastGoalTime = now;
    this.isInCelebration = true;
    
    // Započítání gólu
    if (team === 'player') {
      this.score.player++;
      logger.info(`⚽ GÓL! Hráč skóroval! ${this.score.player}-${this.score.opponent}`);
      
      // PlayerData reward
      playerDataManager.rewardGoal();
      
    } else if (team === 'opponent') {
      this.score.opponent++;
      logger.info(`😞 Soupeř skórował! ${this.score.player}-${this.score.opponent}`);
    }
    
    // Notify listeners
    this.notifyListeners('goalScored', {
      team: team,
      score: this.score,
      time: this.currentTime
    });
    
    // Ukončení oslavy po 3 sekundách
    setTimeout(() => {
      this.isInCelebration = false;
      logger.debug('🎉 Goal celebration ended');
    }, this.celebrationDuration);
    
    return true;
  }
  
  // === GOAL DETECTION ===
  
  checkGoalScored(ballPosition, ballVelocity) {
    if (this.matchState !== 'playing' || this.isInCelebration) return null;
    
    // Parametry branek z FieldUtils.js
    const goalWidth = 3; // šířka branky
    const goalHeight = 1.5; // výška branky
    const goalDepth = 2; // hloubka branky
    
    const leftGoalX = -20; // Levá branka (hráč útočí)
    const rightGoalX = 20;  // Pravá branka (soupeř útočí)
    
    const ballX = ballPosition.x;
    const ballY = ballPosition.y;
    const ballZ = ballPosition.z;
    
    // Kontrola výšky míče (musí být pod břevnem)
    if (ballY > goalHeight || ballY < 0) return null;
    
    // Kontrola šířky (míč musí být mezi tyčemi)
    if (Math.abs(ballZ) > goalWidth / 2) return null;
    
    // === LEVÁ BRANKA (hráč skóruje) ===
    if (ballX <= leftGoalX && ballX >= leftGoalX - goalDepth) {
      // Kontrola směru pohybu míče (musí jít směrem do branky)
      if (ballVelocity.x < 0) {
        return 'player';
      }
    }
    
    // === PRAVÁ BRANKA (soupeř skóruje) ===
    if (ballX >= rightGoalX && ballX <= rightGoalX + goalDepth) {
      // Kontrola směru pohybu míče (musí jít směrem do branky)
      if (ballVelocity.x > 0) {
        return 'opponent';
      }
    }
    
    return null;
  }
  
  // === UPDATE METODA ===
  
  update(deltaTime) {
    if (!this.isRunning || this.isPaused || this.matchState === 'ended') return;
    
    // Aktualizace času
    this.currentTime += deltaTime;
    
    // Kontrola konce zápasu
    if (this.currentTime >= this.matchDuration) {
      this.currentTime = this.matchDuration;
      this.endMatch();
      return;
    }
    
    // Notify time update (každých 100ms pro plynulé UI)
    this.notifyListeners('timeUpdate', {
      currentTime: this.currentTime,
      remainingTime: this.matchDuration - this.currentTime,
      formattedTime: this.getFormattedTime()
    });
  }
  
  // === UTILITY METODY ===
  
  getFormattedTime() {
    const remaining = Math.max(0, this.matchDuration - this.currentTime);
    const minutes = Math.floor(remaining / 60);
    const seconds = Math.floor(remaining % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
  
  getMatchProgress() {
    return Math.min(this.currentTime / this.matchDuration, 1.0);
  }
  
  getRemainingTime() {
    return Math.max(0, this.matchDuration - this.currentTime);
  }
  
  getScoreString() {
    return `${this.score.player} - ${this.score.opponent}`;
  }
  
  // === RESET METODY ===
  
  resetMatch() {
    this.currentTime = 0;
    this.isRunning = false;
    this.isPaused = false;
    this.matchState = 'ready';
    this.matchResult = null;
    this.score = { player: 0, opponent: 0 };
    this.isInCelebration = false;
    this.lastGoalTime = 0;
    
    logger.info('🔄 Match reset - ready for new game');
    this.notifyListeners('stateChange', { 
      state: 'ready', 
      time: 0,
      score: this.score 
    });
  }
  
  // === REWARDS ===
  
  giveMatchRewards() {
    const baseCoins = 50;
    const baseExp = 25;
    
    switch (this.matchResult) {
      case 'win':
        playerDataManager.addCoins(baseCoins * 2, 'match_win');
        playerDataManager.addExperience(baseExp * 2, 'match_win');
        playerDataManager.stats.matchesWon++;
        logger.info('🏆 Victory rewards: +100 coins, +50 EXP');
        break;
        
      case 'draw':
        playerDataManager.addCoins(baseCoins, 'match_draw');
        playerDataManager.addExperience(baseExp, 'match_draw');
        logger.info('🤝 Draw rewards: +50 coins, +25 EXP');
        break;
        
      case 'lose':
        playerDataManager.addCoins(baseCoins / 2, 'match_participation');
        playerDataManager.addExperience(baseExp / 2, 'match_participation');
        logger.info('💪 Participation rewards: +25 coins, +12 EXP');
        break;
    }
    
    // Vždy započítej zápas
    playerDataManager.stats.matchesPlayed++;
    playerDataManager.saveToFirebase();
  }
  
  // === EVENT SYSTEM ===
  
  addEventListener(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event].push(callback);
    }
  }
  
  removeEventListener(event, callback) {
    if (this.listeners[event]) {
      const index = this.listeners[event].indexOf(callback);
      if (index > -1) {
        this.listeners[event].splice(index, 1);
      }
    }
  }
  
  notifyListeners(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          logger.error(`Error in ${event} listener:`, error);
        }
      });
    }
  }
  
  // === GETTER METODY ===
  
  isMatchRunning() {
    return this.isRunning && !this.isPaused;
  }
  
  isMatchEnded() {
    return this.matchState === 'ended';
  }
  
  isInGoalCelebration() {
    return this.isInCelebration;
  }
  
  getCurrentState() {
    return {
      time: this.currentTime,
      formattedTime: this.getFormattedTime(),
      remainingTime: this.getRemainingTime(),
      score: this.score,
      matchState: this.matchState,
      matchResult: this.matchResult,
      isRunning: this.isRunning,
      isPaused: this.isPaused,
      isInCelebration: this.isInCelebration,
      progress: this.getMatchProgress()
    };
  }
  
  // === DEBUG ===
  
  debugInfo() {
    logger.debug('⚽ MatchManager Debug Info:', {
      time: `${this.currentTime.toFixed(1)}s / ${this.matchDuration}s`,
      formattedTime: this.getFormattedTime(),
      score: this.getScoreString(),
      state: this.matchState,
      result: this.matchResult,
      isRunning: this.isRunning,
      isPaused: this.isPaused,
      celebration: this.isInCelebration
    });
  }
}

// Export singleton instance
export const matchManager = new MatchManager();