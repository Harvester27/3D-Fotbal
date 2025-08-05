// src/FootballPlayer.js - Hlavní třída hráče s FIFA atributy - FIXED AI CONTROL
import { THREE } from './three.js';
import { PlayerAppearance } from './PlayerAppearance.js';
import { PlayerControls } from './PlayerControls.js';
import { PlayerAttributeCalculator } from './PlayerAttributeCalculator.js';
import { PlayerSkillChecker } from './PlayerSkillChecker.js';
import { PlayerBallHandler } from './PlayerBallHandler.js';
import { PlayerMovementAnimator } from './PlayerMovementAnimator.js';
import { PlayerStaminaManager } from './PlayerStaminaManager.js';
import { PlayerUtilities } from './PlayerUtilities.js';
import { playerDataManager } from './PlayerDataManager.js';

export default class FootballPlayer {
  constructor(scene, initialPosition = { x: 0, y: 0, z: 8 }, isAI = false) {
    this.scene = scene;
    this.isAI = isAI; // 🔥 NOVÉ: Flag pro AI hráče
    
    // 🔥 OPRAVA: Získej atributy přímo z PlayerDataManager, ne přes Calculator
    this.attributes = JSON.parse(JSON.stringify(playerDataManager.attributes));
    this.traits = JSON.parse(JSON.stringify(playerDataManager.traits));
    
    // Debug log
    console.log(`🎮 Creating ${isAI ? 'AI' : 'human'} player with attributes:`, {
      pace: this.attributes.physical.pace,
      dribbling: this.attributes.technical.dribbling,
      finishing: this.attributes.technical.finishing,
      overall: PlayerAttributeCalculator.getOverallRating(this.attributes)
    });
    
    // Základní rychlosti - nyní ovlivněné atributy
    this.baseSpeed = 2.0; // Základní rychlost
    this.speed = 0;
    this.maxSpeed = PlayerAttributeCalculator.calculateMaxSpeed(this.attributes, this.traits, this.baseSpeed);
    this.maxBackwardSpeed = this.maxSpeed * 0.5; // Polovina dopředné rychlosti
    this.sprintSpeed = PlayerAttributeCalculator.calculateSprintSpeed(this.attributes, this.maxSpeed);
    this.sprintBackwardSpeed = this.sprintSpeed * 0.5;
    
    // Akcelerace a decelerace - ovlivněno atributy
    this.acceleration = PlayerAttributeCalculator.calculateAcceleration(this.attributes);
    this.deceleration = PlayerAttributeCalculator.calculateDeceleration(this.attributes);
    
    this.radius = 0.375;
    this.animationTime = 0;
    
    // Skok systém - ovlivněný atributy
    this.verticalVelocity = 0;
    this.jumpForce = PlayerAttributeCalculator.calculateJumpForce(this.attributes);
    this.gravity = -15;
    this.isOnGround = true;
    this.groundLevel = 0;
    this.jumpCooldown = 0;
    this.jumpCooldownTime = 0.3;
    
    // Vlastnosti pro předkopávání míče - ovlivněné atributy
    this.lastKickTime = 0;
    this.kickInterval = PlayerAttributeCalculator.calculateKickInterval(this.attributes);
    this.kickForce = PlayerAttributeCalculator.calculateKickForce(this.attributes);
    this.controlRadius = PlayerAttributeCalculator.calculateControlRadius(this.attributes);
    
    // Skill-based chyby - ovlivněné atributy a traits
    this.missKickChance = PlayerSkillChecker.calculateMissKickChance(this.attributes, this.traits);
    this.tripChance = PlayerSkillChecker.calculateTripChance(this.attributes, this.traits);
    this.badTouchChance = PlayerSkillChecker.calculateBadTouchChance(this.attributes, 0); // pressure level 0 initially
    this.loseControlChance = 0; // Will be calculated dynamically with stamina
    
    // Tracking pro FPS ovládání
    this.currentRotation = 0;
    this.isMovingBackward = false;
    this.isSprinting = false;
    this.isJumping = false;
    
    // Driblování a kontrola míče - ovlivněno atributy
    this.isDribbling = false;
    this.ballControlStartTime = 0;
    this.ballFirstTouchAnimation = 0;
    this.headLookDownAmount = 0;
    this.lastDribbleTime = 0;
    this.dribblingSkill = PlayerAttributeCalculator.calculateDribblingSkill(this.attributes);
    
    // Body physics pro animace
    this.bodyTilt = { x: 0, z: 0 };
    this.bodyBounce = 0;
    this.shoulderRotation = 0;
    
    // Stamina systém
    this.maxStamina = PlayerAttributeCalculator.calculateMaxStamina(this.attributes);
    this.currentStamina = this.maxStamina;
    this.staminaRecoveryRate = PlayerAttributeCalculator.calculateStaminaRecovery(this.attributes);
    this.isExhausted = false;
    
    // Skill cooldowns a performance tracking
    this.performanceModifier = 1.0; // Ovlivněno únavou, tlakem, atd.
    this.pressureLevel = 0; // 0-1, ovlivňuje composure
    this.confidence = 0.5; // 0-1, ovlivňuje všechny akce
    
    this.moveDirection = new THREE.Vector3();
    this.velocity = new THREE.Vector3();
    
    // Vytvoření vzhledu hráče
    const playerData = PlayerAppearance.createPlayer(scene, initialPosition);
    this.mesh = playerData.mesh;
    this.leftArm = playerData.leftArm;
    this.rightArm = playerData.rightArm;
    this.leftLeg = playerData.leftLeg;
    this.rightLeg = playerData.rightLeg;
    
    // Scale podle build atributu
    const buildScale = PlayerAttributeCalculator.getBuildScale(this.attributes);
    this.mesh.scale.set(buildScale.x, buildScale.y, buildScale.z);
    
    // Body parts pro animaci
    this.torso = this.mesh.children.find(child => child.position.y > 0.5 && child.position.y < 1.5);
    this.head = this.mesh.children.find(child => child.position.y > 1.4);
    
    // Uložíme všechny části hlavy
    this.headParts = this.mesh.children.filter(child => {
      return child.position.y > 1.4 || 
             (child.parent && child.parent.position.y > 1.4);
    });
    
    // 🔥 KRITICKÁ OPRAVA: Nastavení ovládání pouze pro lidské hráče
    if (!this.isAI) {
      this.controls = new PlayerControls();
      console.log('✅ Human player controls initialized');
    } else {
      this.controls = null; // AI nemá ovládání z klávesnice
      console.log('🤖 AI player created without keyboard controls');
    }
    
    // Nastav počáteční rotaci mesh
    this.mesh.rotation.y = this.currentRotation;
    
    console.log(`⚽ ${isAI ? 'AI' : 'Human'} player created with OVR: ${this.getOverallRating()}, Speed: ${this.maxSpeed.toFixed(1)}, Control: ${this.controlRadius.toFixed(1)}`);
  }

  // 🔥 NOVÁ METODA: Refresh vzhledu hráče
  refreshAppearance() {
    console.log(`🔄 Refreshing ${this.isAI ? 'AI' : 'human'} player appearance...`);
    
    // Pouze lidský hráč používá PlayerDataManager customization
    // AI hráč má vlastní customization nastavenou v AIController
    if (this.isAI) {
      console.log('⚠️ AI player appearance refresh skipped - managed by AIController');
      return;
    }
    
    // Získej aktuální pozici a rotaci
    const currentPosition = this.mesh.position.clone();
    const currentRotation = this.mesh.rotation.clone();
    
    // Odstraň starý mesh ze scény
    this.scene.remove(this.mesh);
    
    // Vytvoř nový mesh s aktualizovanou customizací
    const newPlayerData = PlayerAppearance.createPlayer(
      this.scene, 
      { 
        x: currentPosition.x, 
        y: currentPosition.y, 
        z: currentPosition.z 
      },
      playerDataManager.playerCustomization // Použij aktuální data z PlayerDataManager
    );
    
    // Aktualizuj reference
    this.mesh = newPlayerData.mesh;
    this.leftArm = newPlayerData.leftArm;
    this.rightArm = newPlayerData.rightArm;
    this.leftLeg = newPlayerData.leftLeg;
    this.rightLeg = newPlayerData.rightLeg;
    
    // Obnov rotaci
    this.mesh.rotation.copy(currentRotation);
    
    // Aplikuj build scale znovu
    const buildScale = PlayerAttributeCalculator.getBuildScale(this.attributes);
    this.mesh.scale.set(buildScale.x, buildScale.y, buildScale.z);
    
    // Znovu najdi body parts pro animaci
    this.torso = this.mesh.children.find(child => child.position.y > 0.5 && child.position.y < 1.5);
    this.head = this.mesh.children.find(child => child.position.y > 1.4);
    this.headParts = this.mesh.children.filter(child => {
      return child.position.y > 1.4 || 
             (child.parent && child.parent.position.y > 1.4);
    });
    
    console.log('✅ Human player appearance refreshed successfully');
  }

  // 🔥 NOVÁ METODA: Refresh atributů
  refreshAttributes() {
    console.log(`🔄 Refreshing ${this.isAI ? 'AI' : 'human'} player attributes...`);
    
    // AI hráč má svoje atributy nastavené z AIController, neměnit je
    if (this.isAI) {
      console.log('⚠️ AI player attributes refresh skipped - managed by AIController');
      return;
    }
    
    // Získej aktualizované atributy z PlayerDataManager (pouze pro lidský hráč)
    this.attributes = JSON.parse(JSON.stringify(playerDataManager.attributes));
    this.traits = JSON.parse(JSON.stringify(playerDataManager.traits));
    
    // Přepočítej všechny hodnoty závislé na atributech
    this.maxSpeed = PlayerAttributeCalculator.calculateMaxSpeed(this.attributes, this.traits, this.baseSpeed);
    this.maxBackwardSpeed = this.maxSpeed * 0.5;
    this.sprintSpeed = PlayerAttributeCalculator.calculateSprintSpeed(this.attributes, this.maxSpeed);
    this.sprintBackwardSpeed = this.sprintSpeed * 0.5;
    
    this.acceleration = PlayerAttributeCalculator.calculateAcceleration(this.attributes);
    this.deceleration = PlayerAttributeCalculator.calculateDeceleration(this.attributes);
    
    this.jumpForce = PlayerAttributeCalculator.calculateJumpForce(this.attributes);
    this.kickInterval = PlayerAttributeCalculator.calculateKickInterval(this.attributes);
    this.kickForce = PlayerAttributeCalculator.calculateKickForce(this.attributes);
    this.controlRadius = PlayerAttributeCalculator.calculateControlRadius(this.attributes);
    
    this.dribblingSkill = PlayerAttributeCalculator.calculateDribblingSkill(this.attributes);
    this.maxStamina = PlayerAttributeCalculator.calculateMaxStamina(this.attributes);
    this.staminaRecoveryRate = PlayerAttributeCalculator.calculateStaminaRecovery(this.attributes);
    
    // Přepočítej skill-based chyby
    this.missKickChance = PlayerSkillChecker.calculateMissKickChance(this.attributes, this.traits);
    this.tripChance = PlayerSkillChecker.calculateTripChance(this.attributes, this.traits);
    this.badTouchChance = PlayerSkillChecker.calculateBadTouchChance(this.attributes, 0);
    
    // Aplikuj build scale
    const buildScale = PlayerAttributeCalculator.getBuildScale(this.attributes);
    this.mesh.scale.set(buildScale.x, buildScale.y, buildScale.z);
    
    console.log(`⚽ Human player attributes refreshed! New OVR: ${this.getOverallRating()}, Speed: ${this.maxSpeed.toFixed(1)}`);
  }

  // === DELEGOVANÉ METODY ===
  
  // Atributy a výpočty
  getPlayerAttributes() {
    return PlayerAttributeCalculator.getPlayerAttributes();
  }
  
  getPlayerTraits() {
    return PlayerAttributeCalculator.getPlayerTraits();
  }
  
  getOverallRating() {
    return PlayerAttributeCalculator.getOverallRating(this.attributes);
  }
  
  getBuildScale() {
    return PlayerAttributeCalculator.getBuildScale(this.attributes);
  }
  
  // Calculate methods - pro zachování kompatibility
  calculateMaxSpeed() { return this.maxSpeed; }
  calculateSprintSpeed() { return this.sprintSpeed; }
  calculateAcceleration() { return this.acceleration; }
  calculateDeceleration() { return this.deceleration; }
  calculateJumpForce() { return this.jumpForce; }
  calculateKickInterval() { return this.kickInterval; }
  calculateKickForce() { return this.kickForce; }
  calculateControlRadius() { return this.controlRadius; }
  calculateDribblingSkill() { return this.dribblingSkill; }
  calculateMaxStamina() { return this.maxStamina; }
  calculateStaminaRecovery() { return this.staminaRecoveryRate; }
  
  // Skill chyby
  calculateMissKickChance() {
    return PlayerSkillChecker.calculateMissKickChance(this.attributes, this.traits);
  }
  
  calculateTripChance() {
    return PlayerSkillChecker.calculateTripChance(this.attributes, this.traits);
  }
  
  calculateBadTouchChance() {
    return PlayerSkillChecker.calculateBadTouchChance(this.attributes, this.pressureLevel);
  }
  
  calculateLoseControlChance() {
    return PlayerSkillChecker.calculateLoseControlChance(this.attributes, this.currentStamina, this.maxStamina);
  }
  
  // Ball handling
  kickBallForward(ball, deltaTime) {
    PlayerBallHandler.kickBallForward(this, ball, deltaTime);
  }
  
  handleBallFirstTouch(ball) {
    // 🔥 OPRAVA: Vlastní implementace s kontrolou AI pro potlačení zpráv
    if (!ball) return;
    
    const distance = this.mesh.position.distanceTo(ball.mesh.position);
    const wasInControl = this.isDribbling;
    
    // Zkontroluj jestli hráč je blízko míče
    if (distance <= this.controlRadius && !this.isDribbling) {
      this.isDribbling = true;
      this.ballControlStartTime = Date.now();
      this.lastDribbleTime = Date.now();
      this.ballFirstTouchAnimation = 1.0;
      
      // 🔥 OPRAVA: Zprávy pouze pro lidského hráče
      if (!this.isAI) {
        console.log(`⚽ Player gained ball control! Distance: ${distance.toFixed(2)}m`);
        
        // Zobraz UI zprávu pokud existuje globální funkce
        if (window.showGameMessage) {
          window.showGameMessage(`⚽ Převzal jsi kontrolu míče!`, 'success', 2000);
        }
      }
      
    } else if (distance > this.controlRadius * 1.2 && this.isDribbling) {
      // Ztráta kontroly míče
      this.isDribbling = false;
      this.ballControlStartTime = 0;
      this.ballFirstTouchAnimation = 0;
      
      // 🔥 OPRAVA: Zprávy pouze pro lidského hráče
      if (!this.isAI) {
        console.log(`❌ Player lost ball control! Distance: ${distance.toFixed(2)}m`);
        
        // Zobraz UI zprávu pokud existuje globální funkce
        if (window.showGameMessage) {
          window.showGameMessage(`❌ Ztratil jsi kontrolu míče!`, 'warning', 1500);
        }
      }
    }
    
    // Update first touch animation
    if (this.ballFirstTouchAnimation > 0) {
      this.ballFirstTouchAnimation -= 0.02;
      this.ballFirstTouchAnimation = Math.max(0, this.ballFirstTouchAnimation);
    }
  }
  
  checkBallControl(ball) {
    return PlayerBallHandler.checkBallControl(this, ball);
  }
  
  handleBallKick(ball, camera) {
    // 🔥 OPRAVA: AI hráč nemá kameru ani ovládání střelby myší
    if (this.isAI) return;
    PlayerBallHandler.handleBallKick(this, ball, camera);
  }
  
  getDribblingStatus() {
    return PlayerBallHandler.getDribblingStatus(this);
  }
  
  // Movement a animace
  handleJump(deltaTime, isJumping) {
    PlayerMovementAnimator.handleJump(this, deltaTime, isJumping);
  }
  
  updateFPSRunningAnimation(deltaTime, isBackward = false, isSprinting = false, isJumping = false) {
    PlayerMovementAnimator.updateFPSRunningAnimation(this, deltaTime, isBackward, isSprinting, isJumping);
  }
  
  constrainToField() {
    PlayerMovementAnimator.constrainToField(this);
  }
  
  // Stamina management
  updateStamina(deltaTime) {
    PlayerStaminaManager.updateStamina(this, deltaTime);
    // Update dynamic values
    this.loseControlChance = PlayerSkillChecker.calculateLoseControlChance(this.attributes, this.currentStamina, this.maxStamina);
    this.badTouchChance = PlayerSkillChecker.calculateBadTouchChance(this.attributes, this.pressureLevel);
  }
  
  // Utility gettery
  getCurrentRotation() {
    return PlayerUtilities.getCurrentRotation(this);
  }

  getMovementDirection() {
    return PlayerUtilities.getMovementDirection(this);
  }

  isCurrentlyMoving() {
    return PlayerUtilities.isCurrentlyMoving(this);
  }
  
  getLastDribbleTime() {
    return PlayerUtilities.getLastDribbleTime(this);
  }
  
  getStaminaPercent() {
    return PlayerUtilities.getStaminaPercent(this);
  }
  
  getPerformanceRating() {
    return PlayerUtilities.getPerformanceRating(this);
  }
  
  getConfidenceLevel() {
    return PlayerUtilities.getConfidenceLevel(this);
  }
  
  getSkillRating(category, attribute) {
    return PlayerUtilities.getSkillRating(this, category, attribute);
  }
  
  setHeadVisible(visible) {
    PlayerUtilities.setHeadVisible(this, visible);
  }
  
  getDetailedStatus() {
    return PlayerUtilities.getDetailedStatus(this);
  }

  // === HLAVNÍ UPDATE METODA ===
  update(deltaTime, ball = null, camera = null) {
    // Update stamina first
    this.updateStamina(deltaTime);
    
    // 🔥 KRITICKÁ OPRAVA: Rozdělení mezi lidský a AI hráč
    if (this.isAI) {
      // === AI HRÁČ - POUZE PASIVNÍ AKTUALIZACE ===
      // AI hráč je ovládán pouze přes AIController
      // Zde pouze zpracováváme základní fyziku a animace
      
      // === DETEKCE PŘEVZETÍ MÍČE s atributy ===
      this.handleBallFirstTouch(ball);
      
      // === VEDENÍ MÍČE - PŘEDKOPÁVÁNÍ s atributy (AI řízeno AIControllerem) ===
      if (ball && this.isDribbling) {
        if (!this.isMovingBackward) {
          this.kickBallForward(ball, deltaTime);
        } else {
          PlayerBallHandler.handleBackwardBallControl(this, ball, deltaTime);
        }
      }
      
      // === HRANICE HŘIŠTĚ ===
      this.constrainToField();
      
      // === ANIMACE na základě aktuálního pohybu ===
      this.updateFPSRunningAnimation(deltaTime, this.isMovingBackward, this.isSprinting, this.isJumping);
      
      // Update pressure level based on game situation
      PlayerStaminaManager.updatePressureLevel(this, deltaTime);
      
      return; // AI hráč končí zde
    }
    
    // === LIDSKÝ HRÁČ - KOMPLETNÍ OVLÁDÁNÍ ===
    
    // Update controls (including charging system)
    this.controls.update(deltaTime);
    
    // === FPS OVLÁDÁNÍ s performance modifikací ===
    const { isMoving, movementInput, isBackward, turnInput, isSprinting, isJumping } = this.controls.getMovementInput(this.currentRotation);
    
    // Check if player can sprint (stamina requirement)
    const canSprint = isSprinting && this.currentStamina > 20 && !this.isExhausted;
    this.isSprinting = canSprint;
    
    // Agility affects turn speed
    const baseTurnSpeed = this.controls.getTurnSpeed();
    const agilityFactor = (this.attributes.physical.agility / 100);
    const effectiveTurnSpeed = baseTurnSpeed * (0.8 + agilityFactor * 0.4) * this.performanceModifier;
    
    // Otáčení hráče (A/D klávesy)
    if (turnInput !== 0) {
      this.currentRotation += turnInput * effectiveTurnSpeed * deltaTime;
      this.mesh.rotation.y = this.currentRotation;
    }
    
    // Pohyb hráče dopředu/dozadu
    if (isMoving) {
      // Aplikuj sprint na maximální rychlost s performance modifier
      let targetMaxSpeed;
      if (canSprint) {
        targetMaxSpeed = isBackward ? this.sprintBackwardSpeed : this.sprintSpeed;
      } else {
        targetMaxSpeed = isBackward ? this.maxBackwardSpeed : this.maxSpeed;
      }
      
      // Apply performance modifier to speed
      targetMaxSpeed *= this.performanceModifier;
      
      // Acceleration affected by acceleration attribute
      const effectiveAcceleration = this.acceleration * this.performanceModifier;
      this.speed = Math.min(this.speed + effectiveAcceleration * deltaTime, targetMaxSpeed);
      
      // Nastav pohyb podle vstupů
      const movementVector = new THREE.Vector3(movementInput.x, 0, movementInput.z);
      movementVector.normalize();
      
      this.velocity = movementVector.multiplyScalar(this.speed);
      this.mesh.position.add(this.velocity.clone().multiplyScalar(deltaTime));
      
      // Uložíme informaci o couvání
      this.isMovingBackward = isBackward;
      
    } else {
      // Deceleration affected by balance
      const effectiveDeceleration = this.deceleration * this.performanceModifier;
      this.speed = Math.max(this.speed - effectiveDeceleration * deltaTime, 0);
      this.isMovingBackward = false;
    }
    
    // === SKOK s atributy ===
    this.handleJump(deltaTime, isJumping);
    
    // === DETEKCE PŘEVZETÍ MÍČE s atributy ===
    this.handleBallFirstTouch(ball);
    
    // === VEDENÍ MÍČE - PŘEDKOPÁVÁNÍ s atributy ===
    if (ball && this.isDribbling) {
      if (!this.isMovingBackward) {
        this.kickBallForward(ball, deltaTime);
      } else {
        // Při couvání - speciální handling s atributy
        PlayerBallHandler.handleBackwardBallControl(this, ball, deltaTime);
      }
    }
    
    // === STŘELBA MYŠÍ s atributy ===
    this.handleBallKick(ball, camera);
    
    // === HRANICE HŘIŠTĚ ===
    this.constrainToField();
    
    // === FPS ANIMACE s atributy ===
    this.updateFPSRunningAnimation(deltaTime, this.isMovingBackward, this.isSprinting, this.isJumping);
    
    // Update pressure level based on game situation
    PlayerStaminaManager.updatePressureLevel(this, deltaTime);
  }

  // Cleanup
  dispose() {
    PlayerUtilities.dispose(this);
  }
}