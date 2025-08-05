/**
 * StadiumBuilderStadium.js - STADIUM OBJEKTY (HLAVNÍ SOUBOR)
 * 
 * OBSAH:
 * - createSmallStand() - Malá dřevěná tribuna pro 50 lidí
 * - createLargeStand() - Velká betonová tribuna pro 200 lidí
 * - createFence() - Kovové zábradlí 4m
 * - createCornerFence() - L-shaped rohové zábradlí
 * - createFloodlight() - Vysoký stožár s reflektory
 * - getStairSeatPositions() - Utility pro pozice sedaček na schodech
 * - findNearestSeatPosition() - Najde nejbližší pozici sedačky
 * - createElement() - Hlavní metoda pro vytvoření prvku stadionu
 * 
 * IMPORTY:
 * - StadiumBuilderStadiumConcreteStairs - Betonové schody
 * - StadiumBuilderStadiumCurvedStairs - Obloukové schody
 * - StadiumBuilderStadiumWidthDividedStairs - Schody rozdělené na šířku
 * - StadiumBuilderStadiumProgressiveTurningStairs - Progresivně se zatáčející schody
 * - StadiumBuilderStadiumIndividualSeat - Individuální sedačky
 * 
 * PODPOROVANÉ TYPY:
 * - small_stand, large_stand, fence, corner_fence, floodlight
 * - concrete_stairs, curved_stairs, turning_stairs (=width_divided), width_divided_stairs, progressive_turning_stairs, individual_seat
 * 
 * POZNÁMKA: Při aktualizaci tohoto souboru aktualizuj i tento popis!
 */

import { THREE } from '../three.js';
import { StadiumBuilderStadiumConcreteStairs } from './StadiumBuilderStadiumConcreteStairs.js';
import { StadiumBuilderStadiumCurvedStairs } from './StadiumBuilderStadiumCurvedStairs.js';
import { StadiumBuilderStadiumWidthDividedStairs } from './StadiumBuilderStadiumWidthDividedStairs.js';
import { StadiumBuilderStadiumProgressiveTurningStairs } from './StadiumBuilderStadiumProgressiveTurningStairs.js';
import { StadiumBuilderStadiumIndividualSeat } from './StadiumBuilderStadiumIndividualSeat.js';

export const StadiumBuilderStadium = {
  
  // 📋 SEZNAM PODPOROVANÝCH TYPŮ
  supportedTypes: [
    'small_stand', 'large_stand', 'fence', 'corner_fence', 
    'floodlight', 'concrete_stairs', 'curved_stairs', 'turning_stairs', 'width_divided_stairs', 'progressive_turning_stairs', 'individual_seat'
  ],

  // ✅ KONTROLA, zda modul podporuje daný typ
  hasElement(elementType) {
    return this.supportedTypes.includes(elementType);
  },

  // 🏟️ Vytvoření malé tribuny
  createSmallStand(position) {
    const standGroup = new THREE.Group();
    
    // Dřevěná konstrukce
    const woodMaterial = new THREE.MeshStandardMaterial({
      color: 0x8B4513,
      roughness: 0.8,
      metalness: 0.1
    });
    
    // Podlaha tribuny
    const platform = new THREE.Mesh(
      new THREE.BoxGeometry(8, 0.3, 4),
      woodMaterial
    );
    platform.position.y = 2;
    platform.castShadow = true;
    platform.receiveShadow = true;
    standGroup.add(platform);
    
    // Pilíře
    for (let i = 0; i < 3; i++) {
      const pillar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.15, 0.15, 4, 8),
        woodMaterial
      );
      pillar.position.set((i - 1) * 3, 1, 0);
      pillar.castShadow = true;
      standGroup.add(pillar);
    }
    
    // Zábradlí
    const railing = new THREE.Mesh(
      new THREE.BoxGeometry(8, 0.1, 0.1),
      new THREE.MeshStandardMaterial({ color: 0x654321 })
    );
    railing.position.set(0, 2.8, 2);
    standGroup.add(railing);
    
    // Schody
    for (let i = 0; i < 4; i++) {
      const step = new THREE.Mesh(
        new THREE.BoxGeometry(2, 0.2, 0.8),
        woodMaterial
      );
      step.position.set(0, i * 0.5, -2 + i * 0.3);
      step.castShadow = true;
      standGroup.add(step);
    }
    
    standGroup.position.copy(position);
    return standGroup;
  },

  // 🏛️ Vytvoření velkého stojanu
  createLargeStand(position) {
    const standGroup = new THREE.Group();
    
    const concreteMaterial = new THREE.MeshStandardMaterial({
      color: 0x999999,
      roughness: 0.9,
      metalness: 0.1
    });
    
    const metalMaterial = new THREE.MeshStandardMaterial({
      color: 0x444444,
      roughness: 0.3,
      metalness: 0.8
    });
    
    // Hlavní betonová struktura
    const mainStructure = new THREE.Mesh(
      new THREE.BoxGeometry(12, 0.5, 6),
      concreteMaterial
    );
    mainStructure.position.y = 3;
    mainStructure.castShadow = true;
    mainStructure.receiveShadow = true;
    standGroup.add(mainStructure);
    
    // Kovové pilíře
    for (let i = 0; i < 4; i++) {
      const pillar = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 6, 0.3),
        metalMaterial
      );
      pillar.position.set(
        (i % 2 === 0 ? -5.5 : 5.5),
        1.5,
        (i < 2 ? -2.5 : 2.5)
      );
      pillar.castShadow = true;
      standGroup.add(pillar);
    }
    
    // Střecha
    const roof = new THREE.Mesh(
      new THREE.BoxGeometry(14, 0.2, 8),
      metalMaterial
    );
    roof.position.y = 6;
    roof.castShadow = true;
    standGroup.add(roof);
    
    // Sedačky (simulované jako kostky)
    const seatMaterial = new THREE.MeshStandardMaterial({
      color: 0x0066cc,
      roughness: 0.7
    });
    
    for (let row = 0; row < 3; row++) {
      for (let seat = 0; seat < 20; seat++) {
        const seatMesh = new THREE.Mesh(
          new THREE.BoxGeometry(0.5, 0.1, 0.4),
          seatMaterial
        );
        seatMesh.position.set(
          -5 + seat * 0.5,
          3.2 + row * 0.3,
          -2 + row * 0.5
        );
        standGroup.add(seatMesh);
      }
    }
    
    standGroup.position.copy(position);
    return standGroup;
  },

  // 🛡️ Vytvoření zábradlí
  createFence(position) {
    const fenceGroup = new THREE.Group();
    
    const fenceMaterial = new THREE.MeshStandardMaterial({
      color: 0x333333,
      roughness: 0.6,
      metalness: 0.8
    });
    
    // Sloupky
    for (let i = 0; i < 5; i++) {
      const post = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.05, 1.5, 8),
        fenceMaterial
      );
      post.position.set((i - 2) * 1, 0.75, 0);
      post.castShadow = true;
      fenceGroup.add(post);
    }
    
    // Horizontální tyče
    for (let i = 0; i < 3; i++) {
      const rail = new THREE.Mesh(
        new THREE.CylinderGeometry(0.03, 0.03, 4, 8),
        fenceMaterial
      );
      rail.rotation.z = Math.PI / 2;
      rail.position.set(0, 0.4 + i * 0.4, 0);
      rail.castShadow = true;
      fenceGroup.add(rail);
    }
    
    fenceGroup.position.copy(position);
    return fenceGroup;
  },

  // 📐 Vytvoření rohového zábradlí
  createCornerFence(position) {
    const cornerGroup = new THREE.Group();
    
    const fenceMaterial = new THREE.MeshStandardMaterial({
      color: 0x333333,
      roughness: 0.6,
      metalness: 0.8
    });
    
    // Rohový sloupek
    const cornerPost = new THREE.Mesh(
      new THREE.CylinderGeometry(0.07, 0.07, 1.5, 8),
      fenceMaterial
    );
    cornerPost.position.set(0, 0.75, 0);
    cornerPost.castShadow = true;
    cornerGroup.add(cornerPost);
    
    // Dvě kolmé sekce zábradlí
    for (let side = 0; side < 2; side++) {
      const rail = new THREE.Mesh(
        new THREE.CylinderGeometry(0.03, 0.03, 2, 8),
        fenceMaterial
      );
      rail.rotation.z = side === 0 ? Math.PI / 2 : 0;
      rail.rotation.y = side === 0 ? 0 : Math.PI / 2;
      rail.position.set(
        side === 0 ? 1 : 0,
        1,
        side === 0 ? 0 : 1
      );
      rail.castShadow = true;
      cornerGroup.add(rail);
    }
    
    cornerGroup.position.copy(position);
    return cornerGroup;
  },

  // 💡 Vytvoření reflektoru
  createFloodlight(position) {
    const lightGroup = new THREE.Group();
    
    const poleMaterial = new THREE.MeshStandardMaterial({
      color: 0x666666,
      roughness: 0.4,
      metalness: 0.7
    });
    
    // Stožár
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15, 0.2, 8, 12),
      poleMaterial
    );
    pole.position.y = 4;
    pole.castShadow = true;
    lightGroup.add(pole);
    
    // Platforma pro světla
    const platform = new THREE.Mesh(
      new THREE.CylinderGeometry(1, 0.8, 0.3, 8),
      poleMaterial
    );
    platform.position.y = 8;
    platform.castShadow = true;
    lightGroup.add(platform);
    
    // Světla
    const lightMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffaa,
      emissive: 0xffffaa,
      emissiveIntensity: 0.5
    });
    
    for (let i = 0; i < 4; i++) {
      const light = new THREE.Mesh(
        new THREE.CylinderGeometry(0.3, 0.2, 0.4, 8),
        lightMaterial
      );
      const angle = (i / 4) * Math.PI * 2;
      light.position.set(
        Math.cos(angle) * 0.6,
        8.2,
        Math.sin(angle) * 0.6
      );
      light.rotation.x = Math.PI / 4;
      lightGroup.add(light);
      
      // Přidej skutečné světlo
      const spotLight = new THREE.SpotLight(0xffffff, 0.8, 50, Math.PI / 6, 0.5);
      spotLight.position.copy(light.position);
      spotLight.target.position.set(0, 0, 0);
      spotLight.castShadow = true;
      lightGroup.add(spotLight);
      lightGroup.add(spotLight.target);
    }
    
    lightGroup.position.copy(position);
    return lightGroup;
  },

  // ✅ AKTUALIZOVANÁ FUNKCE: Získání pozic sedaček na schodech
  getStairSeatPositions(stairElement) {
    if (!stairElement || !['concrete_stairs', 'curved_stairs', 'turning_stairs', 'width_divided_stairs', 'progressive_turning_stairs'].includes(stairElement.type)) {
      return [];
    }

    const positions = [];
    const stairPosition = stairElement.position;
    const stairRotation = stairElement.rotation || 0;
    
    // Parametry schodů - nyní z options pokud jsou dostupné
    const config = stairElement.config || {
      stepCount: 8,
      stepWidth: 4,
      stepDepth: 0.8,
      stepHeight: 0.3,
      turnAt: Math.floor(8 / 2),
      turnAngle: Math.PI/2,
      rightWidth: 2,
      centerWidth: 2,
      leftWidth: 2
    };
    
    if (stairElement.type === 'width_divided_stairs' || stairElement.type === 'turning_stairs') {
      // 🔄 SCHODY ROZDĚLENÉ NA ŠÍŘKU - sedačky pro pravou a levou stranu
      for (let step = 1; step < config.stepCount; step++) {
        const yPos = step * config.stepHeight + config.stepHeight;
        const zPos = step * config.stepDepth - config.stepDepth/3;
        
        // Sedačky na pravé straně (rovné)
        const rightSeatsPerStep = Math.floor(config.rightWidth / 0.5);
        for (let seat = 0; seat < rightSeatsPerStep; seat++) {
          const seatOffset = (seat - (rightSeatsPerStep - 1) / 2) * 0.5;
          const seatX = -config.centerWidth/2 - config.rightWidth/2 + seatOffset;
          
          const localPos = new THREE.Vector3(seatX, yPos, zPos);
          localPos.applyAxisAngle(new THREE.Vector3(0, 1, 0), stairRotation);
          const globalPos = localPos.add(stairPosition);
          
          positions.push({
            position: globalPos.clone(),
            stepIndex: step,
            seatIndex: seat,
            side: 'right',
            rotation: stairRotation + Math.PI
          });
        }
        
        // Sedačky na levé straně (otočené)
        const leftSeatsPerStep = Math.floor(config.leftWidth / 0.5);
        for (let seat = 0; seat < leftSeatsPerStep; seat++) {
          const seatOffset = (seat - (leftSeatsPerStep - 1) / 2) * 0.5;
          const seatX = config.centerWidth/2 + config.leftWidth/2 + seatOffset;
          
          const localPos = new THREE.Vector3(seatX, yPos, zPos);
          localPos.applyAxisAngle(new THREE.Vector3(0, 1, 0), stairRotation);
          const globalPos = localPos.add(stairPosition);
          
          positions.push({
            position: globalPos.clone(),
            stepIndex: step,
            seatIndex: seat,
            side: 'left',
            rotation: stairRotation + config.turnAngle + Math.PI
          });
        }
      }
    } else {
      // ROVNÉ SCHODY (concrete_stairs, curved_stairs, progressive_turning_stairs)
      for (let step = 1; step < config.stepCount; step++) { 
        const yPos = step * config.stepHeight + config.stepHeight;
        const zPos = step * config.stepDepth - config.stepDepth/3;
        
        const seatsPerStep = Math.floor(config.stepWidth / 0.5);
        
        for (let seat = 0; seat < seatsPerStep; seat++) {
          const xOffset = (seat - (seatsPerStep - 1) / 2) * 0.5;
          
          if (Math.abs(xOffset) < config.stepWidth / 2 - 0.2) {
            const localPos = new THREE.Vector3(xOffset, yPos, zPos);
            localPos.applyAxisAngle(new THREE.Vector3(0, 1, 0), stairRotation);
            const globalPos = localPos.add(stairPosition);
            
            positions.push({
              position: globalPos.clone(),
              stepIndex: step,
              seatIndex: seat,
              rotation: stairRotation + Math.PI
            });
          }
        }
      }
    }
    
    return positions;
  },

  // ✅ NOVÁ FUNKCE: Nalezení nejbližší pozice sedačky
  findNearestSeatPosition(targetPosition, stairElement, tolerance = 1.0) {
    const seatPositions = this.getStairSeatPositions(stairElement);
    
    let nearest = null;
    let minDistance = Infinity;
    
    for (const seatPos of seatPositions) {
      const distance = targetPosition.distanceTo(seatPos.position);
      if (distance < tolerance && distance < minDistance) {
        minDistance = distance;
        nearest = seatPos;
      }
    }
    
    return nearest;
  },

  // 🏗️ HLAVNÍ METODA pro vytvoření prvku stadionu
  createElement(elementType, position, options = {}) {
    console.log(`🏟️ StadiumBuilderStadium.createElement: ${elementType}`);
    
    switch (elementType) {
      case 'small_stand':
        return this.createSmallStand(position);
      case 'large_stand':
        return this.createLargeStand(position);
      case 'fence':
        return this.createFence(position);
      case 'corner_fence':
        return this.createCornerFence(position);
      case 'floodlight':
        return this.createFloodlight(position);
      case 'concrete_stairs':
        return StadiumBuilderStadiumConcreteStairs.createConcreteStairs(position, options);
      case 'curved_stairs':
        console.log(`🌀 Creating curved stairs with options:`, options);
        return StadiumBuilderStadiumCurvedStairs.createCurvedStairs(position, options);
      case 'turning_stairs':
        console.log(`🔄 Creating width-divided turning stairs with options:`, options);
        return StadiumBuilderStadiumWidthDividedStairs.createWidthDividedStairs(position, options);
      case 'width_divided_stairs':
        console.log(`🔄 Creating width-divided stairs with options:`, options);
        return StadiumBuilderStadiumWidthDividedStairs.createWidthDividedStairs(position, options);
      case 'progressive_turning_stairs':
        console.log(`🌀 Creating progressive turning stairs with options:`, options);
        return StadiumBuilderStadiumProgressiveTurningStairs.createProgressiveTurningStairs(position, options);
      case 'individual_seat':
        console.log(`🪑 Creating individual seat with full options:`, options);
        return StadiumBuilderStadiumIndividualSeat.createIndividualSeat(
          position,
          options.seatType || 'plastic',
          options.seatColor || 'blue',
          options.rotation || 0
        );
      default:
        console.warn(`❌ StadiumBuilderStadium: Neznámý typ prvku: ${elementType}`);
        return null;
    }
  }
};