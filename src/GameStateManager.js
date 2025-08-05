// src/GameStateManager.js

export class GameStateManager {
  constructor(
    gameState,
    setGameState,
    isFirstPerson,
    setIsFirstPerson,
    showControls,
    setShowControls,
    isDribbling,
    setIsDribbling,
    kickCooldown,
    setKickCooldown,
    stadiumElements,
    setStadiumElements,
    selectedTool,
    setSelectedTool,
    placementMode,
    setPlacementMode,
    selectedObject,
    setSelectedObject,
    editMode,
    setEditMode,
    previewPosition,
    setPreviewPosition,
    isValidPlacement,
    setIsValidPlacement,
    previewRotation,
    setPreviewRotation,
    seatOptions,
    setSeatOptions,
    selectedStairs,
    setSelectedStairs,
    seatDetailMode,
    setSeatDetailMode,
    originalCameraPosition,
    setOriginalCameraPosition,
    mouseOffsetX,
    setMouseOffsetX,
    targetCameraRotationY,
    setTargetCameraRotationY,
    playerRef,
    ballRef,
    backToMenuCallback,
    // Manual Camera Parameters
    manualCameraMode,
    setManualCameraMode,
    cameraPosition,
    setCameraPosition,
    cameraZoom,
    setCameraZoom
  ) {
    // Store all state and setters
    this.gameState = gameState;
    this.setGameState = setGameState;
    this.isFirstPerson = isFirstPerson;
    this.setIsFirstPerson = setIsFirstPerson;
    this.showControls = showControls;
    this.setShowControls = setShowControls;
    this.isDribbling = isDribbling;
    this.setIsDribbling = setIsDribbling;
    this.kickCooldown = kickCooldown;
    this.setKickCooldown = setKickCooldown;
    this.stadiumElements = stadiumElements;
    this.setStadiumElements = setStadiumElements;
    this.selectedTool = selectedTool;
    this.setSelectedTool = setSelectedTool;
    this.placementMode = placementMode;
    this.setPlacementMode = setPlacementMode;
    this.selectedObject = selectedObject;
    this.setSelectedObject = setSelectedObject;
    this.editMode = editMode;
    this.setEditMode = setEditMode;
    this.previewPosition = previewPosition;
    this.setPreviewPosition = setPreviewPosition;
    this.isValidPlacement = isValidPlacement;
    this.setIsValidPlacement = setIsValidPlacement;
    this.previewRotation = previewRotation;
    this.setPreviewRotation = setPreviewRotation;
    this.seatOptions = seatOptions;
    this.setSeatOptions = setSeatOptions;
    this.selectedStairs = selectedStairs;
    this.setSelectedStairs = setSelectedStairs;
    this.seatDetailMode = seatDetailMode;
    this.setSeatDetailMode = setSeatDetailMode;
    this.originalCameraPosition = originalCameraPosition;
    this.setOriginalCameraPosition = setOriginalCameraPosition;
    this.mouseOffsetX = mouseOffsetX;
    this.setMouseOffsetX = setMouseOffsetX;
    this.targetCameraRotationY = targetCameraRotationY;
    this.setTargetCameraRotationY = setTargetCameraRotationY;
    this.playerRef = playerRef;
    this.ballRef = ballRef;
    this.backToMenuCallback = backToMenuCallback;
    // Manual Camera States
    this.manualCameraMode = manualCameraMode;
    this.setManualCameraMode = setManualCameraMode;
    this.cameraPosition = cameraPosition;
    this.setCameraPosition = setCameraPosition;
    this.cameraZoom = cameraZoom;
    this.setCameraZoom = setCameraZoom;
    
    // 🆕 NEW: User-controlled camera flag
    this.userControlledCamera = false; // Internal flag pro sledování uživatelské kontroly
  }

  // Get all current state values
  getState() {
    return {
      gameState: this.gameState,
      setGameState: this.setGameState,
      isFirstPerson: this.isFirstPerson,
      setIsFirstPerson: this.setIsFirstPerson,
      showControls: this.showControls,
      setShowControls: this.setShowControls,
      isDribbling: this.isDribbling,
      setIsDribbling: this.setIsDribbling,
      kickCooldown: this.kickCooldown,
      setKickCooldown: this.setKickCooldown,
      stadiumElements: this.stadiumElements,
      setStadiumElements: this.setStadiumElements,
      selectedTool: this.selectedTool,
      setSelectedTool: this.setSelectedTool,
      placementMode: this.placementMode,
      setPlacementMode: this.setPlacementMode,
      selectedObject: this.selectedObject,
      setSelectedObject: this.setSelectedObject,
      editMode: this.editMode,
      setEditMode: this.setEditMode,
      previewPosition: this.previewPosition,
      setPreviewPosition: this.setPreviewPosition,
      isValidPlacement: this.isValidPlacement,
      setIsValidPlacement: this.setIsValidPlacement,
      previewRotation: this.previewRotation,
      setPreviewRotation: this.setPreviewRotation,
      seatOptions: this.seatOptions,
      setSeatOptions: this.setSeatOptions,
      selectedStairs: this.selectedStairs,
      setSelectedStairs: this.setSelectedStairs,
      seatDetailMode: this.seatDetailMode,
      setSeatDetailMode: this.setSeatDetailMode,
      originalCameraPosition: this.originalCameraPosition,
      setOriginalCameraPosition: this.setOriginalCameraPosition,
      mouseOffsetX: this.mouseOffsetX,
      setMouseOffsetX: this.setMouseOffsetX,
      targetCameraRotationY: this.targetCameraRotationY,
      setTargetCameraRotationY: this.setTargetCameraRotationY,
      playerRef: this.playerRef,
      ballRef: this.ballRef,
      exitSeatDetailMode: this.exitSeatDetailMode.bind(this),
      // Manual Camera States
      manualCameraMode: this.manualCameraMode,
      setManualCameraMode: this.setManualCameraMode,
      cameraPosition: this.cameraPosition,
      setCameraPosition: this.setCameraPosition,
      cameraZoom: this.cameraZoom,
      setCameraZoom: this.setCameraZoom,
      // 🆕 NEW: User controlled camera methods
      userControlledCamera: this.userControlledCamera,
      setUserControlledCamera: this.setUserControlledCamera.bind(this),
      isUserControllingCamera: this.isUserControllingCamera.bind(this),
      resetCameraControl: this.resetCameraControl.bind(this)
    };
  }

  // 🆕 NEW: Methods for user-controlled camera
  setUserControlledCamera(value) {
    this.userControlledCamera = value;
    console.log(`User controlled camera: ${value ? 'AKTIVNÍ' : 'NEAKTIVNÍ'}`);
  }
  
  isUserControllingCamera() {
    return this.userControlledCamera || 
           this.seatDetailMode || 
           this.manualCameraMode;
  }
  
  resetCameraControl() {
    this.userControlledCamera = false;
    this.setManualCameraMode(false);
    this.setSeatDetailMode(false);
    this.setSelectedStairs(null);
    this.setOriginalCameraPosition(null);
    console.log('Camera control reset - vráceno k automatické kontrole');
  }

  // Wrapper methods for external calls to setters
  updatePreviewRotation(value) {
    if (typeof value === 'function') {
      this.setPreviewRotation(value(this.previewRotation));
    } else {
      this.setPreviewRotation(value);
    }
  }

  updateMouseOffsetX(value) {
    if (typeof value === 'function') {
      this.setMouseOffsetX(value(this.mouseOffsetX));
    } else {
      this.setMouseOffsetX(value);
    }
  }

  updateTargetCameraRotationY(value) {
    if (typeof value === 'function') {
      this.setTargetCameraRotationY(value(this.targetCameraRotationY));
    } else {
      this.setTargetCameraRotationY(value);
    }
  }

  updateIsFirstPerson(value) {
    if (typeof value === 'function') {
      this.setIsFirstPerson(value(this.isFirstPerson));
    } else {
      this.setIsFirstPerson(value);
    }
  }

  updateShowControls(value) {
    if (typeof value === 'function') {
      this.setShowControls(value(this.showControls));
    } else {
      this.setShowControls(value);
    }
  }

  // Manual Camera wrapper methods
  updateManualCameraMode(value) {
    if (typeof value === 'function') {
      this.setManualCameraMode(value(this.manualCameraMode));
    } else {
      this.setManualCameraMode(value);
    }
    // 🆕 Když se aktivuje manual camera, nastav user controlled flag
    if (typeof value === 'boolean' && value) {
      this.setUserControlledCamera(true);
    }
  }

  updateCameraPosition(value) {
    if (typeof value === 'function') {
      this.setCameraPosition(value(this.cameraPosition));
    } else {
      this.setCameraPosition(value);
    }
  }

  updateCameraZoom(value) {
    if (typeof value === 'function') {
      this.setCameraZoom(value(this.cameraZoom));
    } else {
      this.setCameraZoom(value);
    }
  }

  // Convenience methods for commonly used state
  getSeatOptions() {
    return this.seatOptions;
  }

  getPlayerRef() {
    return this.playerRef;
  }

  getBallRef() {
    return this.ballRef;
  }

  // Manual Camera convenience methods
  getManualCameraMode() {
    return this.manualCameraMode;
  }

  getCameraPosition() {
    return this.cameraPosition;
  }

  getCameraZoom() {
    return this.cameraZoom;
  }

  // 🆕 UPDATED: Exit seat detail mode with user control flag
  exitSeatDetailMode() {
    this.setSeatDetailMode(false);
    this.setSelectedStairs(null);
    this.setOriginalCameraPosition(null);
    // NECHŤ KAMERA ZŮSTANE TAM, KDE JE! Neresetneme user controlled flag
    console.log('Seat detail mode ukončen - kamera zůstává na aktuální pozici');
  }

  // Back to menu - consolidated logic
  backToMenu() {
    if (this.backToMenuCallback) {
      this.backToMenuCallback();
    }
  }

  // 🔥 NOVÉ: Update specific states with validation - přidány nové stavy
  updateGameState(newState) {
    const validStates = ['menu', 'playing', 'editor', 'offlineLeague', 'matchSetup'];
    if (validStates.includes(newState)) {
      this.setGameState(newState);
    } else {
      console.warn(`Invalid game state: ${newState}`);
    }
  }

  updateEditMode(newMode) {
    const validModes = ['place', 'select', 'seat'];
    if (validModes.includes(newMode)) {
      this.setEditMode(newMode);
    } else {
      console.warn(`Invalid edit mode: ${newMode}`);
    }
  }

  // 🆕 UPDATED: Enter seat detail mode with user control
  enterSeatDetailMode(stairs, cameraPosition) {
    this.setSelectedStairs(stairs);
    this.setSeatDetailMode(true);
    this.setOriginalCameraPosition(cameraPosition);
    this.setUserControlledCamera(true); // Nastav že uživatel ovládá kameru
    console.log(`Entering seat detail mode for stairs: ${stairs.id} - user controlled camera activated`);
  }

  // Enter manual camera mode with optional position
  enterManualCameraMode(position = null, zoom = 1.0) {
    this.setManualCameraMode(true);
    this.setUserControlledCamera(true); // Nastav user controlled flag
    if (position) {
      this.setCameraPosition(position);
    }
    this.setCameraZoom(zoom);
    console.log(`Manual camera mode enabled at position:`, position || 'current');
  }

  // 🆕 UPDATED: Exit manual camera mode - option to keep position
  exitManualCameraMode(resetPosition = false) {
    this.setManualCameraMode(false);
    if (resetPosition) {
      this.setCameraPosition({ x: 0, y: 35, z: 50 });
      this.setCameraZoom(1.0);
      this.setUserControlledCamera(false); // Reset user control only if resetting position
      console.log(`Manual camera mode disabled - reset to default position`);
    } else {
      console.log(`Manual camera mode disabled - camera position preserved`);
    }
  }

  // 🆕 UPDATED: Reset editor state with camera options
  resetEditorState(resetCamera = false) {
    this.setPlacementMode(false);
    this.setEditMode('place');
    this.setSelectedObject(null);
    this.setPreviewPosition(null);
    this.setPreviewRotation(0);
    this.setSeatDetailMode(false);
    this.setSelectedStairs(null);
    this.setOriginalCameraPosition(null);
    
    if (resetCamera) {
      this.setManualCameraMode(false);
      this.setCameraPosition({ x: 0, y: 35, z: 50 });
      this.setCameraZoom(1.0);
      this.setUserControlledCamera(false);
      console.log('Editor state reset WITH camera reset');
    } else {
      console.log('Editor state reset - camera position preserved');
    }
  }

  resetGameState() {
    this.setIsFirstPerson(false);
    this.setIsDribbling(false);
    this.setKickCooldown(0);
    this.setMouseOffsetX(0);
    this.setTargetCameraRotationY(0);
  }

  // Helper method to check if we're in specific modes
  isInEditMode(mode = null) {
    if (mode) {
      return this.gameState === 'editor' && this.editMode === mode;
    }
    return this.gameState === 'editor';
  }

  isInGameMode() {
    return this.gameState === 'playing';
  }

  isInMenuMode() {
    return this.gameState === 'menu';
  }
  
  // 🔥 NOVÉ: Helper metody pro offline ligu
  isInOfflineLeagueMode() {
    return this.gameState === 'offlineLeague';
  }
  
  isInMatchSetupMode() {
    return this.gameState === 'matchSetup';
  }
  
  isPlayingOfflineMatch() {
    // Zkontroluj jestli hrajeme a máme AI soupeře
    return this.gameState === 'playing' && window.currentAIOpponent !== null;
  }

  // Manual camera mode helpers
  isManualCameraModeActive() {
    return this.gameState === 'editor' && this.manualCameraMode;
  }

  canUseManualCamera() {
    return this.gameState === 'editor' && !this.seatDetailMode;
  }

  // Stadium management helpers
  addStadiumElement(element) {
    this.setStadiumElements(prev => [...prev, element]);
  }

  removeStadiumElement(elementId) {
    this.setStadiumElements(prev => prev.filter(el => el.id !== elementId));
  }

  // 🆕 UPDATED: Clear stadium with camera options
  clearAllStadiumElements(resetCamera = false) {
    this.setStadiumElements([]);
    this.setSelectedObject(null);
    this.setPreviewPosition(null);
    this.setPreviewRotation(0);
    this.setSeatDetailMode(false);
    this.setSelectedStairs(null);
    this.setOriginalCameraPosition(null);
    
    if (resetCamera) {
      this.setManualCameraMode(false);
      this.setCameraPosition({ x: 0, y: 35, z: 50 });
      this.setCameraZoom(1.0);
      this.setUserControlledCamera(false);
      console.log('Stadium cleared WITH camera reset');
    } else {
      console.log('Stadium cleared - camera position preserved');
    }
  }

  // 🔥 NOVÉ: Enhanced debug method s offline match info
  logState() {
    console.log('Current Game State:', {
      gameState: this.gameState,
      editMode: this.editMode,
      placementMode: this.placementMode,
      seatDetailMode: this.seatDetailMode,
      manualCameraMode: this.manualCameraMode,
      userControlledCamera: this.userControlledCamera,
      isUserControllingCamera: this.isUserControllingCamera(),
      stadiumElementsCount: this.stadiumElements.length,
      selectedTool: this.selectedTool,
      isFirstPerson: this.isFirstPerson,
      cameraPosition: this.cameraPosition,
      cameraZoom: this.cameraZoom,
      // 🔥 NOVÉ
      isOfflineMatch: this.gameState === 'playing' && window.currentAIOpponent !== null,
      aiOpponentName: window.currentAIOpponent?.name || 'None'
    });
  }
}