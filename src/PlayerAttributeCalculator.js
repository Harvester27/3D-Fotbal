// PlayerAttributeCalculator.js - Výpočty atributů a základních vlastností hráče

export class PlayerAttributeCalculator {
  
    // Získání atributů z PlayerDataManager
    static getPlayerAttributes() {
      if (typeof window !== 'undefined' && window.playerDataManager) {
        // 🔥 OPRAVA: Vrať hlubokou kopii, ne jen spread
        return JSON.parse(JSON.stringify(window.playerDataManager.attributes));
      }
      
      // Fallback hodnoty pokud PlayerDataManager není dostupný
      return {
        technical: {
          corners: 50, crossing: 50, dribbling: 50, finishing: 50, firstTouch: 50,
          freeKickTaking: 50, heading: 50, longShots: 50, longThrows: 50, marking: 50,
          passing: 50, penaltyTaking: 50, tackling: 50, technique: 50
        },
        mental: {
          aggression: 50, anticipation: 50, bravery: 50, composure: 50, concentration: 50,
          decisions: 50, determination: 50, flair: 50, leadership: 50, offTheBall: 50,
          positioning: 50, teamwork: 50, vision: 50, workRate: 50
        },
        physical: {
          acceleration: 50, agility: 50, balance: 50, jumpingReach: 50, naturalFitness: 50,
          pace: 50, stamina: 50, strength: 50
        }
      };
    }
    
    // Získání traits z PlayerDataManager
    static getPlayerTraits() {
      if (typeof window !== 'undefined' && window.playerDataManager) {
        // 🔥 OPRAVA: Vrať hlubokou kopii
        return JSON.parse(JSON.stringify(window.playerDataManager.traits));
      }
      
      return {
        positive: ['beginner_luck'],
        negative: ['rookie_mistakes']
      };
    }
    
    // Overall rating calculation
    static getOverallRating(attributes) {
      const tech = attributes.technical;
      const ment = attributes.mental;
      const phys = attributes.physical;
      
      const techAvg = Object.values(tech).reduce((a, b) => a + b, 0) / Object.keys(tech).length;
      const mentAvg = Object.values(ment).reduce((a, b) => a + b, 0) / Object.keys(ment).length;
      const physAvg = Object.values(phys).reduce((a, b) => a + b, 0) / Object.keys(phys).length;
      
      const overall = (techAvg * 0.4) + (physAvg * 0.35) + (mentAvg * 0.25);
      return Math.round(overall);
    }
  
    // Výpočet maximální rychlosti
    static calculateMaxSpeed(attributes, traits, baseSpeed) {
      const paceEffect = (attributes.physical.pace / 100) * 2.0; // 0-2.0
      const agilityEffect = (attributes.physical.agility / 100) * 0.5; // 0-0.5
      const speed = baseSpeed + paceEffect + agilityEffect;
      
      // Trait modifiers
      if (traits.positive.includes('speedster')) {
        return speed * 1.2; // +20% rychlost
      }
      if (traits.negative.includes('lazy')) {
        return speed * 0.8; // -20% rychlost
      }
      
      return speed;
    }
    
    // Výpočet sprint rychlosti
    static calculateSprintSpeed(attributes, maxSpeed) {
      const accelerationEffect = (attributes.physical.acceleration / 100) * 1.5;
      const staminaEffect = (attributes.physical.stamina / 100) * 0.5;
      return maxSpeed * (1.5 + accelerationEffect + staminaEffect);
    }
    
    // Výpočet akcelerace
    static calculateAcceleration(attributes) {
      const accelerationAttr = (attributes.physical.acceleration / 100) * 3; // 0-3
      const agilityAttr = (attributes.physical.agility / 100) * 2; // 0-2
      return 3 + accelerationAttr + agilityAttr; // Base 3, max 8
    }
    
    // Výpočet decelerace
    static calculateDeceleration(attributes) {
      const balanceAttr = (attributes.physical.balance / 100) * 2;
      const agilityAttr = (attributes.physical.agility / 100) * 1;
      return 2 + balanceAttr + agilityAttr; // Base 2, max 5
    }
    
    // Výpočet síly skoku
    static calculateJumpForce(attributes) {
      const jumpingReach = (attributes.physical.jumpingReach / 100) * 4; // 0-4
      const strength = (attributes.physical.strength / 100) * 2; // 0-2
      return 4 + jumpingReach + strength; // Base 4, max 10
    }
    
    // Výpočet intervalu mezi kopnutími
    static calculateKickInterval(attributes) {
      const technique = (attributes.technical.technique / 100);
      const passing = (attributes.technical.passing / 100);
      const avgSkill = (technique + passing) / 2;
      
      // Vyšší skill = rychlejší předkopávání (nižší interval)
      return 0.6 - (avgSkill * 0.3); // 0.6s pro skill 0, 0.3s pro skill 100
    }
    
    // Výpočet síly kopnutí
    static calculateKickForce(attributes) {
      const technique = (attributes.technical.technique / 100);
      const passing = (attributes.technical.passing / 100);
      const strength = (attributes.physical.strength / 100);
      
      const avgSkill = (technique + passing + strength) / 3;
      return 1.0 + (avgSkill * 1.5); // 1.0-2.5 force
    }
    
    // Výpočet dosahu kontroly míče
    static calculateControlRadius(attributes) {
      const firstTouch = (attributes.technical.firstTouch / 100);
      const dribbling = (attributes.technical.dribbling / 100);
      const avgSkill = (firstTouch + dribbling) / 2;
      
      // Vyšší skill = větší dosah kontroly
      return 1.5 + (avgSkill * 2.0); // 1.5-3.5 radius
    }
    
    // Výpočet dribblingového skillu
    static calculateDribblingSkill(attributes) {
      const dribbling = (attributes.technical.dribbling / 100);
      const agility = (attributes.physical.agility / 100);
      const balance = (attributes.physical.balance / 100);
      
      return (dribbling + agility + balance) / 3;
    }
    
    // Výpočet maximální staminy
    static calculateMaxStamina(attributes) {
      const stamina = attributes.physical.stamina;
      const naturalFitness = attributes.physical.naturalFitness;
      return 100 + stamina + naturalFitness; // 102-300 max stamina
    }
    
    // Výpočet rychlosti obnovy staminy
    static calculateStaminaRecovery(attributes) {
      const naturalFitness = (attributes.physical.naturalFitness / 100);
      const workRate = (attributes.mental.workRate / 100);
      return 5 + (naturalFitness * 10) + (workRate * 5); // 5-20 recovery per second
    }
  
    // Výpočet scale podle build atributu
    static getBuildScale(attributes) {
      let customization = {};
      if (typeof window !== 'undefined' && window.playerDataManager) {
        customization = window.playerDataManager.playerCustomization || {};
      }
      
      const height = customization.height || 1.0;
      const build = customization.build || 1.0;
      const strength = (attributes.physical.strength / 100) * 0.1 + 1.0;
      
      return {
        x: build * strength * 0.75,
        y: height * 0.75, 
        z: build * strength * 0.75
      };
    }
  }