/**
 * StadiumBuilderStadiumProgressiveTurningStairs.js - PROGRESIVNĚ SE ZATÁČEJÍCÍ SCHODY
 * 
 * OBSAH:
 * - createConcreteMaterial() - Sdílená funkce pro betonový materiál
 * - createProgressiveTurningStairs() - Každý schod se postupně zatočí
 */

import { THREE } from '../three.js';

export const StadiumBuilderStadiumProgressiveTurningStairs = {
  
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

  // 🌀 Vytvoření progresivně se zatáčejících schodů (každý schod se postupně zatočí)
  createProgressiveTurningStairs(position, options = {}) {
    console.log(`🌀 Creating progressive turning stairs with options:`, options);
    
    const stairsGroup = new THREE.Group();
    
    // 📏 PARAMETRY PROGRESIVNÍCH SCHODŮ
    const config = {
      stepCount: options.stepCount || 8,
      stepWidth: options.stepWidth || 4,
      stepDepth: options.stepDepth || 0.8,
      stepHeight: options.stepHeight || 0.3,
      rotation: options.rotation || 0,
      
      // 🌀 NOVÉ PARAMETRY PRO PROGRESIVNÍ ZATÁČENÍ
      totalTurnAngle: options.totalTurnAngle || Math.PI/2, // Celkový úhel zatočení (90° default)
      
      scale: {
        x: options.scaleX || 1,
        y: options.scaleY || 1,
        z: options.scaleZ || 1
      }
    };
    
    console.log(`🌀 Progressive turning stairs config:`, config);

    const concreteMaterial = this.createConcreteMaterial();
    
    // 🧱 VYTVOŘENÍ PROGRESIVNĚ SE ZATÁČEJÍCÍCH SCHODŮ
    let currentX = 0;
    let currentZ = 0;
    
    for (let i = 0; i < config.stepCount; i++) {
      // 🌀 POSTUPNÉ ZATÁČENÍ - každý schod se zatočí o (totalAngle/stepCount)
      const stepProgress = i / (config.stepCount - 1); // 0 až 1
      const currentAngle = stepProgress * config.totalTurnAngle;
      
      const step = new THREE.Mesh(
        new THREE.BoxGeometry(config.stepWidth, config.stepHeight, config.stepDepth),
        concreteMaterial
      );
      
      const yPos = i * config.stepHeight;
      
      // 📍 POZICE PODLE POSTUPNÉHO ZATÁČENÍ
      if (i > 0) {
        // Předchozí úhel pro výpočet směru
        const prevAngle = (i - 1) / (config.stepCount - 1) * config.totalTurnAngle;
        currentX += Math.sin(prevAngle) * config.stepDepth;
        currentZ += Math.cos(prevAngle) * config.stepDepth;
      }
      
      step.position.set(currentX, yPos + config.stepHeight/2, currentZ);
      step.rotation.y = currentAngle; // Každý schod má svou rotaci
      step.castShadow = true;
      step.receiveShadow = true;
      stairsGroup.add(step);
      
      // 🔲 Hrany na schodech
      if (i > 0) {
        const edge = new THREE.Mesh(
          new THREE.BoxGeometry(config.stepWidth, 0.05, 0.05),
          new THREE.MeshStandardMaterial({ color: 0x666666, roughness: 0.8 })
        );
        edge.position.copy(step.position);
        edge.position.y = yPos + config.stepHeight;
        edge.rotation.y = currentAngle;
        edge.castShadow = true;
        stairsGroup.add(edge);
      }
    }
    
    // 🏗️ PILÍŘE PRO PROGRESIVNÍ SCHODY (jednodušší)
    const pillarWidth = 0.4;
    const pillarDepth = 0.4;
    const pillarCount = Math.max(2, Math.floor(config.stepCount / 3));
    
    for (let i = 0; i < pillarCount; i++) {
      const progress = i / (pillarCount - 1);
      const pillarStep = Math.floor(progress * (config.stepCount - 1));
      const pillarAngle = (pillarStep / (config.stepCount - 1)) * config.totalTurnAngle;
      
      // Spočítej pozici pilíře
      let pillarX = 0;
      let pillarZ = 0;
      for (let j = 1; j <= pillarStep; j++) {
        const prevAngle = (j - 1) / (config.stepCount - 1) * config.totalTurnAngle;
        pillarX += Math.sin(prevAngle) * config.stepDepth;
        pillarZ += Math.cos(prevAngle) * config.stepDepth;
      }
      
      const maxHeight = pillarStep * config.stepHeight;
      
      if (maxHeight > 0) {
        // Levý a pravý pilíř
        for (let side = -1; side <= 1; side += 2) {
          const offsetX = Math.cos(pillarAngle) * side * config.stepWidth/3;
          const offsetZ = -Math.sin(pillarAngle) * side * config.stepWidth/3;
          
          const pillar = new THREE.Mesh(
            new THREE.BoxGeometry(pillarWidth, maxHeight, pillarDepth),
            concreteMaterial
          );
          pillar.position.set(pillarX + offsetX, maxHeight/2, pillarZ + offsetZ);
          pillar.rotation.y = pillarAngle;
          pillar.castShadow = true;
          pillar.receiveShadow = true;
          stairsGroup.add(pillar);
        }
      }
    }
    
    // 🔄 APLIKACE TRANSFORMACÍ
    stairsGroup.position.copy(position);
    stairsGroup.rotation.y = config.rotation;
    stairsGroup.scale.set(config.scale.x, config.scale.y, config.scale.z);
    
    console.log(`✅ Progressive turning stairs created with total turn of ${config.totalTurnAngle} radians`);
    
    return stairsGroup;
  }
};