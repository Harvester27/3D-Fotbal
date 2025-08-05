// PlayerBallHandler.js - Zpracování interakcí s míčem

import { THREE } from './three.js';
import { PlayerSkillChecker } from './PlayerSkillChecker.js';

export class PlayerBallHandler {
  
  // Předkopnutí míče ve směru pohybu
  static kickBallForward(player, ball, deltaTime) {
    if (!ball || !ball.mesh) return;
    
    const distanceToBall = player.mesh.position.distanceTo(ball.mesh.position);
    
    // Kontrola jestli je míč v dosahu
    if (distanceToBall > player.radius + ball.radius + (player.controlRadius * 0.5)) return;
    
    // Čas od posledního kopnutí
    player.lastKickTime += deltaTime;
    
    if (player.lastKickTime >= player.kickInterval) {
      player.lastKickTime = 0;
      player.lastDribbleTime = Date.now();
      
      // Směr kopnutí podle atributů a výkonu
      let kickDirection;
      
      if (player.speed > 0.1) {
        kickDirection = new THREE.Vector3(
          Math.sin(player.currentRotation),
          0.02,
          Math.cos(player.currentRotation)
        );
        
        // Adaptivní síla podle rychlosti a passing atributu
        const passingSkill = (player.attributes.technical.passing / 100);
        const speedFactor = player.speed / player.maxSpeed;
        const skillMultiplier = 0.8 + passingSkill * 0.4;
        
        kickDirection.multiplyScalar(skillMultiplier * (0.8 + speedFactor * 0.4));
        
        if (player.isMovingBackward) {
          kickDirection.multiplyScalar(-0.5);
        }
      } else {
        // Standing kick
        const technique = (player.attributes.technical.technique / 100);
        kickDirection = new THREE.Vector3(
          Math.sin(player.currentRotation) * (0.2 + technique * 0.2),
          0.02,
          Math.cos(player.currentRotation) * (0.2 + technique * 0.2)
        );
      }
      
      // Výpočet síly podle atributů
      let force = player.kickForce;
      
      // Performance modifiers
      force *= player.performanceModifier; // Stamina effect
      
      // Sprint a skok bonusy
      if (player.isSprinting) {
        const strength = (player.attributes.physical.strength / 100);
        force *= (1.2 + strength * 0.2);
      }
      
      if (!player.isOnGround) {
        force *= 0.7;
        kickDirection.y += 0.2;
      }
      
      // Skill-based error handling
      const missKickResult = PlayerSkillChecker.checkMissKickError(player, ball, kickDirection, force);
      kickDirection = missKickResult.kickDirection;
      force = missKickResult.force;
      
      // Trip/stumble check při vysoké rychlosti
      const tripResult = PlayerSkillChecker.checkTripError(player, kickDirection, force);
      kickDirection = tripResult.kickDirection;
      force = tripResult.force;
      
      // Aplikuj sílu na míč
      ball.kick(kickDirection, force);
      
      // Confidence boost při úspěšném kopnutí
      const errorRoll = Math.random();
      if (errorRoll >= player.missKickChance) {
        player.confidence = Math.min(1.0, player.confidence + 0.01);
      } else {
        player.confidence = Math.max(0.0, player.confidence - 0.05);
      }
      
      // Animace hlavy při předkopnutí
      if (player.ballFirstTouchAnimation < 0.5) {
        player.ballFirstTouchAnimation = 0.7;
      }
    }
  }
  
  // Zpracování prvního dotyku s míčem
  static handleBallFirstTouch(player, ball) {
    if (!player.isDribbling && PlayerBallHandler.checkBallControl(player, ball)) {
      // První dotek s míčem
      player.isDribbling = true;
      player.ballControlStartTime = Date.now();
      player.ballFirstTouchAnimation = 1.0;
      
      // Kontrola kvality prvního dotyku
      const touchResult = PlayerSkillChecker.checkFirstTouchQuality(player, ball);
      
      if (!touchResult.isGoodTouch) {
        // Špatný první dotek již zpracován v PlayerSkillChecker
        return;
      }
      
      // Dobrý první dotek
      player.speed *= 0.8; // Menší zpomalení
      
      // Smart first touch based on dribbling skill
      const playerForward = new THREE.Vector3(
        Math.sin(player.currentRotation),
        0,
        Math.cos(player.currentRotation)
      );
      
      PlayerSkillChecker.applySmartFirstTouch(player, ball, playerForward);
      
      console.log(`⚽ Ball control: Skill ${(player.dribblingSkill * 100).toFixed(0)}%, First touch: GOOD`);
      
    } else if (player.isDribbling && !PlayerBallHandler.checkBallControl(player, ball)) {
      // Ztráta míče
      player.isDribbling = false;
      player.ballFirstTouchAnimation = 0;
      player.headLookDownAmount = 0;
      
      // Loss reason based on attributes
      const dribbling = player.attributes.technical.dribbling;
      const concentration = player.attributes.mental.concentration;
      
      let lossReason = "❌ MÍČ ZTRACEN!";
      if (concentration < 30) {
        lossReason += " (Nedostatek soustředění)";
      } else if (dribbling < 30) {
        lossReason += " (Slabý dribling)";
      } else if (player.isExhausted) {
        lossReason += " (Únava)";
      }
      
      if (window.showGameMessage) {
        window.showGameMessage(lossReason, "error", 2500);
      }
      
      // Snížit confidence výrazněji
      player.confidence = Math.max(0.0, player.confidence - 0.1);
      
      console.log("❌ Ball control lost - skill factors checked");
    }
  }
  
  // Kontrola vzdálenosti míče
  static checkBallControl(player, ball) {
    if (!ball || !ball.mesh) return false;
    
    const distance = player.mesh.position.distanceTo(ball.mesh.position);
    
    // Control radius is affected by fatigue
    const effectiveRadius = player.controlRadius * player.performanceModifier;
    
    return distance <= effectiveRadius;
  }
  
  // Mouse-based shooting
  static handleBallKick(player, ball, camera) {
    if (!player.controls.isKickPressed() || !ball || !ball.mesh || !camera) {
      return;
    }

    const distanceToBall = player.mesh.position.distanceTo(ball.mesh.position);
    const maxKickDistance = player.radius + ball.radius + 0.8;
    
    const hasBallControl = player.isDribbling || distanceToBall < maxKickDistance;
    
    if (hasBallControl) {
      // Síla podle nabití a atributů
      const chargePower = player.controls.getChargePower();
      const maxChargePower = player.controls.getMaxChargePower();
      const powerRatio = chargePower / maxChargePower;
      
      // Base power affected by finishing and long shots
      const finishing = player.attributes.technical.finishing / 100;
      const longShots = player.attributes.technical.longShots / 100;
      const technique = player.attributes.technical.technique / 100;
      const strength = player.attributes.physical.strength / 100;
      
      const skillAverage = (finishing + longShots + technique + strength) / 4;
      
      // Power calculation with skill influence
      let kickPower = (5 + (powerRatio * 15)) * (0.8 + skillAverage * 0.4); // 4-19.2 base power
      
      // Performance modifiers
      kickPower *= player.performanceModifier; // Stamina effect
      kickPower *= (0.8 + player.confidence * 0.4); // Confidence effect
      
      // Sprint bonus
      if (player.isSprinting) {
        kickPower *= (1.3 + strength * 0.2);
      }
      
      // Air shot penalty
      if (!player.isOnGround) {
        kickPower *= 0.8;
      }
      
      // Směr podle pozice myši
      let kickDirection = player.controls.getMouseAimDirection(camera);
      
      if (!kickDirection) {
        kickDirection = new THREE.Vector3(
          Math.sin(player.currentRotation),
          0.3,
          Math.cos(player.currentRotation)
        );
      }
      
      // Shooting accuracy with attributes
      const accuracyData = player.controls.getAccuracyData();
      let baseAccuracy = accuracyData.hitAccuracy;
      
      // Modify accuracy based on composure and finishing
      const composure = player.attributes.mental.composure / 100;
      const finalAccuracy = baseAccuracy * (0.7 + composure * 0.3) * player.performanceModifier;
      
      // Apply accuracy spread
      if (finalAccuracy < 1.0) {
        const spread = (1.0 - finalAccuracy) * 0.6;
        kickDirection.x += (Math.random() - 0.5) * spread;
        kickDirection.z += (Math.random() - 0.5) * spread;
        
        kickDirection.normalize();
        kickDirection.y = Math.max(0.1, kickDirection.y);
      }
      
      // Special shot types based on attributes
      if (longShots > 70 && distanceToBall > 15 && powerRatio > 0.7) {
        // Long shot specialist
        kickPower *= 1.2;
        kickDirection.y += 0.1;
        
        if (window.showGameMessage) {
          window.showGameMessage("🚀 LONG SHOT SPECIALIST!", "success", 2000);
        }
      }
      
      if (finishing > 80 && distanceToBall < 8 && powerRatio > 0.5 && powerRatio < 0.8) {
        // Clinical finisher
        kickPower *= 1.1;
        const accuracy = finalAccuracy * 1.15;
        
        if (window.showGameMessage) {
          window.showGameMessage("🎯 CLINICAL FINISH!", "success", 2000);
        }
      }
      
      // Ve vzduchu trochu nahoru
      if (!player.isOnGround) {
        kickDirection.y += 0.2;
      }
      
      // Apply stamina cost for powerful shots
      const shotCost = Math.max(3, kickPower * 0.3);
      player.currentStamina -= shotCost;
      
      // SHOT!
      ball.kick(kickDirection, kickPower);
      player.controls.resetKick();
      
      // Update confidence based on shot quality
      if (finalAccuracy > 0.85 && powerRatio > 0.6) {
        player.confidence = Math.min(1.0, player.confidence + 0.05);
      }
      
      console.log(`🚀 SHOT! Power: ${kickPower.toFixed(1)}, Accuracy: ${(finalAccuracy * 100).toFixed(1)}%, Skill: ${(skillAverage * 100).toFixed(0)}%`);
      
      // UI feedback
      if (window.showGameMessage) {
        const powerPercent = (powerRatio * 100).toFixed(0);
        const accuracyPercent = (finalAccuracy * 100).toFixed(0);
        const skillPercent = (skillAverage * 100).toFixed(0);
        
        if (powerRatio > 0.6 && powerRatio < 0.8 && finalAccuracy > 0.9) {
          window.showGameMessage(`🎯 PERFECT SHOT! ${skillPercent}% skill`, "success", 2000);
        } else if (powerRatio > 0.8) {
          window.showGameMessage(`⚡ Power shot! ${powerPercent}% síla, ${accuracyPercent}% přesnost`, "info", 1500);
        } else {
          window.showGameMessage(`⚽ Střela! ${powerPercent}% síla, ${accuracyPercent}% přesnost`, "info", 1500);
        }
      }
    } else {
      player.controls.resetKick();
      
      if (window.showGameMessage) {
        window.showGameMessage("❌ Míč není v dosahu pro střelu!", "error", 1500);
      }
    }
  }
  
  // Zpracování couvání s míčem
  static handleBackwardBallControl(player, ball, deltaTime) {
    if (!player.isDribbling || !player.isMovingBackward) return;
    
    player.lastKickTime += deltaTime;
    
    const backKickInterval = player.kickInterval * 1.5;
    if (player.lastKickTime >= backKickInterval) {
      player.lastKickTime = 0;
      
      // Kopnutí dozadu ovlivněno technique
      const technique = (player.attributes.technical.technique / 100);
      const backKickDirection = new THREE.Vector3(
        -Math.sin(player.currentRotation) * (0.4 + technique * 0.2),
        0.02,
        -Math.cos(player.currentRotation) * (0.4 + technique * 0.2)
      );
      
      const backKickForce = 1.2 + technique * 0.6;
      ball.kick(backKickDirection, backKickForce);
    }
  }
  
  // Getter pro driblování status
  static getDribblingStatus(player) {
    return player.isDribbling;
  }
}