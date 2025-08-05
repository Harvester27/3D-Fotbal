// PlayerStaminaManager.js - Správa staminy a výkonu hráče

export class PlayerStaminaManager {
  
  // Update stamina based on player activities
  static updateStamina(player, deltaTime) {
    // Stamina consumption
    if (player.speed > 0.1) {
      let consumption = 2; // Base consumption
      
      if (player.isSprinting) {
        consumption *= 3; // Sprint costs 3x more
      }
      if (player.isDribbling) {
        consumption *= 1.5; // Dribbling costs 50% more
      }
      if (!player.isOnGround) {
        consumption *= 2; // Being in air costs 2x more
      }
      
      // Work rate affects consumption
      const workRateEffect = (player.attributes.mental.workRate / 100);
      consumption *= (1.5 - workRateEffect * 0.5); // High work rate = less consumption
      
      player.currentStamina -= consumption * deltaTime;
    } else {
      // Recovery when not moving
      player.currentStamina += player.staminaRecoveryRate * deltaTime;
    }
    
    // Clamp stamina
    player.currentStamina = Math.max(0, Math.min(player.maxStamina, player.currentStamina));
    
    // Update exhaustion state
    const staminaPercent = player.currentStamina / player.maxStamina;
    player.isExhausted = staminaPercent < 0.2;
    
    // Update performance modifier based on stamina
    player.performanceModifier = 0.5 + (staminaPercent * 0.5); // 50%-100% performance
  }
  
  // Update pressure level based on game situation
  static updatePressureLevel(player, deltaTime) {
    // This could be expanded based on game state, score, time remaining, etc.
    if (player.isDribbling && player.speed > player.maxSpeed * 0.8) {
      player.pressureLevel = Math.min(1.0, player.pressureLevel + deltaTime * 0.1); // Build pressure when sprinting with ball
    } else {
      player.pressureLevel = Math.max(0.0, player.pressureLevel - deltaTime * 0.05); // Reduce pressure slowly
    }
  }
  
  // Check if player can perform stamina-intensive action
  static canPerformAction(player, staminaCost) {
    return player.currentStamina >= staminaCost && !player.isExhausted;
  }
  
  // Consume stamina for specific action
  static consumeStamina(player, amount, actionName = "action") {
    if (player.currentStamina >= amount) {
      player.currentStamina -= amount;
      return true;
    } else {
      if (window.showGameMessage) {
        window.showGameMessage(`😴 Příliš unavený na ${actionName}!`, "warning", 1500);
      }
      return false;
    }
  }
  
  // Get stamina percentage (0-1)
  static getStaminaPercent(player) {
    return player.currentStamina / player.maxStamina;
  }
  
  // Get performance rating (0-100)
  static getPerformanceRating(player) {
    return Math.round(player.performanceModifier * 100);
  }
  
  // Get confidence level (0-100)
  static getConfidenceLevel(player) {
    return Math.round(player.confidence * 100);
  }
  
  // Update confidence based on successful actions
  static updateConfidence(player, isSuccess, impactLevel = 0.01) {
    if (isSuccess) {
      player.confidence = Math.min(1.0, player.confidence + impactLevel);
    } else {
      player.confidence = Math.max(0.0, player.confidence - impactLevel * 2); // Failures impact confidence more
    }
  }
}