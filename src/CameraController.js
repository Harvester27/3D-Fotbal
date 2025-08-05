// src/CameraController.js
import { THREE } from './three.js';

export class CameraController {
  constructor(camera) {
    this.camera = camera;
    this.originalPosition = { x: 0, y: 35, z: 50 };
    this.originalLookAt = { x: 0, y: 0, z: 0 };
    this.isDetailMode = false;
    this.detailModeActive = false;
  }

  // Uloží aktuální pozici kamery
  saveCurrentPosition() {
    return {
      x: this.camera.position.x,
      y: this.camera.position.y,
      z: this.camera.position.z,
      lookAtX: 0, // Můžeme rozšířit později
      lookAtY: 0,
      lookAtZ: 0
    };
  }

  // Obnoví pozici kamery
  restorePosition(savedPosition) {
    if (savedPosition) {
      this.camera.position.set(
        savedPosition.x,
        savedPosition.y,
        savedPosition.z
      );
      this.camera.lookAt(
        savedPosition.lookAtX,
        savedPosition.lookAtY,
        savedPosition.lookAtZ
      );
      console.log("Kamera obnovena na uloženou pozici:", savedPosition);
    } else {
      // Fallback na původní pozici
      this.camera.position.set(
        this.originalPosition.x,
        this.originalPosition.y,
        this.originalPosition.z
      );
      this.camera.lookAt(
        this.originalLookAt.x,
        this.originalLookAt.y,
        this.originalLookAt.z
      );
      console.log("Kamera obnovena na původní pozici:", this.originalPosition);
    }
    this.detailModeActive = false;
    console.log("Detail mode deaktivován");
  }

  // Přiblíží kameru k objektu (např. schodům)
  focusOnObject(targetObject, distance = 2.5, height = 2) {
    if (!targetObject || !targetObject.position) return false;

    console.log("Přibližuji kameru k objektu:", targetObject);
    
    const stairPos = targetObject.position;
    const stairRotation = targetObject.rotation || 0;
    
    // Vypočítej pozici kamery - VELMI BLÍZKO před objektem pro detailní záběr
    const offsetX = Math.sin(stairRotation) * distance;
    const offsetZ = Math.cos(stairRotation) * distance;
    
    // Nastav pozici kamery
    this.camera.position.set(
      stairPos.x - offsetX,
      height,
      stairPos.z - offsetZ
    );
    
    // Zaměř kameru na střed schodů (mírně výš pro lepší úhel)
    this.camera.lookAt(stairPos.x, stairPos.y + 0.8, stairPos.z);
    
    this.detailModeActive = true;
    
    console.log("Kamera nastavena na velmi blízkou pozici:", this.camera.position);
    console.log("Kamera se dívá na schody:", stairPos);
    
    return true;
  }

  // Aktualizuje kameru pro normální režim (hra/editor)
  updateNormalMode(gameState, isFirstPerson, mouseX, mouseY, playerRef, mouseOffsetX, targetCameraRotationY, cameraSmoothness) {
    // Pokud je aktivní detailní režim, neměň pozici kamery
    if (this.detailModeActive) {
      console.log("Detail mode aktivní - neměním pozici kamery");
      return;
    }

    if (gameState === 'playing' && isFirstPerson && playerRef.current) {
      this.updateFirstPersonCamera(playerRef.current, mouseOffsetX, targetCameraRotationY, cameraSmoothness);
    } else if (gameState === 'editor') {
      this.updateThirdPersonCamera(mouseX, mouseY);
    }
  }

  // Aktualizace kamery pro první osobu - JEDNODUCHÁ VERZE
  updateFirstPersonCamera(player, mouseOffsetX, targetCameraRotationY, cameraSmoothness) {
    // Pozice kamery = pozice hráče + výška očí
    this.camera.position.x = player.mesh.position.x;
    this.camera.position.y = player.mesh.position.y + 1.6; // Výška očí
    this.camera.position.z = player.mesh.position.z;
    
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
      
      const lookAt = new THREE.Vector3().addVectors(this.camera.position, lookDirection);
      this.camera.lookAt(lookAt);
      
    } else {
      // Fallback kamera - zde by bylo potřeba přidat mouseDeltaX, mouseDeltaY
      console.log("Fallback kamera");
    }
  }

  // Aktualizace kamery pro třetí osobu
  updateThirdPersonCamera(mouseX, mouseY) {
    this.camera.position.x = this.originalPosition.x + mouseX * 8;
    this.camera.position.y = this.originalPosition.y;
    this.camera.position.z = this.originalPosition.z - mouseY * 15;
    this.camera.lookAt(this.originalLookAt.x, this.originalLookAt.y, this.originalLookAt.z);
  }

  // Označí, že je detailní režim aktivní
  setDetailMode(active) {
    this.detailModeActive = active;
    console.log("Detail mode nastaven na:", active);
  }

  // Zjistí, zda je detailní režim aktivní
  isDetailModeActive() {
    return this.detailModeActive;
  }
}