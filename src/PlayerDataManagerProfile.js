// src/PlayerDataManagerProfile.js - 👤 Profil hráče a nastavení
export class PlayerProfileManager {
    constructor(dataManager) {
      this.dataManager = dataManager;
      
      // 👤 Hráčská data
      this.playerProfile = {
        displayName: 'Nový hráč',
        avatarUrl: null,
        country: 'CZ',
        favoriteTeam: '',
        joinDate: new Date(),
        lastLogin: new Date(),
        bio: '',
        motto: '',
        preferredPosition: 'CAM'
      };
      
      // 🎵 Nastavení
      this.settings = {
        // Audio
        soundEnabled: true,
        musicEnabled: true,
        soundVolume: 0.7,
        musicVolume: 0.5,
        
        // Grafika
        graphicsQuality: 'high',   // low, medium, high
        showFPS: false,
        particleEffects: true,
        shadows: true,
        antiAliasing: true,
        
        // Gameplay
        autoSave: true,
        difficultLevel: 'normal',  // easy, normal, hard
        cameraMode: 'dynamic',     // static, dynamic, follow
        
        // UI
        notifications: true,
        language: 'cs',            // čeština default
        showTutorials: true,
        compactMode: false,
        
        // Privacy
        shareStats: true,
        showOnline: true,
        allowFriendRequests: true
      };
    }
    
    // 👤 Profile management
    updateProfile(updates) {
      Object.assign(this.playerProfile, updates);
      this.playerProfile.lastLogin = new Date();
      
      console.log('👤 Profile updated:', updates);
      this.dataManager.notifyListeners('profileUpdated', this.playerProfile);
      this.dataManager.saveToFirebase();
    }
    
    getProfile() {
      return { ...this.playerProfile };
    }
    
    // Nastavit avatar
    setAvatar(avatarUrl) {
      this.updateProfile({ avatarUrl });
    }
    
    // Nastavit jméno
    setDisplayName(name) {
      if (name && name.trim().length > 0) {
        this.updateProfile({ displayName: name.trim() });
        return true;
      }
      return false;
    }
    
    // Nastavit zemi
    setCountry(countryCode) {
      this.updateProfile({ country: countryCode });
    }
    
    // Nastavit oblíbený tým
    setFavoriteTeam(team) {
      this.updateProfile({ favoriteTeam: team });
    }
    
    // Nastavit bio
    setBio(bio) {
      this.updateProfile({ bio: bio.slice(0, 200) }); // Max 200 znaků
    }
    
    // Nastavit motto
    setMotto(motto) {
      this.updateProfile({ motto: motto.slice(0, 50) }); // Max 50 znaků
    }
    
    // Nastavit preferovanou pozici
    setPreferredPosition(position) {
      const validPositions = ['GK', 'CB', 'LB', 'RB', 'CM', 'CAM', 'LM', 'RM', 'ST', 'LW', 'RW'];
      if (validPositions.includes(position)) {
        this.updateProfile({ preferredPosition: position });
        return true;
      }
      return false;
    }
    
    // 🎵 Settings management
    updateSettings(newSettings) {
      const oldSettings = { ...this.settings };
      Object.assign(this.settings, newSettings);
      
      console.log('⚙️ Settings updated:', newSettings);
      
      // Aplikuj změny
      this.applySettings(newSettings, oldSettings);
      
      this.dataManager.notifyListeners('settingsChanged', this.settings);
      this.dataManager.saveToFirebase();
    }
    
    getSettings() {
      return { ...this.settings };
    }
    
    // Aplikovat nastavení
    applySettings(newSettings, oldSettings) {
      // Audio změny
      if (newSettings.soundVolume !== undefined) {
        this.applySoundVolumeChange(newSettings.soundVolume);
      }
      
      if (newSettings.musicVolume !== undefined) {
        this.applyMusicVolumeChange(newSettings.musicVolume);
      }
      
      if (newSettings.soundEnabled !== undefined) {
        this.applySoundEnabledChange(newSettings.soundEnabled);
      }
      
      if (newSettings.musicEnabled !== undefined) {
        this.applyMusicEnabledChange(newSettings.musicEnabled);
      }
      
      // Grafické změny
      if (newSettings.graphicsQuality !== undefined && 
          newSettings.graphicsQuality !== oldSettings.graphicsQuality) {
        this.applyGraphicsQualityChange(newSettings.graphicsQuality);
      }
      
      // Jazykové změny
      if (newSettings.language !== undefined && 
          newSettings.language !== oldSettings.language) {
        this.applyLanguageChange(newSettings.language);
      }
    }
    
    // Audio aplikace
    applySoundVolumeChange(volume) {
      console.log(`🔊 Sound volume changed to: ${volume}`);
      // Tady by se aplikovala změna hlasitosti zvuků
      this.dataManager.notifyListeners('soundVolumeChanged', volume);
    }
    
    applyMusicVolumeChange(volume) {
      console.log(`🎵 Music volume changed to: ${volume}`);
      // Tady by se aplikovala změna hlasitosti hudby
      this.dataManager.notifyListeners('musicVolumeChanged', volume);
    }
    
    applySoundEnabledChange(enabled) {
      console.log(`🔊 Sound ${enabled ? 'enabled' : 'disabled'}`);
      this.dataManager.notifyListeners('soundEnabledChanged', enabled);
    }
    
    applyMusicEnabledChange(enabled) {
      console.log(`🎵 Music ${enabled ? 'enabled' : 'disabled'}`);
      this.dataManager.notifyListeners('musicEnabledChanged', enabled);
    }
    
    // Grafické aplikace
    applyGraphicsQualityChange(quality) {
      console.log(`🎨 Graphics quality changed to: ${quality}`);
      this.dataManager.notifyListeners('graphicsQualityChanged', quality);
    }
    
    // Jazyková aplikace
    applyLanguageChange(language) {
      console.log(`🌍 Language changed to: ${language}`);
      this.dataManager.notifyListeners('languageChanged', language);
    }
    
    // 📊 Profile statistiky
    getProfileStats() {
      const stats = this.dataManager.statsManager?.getPlayerSummary() || {};
      
      return {
        ...this.playerProfile,
        ...stats,
        overallRating: this.dataManager.attributesManager?.getOverallRating() || 1,
        positionRating: this.dataManager.attributesManager?.getPositionRating(this.playerProfile.preferredPosition) || 1,
        playTime: this.calculatePlayTime(),
        joinedDaysAgo: this.calculateDaysJoined()
      };
    }
    
    calculatePlayTime() {
      // Vrátí čas ve formátu "X hodin Y minut"
      const totalMinutes = this.dataManager.statsManager?.stats.totalPlayTime || 0;
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      
      if (hours > 0) {
        return `${hours}h ${minutes}m`;
      } else {
        return `${minutes}m`;
      }
    }
    
    calculateDaysJoined() {
      const joinDate = new Date(this.playerProfile.joinDate);
      const now = new Date();
      const diffTime = Math.abs(now - joinDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      return diffDays;
    }
    
    // 🎯 Presets pro rychlé nastavení
    applySettingsPreset(presetName) {
      const presets = {
        'low_performance': {
          graphicsQuality: 'low',
          showFPS: true,
          particleEffects: false,
          shadows: false,
          antiAliasing: false,
          soundVolume: 0.5,
          musicVolume: 0.3
        },
        'balanced': {
          graphicsQuality: 'medium',
          showFPS: false,
          particleEffects: true,
          shadows: true,
          antiAliasing: false,
          soundVolume: 0.7,
          musicVolume: 0.5
        },
        'high_quality': {
          graphicsQuality: 'high',
          showFPS: false,
          particleEffects: true,
          shadows: true,
          antiAliasing: true,
          soundVolume: 0.8,
          musicVolume: 0.6
        },
        'silent': {
          soundEnabled: false,
          musicEnabled: false,
          notifications: false
        },
        'competitive': {
          difficultLevel: 'hard',
          showFPS: true,
          cameraMode: 'static',
          compactMode: true,
          showTutorials: false
        }
      };
      
      const preset = presets[presetName];
      if (preset) {
        this.updateSettings(preset);
        console.log(`✅ Applied settings preset: ${presetName}`);
        return true;
      }
      
      console.warn(`❌ Unknown preset: ${presetName}`);
      return false;
    }
    
    // 💾 Export/Import
    exportData() {
      return {
        playerProfile: this.playerProfile,
        settings: this.settings
      };
    }
    
    importData(data) {
      this.playerProfile = { ...this.playerProfile, ...data.playerProfile };
      this.settings = { ...this.settings, ...data.settings };
    }
    
    // 🔄 Reset functions
    resetProfile() {
      this.playerProfile = {
        displayName: 'Nový hráč',
        avatarUrl: null,
        country: 'CZ',
        favoriteTeam: '',
        joinDate: new Date(),
        lastLogin: new Date(),
        bio: '',
        motto: '',
        preferredPosition: 'CAM'
      };
    }
    
    resetSettings() {
      this.settings = {
        soundEnabled: true,
        musicEnabled: true,
        soundVolume: 0.7,
        musicVolume: 0.5,
        graphicsQuality: 'high',
        showFPS: false,
        particleEffects: true,
        shadows: true,
        antiAliasing: true,
        autoSave: true,
        difficultLevel: 'normal',
        cameraMode: 'dynamic',
        notifications: true,
        language: 'cs',
        showTutorials: true,
        compactMode: false,
        shareStats: true,
        showOnline: true,
        allowFriendRequests: true
      };
    }
    
    // 🛠️ Debug metody
    debugRandomProfile() {
      if (process.env.NODE_ENV === 'development') {
        const randomNames = ['Alex', 'Jordan', 'Sam', 'Casey', 'Taylor', 'Morgan'];
        const randomCountries = ['CZ', 'SK', 'PL', 'DE', 'AT', 'HU'];
        const randomTeams = ['Sparta', 'Slavia', 'Baník', 'Plzeň', 'Brno'];
        const randomPositions = ['ST', 'CAM', 'CM', 'CB', 'GK'];
        
        this.updateProfile({
          displayName: randomNames[Math.floor(Math.random() * randomNames.length)],
          country: randomCountries[Math.floor(Math.random() * randomCountries.length)],
          favoriteTeam: randomTeams[Math.floor(Math.random() * randomTeams.length)],
          preferredPosition: randomPositions[Math.floor(Math.random() * randomPositions.length)],
          bio: 'Randomly generated profile for testing',
          motto: 'Debug mode activated!'
        });
        
        console.log('🛠️ DEBUG: Random profile generated');
      }
    }
  }