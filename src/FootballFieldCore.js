// FootballFieldCore.js - Core logic pro FootballField3D + FIXED STADIUM LOADING
import { THREE } from './three.js';

// Import nových modulárních tříd
import { SceneSetup } from './SceneSetup.js';
import { StadiumManager } from './StadiumManager.js';
import { EditorEventHandlers } from './EditorEventHandlers.js';
import { GameEventHandlers } from './GameEventHandlers.js';
import { GameStateManager } from './GameStateManager.js';
import { AnimationManager } from './AnimationManager.js';
import { CameraController } from './CameraController.js';
import { ManualCameraController } from './ManualCameraController.js';

// Import starých komponent/tříd
import FootballBall from './FootballBall.js';
import FootballPlayer from './FootballPlayer.js';

// Import AI Controller
import { AIController } from './AIController.js';

// Player data management
import { playerDataManager } from './PlayerDataManager.js';

// Import MatchManager
import { matchManager } from './MatchManager.js';
import * as logger from './utils/logger.js';

export class FootballFieldCore {
  constructor() {
    // Manager refs
    this.sceneSetup = null;
    this.stadiumManager = null;
    this.editorHandlers = null;
    this.gameHandlers = null;
    this.cameraController = null;
    this.manualCameraController = null;
    this.animationManager = null;
    this.gameStateManager = null;
    
    // Player refs
    this.player = null;
    this.ball = null;
    this.aiPlayer = null;
    this.aiController = null;
    
    // Camera persistence system
    this.cameraState = {
      position: { x: 0, y: 35, z: 50 },
      fov: 75,
      userControlled: false,
      hasBeenModified: false
    };
    
    // Cleanup handlers
    this.cleanupHandlers = [];
  }

  // Save camera state
  saveCameraState(camera, gameStateManager) {
    if (camera && gameStateManager) {
      const isUserControlled = gameStateManager.isUserControllingCamera();
      this.cameraState = {
        position: {
          x: camera.position.x,
          y: camera.position.y,
          z: camera.position.z
        },
        fov: camera.fov,
        userControlled: isUserControlled,
        hasBeenModified: isUserControlled
      };
      logger.debug("💾 Camera state saved:", {
        position: this.cameraState.position,
        userControlled: isUserControlled,
        hasBeenModified: this.cameraState.hasBeenModified
      });
    }
  }

  // Restore camera state
  restoreCameraState(camera, gameStateManager, gameState, setCameraPosition, setCameraZoom) {
    const savedState = this.cameraState;
    
    // Pouze restore pokud byla kamera modifikována uživatelem
    if (savedState.hasBeenModified && gameState === 'editor') {
      camera.position.set(
        savedState.position.x,
        savedState.position.y,
        savedState.position.z
      );
      camera.fov = savedState.fov;
      camera.updateProjectionMatrix();
      
      if (savedState.userControlled) {
        gameStateManager.setUserControlledCamera(true);
      }
      
      logger.debug("🔄 Camera state restored:", {
        position: savedState.position,
        userControlled: savedState.userControlled
      });
      
      // Update UI
      setCameraPosition(savedState.position);
      setCameraZoom(75 / savedState.fov);
    } else {
      logger.debug("📍 Using default camera position (no user modifications)");
    }
  }

  // Setup debug helper
  setupDebugHelper() {
    // 🔥 DEBUG: Rozšířený debug helper s goal testing + NET TESTING
    window.debugPlayer = {
      showAttributes: () => {
        logger.debug('📊 Current Player Attributes:', {
          dataManager: playerDataManager.attributes,
          player: this.player?.attributes,
          calculated: {
            maxSpeed: this.player?.maxSpeed,
            controlRadius: this.player?.controlRadius,
            kickForce: this.player?.kickForce,
            overall: this.player?.getOverallRating()
          }
        });
      },
      setAttribute: (category, attr, value) => {
        playerDataManager.attributes[category][attr] = value;
        if (this.player?.refreshAttributes) {
          this.player.refreshAttributes();
          logger.debug(`✅ Set ${category}.${attr} = ${value}`);
        }
      },
      // AI debug commands
      aiStatus: () => {
        if (window.aiController) {
          logger.debug('🤖 AI Status:', window.aiController.getStats());
        } else {
          logger.warn('❌ No AI controller active');
        }
      },
      aiDebug: (enabled) => {
        if (window.aiController) {
          window.aiController.setDebugMode(enabled);
          logger.debug(`🤖 AI Debug mode: ${enabled ? 'ON' : 'OFF'}`);
        }
      },
      aiInfo: () => {
        if (window.currentAIOpponent) {
          logger.debug('🤖 AI Opponent:', {
            name: window.currentAIOpponent.name,
            level: window.currentAIOpponent.level,
            overall: window.currentAIOpponent.overallRating,
            difficulty: window.currentAIOpponent.difficulty,
            behavior: window.currentAIOpponent.behavior
          });
        }
      },
      // Match debug commands
      matchStatus: () => {
        logger.debug('⚽ Match Status:', matchManager.getCurrentState());
      },
      matchStart: () => {
        matchManager.startMatch();
      },
      matchPause: () => {
        matchManager.pauseMatch();
      },
      matchReset: () => {
        matchManager.resetMatch();
      },
      
      // === GOAL TESTING COMMANDS ===
      
      // Teleportuj míč před levou branku (hráč skóruje)
      ballToLeftGoal: () => {
        if (this.ball) {
          this.ball.resetPosition({ x: -19, y: 0.5, z: 0 });
          this.ball.velocity.set(-2, 0, 0); // Rychlost směrem do branky
          logger.debug('⚽ Ball positioned in front of LEFT goal (player scores)');
        }
      },
      
      // Teleportuj míč před pravou branku (AI skóruje)
      ballToRightGoal: () => {
        if (this.ball) {
          this.ball.resetPosition({ x: 19, y: 0.5, z: 0 });
          this.ball.velocity.set(2, 0, 0); // Rychlost směrem do branky
          logger.debug('⚽ Ball positioned in front of RIGHT goal (AI scores)');
        }
      },
      
      // Vystřel míč na levou tyčku
      ballToLeftPost: () => {
        if (this.ball) {
          this.ball.resetPosition({ x: -18, y: 0.5, z: 0 });
          this.ball.velocity.set(-3, 0, -1.5); // Směr na levou tyčku
          logger.debug('⚽ Ball shot towards LEFT goal post');
        }
      },
      
      // Vystřel míč na břevno
      ballToCrossbar: () => {
        if (this.ball) {
          this.ball.resetPosition({ x: -18, y: 0.5, z: 0 });
          this.ball.velocity.set(-2, 1.5, 0); // Směr na břevno
          logger.debug('⚽ Ball shot towards crossbar');
        }
      },
      
      // Simuluj sílu střelby
      ballPowerShot: (direction = 'left') => {
        if (this.ball) {
          const goalX = direction === 'left' ? -20 : 20;
          const velocityX = direction === 'left' ? -5 : 5;
          
          this.ball.resetPosition({ x: 0, y: 0.5, z: 0 });
          this.ball.velocity.set(velocityX, 0.2, Math.random() * 2 - 1);
          logger.debug(`🚀 Power shot towards ${direction} goal!`);
        }
      },
      
      // Debug informace o míči
      ballStatus: () => {
        if (this.ball && this.ball.debugGoalAreas) {
          this.ball.debugGoalAreas();
        }
      },
      
      // Reset míče na střed
      ballReset: () => {
        if (this.ball) {
          this.ball.resetPosition();
          logger.debug('🔄 Ball reset to center');
        }
      },
      
      // Test goal detection systému
      testGoalSystem: () => {
        logger.debug('🧪 Testing goal system...');
        
        // Test 1: Levá branka
        setTimeout(() => {
          logger.debug('Test 1: Ball to left goal');
          window.debugPlayer.ballToLeftGoal();
        }, 1000);
        
        // Test 2: Pravá branka  
        setTimeout(() => {
          logger.debug('Test 2: Ball to right goal');
          window.debugPlayer.ballToRightGoal();
        }, 4000);
        
        // Test 3: Collision test
        setTimeout(() => {
          logger.debug('Test 3: Ball to left post');
          window.debugPlayer.ballToLeftPost();
        }, 7000);
        
        // Test 4: Crossbar test
        setTimeout(() => {
          logger.debug('Test 4: Ball to crossbar');
          window.debugPlayer.ballToCrossbar();
        }, 10000);
        
        logger.debug('⏳ Goal system test sequence started (13 seconds total)');
      },
      
      // Kompletní goal info
      goalInfo: () => {
        if (this.ball && this.ball.goals) {
          logger.debug('🥅 Goal System Info:', {
            leftGoal: this.ball.goals.left,
            rightGoal: this.ball.goals.right,
            ballPosition: {
              x: this.ball.mesh.position.x.toFixed(2),
              y: this.ball.mesh.position.y.toFixed(2),
              z: this.ball.mesh.position.z.toFixed(2)
            },
            matchActive: matchManager.isMatchRunning(),
            netCount: window.fieldUtils?.getGoalNets()?.length || 0
          });
        }
      },
      
      // === 🔥 NOVÉ: NET TESTING COMMANDS ===
      
      // Test net collision - shoot ball into back net
      testNetCollision: () => {
        if (this.ball) {
          this.ball.resetPosition({ x: -19, y: 0.8, z: 0 });
          this.ball.velocity.set(-8, 0, 0); // Fast shot into back net
          logger.debug('🕸️ Testing back net collision');
        }
      },
      
      // Test side net collision
      testSideNet: (side = 'left') => {
        if (this.ball) {
          const x = side === 'left' ? -19 : 19;
          const z = side === 'left' ? -2 : -2;
          this.ball.resetPosition({ x: x, y: 0.5, z: z });
          this.ball.velocity.set(0, 0, side === 'left' ? -3 : -3);
          logger.debug(`🕸️ Testing ${side} side net collision`);
        }
      },
      
      // Test top net collision
      testTopNet: () => {
        if (this.ball) {
          this.ball.resetPosition({ x: -19, y: 1.8, z: 0 });
          this.ball.velocity.set(-2, -1, 0);
          logger.debug('🕸️ Testing top net collision');
        }
      },
      
      // Animate specific net manually
      animateNet: (goalSide = 'left', netType = 'back', intensity = 0.5) => {
        if (window.fieldUtils) {
          const nets = window.fieldUtils.getGoalNets();
          const targetNet = nets.find(net => 
            net.userData.goalSide === goalSide && net.userData.netType === netType
          );
          
          if (targetNet) {
            const impactPoint = new THREE.Vector3(0, 0.8, 0);
            window.fieldUtils.animateNetWave(targetNet, impactPoint, intensity);
            logger.debug(`🌊 Animated ${goalSide} ${netType} net with intensity ${intensity}`);
          } else {
            logger.warn(`❌ Net not found: ${goalSide} ${netType}`);
          }
        }
      },
      
      // Animate all nets
      animateAllNets: (intensity = 0.3) => {
        if (window.fieldUtils) {
          const nets = window.fieldUtils.getGoalNets();
          nets.forEach((net, index) => {
            setTimeout(() => {
              const impactPoint = new THREE.Vector3(0, 0.8, 0);
              window.fieldUtils.animateNetWave(net, impactPoint, intensity);
            }, index * 200); // Staggered animation
          });
          logger.debug(`🌊 Animated all ${nets.length} nets`);
        }
      },
      
      // Net system info
      netInfo: () => {
        if (window.fieldUtils) {
          const nets = window.fieldUtils.getGoalNets();
          logger.debug('🕸️ Net System Info:', {
            totalNets: nets.length,
            nets: nets.map(net => ({
              type: net.userData.netType,
              goalSide: net.userData.goalSide,
              isAnimating: net.userData.waveIntensity > 0,
              intensity: net.userData.waveIntensity.toFixed(3)
            }))
          });
        } else {
          logger.warn('❌ FieldUtils not available');
        }
      },
      
      // Complete net testing sequence
      testNetSequence: () => {
        logger.debug('🧪 Starting complete net testing sequence...');
        
        // Test 1: Back net collision
        setTimeout(() => {
          logger.debug('Test 1: Back net collision');
          window.debugPlayer.testNetCollision();
        }, 1000);
        
        // Test 2: Left side net
        setTimeout(() => {
          logger.debug('Test 2: Left side net collision');
          window.debugPlayer.testSideNet('left');
        }, 4000);
        
        // Test 3: Right side net
        setTimeout(() => {
          logger.debug('Test 3: Right side net collision');
          window.debugPlayer.testSideNet('right');
        }, 7000);
        
        // Test 4: Top net
        setTimeout(() => {
          logger.debug('Test 4: Top net collision');
          window.debugPlayer.testTopNet();
        }, 10000);
        
        // Test 5: Manual net animation
        setTimeout(() => {
          logger.debug('Test 5: Manual net wave animation');
          window.debugPlayer.animateAllNets(0.5);
        }, 13000);
        
        logger.debug('⏳ Net testing sequence started (16 seconds total)');
      },
      
      // === STADIUM SAVE COMMANDS ===
      saveStadium: () => {
        const saved = playerDataManager.stadiumManager.saveStadium();
        logger.debug(saved ? '✅ Stadium saved!' : '❌ Failed to save stadium');
      },
      
      stadiumInfo: () => {
        const info = playerDataManager.getStadiumInfo();
        logger.debug('🏟️ Stadium Info:', info);
        logger.debug('💾 Unsaved changes:', info.hasUnsavedChanges);
        logger.debug('📦 Elements:', playerDataManager.stadiumManager.mainStadium.elements.length);
      }
    };
    
    logger.debug('💡 Goal Debug Helper loaded! Available commands:');
    logger.debug('🎯 window.debugPlayer.ballToLeftGoal() - Test player goal');
    logger.debug('🤖 window.debugPlayer.ballToRightGoal() - Test AI goal');  
    logger.debug('🏒 window.debugPlayer.ballToLeftPost() - Test post collision');
    logger.debug('🎳 window.debugPlayer.ballToCrossbar() - Test crossbar collision');
    logger.debug('🚀 window.debugPlayer.ballPowerShot("left") - Power shot test');
    logger.debug('📊 window.debugPlayer.ballStatus() - Ball debug info');
    logger.debug('🧪 window.debugPlayer.testGoalSystem() - Automated test sequence');
    logger.debug('🥅 window.debugPlayer.goalInfo() - Complete goal system info');
    
    logger.debug('\n🕸️ Net System Commands:');
    logger.debug('🌊 window.debugPlayer.testNetCollision() - Test back net collision');
    logger.debug('🌊 window.debugPlayer.testSideNet("left") - Test side net collision');  
    logger.debug('🌊 window.debugPlayer.testTopNet() - Test top net collision');
    logger.debug('🌊 window.debugPlayer.animateNet("left", "back", 0.5) - Manual net animation');
    logger.debug('🌊 window.debugPlayer.animateAllNets(0.3) - Animate all nets');
    logger.debug('🕸️ window.debugPlayer.netInfo() - Net system info');
    logger.debug('🧪 window.debugPlayer.testNetSequence() - Complete net testing sequence');
    
    logger.debug('\n💾 Stadium Commands:');
    logger.debug('💾 window.debugPlayer.saveStadium() - Manually save stadium');
    logger.debug('🏟️ window.debugPlayer.stadiumInfo() - Stadium info and unsaved changes');
  }

  // Create and initialize the football field
  initializeField(mountRef, gameState, isFirstPerson, stadiumElements, selectedTool, placementMode, 
                 editMode, selectedObject, previewPosition, isValidPlacement, previewRotation, 
                 seatOptions, selectedStairs, seatDetailMode, originalCameraPosition, mouseOffsetX, 
                 targetCameraRotationY, manualCameraMode, cameraPosition, setCameraPosition, 
                 cameraZoom, setCameraZoom, playerRef, ballRef, backToMenuCallback, 
                 stateSetters, currentAIOpponent) {
    
    if (!mountRef.current || (gameState !== 'playing' && gameState !== 'editor')) return null;

    logger.info("🚀 Core field initialization - saving camera state first");

    // SAVE camera state BEFORE cleanup (pokud existuje)
    if (this.sceneSetup?.camera && this.gameStateManager) {
      this.saveCameraState(this.sceneSetup.camera, this.gameStateManager);
    }

    const width = window.innerWidth;
    const height = window.innerHeight;

    // Create managers
    this.sceneSetup = new SceneSetup();
    const scene = this.sceneSetup.createScene();
    const camera = this.sceneSetup.createCamera(width, height);
    const renderer = this.sceneSetup.createRenderer(width, height);
    const clock = this.sceneSetup.createClock();
    
    // Setup scene elements
    this.sceneSetup.setupLighting(scene);
    this.sceneSetup.createField(scene);
    
    // 🔥 NOVÉ: Uložení FieldUtils reference pro net animations
    window.fieldUtils = this.sceneSetup.fieldUtils;
    
    const gridHelper = this.sceneSetup.createGridHelper(scene, gameState === 'editor' && placementMode);
    
    // Mount renderer
    mountRef.current.appendChild(renderer.domElement);

    // Create camera controller
    this.cameraController = new CameraController(camera);
    
    // Create stadium manager
    this.stadiumManager = new StadiumManager(scene);
    
    // Create game state manager
    this.gameStateManager = new GameStateManager(
      gameState, stateSetters.setGameState,
      isFirstPerson, stateSetters.setIsFirstPerson,
      stateSetters.showControls, stateSetters.setShowControls,
      stateSetters.isDribbling, stateSetters.setIsDribbling,
      stateSetters.kickCooldown, stateSetters.setKickCooldown,
      stadiumElements, stateSetters.setStadiumElements,
      selectedTool, stateSetters.setSelectedTool,
      placementMode, stateSetters.setPlacementMode,
      selectedObject, stateSetters.setSelectedObject,
      editMode, stateSetters.setEditMode,
      previewPosition, stateSetters.setPreviewPosition,
      isValidPlacement, stateSetters.setIsValidPlacement,
      previewRotation, stateSetters.setPreviewRotation,
      seatOptions, stateSetters.setSeatOptions,
      selectedStairs, stateSetters.setSelectedStairs,
      seatDetailMode, stateSetters.setSeatDetailMode,
      originalCameraPosition, stateSetters.setOriginalCameraPosition,
      mouseOffsetX, stateSetters.setMouseOffsetX,
      targetCameraRotationY, stateSetters.setTargetCameraRotationY,
      playerRef, ballRef,
      backToMenuCallback,
      manualCameraMode, stateSetters.setManualCameraMode,
      cameraPosition, setCameraPosition,
      cameraZoom, setCameraZoom
    );
    
    // RESTORE camera state AFTER creating managers
    this.restoreCameraState(camera, this.gameStateManager, gameState, setCameraPosition, setCameraZoom);
    
    // Create manual camera controller (pouze pro editor)
    if (gameState === 'editor') {
      this.manualCameraController = new ManualCameraController(camera, this.gameStateManager);
      this.manualCameraController.setupEventListeners();
      
      // HOOK: Save camera state when user modifies camera
      if (this.gameStateManager && typeof this.gameStateManager.setUserControlledCamera === 'function') {
        const originalSetUserControlled = this.gameStateManager.setUserControlledCamera.bind(this.gameStateManager);
        this.gameStateManager.setUserControlledCamera = (value) => {
          originalSetUserControlled(value);
          if (value) {
            // User just took control - mark as modified
            this.cameraState.hasBeenModified = true;
            logger.debug("🎮 User took control - marking camera as modified");
          }
        };
      } else {
        logger.warn('⚠️ gameStateManager.setUserControlledCamera method not found');
      }
      
      // 🏟️ OPRAVENO: Načti hlavní stadion hráče
      logger.debug('🏟️ Loading player\'s main stadium...');
      playerDataManager.loadMainStadium().then(loadedElements => {
        if (loadedElements && loadedElements.length > 0) {
          logger.debug(`✅ Loaded ${loadedElements.length} stadium elements from Firebase`);
          stateSetters.setStadiumElements(loadedElements);
          
          // Vytvoř 3D objekty pro načtené elementy
          this.stadiumManager.createExistingElements(loadedElements);
        } else {
          logger.debug('🆕 Starting with empty stadium');
          // Nic nedělej - začni s prázdným stadionem
        }
      }).catch(error => {
        logger.error('❌ Failed to load stadium:', error);
      });
    }
    
    // Create event handlers
    if (gameState === 'editor') {
      this.editorHandlers = new EditorEventHandlers(renderer, camera, this.stadiumManager, this.cameraController, this.gameStateManager);
      this.editorHandlers.setupEventListeners();
    }
    
    if (gameState === 'playing') {
      this.gameHandlers = new GameEventHandlers(renderer, camera, this.gameStateManager);
      this.gameHandlers.setupEventListeners();
    }
    
    // Create players and ball for game mode
    if (gameState === 'playing') {
      this.player = new FootballPlayer(scene, { x: 0, y: 0, z: 8 });
      this.ball = new FootballBall(scene, { x: 0, y: 1, z: 0 });
      
      playerRef.current = this.player;
      ballRef.current = this.ball;
      
      // Nastav globální referenci pro preview!
      window.playerRef = playerRef;
      logger.debug('✅ Global playerRef set for preview synchronization');
      
      // OKAMŽITĚ REFRESH VZHLED podle PlayerDataManager
      if (this.player.refreshAppearance) {
        this.player.refreshAppearance();
        logger.debug('✅ Player appearance synced with PlayerDataManager on creation');
      }
      
      // OKAMŽITĚ REFRESH ATRIBUTY podle PlayerDataManager
      if (this.player.refreshAttributes) {
        this.player.refreshAttributes();
        logger.debug('✅ Player attributes synced with PlayerDataManager on creation');
      }
      
      // Nastav viditelnost hlavy podle počátečního pohledu
      if (typeof this.player.setHeadVisible === 'function') {
        this.player.setHeadVisible(!isFirstPerson);
      }
      
      logger.debug("✅ Player created with custom appearance AND attributes from PlayerDataManager");
      
      // Pokud je offline match, vytvoř AI hráče
      if (currentAIOpponent) {
        logger.debug("🤖 Creating AI player:", currentAIOpponent.name);
        
        // Vytvoř AI hráče pomocí stejné třídy FootballPlayer
        this.aiPlayer = new FootballPlayer(scene, { x: 0, y: 0, z: -8 }, true); // true = isAI
        
        // Nastav AI atributy
        this.aiPlayer.attributes = JSON.parse(JSON.stringify(currentAIOpponent.attributes));
        this.aiPlayer.traits = JSON.parse(JSON.stringify(currentAIOpponent.traits));
        
        // Nastav AI vzhled pomocí customizace
        if (currentAIOpponent.customization) {
          // Override playerDataManager pro AI vzhled
          const originalCustomization = playerDataManager.playerCustomization;
          playerDataManager.playerCustomization = currentAIOpponent.customization;
          
          // Refresh vzhled AI
          if (this.aiPlayer.refreshAppearance) {
            this.aiPlayer.refreshAppearance();
          }
          
          // Vrať zpět původní customizaci
          playerDataManager.playerCustomization = originalCustomization;
        }
        
        // Refresh AI atributy
        if (this.aiPlayer.refreshAttributes) {
          this.aiPlayer.refreshAttributes();
        }
        
        // Globální reference pro debugging
        window.aiPlayerRef = this.aiPlayer;
        
        logger.debug("✅ AI player created with OVR:", this.aiPlayer.getOverallRating());
        
        // Vytvoř AI Controller
        this.aiController = new AIController(
          this.aiPlayer, 
          this.ball, 
          currentAIOpponent,
          { x: 0, z: 13 },  // Pozice hráčovy branky
          { x: 0, z: -13 }  // Pozice AI branky
        );
        
        window.aiController = this.aiController; // Pro debugging
        
        logger.debug("🎮 AI Controller created for:", currentAIOpponent.name);
        
        // Volitelně: Zapni debug mode pro vývoj
        if (process.env.NODE_ENV === 'development') {
          this.aiController.setDebugMode(true);
        }
      }
      
      // Setup debug helper
      this.setupDebugHelper();
    }

    // Create existing stadium elements (pouze pokud jsme je nenačetli z Firebase)
    // Create existing stadium elements
    this.stadiumManager.createExistingElements(stadiumElements);
    
    // Create animation manager and start
    this.animationManager = new AnimationManager(
      renderer, 
      camera, 
      scene, 
      clock, 
      this.cameraController, 
      this.gameStateManager, 
      this.gameHandlers, 
      this.manualCameraController,
      this.aiController
    );
    
    // 🔥 NOVÉ: Přidej net animation callback do animation manageru
    if (window.fieldUtils && typeof window.fieldUtils.updateNetAnimations === 'function') {
      this.animationManager.addUpdateCallback('netAnimations', (deltaTime) => {
        window.fieldUtils.updateNetAnimations(deltaTime);
      });
      logger.debug('✅ Net animations registered with AnimationManager');
    }
    
    this.animationManager.start();
    
    // Setup resize handler
    const removeResizeHandler = this.sceneSetup.setupResizeHandler(camera, renderer);
    this.cleanupHandlers.push(removeResizeHandler);

    return {
      sceneSetup: this.sceneSetup,
      stadiumManager: this.stadiumManager,
      editorHandlers: this.editorHandlers,
      gameHandlers: this.gameHandlers,
      cameraController: this.cameraController,
      manualCameraController: this.manualCameraController,
      animationManager: this.animationManager,
      gameStateManager: this.gameStateManager,
      player: this.player,
      ball: this.ball,
      aiPlayer: this.aiPlayer,
      aiController: this.aiController
    };
  }

  // Clear camera state
  clearCameraState() {
    this.cameraState = {
      position: { x: 0, y: 35, z: 50 },
      fov: 75,
      userControlled: false,
      hasBeenModified: false
    };
  }

  // Get camera state info
  getCameraState() {
    return this.cameraState;
  }

  // Get user controlled camera status
  getUserControlledCamera() {
    return this.gameStateManager?.isUserControllingCamera() || false;
  }

  // Reset camera control
  resetCameraControl() {
    if (this.gameStateManager) {
      this.gameStateManager.resetCameraControl();
      // Reset camera persistence
      this.clearCameraState();
    }
  }

  // Cleanup all resources
  dispose() {
    logger.info("🧹 Core cleanup started");

    // SAVE camera state BEFORE cleanup
    if (this.sceneSetup?.camera && this.gameStateManager) {
      this.saveCameraState(this.sceneSetup.camera, this.gameStateManager);
    }
    
    // Stop animation
    if (this.animationManager) {
      this.animationManager.dispose();
      this.animationManager = null;
    }
    
    // Remove event listeners
    if (this.editorHandlers) {
      this.editorHandlers.dispose();
      this.editorHandlers = null;
    }
    if (this.gameHandlers) {
      this.gameHandlers.dispose();
      this.gameHandlers = null;
    }
    
    if (this.manualCameraController) {
      this.manualCameraController.dispose();
      this.manualCameraController = null;
    }
    
    // Cleanup players
    if (this.player) {
      this.player.dispose();
      this.player = null;
      
      // Vyčisti globální referenci
      if (window.playerRef) {
        window.playerRef = null;
        logger.debug('🧹 Global playerRef cleaned up');
      }
    }
    if (this.ball) {
      this.ball.dispose();
      this.ball = null;
    }
    
    // Cleanup AI hráče
    if (this.aiPlayer) {
      this.aiPlayer.dispose();
      this.aiPlayer = null;
    }
    if (window.aiPlayerRef) {
      window.aiPlayerRef = null;
      logger.debug('🧹 AI player cleaned up');
    }
    
    // Cleanup AI controller
    if (this.aiController) {
      this.aiController = null;
    }
    if (window.aiController) {
      window.aiController = null;
      logger.debug('🧹 AI Controller cleaned up');
    }
    
    // 🔥 NOVÉ: Cleanup FieldUtils reference
    if (window.fieldUtils) {
      window.fieldUtils = null;
      logger.debug('🧹 FieldUtils reference cleaned up');
    }
    
    // Cleanup debug helper
    if (window.debugPlayer) {
      delete window.debugPlayer;
    }
    
    // Cleanup stadium manager
    if (this.stadiumManager) {
      this.stadiumManager.dispose();
      this.stadiumManager = null;
    }
    
    // Execute cleanup handlers
    this.cleanupHandlers.forEach(handler => {
      if (typeof handler === 'function') {
        handler();
      }
    });
    this.cleanupHandlers = [];
    
    // Dispose scene setup
    if (this.sceneSetup) {
      this.sceneSetup.dispose();
      this.sceneSetup = null;
    }

    // Clear other refs
    this.cameraController = null;
    this.gameStateManager = null;

    logger.info("✅ Core cleanup completed");
  }
}