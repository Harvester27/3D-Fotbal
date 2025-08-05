// src/PlayerDataManagerCustomization.js - 🎨 Vzhled hráče a inventory
export class PlayerCustomizationManager {
    constructor(dataManager) {
      this.dataManager = dataManager;
      
      // ⚽ Customizace hráče - ROZŠÍŘENÁ VERZE
      this.playerCustomization = {
        // Vzhled
        skinColor: 0xf4c2a1,       // Realističtější defaultní barva pleti
        hairColor: 0x1a0f08,       // Tmavě hnědá
        hairStyle: 'realistic',     // Styl vlasů: realistic, short, buzz, mohawk, long, afro, spiky, ponytail, bald, dreadlocks, manbun, undercut
        eyeColor: 0x3d2817,        // Hnědé oči
        
        // Postava
        height: 1.0,               // Výška postavy (0.9 - 1.2)
        build: 1.0,                // Postava (0.9 - 1.2)
        
        // Dres a oblečení
        jerseyColor: 0xfafafa,     // Barva dresu
        jerseyNumber: 10,          // Číslo na dresu
        jerseyName: '',            // Jméno na dresu
        jerseyStyle: 'classic',    // classic, modern, retro
        shortsColor: 0xe8e8e8,     // Barva šortek
        socksColor: 0x4a90e2,      // Barva ponožek
        shoesColor: 0x0a0a0a,      // Barva kopaček
        shoesStyle: 'modern',      // modern, classic, pro
        
        // Doplňky - rozšířené
        accessories: {
          gloves: false,
          headband: false,
          wristbands: false,
          necklace: false,
          earrings: false,
          tattoo_arm: false,
          tattoo_leg: false,
          captain_band: false,
          shin_guards: false,
          ankle_tape: false
        }
      };
      
      // 🏪 Vlastněné předměty (pro obchod)
      this.inventory = {
        jerseys: ['classic'],      // Vlastněné styly dresů
        hairStyles: ['realistic', 'short'], // Vlastněné účesy (základní zdarma)
        accessories: [],           // Vlastněné doplňky
        stadiumThemes: ['default'], // Témata stadionů
        balls: ['default'],        // Styly míčů
        celebrations: ['basic'],   // Oslavy gólů
        jerseyDesigns: [],         // Speciální designy dresů
        
        // Training items
        trainingEquipment: [],     // Tréningové vybavení
        coaches: ['basic'],        // Vlastnění trenéři
        facilities: ['basic']      // Tréningová zařízení
      };
    }
    
    // 🎨 Customization metody
    updateCustomization(category, updates) {
      console.log('🎨 Updating customization:', { category, updates });
      console.log('👱 Updating hairStyle:', updates.hairStyle);
      
      if (category === 'appearance') {
        Object.assign(this.playerCustomization, updates);
      } else if (category === 'accessories') {
        Object.assign(this.playerCustomization.accessories, updates);
      } else {
        // Pro ostatní kategorie
        Object.assign(this.playerCustomization, updates);
      }
      
      console.log('🎨 New customization state:', this.playerCustomization);
      console.log('👱 New hairStyle:', this.playerCustomization.hairStyle);
      
      this.dataManager.notifyListeners('customizationChanged', { category, updates });
      this.dataManager.saveToFirebase();
    }
    
    // Zkontrolovat jestli má přístup k určitému stylu
    hasAccess(itemType, itemId) {
      return this.inventory[itemType]?.includes(itemId) || false;
    }
    
    // Získat všechny dostupné styly pro kategorii
    getAvailableItems(itemType) {
      return this.inventory[itemType] || [];
    }
    
    // 🏪 Inventory management
    addToInventory(itemType, itemId, cost = 0, currency = 'coins') {
      if (!this.inventory[itemType]) {
        this.inventory[itemType] = [];
      }
      
      if (!this.inventory[itemType].includes(itemId)) {
        this.inventory[itemType].push(itemId);
        this.dataManager.notifyListeners('itemPurchased', { itemType, itemId, cost, currency });
        this.dataManager.saveToFirebase();
        return true;
      }
      
      console.warn(`⚠️ Item already owned: ${itemType}/${itemId}`);
      return false;
    }
    
    ownsItem(itemType, itemId) {
      return this.inventory[itemType]?.includes(itemId) || false;
    }
    
    // Odemknout předměty na určitých levelech
    checkLevelUnlocks(level) {
      const levelUnlocks = {
        5: { type: 'hairStyles', items: ['mohawk'] },
        10: { type: 'accessories', items: ['captain_band'] },
        15: { type: 'jerseyDesigns', items: ['premium1'] },
        20: { type: 'celebrations', items: ['backflip'] },
        25: { type: 'stadiumThemes', items: ['night'] },
        
        // Training unlocks
        30: { type: 'coaches', items: ['professional'] },
        40: { type: 'facilities', items: ['advanced'] },
        50: { type: 'trainingEquipment', items: ['premium_gear'] }
      };
      
      const unlock = levelUnlocks[level];
      if (unlock) {
        unlock.items.forEach(item => {
          if (!this.inventory[unlock.type].includes(item)) {
            this.inventory[unlock.type].push(item);
            this.dataManager.notifyListeners('itemUnlocked', { 
              type: unlock.type, 
              item: item, 
              level: level 
            });
          }
        });
      }
    }
    
    // 🎨 Preset styly
    applyPresetStyle(presetName) {
      const presets = {
        'classic_player': {
          hairStyle: 'short',
          hairColor: 0x2c1810,
          jerseyStyle: 'classic',
          jerseyColor: 0xff0000,
          jerseyNumber: 10,
          shoesStyle: 'classic',
          accessories: {
            captain_band: true,
            shin_guards: true
          }
        },
        'modern_star': {
          hairStyle: 'undercut',
          hairColor: 0x1a0f08,
          jerseyStyle: 'modern',
          jerseyColor: 0x0066cc,
          jerseyNumber: 7,
          shoesStyle: 'pro',
          accessories: {
            wristbands: true,
            ankle_tape: true,
            tattoo_arm: true
          }
        },
        'retro_legend': {
          hairStyle: 'afro',
          hairColor: 0x3d2817,
          jerseyStyle: 'retro',
          jerseyColor: 0xffff00,
          jerseyNumber: 8,
          shoesStyle: 'classic',
          accessories: {
            headband: true,
            shin_guards: true
          }
        },
        'street_player': {
          hairStyle: 'dreadlocks',
          hairColor: 0x0a0a0a,
          jerseyStyle: 'modern',
          jerseyColor: 0x000000,
          jerseyNumber: 99,
          shoesStyle: 'modern',
          accessories: {
            necklace: true,
            earrings: true,
            tattoo_leg: true
          }
        }
      };
      
      const preset = presets[presetName];
      if (preset) {
        // Zkontroluj jestli má všechny požadované předměty
        const requiredItems = [];
        if (preset.hairStyle && !this.ownsItem('hairStyles', preset.hairStyle)) {
          requiredItems.push(`hairStyle: ${preset.hairStyle}`);
        }
        if (preset.jerseyStyle && !this.ownsItem('jerseys', preset.jerseyStyle)) {
          requiredItems.push(`jersey: ${preset.jerseyStyle}`);
        }
        
        if (requiredItems.length > 0) {
          console.warn('❌ Missing items for preset:', requiredItems);
          this.dataManager.notifyListeners('missingItemsForPreset', { 
            preset: presetName, 
            missing: requiredItems 
          });
          return false;
        }
        
        // Aplikuj preset
        this.updateCustomization('preset', preset);
        console.log(`✅ Applied preset: ${presetName}`);
        return true;
      }
      
      console.warn(`❌ Unknown preset: ${presetName}`);
      return false;
    }
    
    // 🎨 Náhodný vzhled
    generateRandomLook() {
      const availableHairStyles = this.getAvailableItems('hairStyles');
      const availableJerseys = this.getAvailableItems('jerseys');
      
      if (availableHairStyles.length === 0 || availableJerseys.length === 0) {
        console.warn('❌ Not enough items for random generation');
        return false;
      }
      
      const randomLook = {
        hairStyle: availableHairStyles[Math.floor(Math.random() * availableHairStyles.length)],
        hairColor: Math.floor(Math.random() * 0xffffff),
        eyeColor: Math.floor(Math.random() * 0xffffff),
        skinColor: 0xf4c2a1 + Math.floor(Math.random() * 0x202020) - 0x101010, // Variace v barvě pleti
        jerseyColor: Math.floor(Math.random() * 0xffffff),
        jerseyNumber: Math.floor(Math.random() * 99) + 1,
        jerseyStyle: availableJerseys[Math.floor(Math.random() * availableJerseys.length)],
        shortsColor: Math.floor(Math.random() * 0xffffff),
        socksColor: Math.floor(Math.random() * 0xffffff),
        shoesColor: Math.floor(Math.random() * 0xffffff),
        
        // Náhodné accessory
        accessories: {}
      };
      
      // Náhodně zapni některé accessories (jen ty které vlastní)
      Object.keys(this.playerCustomization.accessories).forEach(accessory => {
        if (this.ownsItem('accessories', accessory)) {
          randomLook.accessories[accessory] = Math.random() < 0.3; // 30% šance
        }
      });
      
      this.updateCustomization('random', randomLook);
      console.log('🎲 Generated random look');
      return true;
    }
    
    // 💾 Export/Import
    exportData() {
      return {
        playerCustomization: this.playerCustomization,
        inventory: this.inventory
      };
    }
    
    importData(data) {
      this.playerCustomization = { 
        ...this.playerCustomization, 
        ...data.playerCustomization,
        accessories: { 
          ...this.playerCustomization.accessories, 
          ...data.playerCustomization?.accessories 
        }
      };
      this.inventory = { ...this.inventory, ...data.inventory };
    }
    
    // 🔄 Reset functions
    resetCustomization() {
      this.playerCustomization = {
        skinColor: 0xf4c2a1,
        hairColor: 0x1a0f08,
        hairStyle: 'realistic',
        eyeColor: 0x3d2817,
        height: 1.0,
        build: 1.0,
        jerseyColor: 0xfafafa,
        jerseyNumber: 10,
        jerseyName: '',
        jerseyStyle: 'classic',
        shortsColor: 0xe8e8e8,
        socksColor: 0x4a90e2,
        shoesColor: 0x0a0a0a,
        shoesStyle: 'modern',
        accessories: {
          gloves: false,
          headband: false,
          wristbands: false,
          necklace: false,
          earrings: false,
          tattoo_arm: false,
          tattoo_leg: false,
          captain_band: false,
          shin_guards: false,
          ankle_tape: false
        }
      };
      
      // Reset inventory na základní
      this.inventory = {
        jerseys: ['classic'],
        hairStyles: ['realistic', 'short'],
        accessories: [],
        stadiumThemes: ['default'],
        balls: ['default'],
        celebrations: ['basic'],
        jerseyDesigns: [],
        trainingEquipment: [],
        coaches: ['basic'],
        facilities: ['basic']
      };
    }
    
    // 🛠️ Debug metody
    debugUnlockAll() {
      if (process.env.NODE_ENV === 'development') {
        // Odemkni všechny účesy
        this.inventory.hairStyles = [
          'realistic', 'short', 'buzz', 'mohawk', 'long', 
          'afro', 'spiky', 'ponytail', 'bald', 'dreadlocks', 
          'manbun', 'undercut'
        ];
        // Odemkni všechny doplňky
        this.inventory.accessories = [
          'gloves', 'headband', 'wristbands', 'necklace', 
          'earrings', 'tattoo_arm', 'tattoo_leg', 
          'captain_band', 'shin_guards', 'ankle_tape'
        ];
        this.dataManager.saveToFirebase();
        console.log('✅ All customization items unlocked!');
      }
    }
  }