// src/PlayerDataManagerAttributes.js - ⚽ FIFA-style atributy a trénink
export class PlayerAttributesManager {
    constructor(dataManager) {
      this.dataManager = dataManager;
      
      // 🔥 FIFA-STYLE ATRIBUTY SYSTÉM (1-100)
      this.attributes = {
        // TECHNICAL (14 atributů)
        technical: {
          corners: 1,           // Rohové kopy - přesnost centrů z rohů
          crossing: 1,          // Centrování - kvalita přihrávek z křídel
          dribbling: 1,         // Dribling - schopnost obejít soupeře
          finishing: 1,         // Zakončování - přesnost střelby v šestnáctce
          firstTouch: 1,        // První dotek - kontrola míče při přijetí
          freeKickTaking: 1,    // Přímé kopy - přesnost a síla volných kopů
          heading: 1,           // Hlavičkování - efektivita hry hlavou
          longShots: 1,         // Daleké střely - síla a přesnost z dálky
          longThrows: 1,        // Dlouhé auty - dosah a přesnost autů
          marking: 1,           // Obsazování - schopnost bránit soupeře
          passing: 1,           // Přihrávání - přesnost krátkých přihrávek
          penaltyTaking: 1,     // Penalty - přesnost pokutových kopů
          tackling: 1,          // Skluzování - efektivita obranných zákroků
          technique: 1          // Technika - celková technická úroveň
        },
        
        // MENTAL (14 atributů)
        mental: {
          aggression: 1,        // Agresivita - tendence k tvrdé hře
          anticipation: 1,      // Předvídání - čtení hry a reakce
          bravery: 1,           // Odvaha - ochota jít do soubojů
          composure: 1,         // Chladnokrevnost - klid v tlaku
          concentration: 1,     // Soustředění - udržení pozornosti
          decisions: 1,         // Rozhodování - rychlost a kvalita rozhodnutí
          determination: 1,     // Odhodlání - vůle vyhrát
          flair: 1,            // Kreativita - schopnost překvapit
          leadership: 1,        // Vedení - vliv na spoluhráče
          offTheBall: 1,        // Pohyb bez míče - inteligentní běh
          positioning: 1,       // Postavení - správná pozice na hřišti
          teamwork: 1,         // Týmová práce - spolupráce s ostatními
          vision: 1,           // Vidění hry - schopnost vidět přihrávky
          workRate: 1          // Pracovitost - množství úsilí v zápase
        },
        
        // PHYSICAL (8 atributů)
        physical: {
          acceleration: 1,      // Zrychlení - rychlost nástupu do běhu
          agility: 1,          // Hbitost - schopnost rychle měnit směr
          balance: 1,          // Rovnováha - stabilita v soubojích
          jumpingReach: 1,     // Výskok - výška skoku pro hlavičky
          naturalFitness: 1,   // Přirozená kondice - odolnost únavě
          pace: 1,             // Rychlost - maximální běžecká rychlost
          stamina: 1,          // Vytrvalost - schopnost dlouho běžet
          strength: 1          // Síla - fyzická převaha v soubojích
        }
      };
  
      // 🎭 TRAITS/PERKY SYSTÉM
      this.traits = {
        // Pozitivní vlastnosti (zlepšují výkon)
        positive: [
          // Příklady: 'technical_genius', 'speedster', 'leader', 
          // 'clutch_player', 'team_player', 'power_shooter'
        ],
        
        // Negativní vlastnosti (zhoršují výkon v určitých situacích)
        negative: [
          // Příklady: 'clumsy', 'nervous', 'ball_trips', 
          // 'poor_finisher', 'lazy', 'injury_prone'
        ]
      };
  
      // 🎯 TRAINING SYSTÉM - pro zlepšování atributů
      this.training = {
        // Kolik tréninků zbývá dnes
        dailyTrainingPoints: 3,
        lastTrainingReset: new Date(),
        
        // Specializace - co hráč trénuje nejčastěji
        focus: 'balanced', // 'technical', 'mental', 'physical', 'balanced'
        
        // Historie tréninků pro efektivitu
        recentTraining: [], // [{ attribute: 'pace', date: Date, cost: 100 }]
        
        // Bonus multipliers
        coachLevel: 1,      // Úroveň trenéra (1-5) - ovlivňuje efektivitu
        facilityLevel: 1    // Úroveň zařízení (1-5) - snižuje náklady
      };
    }
    
    // 🔥 ATRIBUTY MANAGEMENT
    
    // Získat atribut podle kategorie a názvu
    getAttribute(category, attributeName) {
      return this.attributes[category]?.[attributeName] || 1;
    }
    
    // Nastavit atribut (pro admin/debug)
    setAttribute(category, attributeName, value) {
      if (this.attributes[category] && this.attributes[category].hasOwnProperty(attributeName)) {
        this.attributes[category][attributeName] = Math.max(1, Math.min(100, value));
        this.dataManager.notifyListeners('attributeChanged', { category, attributeName, value });
        this.dataManager.saveToFirebase();
        return true;
      }
      return false;
    }
    
    // Trénink atributu - stojí coins a training points
    trainAttribute(category, attributeName, intensity = 'normal') {
      // Zkontroluj jestli má training points
      if (this.training.dailyTrainingPoints <= 0) {
        console.warn('❌ No training points left today!');
        this.dataManager.notifyListeners('noTrainingPoints', {});
        return false;
      }
      
      // Zkontroluj jestli atribut existuje
      if (!this.attributes[category] || !this.attributes[category].hasOwnProperty(attributeName)) {
        console.warn('❌ Invalid attribute:', category, attributeName);
        return false;
      }
      
      const currentValue = this.attributes[category][attributeName];
      
      // Vyšší atributy stojí víc
      const baseCost = Math.floor(50 + (currentValue * 10));
      
      // Intenzita tréninku ovlivňuje cenu a efektivitu
      const intensityMultipliers = {
        light: { cost: 0.7, gain: 0.5, points: 0.5 },
        normal: { cost: 1.0, gain: 1.0, points: 1.0 },
        intense: { cost: 1.5, gain: 1.8, points: 1.5 }
      };
      
      const multiplier = intensityMultipliers[intensity] || intensityMultipliers.normal;
      const totalCost = Math.floor(baseCost * multiplier.cost * (1 / this.training.facilityLevel));
      const pointsCost = multiplier.points;
      
      // Zkontroluj peníze
      if (!this.dataManager.economy.spendCoins(totalCost, `Training ${attributeName}`)) {
        return false;
      }
      
      // Spotřebuj training points
      this.training.dailyTrainingPoints -= pointsCost;
      
      // Vypočítej zisk atributu
      let attributeGain = multiplier.gain;
      
      // Bonus za trenéra
      attributeGain *= (1 + (this.training.coachLevel - 1) * 0.2);
      
      // Menší zisk pro vyšší atributy (realistické)
      if (currentValue > 80) {
        attributeGain *= 0.5;
      } else if (currentValue > 60) {
        attributeGain *= 0.7;
      } else if (currentValue > 40) {
        attributeGain *= 0.85;
      }
      
      // Specializace bonus - pokud trénuje svou specializaci
      if (this.training.focus === category || this.training.focus === 'balanced') {
        attributeGain *= 1.2;
      }
      
      // Náhodný prvek
      attributeGain *= (0.8 + Math.random() * 0.4); // 0.8 - 1.2
      
      // Aplikuj zisk
      const newValue = Math.min(100, currentValue + attributeGain);
      this.attributes[category][attributeName] = Math.round(newValue * 10) / 10; // Zaokrouhlí na 1 desetinné místo
      
      console.log(`🏋️ Trained ${attributeName}: ${currentValue} → ${this.attributes[category][attributeName]} (+${(newValue - currentValue).toFixed(1)})`);
      
      // Zapiš do historie
      this.training.recentTraining.push({
        attribute: attributeName,
        category: category,
        gain: newValue - currentValue,
        cost: totalCost,
        intensity: intensity,
        date: new Date()
      });
      
      // Udržuj jen posledních 50 tréninků
      if (this.training.recentTraining.length > 50) {
        this.training.recentTraining.shift();
      }
      
      this.dataManager.notifyListeners('attributeTrained', {
        category,
        attributeName,
        oldValue: currentValue,
        newValue: this.attributes[category][attributeName],
        gain: newValue - currentValue,
        cost: totalCost,
        intensity
      });
      
      this.dataManager.saveToFirebase();
      return true;
    }
    
    // Reset denních training points (volá se automaticky každý den)
    resetDailyTraining() {
      const now = new Date();
      const lastReset = new Date(this.training.lastTrainingReset);
      
      // Pokud uplynul aspoň 1 den
      if (now.getDate() !== lastReset.getDate() || now.getMonth() !== lastReset.getMonth()) {
        this.training.dailyTrainingPoints = 3;
        this.training.lastTrainingReset = now;
        
        console.log('🔄 Daily training points reset: 3 points available');
        this.dataManager.notifyListeners('trainingPointsReset', { points: 3 });
        this.dataManager.saveToFirebase();
      }
    }
    
    // Získat celkový rating hráče (podobný FIFA OVR)
    getOverallRating() {
      const tech = this.attributes.technical;
      const ment = this.attributes.mental;
      const phys = this.attributes.physical;
      
      // Váhy pro různé typy atributů (celkem = 1.0)
      const weights = {
        technical: 0.4,
        physical: 0.35,
        mental: 0.25
      };
      
      // Průměr každé kategorie
      const techAvg = Object.values(tech).reduce((a, b) => a + b, 0) / Object.keys(tech).length;
      const mentAvg = Object.values(ment).reduce((a, b) => a + b, 0) / Object.keys(ment).length;
      const physAvg = Object.values(phys).reduce((a, b) => a + b, 0) / Object.keys(phys).length;
      
      // Vážený průměr
      const overall = (techAvg * weights.technical) + 
                     (physAvg * weights.physical) + 
                     (mentAvg * weights.mental);
      
      return Math.round(overall);
    }
    
    // Získat rating pro specifickou pozici
    getPositionRating(position = 'CAM') {
      const positionWeights = {
        'GK': { // Goalkeeper
          technical: { technique: 0.3, passing: 0.2 },
          mental: { concentration: 0.4, positioning: 0.3, anticipation: 0.3 },
          physical: { agility: 0.4, jumpingReach: 0.3, strength: 0.3 }
        },
        'CB': { // Centre Back
          technical: { marking: 0.4, tackling: 0.4, heading: 0.2 },
          mental: { positioning: 0.4, concentration: 0.3, bravery: 0.3 },
          physical: { strength: 0.4, jumpingReach: 0.3, balance: 0.3 }
        },
        'CM': { // Central Midfielder
          technical: { passing: 0.4, technique: 0.3, dribbling: 0.3 },
          mental: { vision: 0.4, decisions: 0.3, workRate: 0.3 },
          physical: { stamina: 0.4, pace: 0.3, strength: 0.3 }
        },
        'CAM': { // Central Attacking Midfielder (default)
          technical: { passing: 0.3, technique: 0.3, dribbling: 0.2, finishing: 0.2 },
          mental: { vision: 0.4, flair: 0.3, decisions: 0.3 },
          physical: { agility: 0.4, pace: 0.3, balance: 0.3 }
        },
        'ST': { // Striker
          technical: { finishing: 0.4, technique: 0.2, dribbling: 0.2, heading: 0.2 },
          mental: { positioning: 0.4, composure: 0.3, offTheBall: 0.3 },
          physical: { pace: 0.4, strength: 0.3, acceleration: 0.3 }
        }
      };
      
      const weights = positionWeights[position] || positionWeights['CAM'];
      let rating = 0;
      let totalWeight = 0;
      
      // Vypočítej rating podle vah
      Object.keys(weights).forEach(category => {
        Object.keys(weights[category]).forEach(attr => {
          const weight = weights[category][attr];
          const value = this.getAttribute(category, attr);
          rating += value * weight;
          totalWeight += weight;
        });
      });
      
      return Math.round(rating / totalWeight);
    }
  
    // 🎭 TRAITS MANAGEMENT
    
    // Přidat trait
    addTrait(traitId, type = 'positive') {
      if (!this.traits[type].includes(traitId)) {
        this.traits[type].push(traitId);
        this.dataManager.notifyListeners('traitAdded', { traitId, type });
        this.dataManager.saveToFirebase();
        return true;
      }
      return false;
    }
    
    // Odstranit trait
    removeTrait(traitId, type = 'positive') {
      const index = this.traits[type].indexOf(traitId);
      if (index > -1) {
        this.traits[type].splice(index, 1);
        this.dataManager.notifyListeners('traitRemoved', { traitId, type });
        this.dataManager.saveToFirebase();
        return true;
      }
      return false;
    }
    
    // Zkontrolovat jestli má trait
    hasTrait(traitId, type = 'positive') {
      return this.traits[type].includes(traitId);
    }
    
    // Získat všechny traits
    getAllTraits() {
      return {
        positive: [...this.traits.positive],
        negative: [...this.traits.negative]
      };
    }
    
    // Micro-training za gól - automatické zlepšení
    rewardGoalMicroTraining() {
      const currentFinishing = this.getAttribute('technical', 'finishing');
      if (currentFinishing < 100 && Math.random() < 0.3) { // 30% chance
        const gain = 0.1 + Math.random() * 0.2; // 0.1-0.3 gain
        this.setAttribute('technical', 'finishing', currentFinishing + gain);
        console.log(`⚽ Goal micro-training: finishing +${gain.toFixed(2)}`);
        return gain;
      }
      return 0;
    }
    
    // 💾 Export/Import
    exportData() {
      return {
        attributes: this.attributes,
        traits: this.traits,
        training: this.training
      };
    }
    
    importData(data) {
      // Merge atributů s defaulty
      if (data.attributes) {
        this.attributes = {
          technical: { ...this.attributes.technical, ...data.attributes.technical },
          mental: { ...this.attributes.mental, ...data.attributes.mental },
          physical: { ...this.attributes.physical, ...data.attributes.physical }
        };
      }
      
      // Merge traits s defaulty (vždy zajisti že jsou to pole)
      if (data.traits) {
        this.traits = {
          positive: Array.isArray(data.traits.positive) ? [...data.traits.positive] : [...this.traits.positive],
          negative: Array.isArray(data.traits.negative) ? [...data.traits.negative] : [...this.traits.negative]
        };
      }
      
      this.training = { ...this.training, ...data.training };
    }
    
    // 🔄 Reset functions
    resetAttributes() {
      Object.keys(this.attributes).forEach(category => {
        Object.keys(this.attributes[category]).forEach(attr => {
          this.attributes[category][attr] = 1;
        });
      });
      
      // Reset traits na základní
      this.traits = {
        positive: ['beginner_luck'],
        negative: ['rookie_mistakes']
      };
      
      // Reset training
      this.training.dailyTrainingPoints = 3;
      this.training.focus = 'balanced';
      this.training.recentTraining = [];
      this.training.coachLevel = 1;
      this.training.facilityLevel = 1;
    }
    
    // 🛠️ Debug metody
    debugSetAttribute(category, attr, value) {
      if (process.env.NODE_ENV === 'development') {
        this.setAttribute(category, attr, value);
        console.log(`🛠️ DEBUG: Set ${category}.${attr} = ${value}`);
      }
    }
    
    debugMaxAllAttributes() {
      if (process.env.NODE_ENV === 'development') {
        Object.keys(this.attributes).forEach(category => {
          Object.keys(this.attributes[category]).forEach(attr => {
            this.attributes[category][attr] = 100;
          });
        });
        this.dataManager.saveToFirebase();
        console.log('🛠️ DEBUG: All attributes set to 100');
      }
    }
  }