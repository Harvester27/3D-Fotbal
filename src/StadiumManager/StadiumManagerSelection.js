// src/StadiumManager/StadiumManagerSelection.js - 🎯 SELECTION SYSTEM
import { THREE } from '../three.js';
import * as logger from '../utils/logger.js';

export class StadiumManagerSelection {
  constructor(stadiumManager) {
    this.stadiumManager = stadiumManager;
  }

  // 🔥 Vytvoření ORANŽOVÉHO outline pro vybraný objekt
  createSelectionOutline(selectedObject) {
    // Odstraň starý outline a glow
    this.clearSelectionOutline();
    
    if (selectedObject && selectedObject.mesh) {
      // 🆕 ORANŽOVÝ BOX OUTLINE
      const box = new THREE.Box3().setFromObject(selectedObject.mesh);
      const helper = new THREE.Box3Helper(box, 0xFF8800); // 🟠 ORANŽOVÁ barva!
      helper.material.linewidth = 5; // Širší čáry
      helper.material.opacity = 0.8;
      helper.material.transparent = true;
      this.stadiumManager.scene.add(helper);
      this.stadiumManager.selectedOutline = helper;
      
      // 🆕 PŘIDEJ GLOW EFEKT - větší, průhlednější oranžový box
      const glowHelper = new THREE.Box3Helper(box, 0xFF8800);
      glowHelper.material.linewidth = 2;
      glowHelper.material.opacity = 0.3;
      glowHelper.material.transparent = true;
      glowHelper.scale.setScalar(1.05); // Mírně větší
      this.stadiumManager.scene.add(glowHelper);
      this.stadiumManager.selectedGlow = glowHelper;
      
      logger.debug(`🟠 Orange outline created for ${selectedObject.type}`);
    }
  }

  // 🔥 Aktualizace ORANŽOVÉHO outline při změně objektu
  updateSelectionOutline(selectedObject) {
    if (this.stadiumManager.selectedOutline && this.stadiumManager.selectedGlow && selectedObject && selectedObject.mesh) {
      // Remove old outlines
      this.stadiumManager.scene.remove(this.stadiumManager.selectedOutline);
      this.stadiumManager.scene.remove(this.stadiumManager.selectedGlow);
      
      // Create new outlines at updated position
      const box = new THREE.Box3().setFromObject(selectedObject.mesh);
      
      // Main outline
      const helper = new THREE.Box3Helper(box, 0xFF8800); // 🟠 ORANŽOVÁ
      helper.material.linewidth = 5;
      helper.material.opacity = 0.8;
      helper.material.transparent = true;
      this.stadiumManager.scene.add(helper);
      this.stadiumManager.selectedOutline = helper;
      
      // Glow effect
      const glowHelper = new THREE.Box3Helper(box, 0xFF8800);
      glowHelper.material.linewidth = 2;
      glowHelper.material.opacity = 0.3;
      glowHelper.material.transparent = true;
      glowHelper.scale.setScalar(1.05);
      this.stadiumManager.scene.add(glowHelper);
      this.stadiumManager.selectedGlow = glowHelper;
      
      logger.debug(`🟠 Orange outline updated for ${selectedObject.type}`);
    }
  }

  // 🔥 Odebrání outline včetně glow
  clearSelectionOutline() {
    if (this.stadiumManager.selectedOutline) {
      this.stadiumManager.scene.remove(this.stadiumManager.selectedOutline);
      this.stadiumManager.selectedOutline = null;
    }
    if (this.stadiumManager.selectedGlow) {
      this.stadiumManager.scene.remove(this.stadiumManager.selectedGlow);
      this.stadiumManager.selectedGlow = null;
    }
  }
}