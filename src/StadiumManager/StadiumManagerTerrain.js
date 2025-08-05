// src/StadiumManager/StadiumManagerTerrain.js - 🎨 TERRAIN PAINTING SYSTEM
import { THREE } from '../three.js';

export class StadiumManagerTerrain {
  constructor(stadiumManager) {
    this.stadiumManager = stadiumManager;
  }

  // 🎨 Helper funkce pro grid positioning
  getGridKey(position, gridSize = 2) {
    const x = Math.round(position.x / gridSize) * gridSize;
    const z = Math.round(position.z / gridSize) * gridSize;
    return `${x}_${z}`;
  }

  // 🎨 Získej aktuální výšku na pozici
  getCurrentHeight(position, gridSize = 2) {
    const gridKey = this.getGridKey(position, gridSize);
    return this.stadiumManager.heightMap.get(gridKey) || 0;
  }

  // 🎨 Vypočítej změnu výšky podle brush typu
  getHeightChange(brushType) {
    switch(brushType) {
      case 'terrain_raise': return +1;
      case 'terrain_lower': return -1;
      case 'terrain_raise_large': return +2;
      case 'terrain_lower_large': return -2;
      case 'terrain_smooth': return 0; // Special case
      default: return 0;
    }
  }

  // 🎨 Vytvoř akumulovaný terrain mesh
  createAccumulatedTerrain(position, totalHeight, brushType) {
    const isLargeBrush = brushType.includes('_large');
    const brushSize = isLargeBrush ? 8 : (brushType === 'terrain_flatten' ? 6 : 5);
    const subdivisions = isLargeBrush ? 30 : 20;
    
    const geometry = new THREE.PlaneGeometry(brushSize, brushSize, subdivisions, subdivisions);
    const positions = geometry.attributes.position;
    
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      const distance = Math.sqrt(x*x + y*y);
      
      let height = 0;
      
      if (brushType === 'terrain_flatten') {
        // Flatten - constant height with small edge falloff
        height = totalHeight * (distance < brushSize/2 - 0.5 ? 1 : Math.max(0, 1 - (distance - brushSize/2 + 0.5) * 2));
      } else if (brushType === 'terrain_smooth') {
        // Smooth - very gentle waves
        height = totalHeight + Math.sin(x * 0.5) * Math.cos(y * 0.5) * 0.1;
      } else {
        // Standard gaussian profile scaled by total height
        const falloff = isLargeBrush ? 6 : 2;
        height = totalHeight * Math.exp(-distance*distance / falloff);
      }
      
      positions.setZ(i, Math.max(-5, Math.min(20, height))); // Clamp between -5m and +20m
    }
    
    geometry.computeVertexNormals();
    
    // 🎨 Smart material selection based on height
    let material;
    if (totalHeight > 5) {
      // High elevation = rock/stone
      material = new THREE.MeshStandardMaterial({ 
        color: 0x696969, 
        roughness: 0.9,
        metalness: 0.1 
      });
    } else if (totalHeight > 2) {
      // Medium elevation = light dirt
      material = new THREE.MeshStandardMaterial({ 
        color: 0x8B7355, 
        roughness: 0.9 
      });
    } else if (totalHeight > 0) {
      // Low elevation = grass
      material = new THREE.MeshStandardMaterial({ 
        color: 0x4a7c26, 
        roughness: 0.9 
      });
    } else if (totalHeight > -2) {
      // Shallow depression = dark dirt
      material = new THREE.MeshStandardMaterial({ 
        color: 0x654321, 
        roughness: 0.95 
      });
    } else {
      // Deep depression = mud/water
      material = new THREE.MeshStandardMaterial({ 
        color: 0x4B0000, 
        roughness: 0.95 
      });
    }
    
    const terrain = new THREE.Mesh(geometry, material);
    terrain.rotation.x = -Math.PI / 2;
    terrain.position.copy(position);
    terrain.castShadow = true;
    terrain.receiveShadow = true;
    
    // 🆕 Mark as terrain for identification
    terrain.userData = { 
      elementType: brushType,
      isAccumulatedTerrain: true, 
      totalHeight: totalHeight 
    };
    
    return terrain;
  }

  // 🎨 Update preview to show accumulated height
  updatePreviewWithAccumulatedHeight(previewObj, currentHeight, heightChange, brushType) {
    if (!previewObj) return;
    
    const finalHeight = brushType === 'terrain_flatten' ? 0 : currentHeight + heightChange;
    
    // Update preview geometry to show final result
    const geometry = previewObj.geometry;
    if (geometry && geometry.attributes.position) {
      const positions = geometry.attributes.position;
      const isLargeBrush = brushType.includes('_large');
      const brushSize = isLargeBrush ? 8 : (brushType === 'terrain_flatten' ? 6 : 5);
      
      for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i);
        const y = positions.getY(i);
        const distance = Math.sqrt(x*x + y*y);
        
        let height = 0;
        
        if (brushType === 'terrain_flatten') {
          height = finalHeight * (distance < brushSize/2 - 0.5 ? 1 : Math.max(0, 1 - (distance - brushSize/2 + 0.5) * 2));
        } else if (brushType === 'terrain_smooth') {
          height = finalHeight + Math.sin(x * 0.5) * Math.cos(y * 0.5) * 0.1;
        } else {
          const falloff = isLargeBrush ? 6 : 2;
          height = finalHeight * Math.exp(-distance*distance / falloff);
        }
        
        positions.setZ(i, Math.max(-5, Math.min(20, height)));
      }
      
      geometry.attributes.position.needsUpdate = true;
      geometry.computeVertexNormals();
    }
    
    // Update preview color based on final height
    const color = finalHeight > 0 ? (currentHeight >= 0 ? 0x00ff00 : 0xffff00) : 0xff0000;
    this.stadiumManager.preview.updatePreviewColor(previewObj, true); // Keep it green, but we'll enhance this
    
    // Store for UI feedback
    this.stadiumManager.currentHeightPreview = currentHeight;
    this.stadiumManager.previewHeightChange = heightChange;
  }

  // 🎨 Getter pro height preview info (pro UI)
  getHeightPreviewInfo() {
    return {
      currentHeight: this.stadiumManager.currentHeightPreview,
      heightChange: this.stadiumManager.previewHeightChange,
      finalHeight: this.stadiumManager.currentHeightPreview + this.stadiumManager.previewHeightChange
    };
  }
}