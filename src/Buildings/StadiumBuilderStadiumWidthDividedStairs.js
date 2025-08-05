/**
 * StadiumBuilderStadiumWidthDividedStairs.js - SCHODY ROZDĚLENÉ NA ŠÍŘKU
 * 
 * OBSAH:
 * - createConcreteMaterial() - Sdílená funkce pro betonový materiál
 * - createWidthDividedStairs() - Schody rozdělené na šířku (pravá+střed+levá) + VYPLNĚNÉ BETONEM
 */

import { THREE } from '../three.js';

export const StadiumBuilderStadiumWidthDividedStairs = {
  
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

  // 🔄 Vytvoření schodů rozdělených na šířku (pravá strana + střed + levá strana) + VYPLNĚNÉ BETONEM
  createWidthDividedStairs(position, options = {}) {
    console.log(`🔄 Creating width-divided stairs (right side + center + left side) with concrete fill, options:`, options);
    
    const stairsGroup = new THREE.Group();
    
    // 📏 PARAMETRY SCHODŮ ROZDĚLENÝCH NA ŠÍŘKU
    const config = {
      stepCount: options.stepCount || 8,
      stepWidth: options.stepWidth || 6,      // Větší šířka (bude rozdělená na 3 části)
      stepDepth: options.stepDepth || 0.8,
      stepHeight: options.stepHeight || 0.3,
      rotation: options.rotation || 0,
      
      // 🔄 ROZDĚLENÍ ŠÍŘKY
      rightWidth: options.rightWidth || 2,    // Šířka pravé strany
      centerWidth: options.centerWidth || 2,  // Šířka středu (zatáčka)
      leftWidth: options.leftWidth || 2,      // Šířka levé strany
      
      turnAngle: options.turnAngle || Math.PI/2, // O kolik se zatočí levá strana
      
      // 🧱 NOVÝ PARAMETR PRO VYPLNĚNÍ
      fillWithConcrete: options.fillWithConcrete !== false, // Default true
      
      scale: {
        x: options.scaleX || 1,
        y: options.scaleY || 1,
        z: options.scaleZ || 1
      }
    };
    
    console.log(`🔄 Width-divided stairs config:`, config);

    const concreteMaterial = this.createConcreteMaterial();
    
    // 🧱 VYTVOŘENÍ SCHODŮ ROZDĚLENÝCH NA ŠÍŘKU
    for (let i = 0; i < config.stepCount; i++) {
      const yPos = i * config.stepHeight;
      const zPos = i * config.stepDepth;
      
      // 📍 PRAVÁ STRANA - rovné schody
      const rightStep = new THREE.Mesh(
        new THREE.BoxGeometry(config.rightWidth, config.stepHeight, config.stepDepth),
        concreteMaterial
      );
      rightStep.position.set(
        -config.centerWidth/2 - config.rightWidth/2,  // Napravo od středu
        yPos + config.stepHeight/2,
        zPos
      );
      rightStep.rotation.y = 0;  // Rovně
      rightStep.castShadow = true;
      rightStep.receiveShadow = true;
      stairsGroup.add(rightStep);
      
      // 🌀 STŘEDNÍ ČÁST - zatáčecí
      const progress = i / (config.stepCount - 1);  // 0 až 1
      const centerAngle = progress * config.turnAngle;  // Postupné zatáčení
      
      const centerStep = new THREE.Mesh(
        new THREE.BoxGeometry(config.centerWidth, config.stepHeight, config.stepDepth),
        concreteMaterial
      );
      centerStep.position.set(
        0,  // Ve středu
        yPos + config.stepHeight/2,
        zPos
      );
      centerStep.rotation.y = centerAngle;  // Postupné zatáčení
      centerStep.castShadow = true;
      centerStep.receiveShadow = true;
      stairsGroup.add(centerStep);
      
      // 📍 LEVÁ STRANA - rovné schody otočené o 90°
      const leftStep = new THREE.Mesh(
        new THREE.BoxGeometry(config.leftWidth, config.stepHeight, config.stepDepth),
        concreteMaterial
      );
      leftStep.position.set(
        config.centerWidth/2 + config.leftWidth/2,   // Nalevo od středu
        yPos + config.stepHeight/2,
        zPos
      );
      leftStep.rotation.y = config.turnAngle;  // Otočeno o plný úhel
      leftStep.castShadow = true;
      leftStep.receiveShadow = true;
      stairsGroup.add(leftStep);
      
      // 🧱 BETONOVÉ VÝPLNĚ - vyplní mezery mezi schody
      if (config.fillWithConcrete && i > 0) {
        // Výplň mezi pravými schody
        const rightFill = new THREE.Mesh(
          new THREE.BoxGeometry(config.rightWidth, config.stepHeight, config.stepDepth),
          concreteMaterial
        );
        rightFill.position.set(
          -config.centerWidth/2 - config.rightWidth/2,
          (yPos - config.stepHeight) + config.stepHeight/2, // Mezi předchozím a současným
          zPos - config.stepDepth/2
        );
        rightFill.castShadow = true;
        rightFill.receiveShadow = true;
        stairsGroup.add(rightFill);
        
        // Výplň mezi středními schody
        const prevCenterAngle = (i-1) / (config.stepCount - 1) * config.turnAngle;
        const centerFill = new THREE.Mesh(
          new THREE.BoxGeometry(config.centerWidth, config.stepHeight, config.stepDepth),
          concreteMaterial
        );
        centerFill.position.set(
          0,
          (yPos - config.stepHeight) + config.stepHeight/2,
          zPos - config.stepDepth/2
        );
        centerFill.rotation.y = (prevCenterAngle + centerAngle) / 2; // Průměrný úhel
        centerFill.castShadow = true;
        centerFill.receiveShadow = true;
        stairsGroup.add(centerFill);
        
        // Výplň mezi levými schody
        const leftFill = new THREE.Mesh(
          new THREE.BoxGeometry(config.leftWidth, config.stepHeight, config.stepDepth),
          concreteMaterial
        );
        leftFill.position.set(
          config.centerWidth/2 + config.leftWidth/2,
          (yPos - config.stepHeight) + config.stepHeight/2,
          zPos - config.stepDepth/2
        );
        leftFill.rotation.y = config.turnAngle;
        leftFill.castShadow = true;
        leftFill.receiveShadow = true;
        stairsGroup.add(leftFill);
      }
      
      // 🔲 Hrany na schodech
      if (i > 0) {
        // Hrana pro pravou stranu
        const rightEdge = new THREE.Mesh(
          new THREE.BoxGeometry(config.rightWidth, 0.05, 0.05),
          new THREE.MeshStandardMaterial({ color: 0x666666, roughness: 0.8 })
        );
        rightEdge.position.copy(rightStep.position);
        rightEdge.position.y = yPos + config.stepHeight;
        rightEdge.position.z = zPos - config.stepDepth/2;
        stairsGroup.add(rightEdge);
        
        // Hrana pro střední část
        const centerEdge = new THREE.Mesh(
          new THREE.BoxGeometry(config.centerWidth, 0.05, 0.05),
          new THREE.MeshStandardMaterial({ color: 0x666666, roughness: 0.8 })
        );
        centerEdge.position.copy(centerStep.position);
        centerEdge.position.y = yPos + config.stepHeight;
        centerEdge.position.z = zPos - config.stepDepth/2;
        centerEdge.rotation.y = centerAngle;
        stairsGroup.add(centerEdge);
        
        // Hrana pro levou stranu
        const leftEdge = new THREE.Mesh(
          new THREE.BoxGeometry(config.leftWidth, 0.05, 0.05),
          new THREE.MeshStandardMaterial({ color: 0x666666, roughness: 0.8 })
        );
        leftEdge.position.copy(leftStep.position);
        leftEdge.position.y = yPos + config.stepHeight;
        leftEdge.position.z = zPos - config.stepDepth/2;
        leftEdge.rotation.y = config.turnAngle;
        stairsGroup.add(leftEdge);
      }
    }
    
    // 🧱 VELKÝ BETONOVÝ ZÁKLAD POD CELÝMI SCHODY (volitelný)
    if (config.fillWithConcrete) {
      const totalWidth = config.rightWidth + config.centerWidth + config.leftWidth;
      const totalDepth = config.stepCount * config.stepDepth;
      const maxHeight = config.stepCount * config.stepHeight;
      
      const foundation = new THREE.Mesh(
        new THREE.BoxGeometry(totalWidth, maxHeight * 0.8, totalDepth),
        concreteMaterial
      );
      foundation.position.set(
        0,
        maxHeight * 0.4 - config.stepHeight, // Trochu níž než schody
        totalDepth / 2 - config.stepDepth/2
      );
      foundation.castShadow = true;
      foundation.receiveShadow = true;
      stairsGroup.add(foundation);
    }
    
    // 🏗️ PILÍŘE PRO TŘI ČÁSTI
    const pillarWidth = 0.3;
    const pillarDepth = 0.3;
    const maxHeight = config.stepCount * config.stepHeight;
    
    // Pilíře pro pravou stranu
    for (let side = -1; side <= 1; side += 2) {
      const pillar = new THREE.Mesh(
        new THREE.BoxGeometry(pillarWidth, maxHeight * 0.9, pillarDepth),
        concreteMaterial
      );
      pillar.position.set(
        -config.centerWidth/2 - config.rightWidth/2 + side * config.rightWidth/3,
        maxHeight * 0.45,
        config.stepCount * config.stepDepth / 2
      );
      pillar.rotation.y = 0;
      pillar.castShadow = true;
      pillar.receiveShadow = true;
      stairsGroup.add(pillar);
    }
    
    // Pilíře pro levou stranu
    for (let side = -1; side <= 1; side += 2) {
      const pillar = new THREE.Mesh(
        new THREE.BoxGeometry(pillarWidth, maxHeight * 0.9, pillarDepth),
        concreteMaterial
      );
      pillar.position.set(
        config.centerWidth/2 + config.leftWidth/2 + side * config.leftWidth/3,
        maxHeight * 0.45,
        config.stepCount * config.stepDepth / 2
      );
      pillar.rotation.y = config.turnAngle;
      pillar.castShadow = true;
      pillar.receiveShadow = true;
      stairsGroup.add(pillar);
    }
    
    // 🔄 APLIKACE TRANSFORMACÍ
    stairsGroup.position.copy(position);
    stairsGroup.rotation.y = config.rotation;
    stairsGroup.scale.set(config.scale.x, config.scale.y, config.scale.z);
    
    console.log(`✅ Width-divided stairs with concrete fill created: right(${config.rightWidth}) + center(${config.centerWidth}) + left(${config.leftWidth})`);
    
    return stairsGroup;
  }
};