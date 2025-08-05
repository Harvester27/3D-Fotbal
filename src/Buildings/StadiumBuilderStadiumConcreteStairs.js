/**
 * StadiumBuilderStadiumConcreteStairs.js - BETONOVÉ SCHODY
 * 
 * OBSAH:
 * - createConcreteMaterial() - Sdílená funkce pro betonový materiál
 * - createConcreteStairs() - Vylepšené betonové schody s parametry velikosti a orientace
 */

import { THREE } from '../three.js';

export const StadiumBuilderStadiumConcreteStairs = {
  
  // 🎨 SDÍLENÁ FUNKCE pro vytvoření kvalitního betonového materiálu
  createConcreteMaterial() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const context = canvas.getContext('2d');
    
    // Základní betonová barva
    context.fillStyle = '#8C8C8C';
    context.fillRect(0, 0, 256, 256);
    
    // Přidání noise textury
    const imageData = context.getImageData(0, 0, 256, 256);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 40;
      data[i] = Math.max(0, Math.min(255, data[i] + noise));
      data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
      data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
    }
    
    context.putImageData(imageData, 0, 0);
    
    // Tmavé skvrny (stáří, opotřebení)
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * 256;
      const y = Math.random() * 256;
      const size = Math.random() * 15 + 5;
      
      const gradient = context.createRadialGradient(x, y, 0, x, y, size);
      gradient.addColorStop(0, 'rgba(60, 60, 60, 0.3)');
      gradient.addColorStop(1, 'rgba(60, 60, 60, 0)');
      
      context.fillStyle = gradient;
      context.fillRect(x - size, y - size, size * 2, size * 2);
    }
    
    // Světlé skvrny
    for (let i = 0; i < 15; i++) {
      const x = Math.random() * 256;
      const y = Math.random() * 256;
      const size = Math.random() * 10 + 3;
      
      const gradient = context.createRadialGradient(x, y, 0, x, y, size);
      gradient.addColorStop(0, 'rgba(160, 160, 160, 0.2)');
      gradient.addColorStop(1, 'rgba(160, 160, 160, 0)');
      
      context.fillStyle = gradient;
      context.fillRect(x - size, y - size, size * 2, size * 2);
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 2);
    
    return new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.9,
      metalness: 0.1
    });
  },

  // 🪜 VYLEPŠENÉ betonové schody s parametry velikosti a orientace
  createConcreteStairs(position, options = {}) {
    console.log(`🪜 Creating concrete stairs with options:`, options);
    
    const stairsGroup = new THREE.Group();
    
    // 📏 PARAMETRY SCHODŮ - nyní konfigurovatelné!
    const config = {
      stepCount: options.stepCount || 8,
      stepWidth: options.stepWidth || 4,
      stepDepth: options.stepDepth || 0.8,
      stepHeight: options.stepHeight || 0.3,
      rotation: options.rotation || 0,
      scale: {
        x: options.scaleX || 1,
        y: options.scaleY || 1,
        z: options.scaleZ || 1
      }
    };
    
    console.log(`🪜 Stairs config:`, config);

    const concreteMaterial = this.createConcreteMaterial();
    
    // 🧱 VYTVOŘENÍ JEDNOTLIVÝCH SCHODŮ
    for (let i = 0; i < config.stepCount; i++) {
      const step = new THREE.Mesh(
        new THREE.BoxGeometry(config.stepWidth, config.stepHeight, config.stepDepth),
        concreteMaterial
      );
      
      const yPos = i * config.stepHeight;
      const zPos = i * config.stepDepth;
      
      step.position.set(0, yPos + config.stepHeight/2, zPos);
      step.castShadow = true;
      step.receiveShadow = true;
      stairsGroup.add(step);
      
      // 🔲 Hrany na schodech pro lepší vizuální efekt
      if (i > 0) {
        const edge = new THREE.Mesh(
          new THREE.BoxGeometry(config.stepWidth, 0.05, 0.05),
          new THREE.MeshStandardMaterial({ color: 0x666666, roughness: 0.8 })
        );
        edge.position.set(0, yPos + config.stepHeight, zPos - config.stepDepth/2);
        edge.castShadow = true;
        stairsGroup.add(edge);
      }
    }
    
    // 🏗️ POKROČILÉ BETONOVÉ PILÍŘE - stejné jako u obloukových schodů
    const pillarCount = Math.max(3, Math.floor(config.stepCount / 2));
    const pillarWidth = 0.4;
    const pillarDepth = 0.4;
    
    for (let i = 0; i < pillarCount; i++) {
      const progress = i / (pillarCount - 1);
      const zPos = progress * config.stepCount * config.stepDepth * 0.8;
      const maxHeightAtPosition = Math.floor(zPos / config.stepDepth) * config.stepHeight;
      
      if (maxHeightAtPosition > 0) {
        // Levý pilíř
        const leftPillar = new THREE.Mesh(
          new THREE.BoxGeometry(pillarWidth, maxHeightAtPosition, pillarDepth),
          concreteMaterial
        );
        leftPillar.position.set(-config.stepWidth/3, maxHeightAtPosition/2, zPos);
        leftPillar.castShadow = true;
        leftPillar.receiveShadow = true;
        stairsGroup.add(leftPillar);
        
        // Pravý pilíř
        const rightPillar = new THREE.Mesh(
          new THREE.BoxGeometry(pillarWidth, maxHeightAtPosition, pillarDepth),
          concreteMaterial
        );
        rightPillar.position.set(config.stepWidth/3, maxHeightAtPosition/2, zPos);
        rightPillar.castShadow = true;
        rightPillar.receiveShadow = true;
        stairsGroup.add(rightPillar);
      }
    }
    
    // 🔄 APLIKACE TRANSFORMACÍ
    stairsGroup.position.copy(position);
    stairsGroup.rotation.y = config.rotation;
    stairsGroup.scale.set(config.scale.x, config.scale.y, config.scale.z);
    
    console.log(`✅ Concrete stairs created successfully with ${config.stepCount} steps`);
    
    return stairsGroup;
  }
};