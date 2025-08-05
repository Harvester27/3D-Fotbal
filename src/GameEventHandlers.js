// src/GameEventHandlers.js
import { THREE } from './three.js';

export class GameEventHandlers {
  constructor(renderer, camera, gameStateManager) {
    this.renderer = renderer;
    this.camera = camera;
    this.gameStateManager = gameStateManager;
    
    // Smart camera states
    this.mouseX = 0;
    this.mouseY = 0;
    this.mouseDeltaX = 0;
    this.mouseDeltaY = 0;
    
    // Bind methods
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.handlePointerLockError = this.handlePointerLockError.bind(this);
  }

  setupEventListeners() {
    window.addEventListener('mousemove', this.handleMouseMove);
    this.renderer.domElement.addEventListener('click', this.handleClick);
    window.addEventListener('keydown', this.handleKeyPress);
    
    // 🔥 NOVÝ: Handle pointer lock errors
    document.addEventListener('pointerlockerror', this.handlePointerLockError);
  }

  handlePointerLockError() {
    console.warn('Pointer lock failed - možná je potřeba user gesture');
  }

  removeEventListeners() {
    window.removeEventListener('mousemove', this.handleMouseMove);
    this.renderer.domElement.removeEventListener('click', this.handleClick);
    window.removeEventListener('keydown', this.handleKeyPress);
    
    // 🔥 NOVÝ: Remove error handler
    document.removeEventListener('pointerlockerror', this.handlePointerLockError);
  }

  handleMouseMove(event) {
    const { gameState, isFirstPerson } = this.gameStateManager.getState();
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    if (gameState === 'playing' && isFirstPerson && document.pointerLockElement === this.renderer.domElement) {
      // Smart kamera pro hru
      const sensitivity = 0.002;
      const maxMouseOffset = Math.PI / 2;
      
      this.gameStateManager.updateMouseOffsetX(prev => {
        const newOffset = prev + event.movementX * sensitivity;
        return Math.max(-maxMouseOffset, Math.min(maxMouseOffset, newOffset));
      });
      
      // Zachováno původní pro zpětnou kompatibilitu
      this.mouseDeltaX += event.movementX * 0.002;
      this.mouseDeltaY += event.movementY * 0.002;
      this.mouseDeltaY = Math.max(-0.5, Math.min(0.5, this.mouseDeltaY));
    } else if (gameState === 'playing' || gameState === 'editor') {
      this.mouseX = (event.clientX / width) * 2 - 1;
      this.mouseY = -(event.clientY / height) * 2 + 1;
    }
  }

  handleClick(event) {
    const { gameState, isFirstPerson } = this.gameStateManager.getState();
    
    // 🔥 NOVÉ ŘEŠENÍ: Pointer lock POUZE při pravém tlačítku pro rozhlížení
    if (gameState === 'playing' && isFirstPerson) {
      // Zamknout pointer lock POUZE při pravém kliknutí (button === 2)
      // Levé tlačítko (button === 0) je vyhrazené pro střelbu!
      if (event.button === 2) {
        // 🔥 DŮLEŽITÉ: Použij try-catch pro případ selhání
        try {
          this.renderer.domElement.requestPointerLock();
        } catch (error) {
          console.warn("Pointer lock request failed:", error);
        }
      }
    }
  }

  handleKeyPress(event) {
    const { gameState, playerRef, ballRef } = this.gameStateManager.getState();
    
    if (gameState !== 'playing') return;
    
    if (event.code === 'KeyV') {
      this.gameStateManager.updateIsFirstPerson(prev => {
        const newValue = !prev;
        
        // Skryj/zobraz hlavu hráče podle pohledu
        if (playerRef.current && typeof playerRef.current.setHeadVisible === 'function') {
          playerRef.current.setHeadVisible(!newValue); // false pro first person, true pro third person
        }
        
        // 🔥 OPRAVA: Uvolni pointer lock při přepnutí do třetí osoby
        if (!newValue && document.pointerLockElement === this.renderer.domElement) {
          document.exitPointerLock();
        }
        
        if (newValue && playerRef.current) {
          this.gameStateManager.updateMouseOffsetX(0);
          if (typeof playerRef.current.getCurrentRotation === 'function') {
            this.gameStateManager.updateTargetCameraRotationY(-playerRef.current.getCurrentRotation());
          } else {
            this.mouseDeltaX = -playerRef.current.mesh.rotation.y;
            this.mouseDeltaY = 0;
          }
        }
        return newValue;
      });
    }
    
    if (event.code === 'KeyH') {
      this.gameStateManager.updateShowControls(prev => !prev);
    }
    
    if (event.code === 'KeyR') {
      if (ballRef.current) {
        ballRef.current.resetPosition();
      }
    }
    
    if (event.code === 'Escape') {
      // 🔥 OPRAVA: Uvolni pointer lock při ESC
      if (document.pointerLockElement === this.renderer.domElement) {
        document.exitPointerLock();
      }
      this.gameStateManager.backToMenu();
    }
  }

  updateThirdPersonCamera(camera, mouseX, mouseY) {
    const thirdPersonCameraPos = { x: 0, y: 35, z: 50 };
    camera.position.x = thirdPersonCameraPos.x + mouseX * 8;
    camera.position.y = thirdPersonCameraPos.y;
    camera.position.z = thirdPersonCameraPos.z - mouseY * 15;
    camera.lookAt(0, 0, 0);
  }

  updateFirstPersonCamera(camera, player, mouseOffsetX, targetCameraRotationY, cameraSmoothness) {
    // Pozice kamery = pozice hráče + výška
    camera.position.x = player.mesh.position.x;
    camera.position.y = player.mesh.position.y + 1.5;
    camera.position.z = player.mesh.position.z;
    
    if (typeof player.isCurrentlyMoving === 'function' && typeof player.getMovementDirection === 'function') {
      // Smart kamera system
      let baseCameraRotation;
      
      if (player.isCurrentlyMoving()) {
        const movementDirection = player.getMovementDirection();
        if (movementDirection !== null) {
          baseCameraRotation = -movementDirection;
        } else {
          baseCameraRotation = typeof player.getCurrentRotation === 'function' ? 
            -player.getCurrentRotation() : -player.mesh.rotation.y;
        }
      } else {
        baseCameraRotation = targetCameraRotationY;
      }
      
      const finalCameraRotationY = baseCameraRotation + mouseOffsetX;
      
      const lookDirection = new THREE.Vector3(
        Math.sin(finalCameraRotationY),
        0,
        Math.cos(finalCameraRotationY)
      );
      
      const lookAt = new THREE.Vector3().addVectors(camera.position, lookDirection);
      camera.lookAt(lookAt);
      
    } else {
      // Fallback kamera
      const lookDirection = new THREE.Vector3(
        Math.sin(this.mouseDeltaX) * Math.cos(this.mouseDeltaY),
        Math.sin(this.mouseDeltaY),
        Math.cos(this.mouseDeltaX) * Math.cos(this.mouseDeltaY)
      );
      
      const lookAt = new THREE.Vector3().addVectors(camera.position, lookDirection);
      camera.lookAt(lookAt);
      
      player.mesh.rotation.y = -this.mouseDeltaX;
    }
  }

  // Getter pro přístup k mouse pozicím
  getMousePositions() {
    return {
      mouseX: this.mouseX,
      mouseY: this.mouseY,
      mouseDeltaX: this.mouseDeltaX,
      mouseDeltaY: this.mouseDeltaY
    };
  }

  dispose() {
    this.removeEventListeners();
  }
}