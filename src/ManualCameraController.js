// src/ManualCameraController.js
import { THREE } from './three.js';

export class ManualCameraController {
  constructor(camera, gameStateManager) {
    this.camera = camera;
    this.gameStateManager = gameStateManager;
    
    // Výchozí pozice kamery pro editor
    this.defaultPosition = { x: 0, y: 35, z: 50 };
    this.defaultLookAt = { x: 0, y: 0, z: 0 };
    
    // Aktuální lookAt target (kam se kamera dívá)
    this.currentLookAt = { x: 0, y: 0, z: 0 };
    
    // Nastavení pro ruční ovládání
    this.moveSpeed = 30;           // Rychlost pohybu kamery
    this.zoomSpeed = 0.1;          // Rychlost zoomu kolečkem
    this.keyZoomSpeed = 0.05;      // Rychlost zoomu klávesami
    this.minZoom = 0.3;            // Minimální zoom
    this.maxZoom = 3.0;            // Maximální zoom
    this.currentZoom = 1.0;        // Aktuální zoom level
    
    // Sledování času držení kláves pro progresivní zrychlování
    this.keyPressTime = new Map(); // Jak dlouho je každá klávesa držená
    
    // Sledování stisknutých kláves
    this.pressedKeys = new Set();
    
    // Throttling pro zoom operace (zabráni opakovanému volání)
    this.lastZoomTime = 0;
    this.zoomThrottleMs = 50; // Minimální čas mezi zoom operacemi
    
    // Flag pro detekci browser key repeat
    this.keyRepeatBlocked = new Set();
    
    // Mouse drag pro změnu pohledu
    this.isDragging = false;
    this.mouseStartX = 0;
    this.mouseStartY = 0;
    this.dragSensitivity = 0.5;  // Citlivost tažení myší
    this.lookAtOffset = { x: 0, y: 0, z: 0 }; // Offset od výchozího lookAt
    
    // Bind methods
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.handleWheel = this.handleWheel.bind(this);
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.update = this.update.bind(this);
    
    // Globální reset funkce pro panel
    window.resetManualCamera = this.resetCamera.bind(this);
    
    // Inicializační kontrola kamery
    this.validateCameraState();
  }

  // Kontrola a oprava stavu kamery
  validateCameraState() {
    // Zkontroluj pozici kamery
    if (!this.camera.position || isNaN(this.camera.position.x) || isNaN(this.camera.position.y) || isNaN(this.camera.position.z)) {
      console.warn("Invalid camera position detected, resetting to default");
      this.camera.position.set(this.defaultPosition.x, this.defaultPosition.y, this.defaultPosition.z);
    }
    
    // Zkontroluj zoom
    if (isNaN(this.currentZoom) || this.currentZoom < this.minZoom || this.currentZoom > this.maxZoom) {
      this.currentZoom = 1.0;
    }
    
    // Zkontroluj FOV
    if (isNaN(this.camera.fov)) {
      this.camera.fov = 75;
      this.camera.updateProjectionMatrix();
    }
  }

  // Zapnutí event listenerů
  setupEventListeners() {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    window.addEventListener('wheel', this.handleWheel, { passive: false });
    window.addEventListener('mousedown', this.handleMouseDown);
    window.addEventListener('mousemove', this.handleMouseMove);
    window.addEventListener('mouseup', this.handleMouseUp);
  }

  // Vypnutí event listenerů
  removeEventListeners() {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    window.removeEventListener('wheel', this.handleWheel);
    window.removeEventListener('mousedown', this.handleMouseDown);
    window.removeEventListener('mousemove', this.handleMouseMove);
    window.removeEventListener('mouseup', this.handleMouseUp);
  }

  // Zpracování stisknutí klávesy
  handleKeyDown(event) {
    const { gameState, manualCameraMode, setManualCameraMode } = this.gameStateManager.getState();
    
    // Pouze v editoru
    if (gameState !== 'editor') return;
    
    // C klávesa pro zapnutí/vypnutí
    if (event.code === 'KeyC') {
      setManualCameraMode(!manualCameraMode);
      event.preventDefault();
      console.log(`Ruční ovládání kamery: ${!manualCameraMode ? 'ZAPNUTO' : 'VYPNUTO'}`);
      return;
    }
    
    // Ostatní klávesy pouze když je aktivní ruční režim
    if (!manualCameraMode) return;
    
    // Debug log pro detekci problému
    console.log(`Manual camera key pressed: ${event.code}`);
    
    // Šipky pro pohyb
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.code)) {
      // Pokud klávesa není již držená, začni měřit čas
      if (!this.pressedKeys.has(event.code)) {
        this.keyPressTime.set(event.code, Date.now());
        console.log(`Started tracking ${event.code} at ${Date.now()}`);
      }
      this.pressedKeys.add(event.code);
      event.preventDefault();
      event.stopPropagation(); // Zabraň dalšímu šíření eventu
      return; // Důležité - ihned ukonči, aby se nespustily další akce
    }
    
    // Zoom klávesami (pouze + a - klávesy, NE šipky!)
    if (event.code === 'Equal' || event.code === 'NumpadAdd') { // + klávesa
      // Zablokuj browser key repeat
      if (this.keyRepeatBlocked.has(event.code)) {
        event.preventDefault();
        return;
      }
      this.keyRepeatBlocked.add(event.code);
      
      console.log("Zoom IN pressed");
      this.zoomCamera(this.keyZoomSpeed);
      event.preventDefault();
      return;
    }
    
    if (event.code === 'Minus' || event.code === 'NumpadSubtract') { // - klávesa
      // Zablokuj browser key repeat
      if (this.keyRepeatBlocked.has(event.code)) {
        event.preventDefault();
        return;
      }
      this.keyRepeatBlocked.add(event.code);
      
      console.log("Zoom OUT pressed");
      this.zoomCamera(-this.keyZoomSpeed);
      event.preventDefault();
      return;
    }
    
    // R pro reset
    if (event.code === 'KeyR') {
      console.log("Reset camera pressed");
      this.resetCamera();
      event.preventDefault();
      return;
    }
  }

  // Zpracování puštění klávesy
  handleKeyUp(event) {
    const { gameState, manualCameraMode } = this.gameStateManager.getState();
    
    if (gameState !== 'editor' || !manualCameraMode) return;
    
    // Debug log
    console.log(`Manual camera key released: ${event.code}`);
    
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.code)) {
      this.pressedKeys.delete(event.code);
      // Vymaž čas držení klávesy
      this.keyPressTime.delete(event.code);
      console.log(`Stopped tracking ${event.code}`);
      event.preventDefault();
    }
    
    // Odblokuj zoom klávesy při puštění
    if (['Equal', 'NumpadAdd', 'Minus', 'NumpadSubtract'].includes(event.code)) {
      this.keyRepeatBlocked.delete(event.code);
      console.log(`Unblocked key repeat for ${event.code}`);
      event.preventDefault();
    }
  }

  // Zpracování kolečka myši
  handleWheel(event) {
    const { gameState, manualCameraMode } = this.gameStateManager.getState();
    
    if (gameState !== 'editor' || !manualCameraMode) return;
    
    // Debug log
    console.log("Mouse wheel zoom:", event.deltaY);
    
    // Zoom kolečkem myši
    const zoomDelta = event.deltaY > 0 ? -this.zoomSpeed : this.zoomSpeed;
    this.zoomCamera(zoomDelta);
    event.preventDefault();
    event.stopPropagation(); // Zabraň dalšímu šíření eventu
  }

  // Zpracování stisknutí myši
  handleMouseDown(event) {
    const { gameState, manualCameraMode } = this.gameStateManager.getState();
    
    if (gameState !== 'editor' || !manualCameraMode) return;
    
    // Pouze levé tlačítko myši
    if (event.button !== 0) return;
    
    this.isDragging = true;
    this.mouseStartX = event.clientX;
    this.mouseStartY = event.clientY;
    
    // Změň kurzor na "grabbing"
    document.body.style.cursor = 'grabbing';
    
    // Zabraň výběru textu při tažení
    event.preventDefault();
  }

  // Zpracování pohybu myši
  handleMouseMove(event) {
    const { gameState, manualCameraMode } = this.gameStateManager.getState();
    
    if (gameState !== 'editor' || !manualCameraMode || !this.isDragging) return;
    
    // Vypočítej delta změnu od posledního frame
    const deltaX = (event.clientX - this.mouseStartX) * this.dragSensitivity;
    const deltaY = (event.clientY - this.mouseStartY) * this.dragSensitivity;
    
    // Aktualizuj start pozici pro další frame
    this.mouseStartX = event.clientX;
    this.mouseStartY = event.clientY;
    
    // Aktualizuj lookAt offset - akumuluj změny
    this.lookAtOffset.x += -deltaX * 0.01;
    this.lookAtOffset.y += deltaY * 0.01;
    
    // Omez vertikální pohled
    this.lookAtOffset.y = Math.max(-10, Math.min(10, this.lookAtOffset.y));
    
    // Aktualizuj lookAt target
    this.currentLookAt.x = this.defaultLookAt.x + this.lookAtOffset.x;
    this.currentLookAt.y = this.defaultLookAt.y + this.lookAtOffset.y;
    this.currentLookAt.z = this.defaultLookAt.z + this.lookAtOffset.z;
    
    // Nastav nový směr pohledu
    this.camera.lookAt(this.currentLookAt.x, this.currentLookAt.y, this.currentLookAt.z);
  }

  // Zpracování puštění myši
  handleMouseUp(event) {
    const { gameState, manualCameraMode } = this.gameStateManager.getState();
    
    this.isDragging = false;
    
    // Vrať kurzor zpět na grab pokud je manuální mód aktivní
    if (gameState === 'editor' && manualCameraMode) {
      document.body.style.cursor = 'grab';
    } else {
      document.body.style.cursor = 'default';
    }
  }

  // Update loop - volá se z AnimationManager
  update(deltaTime) {
    const { gameState, manualCameraMode } = this.gameStateManager.getState();
    
    if (gameState !== 'editor' || !manualCameraMode) return;
    
    // Zpracování pohybu šipkami
    this.processMovement(deltaTime);
  }

  // Zpracování pohybu kamery šipkami
  processMovement(deltaTime) {
    if (this.pressedKeys.size === 0) return;
    
    const moveDistance = this.moveSpeed * deltaTime;
    const cameraDirection = new THREE.Vector3();
    const cameraRight = new THREE.Vector3();
    
    // Získej směrové vektory kamery
    this.camera.getWorldDirection(cameraDirection);
    cameraRight.crossVectors(this.camera.up, cameraDirection).normalize();
    
    // Pohyb dopředu/dozadu
    if (this.pressedKeys.has('ArrowUp')) {
      this.camera.position.addScaledVector(cameraDirection, moveDistance);
    }
    if (this.pressedKeys.has('ArrowDown')) {
      this.camera.position.addScaledVector(cameraDirection, -moveDistance);
    }
    
    // Pohyb vlevo/vpravo
    if (this.pressedKeys.has('ArrowLeft')) {
      this.camera.position.addScaledVector(cameraRight, moveDistance);
    }
    if (this.pressedKeys.has('ArrowRight')) {
      this.camera.position.addScaledVector(cameraRight, -moveDistance);
    }
    
    // Zachovej aktuální směr pohledu
    this.camera.lookAt(this.currentLookAt.x, this.currentLookAt.y, this.currentLookAt.z);
  }

  // Zoom kamery
  zoomCamera(zoomDelta) {
    // Time-based throttling
    const currentTime = Date.now();
    if (currentTime - this.lastZoomTime < this.zoomThrottleMs) {
      console.log("Zoom throttled");
      return;
    }
    this.lastZoomTime = currentTime;
    
    // Debug log pro sledování zoom volání
    console.log(`zoomCamera called with delta: ${zoomDelta}, current zoom: ${this.currentZoom}`);
    
    // Bezpečnostní kontrola delta
    if (!zoomDelta || isNaN(zoomDelta) || Math.abs(zoomDelta) > 1.0) {
      console.warn("Invalid zoom delta:", zoomDelta);
      return;
    }
    
    const oldZoom = this.currentZoom;
    this.currentZoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.currentZoom + zoomDelta));
    
    // Pouze pokud se zoom skutečně změnil, aktualizuj FOV
    if (Math.abs(this.currentZoom - oldZoom) < 0.001) {
      return; // Žádná změna, ukonči
    }
    
    // Aplikuj zoom změnou FOV
    const baseFOV = 75;
    const newFOV = baseFOV / this.currentZoom;
    this.camera.fov = Math.max(10, Math.min(120, newFOV));
    this.camera.updateProjectionMatrix();
    
    console.log(`Camera zoom: ${this.currentZoom.toFixed(2)}x (FOV: ${this.camera.fov.toFixed(1)}°)`);
  }

  // Reset kamery na výchozí pozici
  resetCamera() {
    console.log("Resetuji kameru...");
    
    // Vynucený reset pozice
    this.camera.position.set(
      this.defaultPosition.x,
      this.defaultPosition.y,
      this.defaultPosition.z
    );
    
    // Reset lookAt
    this.lookAtOffset = { x: 0, y: 0, z: 0 };
    this.currentLookAt = { ...this.defaultLookAt };
    
    // Vymaž všechny časy držení kláves a stisknuté klávesy
    this.keyPressTime.clear();
    this.pressedKeys.clear();
    this.keyRepeatBlocked.clear(); // Vymaž i blokované klávesy
    
    // Reset zoom throttling
    this.lastZoomTime = 0;
    
    // Reset drag stavu
    this.isDragging = false;
    
    // Reset kamery s kontolou
    this.camera.lookAt(
      this.defaultLookAt.x,
      this.defaultLookAt.y,
      this.defaultLookAt.z
    );
    
    // Reset zoom
    this.currentZoom = 1.0;
    this.camera.fov = 75;
    this.camera.updateProjectionMatrix();
    
    // Validace po resetu
    this.validateCameraState();
    
    console.log("Kamera resetována:", {
      position: this.camera.position,
      lookAt: this.currentLookAt,
      zoom: this.currentZoom,
      fov: this.camera.fov
    });
  }

  // Zapnutí/vypnutí ruční kamery
  setManualMode(enabled) {
    if (enabled) {
      console.log("Ruční ovládání kamery ZAPNUTO");
      console.log("Ovládání:");
      console.log("  ↑↓←→ = pohyb kamery");
      console.log("  Tažení myší = změna směru pohledu");
      console.log("  Kolečko/+/- = zoom");
      console.log("  R = reset");
      console.log("  C = vypnout");
      
      // Nastav kurzor aby indikoval možnost tažení
      document.body.style.cursor = 'grab';
    } else {
      console.log("Ruční ovládání kamery VYPNUTO");
      // Vymaž stisknuté klávesy a časy
      this.pressedKeys.clear();
      this.keyPressTime.clear();
      this.keyRepeatBlocked.clear(); // Vymaž i blokované klávesy
      this.isDragging = false;
      
      // Vrať výchozí kurzor
      document.body.style.cursor = 'default';
    }
  }

  // Getter pro aktuální pozici kamery (pro UI panel)
  getCameraPosition() {
    return {
      x: this.camera.position.x,
      y: this.camera.position.y,
      z: this.camera.position.z
    };
  }

  // Getter pro aktuální lookAt target (pro UI panel)
  getCameraLookAt() {
    return {
      x: this.currentLookAt.x,
      y: this.currentLookAt.y,
      z: this.currentLookAt.z
    };
  }

  // Getter pro aktuální zoom (pro UI panel)
  getCameraZoom() {
    return this.currentZoom;
  }

  // Test, zda je ruční režim aktivní
  isManualModeActive() {
    const { gameState, manualCameraMode } = this.gameStateManager.getState();
    return gameState === 'editor' && manualCameraMode;
  }

  // Dispose
  dispose() {
    this.removeEventListeners();
    this.pressedKeys.clear();
    this.keyPressTime.clear(); // Vymaž časy držení
    this.keyRepeatBlocked.clear(); // Vymaž blokované klávesy
    this.isDragging = false; // Reset drag stavu
    
    // Vymaž globální funkci
    if (window.resetManualCamera) {
      delete window.resetManualCamera;
    }
  }
}