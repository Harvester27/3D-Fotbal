// PlayerMovementAnimator.js - Animace a pohyb hráče

import { THREE } from './three.js';

export class PlayerMovementAnimator {
  
  // Zpracování skoku s atributy
  static handleJump(player, deltaTime, isJumping) {
    // Update jump cooldown
    if (player.jumpCooldown > 0) {
      player.jumpCooldown -= deltaTime;
    }
    
    // Skok - pouze pokud je na zemi a není cooldown
    if (isJumping && player.isOnGround && player.jumpCooldown <= 0) {
      // Stamina cost for jumping
      const jumpCost = 8 - (player.attributes.physical.naturalFitness / 100) * 3;
      if (player.currentStamina >= jumpCost) {
        player.verticalVelocity = player.jumpForce * player.performanceModifier;
        player.isOnGround = false;
        player.jumpCooldown = player.jumpCooldownTime;
        player.isJumping = true;
        player.currentStamina -= jumpCost;
        
        console.log(`🦘 Jump! Force: ${player.jumpForce.toFixed(1)}, Stamina: ${player.currentStamina.toFixed(0)}`);
      } else {
        if (window.showGameMessage) {
          window.showGameMessage("😴 Příliš unavený na skok!", "warning", 1500);
        }
      }
    }
    
    // Aplikuj gravitaci
    player.verticalVelocity += player.gravity * deltaTime;
    
    // Aplikuj vertikální pohyb
    player.mesh.position.y += player.verticalVelocity * deltaTime;
    
    // Kontrola země
    if (player.mesh.position.y <= player.groundLevel) {
      player.mesh.position.y = player.groundLevel;
      player.verticalVelocity = 0;
      player.isOnGround = true;
      player.isJumping = false;
    }
  }
  
  // FPS animace s atributy ovlivněním
  static updateFPSRunningAnimation(player, deltaTime, isBackward = false, isSprinting = false, isJumping = false) {
    // Určí maximální rychlost podle směru a sprintu
    let maxSpeedForRatio;
    if (isSprinting) {
      maxSpeedForRatio = isBackward ? player.sprintBackwardSpeed : player.sprintSpeed;
    } else {
      maxSpeedForRatio = isBackward ? player.maxBackwardSpeed : player.maxSpeed;
    }
    
    const speedRatio = player.speed / maxSpeedForRatio;
    
    // Stamina effect on animation smoothness
    const staminaFactor = player.currentStamina / player.maxStamina;
    const animationSmoothness = 0.5 + staminaFactor * 0.5; // 50%-100% smoothness
    
    // Agility affects animation responsiveness
    const agilityFactor = (player.attributes.physical.agility / 100);
    const animationSpeed = 1.0 + agilityFactor * 0.5; // 100%-150% animation speed
    
    // Animace převzetí míče s skill indication
    if (player.ballFirstTouchAnimation > 0) {
      player.ballFirstTouchAnimation -= deltaTime * 1.5;
      
      // Head look down varies with first touch skill  
      const firstTouchSkill = (player.attributes.technical.firstTouch / 100);
      const lookIntensity = 0.7 - firstTouchSkill * 0.3; // Skilled players look down less
      player.headLookDownAmount = Math.sin(player.ballFirstTouchAnimation * Math.PI) * lookIntensity;
      
      if (player.head) {
        player.head.rotation.x = player.headLookDownAmount;
        player.head.rotation.z = Math.sin(Date.now() * 0.003) * 0.05;
      }
    } else if (player.isDribbling) {
      // Při driblování se dívá dolů podle skill levelu
      const dribblingSkill = (player.attributes.technical.dribbling / 100);
      player.headLookDownAmount = 0.4 - dribblingSkill * 0.2; // Skilled dribblers look up more
      if (player.head) {
        player.head.rotation.x = player.headLookDownAmount;
      }
    } else {
      player.headLookDownAmount *= 0.9;
    }
    
    // Speciální animace pro skok s jumping reach effect
    if (isJumping || !player.isOnGround) {
      const jumpingReach = (player.attributes.physical.jumpingReach / 100);
      const jumpAnimationIntensity = 0.8 + jumpingReach * 0.4; // Better jumpers have more dynamic poses
      
      player.leftLeg.rotation.x = -0.8 * jumpAnimationIntensity;
      player.rightLeg.rotation.x = -0.8 * jumpAnimationIntensity;
      player.leftLeg.position.y = 0.4;
      player.rightLeg.position.y = 0.4;
      
      player.leftArm.rotation.x = -0.5 * jumpAnimationIntensity;
      player.rightArm.rotation.x = -0.5 * jumpAnimationIntensity;
      player.leftArm.rotation.z = -0.3 * jumpAnimationIntensity;
      player.rightArm.rotation.z = 0.3 * jumpAnimationIntensity;
      
      if (player.torso) {
        player.torso.rotation.x = -0.2 * jumpAnimationIntensity;
      }
      if (player.head && player.headLookDownAmount < 0.1) {
        player.head.rotation.x = -0.1;
      }
      
      player.mesh.rotation.z = 0;
      return;
    }
    
    if (player.speed > 0.125) {
      // Animation speed modified by agility and stamina
      const effectiveAnimationSpeed = animationSpeed * animationSmoothness;
      const animationSpeedMultiplier = isSprinting ? 1.5 * effectiveAnimationSpeed : effectiveAnimationSpeed;
      player.animationTime += deltaTime * player.speed * 0.5 * animationSpeedMultiplier;
      
      // Different animations for forward and backward with balance influence
      const balance = (player.attributes.physical.balance / 100);
      let legSwingMultiplier = isBackward ? -0.6 : 1.0;
      let armSwingMultiplier = isBackward ? -0.8 : 1.0;
      
      // Balance affects stability of movement
      const stabilityFactor = 0.8 + balance * 0.2;
      
      // Sprint animation intensity affected by strength and pace
      const strength = (player.attributes.physical.strength / 100);
      const pace = (player.attributes.physical.pace / 100);
      const sprintMultiplier = isSprinting ? (1.2 + strength * 0.2 + pace * 0.1) : 1.0;
      
      // Leg movement with skill-based smoothness
      const legSwing = Math.sin(player.animationTime * 10) * 0.4 * speedRatio * legSwingMultiplier * sprintMultiplier * stabilityFactor;
      const legLift = Math.abs(Math.sin(player.animationTime * 10)) * 0.2 * speedRatio * sprintMultiplier;
      
      player.leftLeg.rotation.x = legSwing;
      player.leftLeg.position.y = 0.5 + legLift * 0.5;
      
      player.rightLeg.rotation.x = -legSwing;
      player.rightLeg.position.y = 0.5 + Math.abs(Math.sin(player.animationTime * 10 + Math.PI)) * 0.1 * speedRatio * sprintMultiplier;
      
      // Arm movement with agility influence
      const armSwing = Math.sin(player.animationTime * 10 + Math.PI) * 0.35 * speedRatio * armSwingMultiplier * sprintMultiplier * (0.8 + agilityFactor * 0.2);
      player.leftArm.rotation.x = armSwing;
      player.leftArm.rotation.z = -0.1 - Math.abs(armSwing) * 0.1;
      
      player.rightArm.rotation.x = -armSwing;
      player.rightArm.rotation.z = 0.1 + Math.abs(armSwing) * 0.1;
      
      // Body tilt affected by balance and agility
      if (isBackward) {
        player.bodyTilt.x = -0.1 * speedRatio * stabilityFactor;
      } else {
        player.bodyTilt.x = 0.1 * speedRatio * (isSprinting ? 1.5 : 1.0) * stabilityFactor;
      }
      
      // Extra tilt when dribbling (technical flair)
      if (player.isDribbling) {
        const dribbling = (player.attributes.technical.dribbling / 100);
        player.bodyTilt.x += 0.25 * (0.7 + dribbling * 0.3); // Skilled dribblers have more controlled tilt
      }
      
      player.bodyTilt.z = 0;
      
      // Apply gradual tilt to torso
      if (player.torso) {
        player.torso.rotation.x = player.bodyTilt.x * 0.7;
        player.torso.rotation.z = player.bodyTilt.z * 0.7;
      }
      
      // Head tilt with concentration influence
      if (player.head) {
        const concentration = (player.attributes.mental.concentration / 100);
        const headStability = 0.8 + concentration * 0.2;
        player.head.rotation.x = player.bodyTilt.x * 0.3 * headStability + player.headLookDownAmount;
        player.head.rotation.z = player.bodyTilt.z * 0.3 * headStability;
      }
      
      // Vertical body movement with natural fitness influence
      const naturalFitness = (player.attributes.physical.naturalFitness / 100);
      const bounceMultiplier = isBackward ? 0.5 : 1.0;
      const sprintBounceMultiplier = isSprinting ? (1.3 + naturalFitness * 0.2) : 1.0;
      player.bodyBounce = Math.abs(Math.sin(player.animationTime * 20)) * 0.06 * speedRatio * bounceMultiplier * sprintBounceMultiplier * staminaFactor;
      
      // Apply body bounce only when on ground
      if (player.isOnGround) {
        player.mesh.position.y = player.groundLevel + player.bodyBounce;
      }
      
      // Shoulder rotation with running rhythm
      player.shoulderRotation = Math.sin(player.animationTime * 10) * 0.05 * speedRatio * (isBackward ? -0.5 : 1.0) * sprintMultiplier * agilityFactor;
      player.mesh.rotation.z = player.shoulderRotation;
      
    } else {
      // Gradual animation calming with balance influence
      const balance = (player.attributes.physical.balance / 100);
      const calmingRate = 0.85 + balance * 0.1; // Better balance = smoother stops
      
      player.leftLeg.rotation.x *= calmingRate;
      player.rightLeg.rotation.x *= calmingRate;
      player.leftLeg.position.y = 0.5 + (player.leftLeg.position.y - 0.5) * calmingRate;
      player.rightLeg.position.y = 0.5 + (player.rightLeg.position.y - 0.5) * calmingRate;
      
      player.leftArm.rotation.x *= calmingRate;
      player.rightArm.rotation.x *= calmingRate;
      player.leftArm.rotation.z *= calmingRate;
      player.rightArm.rotation.z *= calmingRate;
      
      if (player.torso) {
        player.torso.rotation.x *= calmingRate;
        player.torso.rotation.z *= calmingRate;
      }
      
      if (player.head) {
        player.head.rotation.x *= calmingRate;
        player.head.rotation.x += player.headLookDownAmount * 0.1;
        player.head.rotation.z *= calmingRate;
      }
      
      player.mesh.rotation.z *= calmingRate;
      
      // Smooth return to ground level when on ground
      if (player.isOnGround) {
        const targetY = player.groundLevel;
        player.mesh.position.y = targetY + (player.mesh.position.y - targetY) * calmingRate;
      }
    }
  }
  
  // Omezení pohybu na hranice hřiště
  static constrainToField(player) {
    const fieldWidth = 40;
    const fieldHeight = 26;
    
    player.mesh.position.x = Math.max(-fieldWidth/2 + player.radius, 
                                      Math.min(fieldWidth/2 - player.radius, player.mesh.position.x));
    player.mesh.position.z = Math.max(-fieldHeight/2 + player.radius, 
                                      Math.min(fieldHeight/2 - player.radius, player.mesh.position.z));
  }
}