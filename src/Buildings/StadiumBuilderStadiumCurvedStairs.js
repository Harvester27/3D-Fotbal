/**
 * StadiumBuilderStadiumCurvedStairs.js - PERFEKTNĚ HLADKÉ ROHOVÉ SCHODY
 * 
 * Každá řada je JEDEN zakřivený kus - úplně hladké!
 * UPRAVENO: Pivot point je na začátku oblouku pro snadné umisťování
 */

import { THREE } from '../three.js';

export const StadiumBuilderStadiumCurvedStairs = {
  
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

  // 🏟️ PERFEKTNĚ HLADKÉ ROHOVÉ SCHODY - S PIVOT POINTEM NA ZAČÁTKU
  createCurvedStairs(position, options = {}) {
    console.log(`🏟️ Creating SMOOTH corner stairs with pivot at start, options:`, options);
    
    // Vytvoř GROUP pro celé schody
    const stairsGroup = new THREE.Group();
    
    // 🔗 Ulož metadata pro snapping systém
    stairsGroup.userData = {
      elementType: 'curved_stairs',
      snapToConcreteStairs: true,
      stepCount: options.stepCount || 8,
      stepDepth: options.stepDepth || 0.8,
      innerRadius: options.innerRadius !== undefined ? options.innerRadius : 0
    };
    
    // 📏 PARAMETRY - stejné jako u betonových schodů
    const config = {
      stepCount: options.stepCount || 8,          // Počet řad (výška) - STEJNÉ
      stepWidth: options.stepWidth || 4,          // Šířka betonových schodů (není použito přímo)
      stepDepth: options.stepDepth || 0.8,        // Hloubka schodu - STEJNÉ
      stepHeight: options.stepHeight || 0.3,      // Výška schodu - STEJNÉ
      
      // 🏟️ PARAMETRY OBLOUKU
      innerRadius: options.innerRadius !== undefined ? options.innerRadius : 0,
      cornerAngle: options.cornerAngle || Math.PI/2,  // 90° roh
      
      rotation: options.rotation || 0
    };

    console.log(`📐 Pivot alignment: innerRadius=${config.innerRadius}, pivot at (0,0)`);

    // Vytvoř vnitřní group pro geometrii (ta bude posunuta)
    const geometryGroup = new THREE.Group();
    
    const concreteMaterial = this.createConcreteMaterial();
    
    // 🧱 VYTVOŘENÍ HLADKÝCH ZAKŘIVENÝCH SCHODŮ
    
    // Pro každou řadu vytvoř JEDEN zakřivený schod
    for (let row = 0; row < config.stepCount; row++) {
      
      // Poloměry pro vnitřní a vnější hranu
      const innerRadius = config.innerRadius + (row * config.stepDepth);
      const outerRadius = config.innerRadius + ((row + 1) * config.stepDepth);
      
      // Speciální případ pro první schod, když innerRadius = 0
      if (innerRadius < 0.1) {
        // Vytvoř výseč místo prstence
        const shape = new THREE.Shape();
        
        // Začni ve středu (0,0)
        shape.moveTo(0, 0);
        
        // Oblouk po vnějším okraji
        const curvePoints = 50;
        for (let i = 0; i <= curvePoints; i++) {
          const angle = (i / curvePoints) * config.cornerAngle;
          const x = Math.cos(angle) * outerRadius;
          const y = Math.sin(angle) * outerRadius;
          shape.lineTo(x, y);
        }
        
        // Zpět do středu
        shape.lineTo(0, 0);
        shape.closePath();
        
        const extrudeSettings = {
          depth: config.stepHeight,
          bevelEnabled: true,
          bevelThickness: 0.02,
          bevelSize: 0.02,
          bevelSegments: 2
        };
        
        const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        const step = new THREE.Mesh(geometry, concreteMaterial);
        
        step.position.set(0, row * config.stepHeight, 0);
        step.rotation.x = -Math.PI / 2;
        step.castShadow = true;
        step.receiveShadow = true;
        geometryGroup.add(step);
        
      } else {
        // Normální prstencový tvar pro ostatní schody
        const shape = new THREE.Shape();
        
        // Počet bodů pro hladkou křivku
        const curvePoints = 50;
        
        // Vnitřní oblouk
        for (let i = 0; i <= curvePoints; i++) {
          const angle = (i / curvePoints) * config.cornerAngle;
          const x = Math.cos(angle) * innerRadius;
          const y = Math.sin(angle) * innerRadius;
          
          if (i === 0) {
            shape.moveTo(x, y);
          } else {
            shape.lineTo(x, y);
          }
        }
        
        // Spojovací čára na vnější okraj
        const endAngle = config.cornerAngle;
        shape.lineTo(
          Math.cos(endAngle) * outerRadius,
          Math.sin(endAngle) * outerRadius
        );
        
        // Vnější oblouk (zpět)
        for (let i = curvePoints; i >= 0; i--) {
          const angle = (i / curvePoints) * config.cornerAngle;
          const x = Math.cos(angle) * outerRadius;
          const y = Math.sin(angle) * outerRadius;
          shape.lineTo(x, y);
        }
        
        // Uzavři tvar
        shape.closePath();
        
        // Vytvoř 3D geometrii
        const extrudeSettings = {
          depth: config.stepHeight,
          bevelEnabled: true,
          bevelThickness: 0.02,
          bevelSize: 0.02,
          bevelSegments: 2
        };
        
        const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        const step = new THREE.Mesh(geometry, concreteMaterial);
        
        // Pozice a rotace
        step.position.set(0, row * config.stepHeight, 0);
        step.rotation.x = -Math.PI / 2;
        
        step.castShadow = true;
        step.receiveShadow = true;
        geometryGroup.add(step);
      }
      
      // 🧱 VÝPLŇ POD SCHODEM (pouze pokud je innerRadius > 0)
      if (row > 0 && config.innerRadius > 0.1) {
        const fillShape = new THREE.Shape();
        const fillInnerRadius = Math.max(0.1, innerRadius - config.stepDepth * 0.5);
        const fillOuterRadius = fillInnerRadius + config.stepDepth;
        
        // Vytvoř výplňový tvar
        const curvePoints = 50;
        for (let i = 0; i <= curvePoints; i++) {
          const angle = (i / curvePoints) * config.cornerAngle;
          const x = Math.cos(angle) * fillInnerRadius;
          const y = Math.sin(angle) * fillInnerRadius;
          
          if (i === 0) {
            fillShape.moveTo(x, y);
          } else {
            fillShape.lineTo(x, y);
          }
        }
        
        fillShape.lineTo(
          Math.cos(config.cornerAngle) * fillOuterRadius,
          Math.sin(config.cornerAngle) * fillOuterRadius
        );
        
        for (let i = curvePoints; i >= 0; i--) {
          const angle = (i / curvePoints) * config.cornerAngle;
          const x = Math.cos(angle) * fillOuterRadius;
          const y = Math.sin(angle) * fillOuterRadius;
          fillShape.lineTo(x, y);
        }
        
        fillShape.closePath();
        
        const fillGeometry = new THREE.ExtrudeGeometry(fillShape, {
          depth: config.stepHeight,
          bevelEnabled: false
        });
        
        const fill = new THREE.Mesh(fillGeometry, concreteMaterial);
        fill.position.set(0, (row - 1) * config.stepHeight + config.stepHeight * 0.5, 0);
        fill.rotation.x = -Math.PI / 2;
        fill.castShadow = true;
        geometryGroup.add(fill);
      }
    }
    
    // 🏗️ ZAKŘIVENÉ PILÍŘE
    const pillarAngles = [config.cornerAngle/4, config.cornerAngle/2, 3*config.cornerAngle/4];
    
    pillarAngles.forEach(angle => {
      // Pilíře na vnějším okraji
      const backRadius = config.innerRadius + (config.stepCount * config.stepDepth);
      const x = Math.cos(angle) * backRadius;
      const z = Math.sin(angle) * backRadius;
      const height = config.stepCount * config.stepHeight;
      
      const pillar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.2, height, 16),
        concreteMaterial
      );
      
      pillar.position.set(x, height/2, z);
      pillar.castShadow = true;
      geometryGroup.add(pillar);
      
      // Vnitřní podpory pouze pokud je dost místa
      if (config.innerRadius > 1) {
        const innerSupportRadius = config.innerRadius + (config.stepCount * config.stepDepth * 0.3);
        const innerX = Math.cos(angle) * innerSupportRadius;
        const innerZ = Math.sin(angle) * innerSupportRadius;
        const innerHeight = config.stepCount * config.stepHeight * 0.7;
        
        const innerPillar = new THREE.Mesh(
          new THREE.CylinderGeometry(0.15, 0.15, innerHeight, 16),
          concreteMaterial
        );
        
        innerPillar.position.set(innerX, innerHeight/2, innerZ);
        innerPillar.castShadow = true;
        geometryGroup.add(innerPillar);
      }
    });
    
    // 🎯 DŮLEŽITÉ: Přidej geometryGroup do stairsGroup
    stairsGroup.add(geometryGroup);
    
    // 🔄 APLIKACE TRANSFORMACÍ na hlavní group
    stairsGroup.position.copy(position);
    stairsGroup.rotation.y = config.rotation;
    
    console.log(`✅ Corner stairs with pivot at start created! Position: (${position.x}, ${position.z})`);
    
    // 💡 POMOCNÝ BOD pro debug - ukaž kde je pivot point (můžeš smazat v produkci)
    if (options.showPivot) {
      const pivotMarker = new THREE.Mesh(
        new THREE.SphereGeometry(0.2, 16, 16),
        new THREE.MeshBasicMaterial({ color: 0xff0000 })
      );
      pivotMarker.position.set(0, 0.5, 0);
      stairsGroup.add(pivotMarker);
    }
    
    return stairsGroup;
  }
};