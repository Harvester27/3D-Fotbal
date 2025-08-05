// src/AIController.js
import { THREE } from './three.js';

export class AIController {
  constructor(aiPlayer, ball, aiData, playerGoalPosition = { x: 0, z: 13 }, aiGoalPosition = { x: 0, z: -13 }) {
    this.aiPlayer = aiPlayer;
    this.ball = ball;
    this.aiData = aiData; // Data z AIPlayerGenerator
    this.behavior = aiData.behavior;
    
    // Pozice branek
    this.playerGoalPosition = playerGoalPosition; // Branka hráče (kterou AI brání)
    this.aiGoalPosition = aiGoalPosition; // Branka AI (kam AI střílí)
    
    // AI States
    this.currentState = 'IDLE'; // IDLE, CHASE_BALL, DRIBBLE, SHOOT, DEFEND, RETURN_TO_POSITION
    this.previousState = 'IDLE';
    
    // Timers
    this.decisionTimer = 0;
    this.stateTimer = 0;
    this.actionCooldown = 0;
    
    // Movement
    this.targetPosition = null;
    this.moveDirection = new THREE.Vector3();
    this.isMoving = false;
    this.isSprinting = false;
    
    // Ball control
    this.hasBallControl = false;
    this.ballControlTimer = 0;
    this.lastKickTime = 0;
    this.dribbleDirection = new THREE.Vector3();
    
    // Defensive position
    this.homePosition = new THREE.Vector3(aiGoalPosition.x, 0, aiGoalPosition.z + 5);
    this.defensiveRadius = 8;
    
    // Decision making
    this.aggressionLevel = this.behavior.aggressiveness || 0.5;
    this.skillLevel = this.aiData.overallRating / 100; // 0-1
    
    // Performance factors
    this.reactionDelay = this.calculateReactionDelay();
    this.accuracy = this.calculateAccuracy();
    
    // Debug
    this.debugMode = false;
  }
  
  // 🎮 MAIN UPDATE METHOD
  update(deltaTime, playerPosition) {
    // Update timers
    this.decisionTimer += deltaTime;
    this.stateTimer += deltaTime;
    this.actionCooldown = Math.max(0, this.actionCooldown - deltaTime);
    
    // Update ball control status
    this.updateBallControlStatus();
    
    // Make decisions based on reaction speed
    if (this.decisionTimer >= this.reactionDelay) {
      this.makeDecision(playerPosition);
      this.decisionTimer = 0;
    }
    
    // Execute current state behavior
    this.executeState(deltaTime, playerPosition);
    
    // Apply movement
    this.applyMovement(deltaTime);
    
    // Debug visualization
    if (this.debugMode) {
      this.debugVisualization();
    }
  }
  
  // 🧠 DECISION MAKING
  makeDecision(playerPosition) {
    const distanceToBall = this.getDistanceToBall();
    const distanceToGoal = this.getDistanceToGoal(this.playerGoalPosition);
    const distanceToAIGoal = this.getDistanceToGoal(this.aiGoalPosition);
    const playerDistanceToBall = this.getPlayerDistanceToBall(playerPosition);
    
    // Store previous state
    this.previousState = this.currentState;
    
    // Priority-based decision tree
    if (this.hasBallControl) {
      // AI má míč - rozhodnout co s ním
      this.decideBallAction(playerPosition, distanceToAIGoal);
    } else if (distanceToBall < this.aiPlayer.controlRadius * 1.5) {
      // Míč je velmi blízko - pokusit se o kontrolu
      this.setState('CHASE_BALL');
    } else if (playerDistanceToBall < distanceToBall && distanceToGoal < this.defensiveRadius) {
      // Hráč je blíž k míči a AI je blízko své branky - bránit
      this.setState('DEFEND');
    } else if (distanceToBall < 10) {
      // Míč je v dosahu - jít pro něj
      this.setState('CHASE_BALL');
    } else {
      // Vrátit se na pozici
      this.setState('RETURN_TO_POSITION');
    }
  }
  
  // 🎯 BALL CONTROL DECISIONS
  decideBallAction(playerPosition, distanceToGoal) {
    const playerDistance = this.getDistanceToPlayer(playerPosition);
    
    // Rozhodnutí na základě situace
    if (distanceToGoal < this.behavior.shootingDistance && this.hasShootingAngle()) {
      // Blízko branky s dobrým úhlem - střílet
      this.setState('SHOOT');
    } else if (playerDistance < 3 && Math.random() < this.behavior.dribblingTendency) {
      // Hráč je blízko - pokusit se o driblink
      this.setState('DRIBBLE');
      this.selectDribbleDirection(playerPosition);
    } else if (distanceToGoal > 15 && Math.random() < 0.3) {
      // Daleko od branky - driblovat vpřed
      this.setState('DRIBBLE');
      this.dribbleDirection = this.getDirectionToGoal(this.aiGoalPosition);
    } else {
      // Default - pokračovat v driblingu
      this.setState('DRIBBLE');
      if (this.dribbleDirection.length() === 0) {
        this.dribbleDirection = this.getDirectionToGoal(this.aiGoalPosition);
      }
    }
  }
  
  // 🏃 STATE EXECUTION
  executeState(deltaTime, playerPosition) {
    switch (this.currentState) {
      case 'IDLE':
        this.executeIdle();
        break;
        
      case 'CHASE_BALL':
        this.executeChaseBall();
        break;
        
      case 'DRIBBLE':
        this.executeDribble(deltaTime);
        break;
        
      case 'SHOOT':
        this.executeShoot();
        break;
        
      case 'DEFEND':
        this.executeDefend(playerPosition);
        break;
        
      case 'RETURN_TO_POSITION':
        this.executeReturnToPosition();
        break;
    }
  }
  
  // 📍 STATE BEHAVIORS
  executeIdle() {
    this.isMoving = false;
    this.isSprinting = false;
  }
  
  executeChaseBall() {
    // Předvídat pozici míče
    const ballVelocity = this.ball.velocity.clone();
    const predictionTime = Math.min(0.5, this.getDistanceToBall() / this.aiPlayer.maxSpeed);
    const predictedPosition = this.ball.mesh.position.clone()
      .add(ballVelocity.clone().multiplyScalar(predictionTime));
    
    this.targetPosition = predictedPosition;
    this.isMoving = true;
    this.isSprinting = this.shouldSprint();
  }
  
  executeDribble(deltaTime) {
    if (!this.hasBallControl) {
      this.setState('CHASE_BALL');
      return;
    }
    
    // Pohyb s míčem
    this.targetPosition = this.aiPlayer.mesh.position.clone()
      .add(this.dribbleDirection.clone().multiplyScalar(5));
    this.isMoving = true;
    this.isSprinting = false; // Pomalejší s míčem
    
    // Kopnout míč vpřed
    if (Date.now() - this.lastKickTime > 500 / this.skillLevel) { // Častější kopnutí pro lepší hráče
      this.kickBallForward();
      this.lastKickTime = Date.now();
    }
  }
  
  executeShoot() {
    if (!this.hasBallControl) {
      this.setState('CHASE_BALL');
      return;
    }
    
    // Zastavit se před střelbou
    this.isMoving = false;
    
    // Střílet po krátkém zaměření
    if (this.stateTimer > 0.2 + (1 - this.skillLevel) * 0.3) { // Lepší hráči střílí rychleji
      this.shootAtGoal();
      this.setState('CHASE_BALL');
      this.actionCooldown = 1.0;
    }
  }
  
  executeDefend(playerPosition) {
    // Pozice mezi míčem a brankou
    const ballPos = this.ball.mesh.position;
    const goalPos = new THREE.Vector3(this.playerGoalPosition.x, 0, this.playerGoalPosition.z);
    
    // Vypočítat obrannou pozici
    const defenseLine = new THREE.Vector3().subVectors(ballPos, goalPos).normalize();
    const defenseDistance = Math.min(5, this.getDistanceToBall() * 0.5);
    
    this.targetPosition = goalPos.clone().add(defenseLine.multiplyScalar(defenseDistance));
    this.isMoving = true;
    this.isSprinting = this.getDistanceToBall() < 5;
  }
  
  executeReturnToPosition() {
    this.targetPosition = this.homePosition.clone();
    this.isMoving = true;
    this.isSprinting = false;
    
    // Pokud jsme blízko domovské pozice, přestat
    if (this.getDistanceToPosition(this.homePosition) < 2) {
      this.setState('IDLE');
    }
  }
  
  // ⚽ BALL ACTIONS
  kickBallForward() {
    const kickDirection = this.dribbleDirection.clone();
    
    // Přidat náhodnou chybu na základě skillu
    const errorAngle = (1 - this.skillLevel) * 0.3 * (Math.random() - 0.5);
    kickDirection.applyAxisAngle(new THREE.Vector3(0, 1, 0), errorAngle);
    
    // Síla kopnutí
    const kickPower = 0.8 + this.skillLevel * 0.4;
    
    this.ball.kick(kickDirection, kickPower);
  }
  
  shootAtGoal() {
    const goalPos = new THREE.Vector3(this.aiGoalPosition.x, 0.5, this.aiGoalPosition.z);
    const shootDirection = new THREE.Vector3()
      .subVectors(goalPos, this.ball.mesh.position)
      .normalize();
    
    // Přidat nepřesnost na základě skillu a vzdálenosti
    const distance = this.getDistanceToGoal(this.aiGoalPosition);
    const maxError = (1 - this.accuracy) * 0.5 * (distance / 20);
    const errorX = (Math.random() - 0.5) * maxError;
    const errorY = Math.random() * maxError * 0.5;
    
    shootDirection.x += errorX;
    shootDirection.y += errorY;
    
    // Síla střely
    const shootPower = 2.0 + this.aiPlayer.attributes.technical.finishing / 100 * 1.5;
    
    this.ball.kick(shootDirection, shootPower);
    
    console.log(`🥅 AI ${this.aiData.name} shoots! Power: ${shootPower.toFixed(1)}`);
  }
  
  // 🚶 MOVEMENT
  applyMovement(deltaTime) {
    if (!this.isMoving || !this.targetPosition) return;
    
    // Vypočítat směr k cíli
    const direction = new THREE.Vector3()
      .subVectors(this.targetPosition, this.aiPlayer.mesh.position);
    direction.y = 0;
    
    const distance = direction.length();
    if (distance < 0.5) {
      this.aiPlayer.velocity.set(0, 0, 0);
      return;
    }
    
    direction.normalize();
    
    // Nastavit rychlost
    const targetSpeed = this.isSprinting ? 
      this.aiPlayer.sprintSpeed * this.skillLevel : 
      this.aiPlayer.maxSpeed * this.skillLevel;
    
    // Plynulé zrychlení
    const currentSpeed = this.aiPlayer.velocity.length();
    const acceleration = this.aiPlayer.acceleration * this.skillLevel;
    const newSpeed = Math.min(currentSpeed + acceleration * deltaTime, targetSpeed);
    
    // Aplikovat rychlost
    this.aiPlayer.velocity = direction.multiplyScalar(newSpeed);
    this.aiPlayer.mesh.position.add(this.aiPlayer.velocity.clone().multiplyScalar(deltaTime));
    
    // Otočit AI správným směrem
    const targetRotation = Math.atan2(direction.x, direction.z);
    const rotationSpeed = 5.0 * deltaTime;
    this.aiPlayer.mesh.rotation.y = this.lerpAngle(
      this.aiPlayer.mesh.rotation.y,
      targetRotation,
      rotationSpeed
    );
    
    // Animace běhu
    this.aiPlayer.animationTime += deltaTime * newSpeed * 2;
    this.updateRunAnimation();
  }
  
  // 🎨 ANIMATIONS
  updateRunAnimation() {
    if (!this.aiPlayer.leftLeg || !this.aiPlayer.rightLeg) return;
    
    const runCycle = Math.sin(this.aiPlayer.animationTime * 5);
    const legSwing = runCycle * 0.8 * (this.aiPlayer.velocity.length() / this.aiPlayer.maxSpeed);
    
    this.aiPlayer.leftLeg.rotation.x = legSwing;
    this.aiPlayer.rightLeg.rotation.x = -legSwing;
    
    // Pohyb rukou
    if (this.aiPlayer.leftArm && this.aiPlayer.rightArm) {
      this.aiPlayer.leftArm.rotation.x = -legSwing * 0.5;
      this.aiPlayer.rightArm.rotation.x = legSwing * 0.5;
    }
  }
  
  // 🧮 CALCULATIONS
  calculateReactionDelay() {
    const baseDelay = this.behavior.decisionSpeed || 2000;
    const skillFactor = 1 - (this.skillLevel * 0.7); // Lepší hráči reagují rychleji
    return (baseDelay * skillFactor) / 1000; // Convert to seconds
  }
  
  calculateAccuracy() {
    const finishing = this.aiPlayer.attributes.technical.finishing / 100;
    const composure = this.aiPlayer.attributes.mental.composure / 100;
    const technique = this.aiPlayer.attributes.technical.technique / 100;
    
    return (finishing + composure + technique) / 3;
  }
  
  updateBallControlStatus() {
    const distance = this.getDistanceToBall();
    const wasInControl = this.hasBallControl;
    
    this.hasBallControl = distance <= this.aiPlayer.controlRadius;
    
    if (this.hasBallControl && !wasInControl) {
      this.ballControlTimer = 0;
      console.log(`⚽ AI ${this.aiData.name} gained ball control!`);
    } else if (!this.hasBallControl && wasInControl) {
      console.log(`❌ AI ${this.aiData.name} lost ball control!`);
    }
    
    if (this.hasBallControl) {
      this.ballControlTimer += 0.016; // ~60fps
    }
  }
  
  // 📏 DISTANCE HELPERS
  getDistanceToBall() {
    return this.aiPlayer.mesh.position.distanceTo(this.ball.mesh.position);
  }
  
  getDistanceToPlayer(playerPosition) {
    return this.aiPlayer.mesh.position.distanceTo(playerPosition);
  }
  
  getDistanceToGoal(goalPosition) {
    const goalPos = new THREE.Vector3(goalPosition.x, 0, goalPosition.z);
    return this.aiPlayer.mesh.position.distanceTo(goalPos);
  }
  
  getDistanceToPosition(position) {
    return this.aiPlayer.mesh.position.distanceTo(position);
  }
  
  getPlayerDistanceToBall(playerPosition) {
    return new THREE.Vector3(playerPosition.x, playerPosition.y, playerPosition.z)
      .distanceTo(this.ball.mesh.position);
  }
  
  // 📐 DIRECTION HELPERS
  getDirectionToGoal(goalPosition) {
    const goalPos = new THREE.Vector3(goalPosition.x, 0, goalPosition.z);
    return new THREE.Vector3()
      .subVectors(goalPos, this.aiPlayer.mesh.position)
      .normalize();
  }
  
  selectDribbleDirection(playerPosition) {
    // Vyhnout se hráči
    const playerDir = new THREE.Vector3()
      .subVectors(playerPosition, this.aiPlayer.mesh.position)
      .normalize();
    
    const goalDir = this.getDirectionToGoal(this.aiGoalPosition);
    
    // Směr kolmý k hráči
    const avoidanceDir = new THREE.Vector3(-playerDir.z, 0, playerDir.x);
    
    // Vybrat stranu podle pozice na hřišti
    if (this.aiPlayer.mesh.position.x > 0) {
      avoidanceDir.multiplyScalar(-1);
    }
    
    // Kombinovat směry
    this.dribbleDirection = new THREE.Vector3()
      .addVectors(goalDir.multiplyScalar(0.7), avoidanceDir.multiplyScalar(0.3))
      .normalize();
  }
  
  // 🎯 SHOOTING HELPERS
  hasShootingAngle() {
    const goalWidth = 7.32; // Oficiální šířka branky
    const goalPos = new THREE.Vector3(this.aiGoalPosition.x, 0, this.aiGoalPosition.z);
    const toGoal = new THREE.Vector3()
      .subVectors(goalPos, this.aiPlayer.mesh.position);
    
    const distance = toGoal.length();
    const angle = Math.atan(goalWidth / 2 / distance);
    
    // Lepší hráči vidí menší úhly
    const minAngle = (1 - this.skillLevel) * 0.3 + 0.1;
    
    return angle > minAngle;
  }
  
  shouldSprint() {
    // Sprint když je to důležité
    if (this.currentState === 'CHASE_BALL' && this.getDistanceToBall() < 5) return true;
    if (this.currentState === 'DEFEND') return true;
    if (this.behavior.counterAttackPreference > 0.5 && this.hasBallControl) return true;
    
    // Jinak na základě staminy a situace
    return Math.random() < 0.3;
  }
  
  // 🔧 UTILITIES
  setState(newState) {
    if (this.currentState !== newState) {
      this.currentState = newState;
      this.stateTimer = 0;
      
      if (this.debugMode) {
        console.log(`🤖 AI ${this.aiData.name} state: ${this.previousState} → ${newState}`);
      }
    }
  }
  
  lerpAngle(from, to, t) {
    const difference = to - from;
    const wrappedDiff = ((difference + Math.PI) % (Math.PI * 2)) - Math.PI;
    return from + wrappedDiff * t;
  }
  
  // 🐛 DEBUG
  debugVisualization() {
    // V produkci by zde byly Three.js helpers pro vizualizaci
    // Např. čáry k cíli, indikátory stavu atd.
    if (this.targetPosition) {
      console.log(`Target: ${this.targetPosition.x.toFixed(1)}, ${this.targetPosition.z.toFixed(1)}`);
    }
  }
  
  setDebugMode(enabled) {
    this.debugMode = enabled;
  }
  
  // 📊 GETTERS
  getState() {
    return this.currentState;
  }
  
  getStats() {
    return {
      state: this.currentState,
      hasBall: this.hasBallControl,
      ballControlTime: this.ballControlTimer,
      distanceToBall: this.getDistanceToBall().toFixed(1),
      speed: this.aiPlayer.velocity.length().toFixed(1)
    };
  }
}