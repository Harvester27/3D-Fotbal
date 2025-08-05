// PlayerSkillChecker.js - Skill-based chyby a výpočty pravděpodobností

import { THREE } from './three.js';

export class PlayerSkillChecker {
  
  // Výpočet šance na chybné kopnutí
  static calculateMissKickChance(attributes, traits) {
    const technique = attributes.technical.technique;
    const composure = attributes.mental.composure;
    const avgSkill = (technique + composure) / 2;
    
    // Vyšší skill = méně chyb
    let baseChance = 0.25 - (avgSkill / 100) * 0.2; // 25% pro skill 0, 5% pro skill 100
    
    // Trait modifiers
    if (traits.negative.includes('poor_finisher')) {
      baseChance *= 1.5;
    }
    if (traits.negative.includes('nervous')) {
      baseChance *= 1.3;
    }
    if (traits.positive.includes('technical_genius')) {
      baseChance *= 0.5;
    }
    
    return Math.max(0.01, baseChance); // Min 1% chyba
  }
  
  // Výpočet šance na zakopnutí
  static calculateTripChance(attributes, traits) {
    const balance = attributes.physical.balance;
    const agility = attributes.physical.agility;
    const dribbling = attributes.technical.dribbling;
    const avgSkill = (balance + agility + dribbling) / 3;
    
    let baseChance = 0.15 - (avgSkill / 100) * 0.12; // 15% pro skill 0, 3% pro skill 100
    
    // Trait modifiers
    if (traits.negative.includes('clumsy')) {
      baseChance *= 2.0;
    }
    if (traits.negative.includes('ball_trips')) {
      baseChance *= 1.8;
    }
    
    return Math.max(0.005, baseChance); // Min 0.5% šance
  }
  
  // Výpočet šance na špatný dotek
  static calculateBadTouchChance(attributes, pressureLevel) {
    const firstTouch = attributes.technical.firstTouch;
    const concentration = attributes.mental.concentration;
    const avgSkill = (firstTouch + concentration) / 2;
    
    let baseChance = 0.3 - (avgSkill / 100) * 0.25; // 30% pro skill 0, 5% pro skill 100
    
    // Pressure effect
    baseChance += pressureLevel * 0.1;
    
    return Math.max(0.02, baseChance);
  }
  
  // Výpočet šance na ztrátu kontroly
  static calculateLoseControlChance(attributes, currentStamina, maxStamina) {
    const dribbling = attributes.technical.dribbling;
    const concentration = attributes.mental.concentration;
    const composure = attributes.mental.composure;
    const avgSkill = (dribbling + concentration + composure) / 3;
    
    let baseChance = 0.08 - (avgSkill / 100) * 0.06; // 8% pro skill 0, 2% pro skill 100
    
    // Stamina effect - únava zvyšuje ztrátu kontroly
    const staminaFactor = currentStamina / maxStamina;
    baseChance *= (2.0 - staminaFactor); // Dvojnásobná šance při 0 stamině
    
    return Math.max(0.005, baseChance);
  }
  
  // Kontrola a aplikace skill-based chyby při kopnutí
  static checkMissKickError(player, ball, kickDirection, force) {
    const errorRoll = Math.random();
    const missChance = player.missKickChance * (2.0 - player.performanceModifier);
    
    if (errorRoll < missChance) {
      console.log("⚠️ Miss kick! Skill-based error");
      
      // Náhodný směr chyby
      const errorAngle = (Math.random() - 0.5) * Math.PI * 0.3; // ±27 degrees
      const errorMagnitude = 0.5 + Math.random() * 0.8;
      
      kickDirection.x += Math.sin(errorAngle) * errorMagnitude;
      kickDirection.z += Math.cos(errorAngle) * errorMagnitude;
      kickDirection.y = 0.1 + Math.random() * 0.3;
      
      force *= (1.0 + Math.random() * 0.5); // Nepredvídatelná síla
      
      if (window.showGameMessage) {
        const composure = player.attributes.mental.composure;
        const message = composure < 30 ? 
          "😰 Nervozita! Špatný dotek!" : 
          "⚠️ Technická chyba!";
        window.showGameMessage(message, "warning", 1500);
      }
      
      return { isError: true, kickDirection, force };
    }
    
    return { isError: false, kickDirection, force };
  }
  
  // Kontrola trip/stumble při vysoké rychlosti
  static checkTripError(player, kickDirection, force) {
    if (player.speed > player.maxSpeed * 0.8 && Math.random() < player.tripChance) {
      force *= 2.5; // Příliš silné kopnutí
      kickDirection.y = 0.3;
      
      // Snížit staminu navíc
      player.currentStamina -= 10;
      
      if (window.showGameMessage) {
        window.showGameMessage("🤡 Šlápnutí na míč! Zpomal!", "error", 2000);
      }
      
      return { isTrip: true, kickDirection, force };
    }
    
    return { isTrip: false, kickDirection, force };
  }
  
  // Kontrola kvality prvního dotyku
  static checkFirstTouchQuality(player, ball) {
    const firstTouchRoll = Math.random();
    const badTouchThreshold = player.badTouchChance * (2.0 - player.performanceModifier);
    
    if (firstTouchRoll < badTouchThreshold) {
      // Špatný první dotek
      player.speed *= 0.4; // Větší zpomalení
      
      const badTouchDirection = new THREE.Vector3();
      badTouchDirection.subVectors(ball.mesh.position, player.mesh.position);
      badTouchDirection.y = 0;
      badTouchDirection.normalize();
      
      // Míč se odrazí dále od hráče
      const errorMultiplier = 1.5 + Math.random() * 1.0;
      badTouchDirection.multiplyScalar(errorMultiplier);
      badTouchDirection.y = 0.05;
      
      ball.kick(badTouchDirection, 1.8);
      
      if (window.showGameMessage) {
        const firstTouch = player.attributes.technical.firstTouch;
        const message = firstTouch < 30 ? 
          "😣 Hrozný dotek! Potřebuješ trénink!" : 
          "⚠️ Nepřesný první dotek";
        window.showGameMessage(message, "warning", 2000);
      }
      
      // Snížit confidence
      player.confidence = Math.max(0.0, player.confidence - 0.08);
      
      return { isGoodTouch: false, wasBadTouch: true };
    }
    
    return { isGoodTouch: true, wasBadTouch: false };
  }
  
  // Smart první dotek na základě dribbling skillu
  static applySmartFirstTouch(player, ball, playerForward) {
    const dribblingSkill = player.attributes.technical.dribbling / 100;
    const approachDirection = new THREE.Vector3();
    approachDirection.subVectors(ball.mesh.position, player.mesh.position);
    approachDirection.y = 0;
    approachDirection.normalize();
    
    // Skill určuje přesnost prvního dotyku
    const skillBlend = 0.3 + dribblingSkill * 0.5; // 30%-80% skill influence
    const firstTouchDirection = new THREE.Vector3();
    firstTouchDirection.lerpVectors(approachDirection, playerForward, skillBlend);
    firstTouchDirection.y = 0.02;
    
    ball.kick(firstTouchDirection, 0.8 + dribblingSkill * 0.4);
    
    // Boost confidence
    player.confidence = Math.min(1.0, player.confidence + 0.03);
    
    if (window.showGameMessage && dribblingSkill > 0.7) {
      window.showGameMessage("✨ Skvělý první dotek!", "success", 1500);
    }
  }
}