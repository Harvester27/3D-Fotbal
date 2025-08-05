// src/StadiumManager/StadiumManagerUtility.js - 🛠️ UTILITY FUNCTIONS
import { StadiumBuilder } from '../StadiumBuilder.js';
import * as logger from '../utils/logger.js';

export class StadiumManagerUtility {
  constructor(stadiumManager) {
    this.stadiumManager = stadiumManager;
  }

  // 🔥 Vytvoření existujících prvků stadionu S OPTIONS pro sedačky
  createExistingElements(stadiumElements) {
    stadiumElements.forEach(element => {
      let mesh;
      
      // 🎨 SPECIÁLNÍ HANDLING pro terrain brushes - restore from height map
      if (element.isTerrainBrush && element.gridKey) {
        // Restore height map data
        this.stadiumManager.heightMap.set(element.gridKey, element.currentHeight || 0);
        
        // Recreate terrain mesh
        mesh = this.stadiumManager.terrain.createAccumulatedTerrain(element.position, element.currentHeight || 0, element.type);
        this.stadiumManager.terrainMeshes.set(element.gridKey, mesh);
        
        logger.debug(`🎨 Restored terrain brush: ${element.type} at ${element.gridKey} with height ${element.currentHeight}m`);
      }
      // 🪑 SPECIÁLNÍ HANDLING pro sedačky - použij uložené options
      else if (element.type === 'individual_seat') {
        logger.debug(`🪑 Recreating existing seat with saved options:`, {
          seatType: element.seatType || 'plastic',
          seatColor: element.seatColor || 'blue',
          position: element.position
        });
        
        mesh = StadiumBuilder.createElement(element.type, element.position, {
          seatType: element.seatType || 'plastic',
          seatColor: element.seatColor || 'blue',
          rotation: element.rotation || 0
        });
      } else {
        // Původní logika pro ostatní prvky (stadium + terrain)
        mesh = StadiumBuilder.createElement(element.type, element.position);
      }
      
      if (mesh) {
        if (element.rotation) {
          mesh.rotation.y = element.rotation;
        }
        // 🌍 Ulož typ objektu
        mesh.userData = { elementType: element.type };
        this.stadiumManager.scene.add(mesh);
        element.mesh = mesh;
      }
    });
  }

  // 🎨 Vymazání všech objektů včetně terrain map cleanup
  clearAllStadiumElements(stadiumElements) {
    stadiumElements.forEach(element => {
      if (element.mesh && this.stadiumManager.scene.children.includes(element.mesh)) {
        this.stadiumManager.scene.remove(element.mesh);
        
        // 🎨 Cleanup terrain brush data
        if (element.isTerrainBrush && element.gridKey) {
          this.stadiumManager.heightMap.delete(element.gridKey);
          this.stadiumManager.terrainMeshes.delete(element.gridKey);
        }
      }
    });
    
    // 🎨 Clear all terrain data
    this.stadiumManager.heightMap.clear();
    this.stadiumManager.terrainMeshes.clear();
    
    // Vymaž i outline a glow
    this.stadiumManager.selection.clearSelectionOutline();
    
    // Vymaž preview
    this.stadiumManager.preview.clearPreview();
    
    // 🪑 Vymaž i seat preview
    this.stadiumManager.seat.clearSeatPreview();
    
    logger.debug(`🎨 Cleared all stadium elements and terrain data`);
  }

  // Complete disposal of all resources
  dispose() {
    this.stadiumManager.preview.clearPreview();
    this.stadiumManager.selection.clearSelectionOutline();
    this.stadiumManager.seat.clearSeatPreview();
    
    // 🎨 Cleanup terrain system
    this.stadiumManager.heightMap.clear();
    this.stadiumManager.terrainMeshes.forEach(mesh => {
      if (this.stadiumManager.scene.children.includes(mesh)) {
        this.stadiumManager.scene.remove(mesh);
        if (mesh.geometry) mesh.geometry.dispose();
        if (mesh.material) {
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach(mat => mat.dispose());
          } else {
            mesh.material.dispose();
          }
        }
      }
    });
    this.stadiumManager.terrainMeshes.clear();
  }
}