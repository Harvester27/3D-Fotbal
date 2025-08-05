// src/PlayerControls.js - FPS Style Controls with Mouse Shooting
import { THREE } from './three.js';

export class PlayerControls {
  constructor() {
    this.keys = {
      forward: false,   // W - pohyb dopředu
      backward: false,  // S - couvání
      turnLeft: false,  // A - otáčení doleva
      turnRight: false, // D - otáčení doprava
      jump: false,      // Space - skok
      kick: false,      // 🔥 ZMĚNA: Nyní pro levé tlačítko myši
      sprint: false     // Shift - sprintování
    };
    
    // 🔥 NOVÝ: Mouse shooting system
    this.mouse = {
      isCharging: false,
      chargePower: 0,
      maxChargePower: 100,
      chargeSpeed: 80, // Power per second
      screenX: 0,
      screenY: 0,
      pixelX: window.innerWidth / 2,  // 🔥 NOVÝ: Pixel coordinates
      pixelY: window.innerHeight / 2,
      virtualX: window.innerWidth / 2,  // 🔥 NOVÝ: Virtual coordinates for pointer lock
      virtualY: window.innerHeight / 2,
      isLocked: false
    };
    
    // 🔥 NOVÝ: Accuracy system - ZJEDNODUŠENO
    this.accuracy = {
      sweetSpotStart: 0.6,  // Sweet spot začíná na 60%
      sweetSpotEnd: 0.8,    // Sweet spot končí na 80%
      hitAccuracy: 1.0      // Final accuracy multiplier (1.0 = perfect)
    };
    
    // Informace o aktuálním směru pohybu pro kameru a animace
    this.currentMovementDirection = null; // radiány
    this.isCurrentlyMoving = false;
    this.isMovingBackward = false;
    
    // Rychlost otáčení hráče
    this.turnSpeed = 0.5;
    
    this.setupControls();
  }

  setupControls() {
    this.handleKeyDown = (event) => {
      // Detekce Shift pomocí event.shiftKey
      this.keys.sprint = event.shiftKey;
      
      switch(event.code) {
        case 'KeyW':
        case 'ArrowUp':
          this.keys.forward = true;
          break;
        case 'KeyS':
        case 'ArrowDown':
          this.keys.backward = true;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          this.keys.turnLeft = true;
          break;
        case 'KeyD':
        case 'ArrowRight':
          this.keys.turnRight = true;
          break;
        case 'Space':
          this.keys.jump = true;
          event.preventDefault();
          break;
        case 'KeyF':
          // F klávesa už nedělá nic - střelba je na myš
          break;
      }
    };
    
    this.handleKeyUp = (event) => {
      // Detekce Shift pomocí event.shiftKey
      this.keys.sprint = event.shiftKey;
      
      switch(event.code) {
        case 'KeyW':
        case 'ArrowUp':
          this.keys.forward = false;
          break;
        case 'KeyS':
        case 'ArrowDown':
          this.keys.backward = false;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          this.keys.turnLeft = false;
          break;
        case 'KeyD':
        case 'ArrowRight':
          this.keys.turnRight = false;
          break;
        case 'Space':
          this.keys.jump = false;
          break;
      }
    };
    
    // 🔥 NOVÝ: Mouse event handlers
    this.handleMouseDown = (event) => {
      if (event.button === 0) { // Levé tlačítko
        this.mouse.isCharging = true;
        this.mouse.chargePower = 0;
        // 🔥 OPRAVA: NESTAVEJ kick flag při stisku!
        // this.keys.kick = true; 
        
        console.log("🎯 Nabíjení střely začalo!");
        // 🔥 OPRAVA: Nezabraňuj propagaci eventu
        // event.preventDefault();
      }
    };
    
    this.handleMouseUp = (event) => {
      if (event.button === 0 && this.mouse.isCharging) { // Levé tlačítko
        // 🔥 OPRAVA: Hned vypni nabíjení a nastav kick flag
        this.mouse.isCharging = false;
        this.keys.kick = true; // 🔥 TEPRVE TEĎ nastav kick flag!
        
        // Calculate accuracy based on power level
        this.calculateAccuracy();
        
        console.log(`🎯 Střela připravena! Síla: ${this.mouse.chargePower.toFixed(1)}%, Přesnost: ${(this.accuracy.hitAccuracy * 100).toFixed(1)}%`);
        // 🔥 OPRAVA: Nezabraňuj propagaci eventu
        // event.preventDefault();
      }
    };
    
    this.handleMouseMove = (event) => {
      // 🔥 VYLEPŠENO: Sleduj pozici myši i při pointer lock
      if (document.pointerLockElement) {
        // Při pointer lock použij virtuální pozici
        this.mouse.virtualX += event.movementX;
        this.mouse.virtualY += event.movementY;
        
        // Omez na hranice obrazovky
        this.mouse.virtualX = Math.max(0, Math.min(window.innerWidth, this.mouse.virtualX));
        this.mouse.virtualY = Math.max(0, Math.min(window.innerHeight, this.mouse.virtualY));
        
        this.mouse.pixelX = this.mouse.virtualX;
        this.mouse.pixelY = this.mouse.virtualY;
      } else {
        // Normální pozice myši
        this.mouse.pixelX = event.clientX;
        this.mouse.pixelY = event.clientY;
        this.mouse.virtualX = event.clientX;
        this.mouse.virtualY = event.clientY;
      }
      
      // Normalized coordinates pro 3D projekci
      this.mouse.screenX = (this.mouse.pixelX / window.innerWidth) * 2 - 1;
      this.mouse.screenY = -(this.mouse.pixelY / window.innerHeight) * 2 + 1;
    };
    
    // 🔥 NOVÝ: Reset virtuální pozice při změně pointer lock
    this.handlePointerLockChange = () => {
      if (!document.pointerLockElement) {
        // Reset virtuální pozici na aktuální pozici myši
        this.mouse.virtualX = this.mouse.pixelX;
        this.mouse.virtualY = this.mouse.pixelY;
      }
    };
    
    // Prevent context menu on right click
    this.handleContextMenu = (event) => {
      event.preventDefault();
    };
    
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    // 🔥 OPRAVA: Mouse eventy na window místo jen canvas
    window.addEventListener('mousedown', this.handleMouseDown);
    window.addEventListener('mouseup', this.handleMouseUp);
    window.addEventListener('mousemove', this.handleMouseMove);
    window.addEventListener('contextmenu', this.handleContextMenu);
    // 🔥 NOVÝ: Sleduj změny pointer lock
    document.addEventListener('pointerlockchange', this.handlePointerLockChange);
  }

  // 🔥 NOVÁ METODA: Update charging system
  update(deltaTime) {
    // Update charging power - jen nabíjí sílu, žádný pohyblivý indikátor
    if (this.mouse.isCharging) {
      this.mouse.chargePower = Math.min(
        this.mouse.chargePower + this.mouse.chargeSpeed * deltaTime,
        this.mouse.maxChargePower
      );
    }
  }

  // 🔥 NOVÁ METODA: Calculate accuracy based on power level
  calculateAccuracy() {
    const powerPercent = this.mouse.chargePower / this.mouse.maxChargePower;
    
    // Check if power is in sweet spot (hidden zone)
    if (powerPercent >= this.accuracy.sweetSpotStart && powerPercent <= this.accuracy.sweetSpotEnd) {
      // Perfect hit - střela v sweet spotu
      this.accuracy.hitAccuracy = 1.0;
      
      if (window.showGameMessage) {
        window.showGameMessage("🎯 PERFEKTNÍ SÍLA! Sweet spot!", "success", 1500);
      }
    } else {
      // Calculate accuracy based on distance from sweet spot
      const sweetSpotCenter = (this.accuracy.sweetSpotStart + this.accuracy.sweetSpotEnd) / 2;
      const distanceFromSweet = Math.abs(powerPercent - sweetSpotCenter);
      
      // Further from sweet spot = less accurate (0.4 to 1.0)
      this.accuracy.hitAccuracy = Math.max(0.4, 1.0 - distanceFromSweet * 2.0);
      
      if (window.showGameMessage) {
        const accuracyPercent = (this.accuracy.hitAccuracy * 100).toFixed(0);
        window.showGameMessage(`⚠️ Síla mimo sweet spot! ${accuracyPercent}% přesnost`, "warning", 1500);
      }
    }
  }

  // 🔥 NOVÁ METODA: Get mouse aiming direction in world space
  getMouseAimDirection(camera) {
    if (!camera) return null;
    
    // 🔥 VYLEPŠENO: Používáme aktuální pozici myši bez ohledu na pointer lock
    const vector = new THREE.Vector3(this.mouse.screenX, this.mouse.screenY, 0.5);
    vector.unproject(camera);
    
    // Calculate direction from camera to mouse point
    const direction = vector.sub(camera.position).normalize();
    
    // Flatten to horizontal plane for shooting
    direction.y = 0.2; // Small upward angle
    direction.normalize();
    
    return direction;
  }

  // FPS-style pohyb relativní k rotaci hráče
  getMovementInput(currentPlayerRotation = 0) {
    let isMoving = false;
    let movementInput = { x: 0, z: 0 };
    let isBackward = false;
    let turnInput = 0;
    
    // Otáčení hráče (A/D)
    if (this.keys.turnLeft) {
      turnInput += 1;
    }
    if (this.keys.turnRight) {
      turnInput -= 1;
    }
    
    // Pohyb dopředu/dozadu (W/S)
    if (this.keys.forward) {
      movementInput.x = Math.sin(currentPlayerRotation);
      movementInput.z = Math.cos(currentPlayerRotation);
      isMoving = true;
      isBackward = false;
    } else if (this.keys.backward) {
      movementInput.x = -Math.sin(currentPlayerRotation);
      movementInput.z = -Math.cos(currentPlayerRotation);
      isMoving = true;
      isBackward = true;
    }
    
    this.isCurrentlyMoving = isMoving;
    this.isMovingBackward = isBackward;
    
    if (isMoving) {
      this.currentMovementDirection = currentPlayerRotation;
    }
    
    return { 
      isMoving, 
      movementInput, 
      isBackward, 
      turnInput,
      isSprinting: this.keys.sprint,
      isJumping: this.keys.jump
    };
  }

  // Getters
  getCurrentMovementDirection() {
    return this.currentMovementDirection;
  }

  isMoving() {
    return this.isCurrentlyMoving;
  }
  
  isMovingBackward() {
    return this.isMovingBackward;
  }
  
  isSprinting() {
    return this.keys.sprint;
  }

  getTurnSpeed() {
    return this.turnSpeed;
  }

  getMovementDirection() {
    return this.currentMovementDirection;
  }

  // 🔥 ZMĚNA: Nové metody pro mouse shooting
  isKickPressed() {
    return this.keys.kick;
  }

  isCharging() {
    return this.mouse.isCharging;
  }

  getChargePower() {
    return this.mouse.chargePower;
  }

  getMaxChargePower() {
    return this.mouse.maxChargePower;
  }

  getAccuracyData() {
    return {
      sweetSpotStart: this.accuracy.sweetSpotStart,
      sweetSpotEnd: this.accuracy.sweetSpotEnd,
      hitAccuracy: this.accuracy.hitAccuracy
    };
  }

  getMousePosition() {
    return {
      screenX: this.mouse.screenX,
      screenY: this.mouse.screenY,
      pixelX: this.mouse.pixelX,    // 🔥 NOVÝ
      pixelY: this.mouse.pixelY     // 🔥 NOVÝ
    };
  }

  // Metoda pro resetování kopnutí - po střele
  resetKick() {
    this.keys.kick = false;
    this.mouse.chargePower = 0;
    this.mouse.isCharging = false; // 🔥 PŘIDÁNO: Reset charging
    this.accuracy.hitAccuracy = 1.0;
  }

  // Cleanup metoda
  dispose() {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    window.removeEventListener('mousedown', this.handleMouseDown);
    window.removeEventListener('mouseup', this.handleMouseUp);
    window.removeEventListener('mousemove', this.handleMouseMove);
    window.removeEventListener('contextmenu', this.handleContextMenu);
    document.removeEventListener('pointerlockchange', this.handlePointerLockChange);
  }
}