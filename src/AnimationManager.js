// src/AnimationManager.js
import { THREE } from './three.js';

export class AnimationManager {
  constructor(renderer, camera, scene, clock, cameraController, gameStateManager, gameEventHandlers = null, manualCameraController = null, aiController = null) {
    this.renderer = renderer;
    this.camera = camera;
    this.scene = scene;
    this.clock = clock;
    this.cameraController = cameraController;
    this.gameStateManager = gameStateManager;
    this.gameEventHandlers = gameEventHandlers; // Může být null v editor módu
    this.manualCameraController = manualCameraController; // Manual camera controller

    // 🔥 NOVÉ: AI Controller reference
    this.aiController = aiController;

    // 🎆 NOVÉ: Update callbacks system
    this.updateCallbacks = new Map();

    this.animationFrameId = null;
    this.cameraSmoothness = 0.12; // Základní plynulost pro mouse offset

    // Bind animate method
    this.animate = this.animate.bind(this);
  }

  start() {
    this.animate();
  }

  stop() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  animate() {
    this.animationFrameId = requestAnimationFrame(this.animate);

    const deltaTime = this.clock.getDelta();

    // Update hráče a míče pouze v režimu hry
    this.updateGameObjects(deltaTime);

    // Update UI stavů
    this.updateUIStates();

    // Update manual camera controller (pouze v editoru)
    if (this.manualCameraController) {
      this.manualCameraController.update(deltaTime);
    }

    // 🎆 NOVÉ: Call all registered update callbacks
    this.updateCallbacks.forEach((callback, name) => {
      try {
        callback(deltaTime);
      } catch (error) {
        console.error(`❌ Error in update callback '${name}':`, error);
      }
    });

    // 🔥 KRITICKÁ ZMĚNA: Absolutní ochrana user controlled kamery
    this.updateCameraSystem(deltaTime);

    this.renderer.render(this.scene, this.camera);
  }

  updateGameObjects(deltaTime) {
    const { gameState, playerRef, ballRef } = this.gameStateManager.getState();
    
    if (gameState === 'playing') {
      // Update hráče
      if (playerRef.current) {
        // 🔥 ZMĚNA: Předej kameru pro mouse shooting
        playerRef.current.update(deltaTime, ballRef.current, this.camera);
      }
      
      // 🔥 NOVÉ: Update AI hráče přes AI Controller
      if (this.aiController && playerRef.current && window.aiPlayerRef) {
        // AI controller potřebuje pozici hráče pro rozhodování
        const playerPosition = playerRef.current.mesh.position;
        this.aiController.update(deltaTime, playerPosition);
        
        // Update AI player physics (používá stejnou třídu FootballPlayer)
        window.aiPlayerRef.update(deltaTime, ballRef.current, null);
      }
      
      // Update míče
      if (ballRef.current) {
        // 🔥 SPRÁVNÉ VOLÁNÍ: Předej všechny hráče míči
        const additionalPlayers = [];
        
        // Přidej AI hráče pokud existuje
        if (window.aiPlayerRef) {
          additionalPlayers.push(window.aiPlayerRef);
        }
        
        // Volej update s hlavním hráčem a pole dalších hráčů
        ballRef.current.update(deltaTime, playerRef.current, additionalPlayers);
      }
    }
  }

  updateUIStates() {
    const { 
      gameState, 
      playerRef, 
      isDribbling, 
      setIsDribbling, 
      kickCooldown, 
      setKickCooldown 
    } = this.gameStateManager.getState();
    
    if (gameState === 'playing' && playerRef.current) {
      // Update dribbling indicator - OPRAVA: použij správný getter
      const currentDribbling = playerRef.current.getDribblingStatus ? 
        playerRef.current.getDribblingStatus() : playerRef.current.isDribbling;
      
      if (currentDribbling !== isDribbling) {
        setIsDribbling(currentDribbling);
      }

      // Update kick cooldown
      if (typeof playerRef.current.remainingCooldown !== 'undefined') {
        const currentCooldown = playerRef.current.remainingCooldown;
        if (Math.abs(currentCooldown - kickCooldown) > 0.1) {
          setKickCooldown(currentCooldown);
        }
      }
    }
  }

  // 🔥 ABSOLUTNÍ OCHRANA: Camera system that NEVER touches user controlled camera
  updateCameraSystem(deltaTime) {
    const { 
      gameState, 
      isFirstPerson, 
      playerRef, 
      mouseOffsetX, 
      targetCameraRotationY, 
      setTargetCameraRotationY,
      isUserControllingCamera // Check if user is controlling camera
    } = this.gameStateManager.getState();
    
    // 🔥 ABSOLUTNÍ STOP: Pokud uživatel ovládá kameru, NIKDY JI NEMĚŇ!
    if (isUserControllingCamera()) {
      // Ani debug log - aby nebyl spam
      return;
    }
    
    // 🔥 DOUBLE CHECK: Ještě jednou zkontroluj všechny podmínky
    const { seatDetailMode, manualCameraMode } = this.gameStateManager.getState();
    if (seatDetailMode || manualCameraMode || this.cameraController.isDetailModeActive()) {
      // Ani tady neměň kameru
      return;
    }
    
    // 🔥 TRIPLE CHECK: Pouze pokud jsme 100% jisti že user nekontroluje kameru
    if (gameState === 'playing' && isFirstPerson && playerRef.current) {
      this.updateFirstPersonCamera(deltaTime);
    } else if (gameState === 'editor' || (gameState === 'playing' && !isFirstPerson)) {
      // 🔥 FINAL CHECK: Ještě jednou před third person camera
      if (!isUserControllingCamera()) {
        this.updateThirdPersonCamera();
      }
    }
  }

  // 🔥 FPS STYLE: Jednoduchá first-person kamera následuje rotaci hráče
  updateFirstPersonCamera(deltaTime) {
    const { 
      playerRef, 
      mouseOffsetX,
      ballRef
    } = this.gameStateManager.getState();
    
    const player = playerRef.current;
    const ball = ballRef?.current;
    
    // Pozice kamery = pozice hráče + výška očí (upraveno pro menšího hráče a skok)
    this.camera.position.x = player.mesh.position.x;
    this.camera.position.y = player.mesh.position.y + 1.2; // Automaticky sleduje i skok
    this.camera.position.z = player.mesh.position.z;
    
    // 🔥 FPS STYLE: Kamera jednoduše sleduje rotaci hráče + mouse offset
    if (typeof player.getCurrentRotation === 'function') {
      // Základní směr kamery = směr pohledu hráče
      const playerRotation = player.getCurrentRotation();
      
      // Konečný směr kamery s mouse offsetem pro fine-tuning
      const finalCameraRotationY = playerRotation + mouseOffsetX;
      
      // Nastav směr pohledu kamery
      const lookDirection = new THREE.Vector3(
        Math.sin(finalCameraRotationY),
        0, // Držíme vodorovný pohled základně
        Math.cos(finalCameraRotationY)
      );
      
      // 🔥 NOVÝ: Efekt sledování míče při driblování
      if (player.getDribblingStatus && player.getDribblingStatus() && ball) {
        // Časování pro efekt kamery
        const timeSinceLastDribble = Date.now() - player.getLastDribbleTime();
        const dribbleCameraEffect = Math.max(0, 1 - timeSinceLastDribble / 300); // Efekt trvá 300ms
        
        if (dribbleCameraEffect > 0) {
          // Kamera se mírně podívá dolů na míč
          const ballRelativePos = new THREE.Vector3();
          ballRelativePos.subVectors(ball.mesh.position, this.camera.position);
          
          // Interpolace mezi normálním pohledem a pohledem na míč
          lookDirection.y = lookDirection.y * (1 - dribbleCameraEffect * 0.3) + 
                           ballRelativePos.y * dribbleCameraEffect * 0.3;
          
          // Mírné naklopení kamery do stran podle pozice míče
          const ballAngle = Math.atan2(ballRelativePos.x, ballRelativePos.z);
          const angleDiff = ballAngle - finalCameraRotationY;
          lookDirection.x += Math.sin(angleDiff) * dribbleCameraEffect * 0.2;
          lookDirection.z += Math.cos(angleDiff) * dribbleCameraEffect * 0.2;
        }
      }
      
      // Přidej jemné efekty - UPRAVENO pro menšího hráče, sprint a skok
      if (player.isCurrentlyMoving() && player.speed > 0.25) {
        // Sprint má intenzivnější efekty
        const sprintMultiplier = player.isSprinting ? 1.6 : 1.0;
        
        // Jemné houpání při běhu - intenzivnější při sprintu
        const runningBob = Math.sin(Date.now() * 0.008 * sprintMultiplier) * 0.015 * sprintMultiplier;
        lookDirection.y += runningBob;
        
        // Při couvání jiné houpání
        if (player.isMovingBackward) {
          const backwardBob = Math.sin(Date.now() * 0.006) * 0.011;
          lookDirection.y += backwardBob;
        }
      }
      
      // 🔥 NOVÝ: Speciální efekt pro skok
      if (player.isJumping || !player.isOnGround) {
        // Lehké houpání kamery při skoku
        const jumpBob = Math.sin(player.verticalVelocity * 0.1) * 0.02;
        lookDirection.y += jumpBob;
        
        // Mírné naklonění pohledu nahoru při vzletu
        if (player.verticalVelocity > 0) {
          lookDirection.y += 0.05;
        }
      }
      
      const lookAt = new THREE.Vector3().addVectors(this.camera.position, lookDirection);
      this.camera.lookAt(lookAt);
      
    } else {
      // Fallback kamera pro starší systém
      if (this.gameEventHandlers) {
        const mousePositions = this.gameEventHandlers.getMousePositions();
        const lookDirection = new THREE.Vector3(
          Math.sin(mousePositions.mouseDeltaX) * Math.cos(mousePositions.mouseDeltaY),
          Math.sin(mousePositions.mouseDeltaY),
          Math.cos(mousePositions.mouseDeltaX) * Math.cos(mousePositions.mouseDeltaY)
        );
        
        const lookAt = new THREE.Vector3().addVectors(this.camera.position, lookDirection);
        this.camera.lookAt(lookAt);
        
        player.mesh.rotation.y = -mousePositions.mouseDeltaX; // ZPĚT NA PŮVODNÍ
      }
    }
  }

  // 🔥 SECURED: Third person camera pouze když není user controlled
  updateThirdPersonCamera() {
    // 🔥 PARANOID CHECK: Ještě jednou zkontroluj
    const { isUserControllingCamera } = this.gameStateManager.getState();
    
    if (isUserControllingCamera()) {
      return; // STOP! User ovládá kameru
    }
    
    if (this.gameEventHandlers) {
      const mousePositions = this.gameEventHandlers.getMousePositions();
      this.gameEventHandlers.updateThirdPersonCamera(this.camera, mousePositions.mouseX, mousePositions.mouseY);
    } else {
      // 🔥 FINAL PARANOID CHECK: I fallback musí respektovat user control
      if (!isUserControllingCamera()) {
        const thirdPersonCameraPos = { x: 0, y: 35, z: 50 };
        this.camera.position.x = thirdPersonCameraPos.x;
        this.camera.position.y = thirdPersonCameraPos.y;
        this.camera.position.z = thirdPersonCameraPos.z;
        this.camera.lookAt(0, 0, 0);
      }
    }
  }

  // 🔥 NOVÉ: Metoda pro nastavení AI controlleru
  setAIController(aiController) {
    this.aiController = aiController;
    console.log('🤖 AI Controller attached to AnimationManager');
  }

  // Helper method pro kontrolu konfliktů kamery
  isCameraControlledExternally() {
    const { isUserControllingCamera } = this.gameStateManager.getState();
    return isUserControllingCamera();
  }

  // Enhanced camera state logging
  logCameraState() {
    const { 
      gameState, 
      seatDetailMode, 
      manualCameraMode, 
      isUserControllingCamera 
    } = this.gameStateManager.getState();
    
    console.log('Camera State:', {
      gameState,
      seatDetailMode,
      manualCameraMode,
      userControlledCamera: isUserControllingCamera(),
      isDetailModeActive: this.cameraController.isDetailModeActive(),
      cameraPosition: {
        x: this.camera.position.x.toFixed(1),
        y: this.camera.position.y.toFixed(1),
        z: this.camera.position.z.toFixed(1)
      },
      cameraFOV: this.camera.fov
    });
  }

  // Enhanced emergency camera reset
  emergencyCameraReset() {
    const { gameState, resetCameraControl } = this.gameStateManager.getState();
    
    if (gameState === 'editor') {
      this.camera.position.set(0, 35, 50);
      this.camera.lookAt(0, 0, 0);
      this.camera.fov = 75;
      this.camera.updateProjectionMatrix();
      
      // Reset all camera control states
      resetCameraControl();
      
      console.log('EMERGENCY camera reset performed - all camera control flags cleared');
    }
  }

  // 🔥 NOVÉ: Debug metoda pro AI
  debugAI() {
    if (this.aiController) {
      const stats = this.aiController.getStats();
      console.log('🤖 AI Debug:', stats);
    }
  }

  // 🎆 NOVÉ: Add update callback
  addUpdateCallback(name, callback) {
    if (typeof callback !== 'function') {
      console.error(`❌ Callback '${name}' must be a function`);
      return;
    }
    this.updateCallbacks.set(name, callback);
    console.log(`✅ Update callback '${name}' registered`);
  }

  // 🎆 NOVÉ: Remove update callback
  removeUpdateCallback(name) {
    if (this.updateCallbacks.has(name)) {
      this.updateCallbacks.delete(name);
      console.log(`🗑️ Update callback '${name}' removed`);
    }
  }

  dispose() {
    this.stop();

    // Clear all update callbacks
    this.updateCallbacks.clear();

    // 🔥 NOVÉ: Cleanup AI controller
    if (this.aiController) {
      this.aiController = null;
    }
  }
}