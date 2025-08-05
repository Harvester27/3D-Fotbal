/**
 * StadiumBuilderSculpting.js - TERÉNNÍ ÚTVARY (KOPCE, ÚDOLÍ, VULKÁNY)
 * 
 * OBSAH:
 * - createHillSmall() - Malý travnatý kopec 10x10m s kameny
 * - createHillLarge() - Velký kopec 15x15m se stromy
 * - createValleySmall() - Malé údolí 12x8m s potůčkem
 * - createPlateau() - Rovná vyvýšenina 15x10m se strmými stěnami
 * - createCanyon() - Hluboká strž 20x5m s říčkou na dně
 * - createVolcano() - Kónický vulkán s kráterem a lávovými toky
 * - createCrater() - Velký kráter 12m průměr s vyvýšenými okraji
 * - createRidge() - Ostrý horský hřeben 15x3m se sněhem na vrcholcích
 * 
 * PODPOROVANÉ TYPY:
 * - hill_small, hill_large, valley_small, plateau
 * - canyon, volcano, crater, ridge
 * 
 * GEOMETRIE: Používá procedurální generování terénu s Gaussovými funkcemi
 * 
 * POZNÁMKA: Při aktualizaci tohoto souboru aktualizuj i tento popis!
 */

import { THREE } from '../three.js';

export const StadiumBuilderSculpting = {
  
  // 📋 SEZNAM PODPOROVANÝCH TYPŮ
  supportedTypes: [
    'hill_small', 'hill_large', 'valley_small', 'plateau',
    'canyon', 'volcano', 'crater', 'ridge'
  ],

  // ✅ KONTROLA, zda modul podporuje daný typ
  hasElement(elementType) {
    return this.supportedTypes.includes(elementType);
  },

  // ⛰️ Malý kopec
  createHillSmall(position) {
    const hillGroup = new THREE.Group();
    
    const grassMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x3d6b1f,
      roughness: 0.9
    });
    
    // Vytvoř kopec s proceduální geometrií
    const geometry = new THREE.PlaneGeometry(10, 10, 40, 40);
    const positions = geometry.attributes.position;
    
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      
      // Gaussova funkce pro kopec - nejvyšší uprostřed
      const distance = Math.sqrt(x*x + y*y);
      const height = Math.max(0, 3 * Math.exp(-distance*distance / 8));
      
      positions.setZ(i, height);
    }
    
    geometry.computeVertexNormals();
    
    const hill = new THREE.Mesh(geometry, grassMaterial);
    hill.rotation.x = -Math.PI / 2;
    hill.castShadow = true;
    hill.receiveShadow = true;
    hillGroup.add(hill);
    
    // Přidej pár kamenů na kopec
    const rockMaterial = new THREE.MeshStandardMaterial({ color: 0x696969 });
    for (let i = 0; i < 3; i++) {
      const rock = new THREE.Mesh(
        new THREE.SphereGeometry(0.2 + Math.random() * 0.3, 6, 4),
        rockMaterial
      );
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 3;
      rock.position.set(
        Math.cos(angle) * radius,
        2.5 - radius * 0.3, // Výš na vrcholu
        Math.sin(angle) * radius
      );
      rock.castShadow = true;
      hillGroup.add(rock);
    }
    
    hillGroup.position.copy(position);
    return hillGroup;
  },

  // 🏔️ Velký kopec
  createHillLarge(position) {
    const hillGroup = new THREE.Group();
    
    const grassMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x2d5016,
      roughness: 0.9
    });
    
    const geometry = new THREE.PlaneGeometry(15, 15, 60, 60);
    const positions = geometry.attributes.position;
    
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      
      // Složitější profil s více vrcholy
      const distance = Math.sqrt(x*x + y*y);
      const height = Math.max(0, 5 * Math.exp(-distance*distance / 15) + 
                                Math.sin(x * 0.3) * Math.cos(y * 0.3) * 0.5);
      
      positions.setZ(i, height);
    }
    
    geometry.computeVertexNormals();
    
    const hill = new THREE.Mesh(geometry, grassMaterial);
    hill.rotation.x = -Math.PI / 2;
    hill.castShadow = true;
    hill.receiveShadow = true;
    hillGroup.add(hill);
    
    // Přidej stromy na kopec
    const treeMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
    const foliageMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 });
    
    for (let i = 0; i < 5; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 2 + Math.random() * 4;
      const treeHeight = 4 - radius * 0.3; // Vyšší stromy níž
      
      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.15, 2, 6),
        treeMaterial
      );
      trunk.position.set(
        Math.cos(angle) * radius,
        treeHeight - 0.5,
        Math.sin(angle) * radius
      );
      trunk.castShadow = true;
      hillGroup.add(trunk);
      
      const foliage = new THREE.Mesh(
        new THREE.SphereGeometry(0.8, 8, 6),
        foliageMaterial
      );
      foliage.position.copy(trunk.position);
      foliage.position.y += 1.5;
      foliage.castShadow = true;
      hillGroup.add(foliage);
    }
    
    hillGroup.position.copy(position);
    return hillGroup;
  },

  // 🕳️ Malé údolí
  createValleySmall(position) {
    const valleyGroup = new THREE.Group();
    
    const grassMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x4a7c26,
      roughness: 0.9
    });
    
    const geometry = new THREE.PlaneGeometry(12, 8, 50, 30);
    const positions = geometry.attributes.position;
    
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      
      // Inverzní gaussova pro údolí - nejnižší uprostřed
      const distance = Math.sqrt(x*x/16 + y*y/4); // Eliptické údolí
      const height = -Math.max(0, 2 * Math.exp(-distance*distance / 4));
      
      positions.setZ(i, height);
    }
    
    geometry.computeVertexNormals();
    
    const valley = new THREE.Mesh(geometry, grassMaterial);
    valley.rotation.x = -Math.PI / 2;
    valley.castShadow = true;
    valley.receiveShadow = true;
    valleyGroup.add(valley);
    
    // Přidej potůček uprostřed údolí
    const waterMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x4169E1,
      roughness: 0.1,
      transparent: true,
      opacity: 0.7
    });
    
    const stream = new THREE.Mesh(
      new THREE.PlaneGeometry(8, 0.5),
      waterMaterial
    );
    stream.rotation.x = -Math.PI / 2;
    stream.position.y = -1.8;
    valleyGroup.add(stream);
    
    valleyGroup.position.copy(position);
    return valleyGroup;
  },

  // 🏛️ Plató
  createPlateau(position) {
    const plateauGroup = new THREE.Group();
    
    const rockMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x8B7355,
      roughness: 0.9
    });
    
    const grassMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x228B22,
      roughness: 0.9
    });
    
    // Základní plató - plochá vrchní část
    const topGeometry = new THREE.PlaneGeometry(15, 10, 30, 20);
    const topPositions = topGeometry.attributes.position;
    
    for (let i = 0; i < topPositions.count; i++) {
      const x = topPositions.getX(i);
      const y = topPositions.getY(i);
      
      // Mírné nerovnosti na vrcholu
      const height = 3 + (Math.random() - 0.5) * 0.3;
      topPositions.setZ(i, height);
    }
    
    topGeometry.computeVertexNormals();
    
    const plateauTop = new THREE.Mesh(topGeometry, grassMaterial);
    plateauTop.rotation.x = -Math.PI / 2;
    plateauTop.castShadow = true;
    plateauTop.receiveShadow = true;
    plateauGroup.add(plateauTop);
    
    // Strmé stěny plató
    const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x8B7355, roughness: 0.9 });
    
    // Přední stěna
    const frontWall = new THREE.Mesh(
      new THREE.PlaneGeometry(15, 3),
      wallMaterial
    );
    frontWall.position.set(0, 1.5, 5);
    frontWall.castShadow = true;
    plateauGroup.add(frontWall);
    
    // Zadní stěna
    const backWall = new THREE.Mesh(
      new THREE.PlaneGeometry(15, 3),
      wallMaterial
    );
    backWall.position.set(0, 1.5, -5);
    backWall.rotation.y = Math.PI;
    backWall.castShadow = true;
    plateauGroup.add(backWall);
    
    // Boční stěny
    const leftWall = new THREE.Mesh(
      new THREE.PlaneGeometry(10, 3),
      wallMaterial
    );
    leftWall.position.set(-7.5, 1.5, 0);
    leftWall.rotation.y = Math.PI / 2;
    leftWall.castShadow = true;
    plateauGroup.add(leftWall);
    
    const rightWall = new THREE.Mesh(
      new THREE.PlaneGeometry(10, 3),
      wallMaterial
    );
    rightWall.position.set(7.5, 1.5, 0);
    rightWall.rotation.y = -Math.PI / 2;
    rightWall.castShadow = true;
    plateauGroup.add(rightWall);
    
    plateauGroup.position.copy(position);
    return plateauGroup;
  },

  // 🏞️ Kaňon
  createCanyon(position) {
    const canyonGroup = new THREE.Group();
    
    const rockMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xCD853F,
      roughness: 0.9
    });
    
    const geometry = new THREE.PlaneGeometry(20, 5, 80, 20);
    const positions = geometry.attributes.position;
    
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      
      // Vytvořit V-shaped kaňon
      const distanceFromCenter = Math.abs(y);
      const height = distanceFromCenter < 1.5 ? -3 + distanceFromCenter * 2 : 0;
      
      // Přidej nerovnosti
      const noise = (Math.random() - 0.5) * 0.5;
      positions.setZ(i, height + noise);
    }
    
    geometry.computeVertexNormals();
    
    const canyon = new THREE.Mesh(geometry, rockMaterial);
    canyon.rotation.x = -Math.PI / 2;
    canyon.castShadow = true;
    canyon.receiveShadow = true;
    canyonGroup.add(canyon);
    
    // Přidej říčku na dně kaňonu
    const waterMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x4169E1,
      roughness: 0.1,
      transparent: true,
      opacity: 0.8
    });
    
    const river = new THREE.Mesh(
      new THREE.PlaneGeometry(18, 0.8),
      waterMaterial
    );
    river.rotation.x = -Math.PI / 2;
    river.position.y = -2.8;
    canyonGroup.add(river);
    
    canyonGroup.position.copy(position);
    return canyonGroup;
  },

  // 🌋 Vulkán
  createVolcano(position) {
    const volcanoGroup = new THREE.Group();
    
    const lavaMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x8B0000,
      roughness: 0.8,
      emissive: 0x330000,
      emissiveIntensity: 0.3
    });
    
    const rockMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x555555,
      roughness: 0.9
    });
    
    // Kónická základna vulkánu
    const coneGeometry = new THREE.ConeGeometry(6, 4, 16);
    const conePositions = coneGeometry.attributes.position;
    
    // Přidej nerovnosti do kónusu
    for (let i = 0; i < conePositions.count; i++) {
      const x = conePositions.getX(i);
      const y = conePositions.getY(i);
      const z = conePositions.getZ(i);
      
      const noise = (Math.random() - 0.5) * 0.3;
      conePositions.setX(i, x + noise);
      conePositions.setZ(i, z + noise);
    }
    
    coneGeometry.computeVertexNormals();
    
    const volcano = new THREE.Mesh(coneGeometry, rockMaterial);
    volcano.position.y = 2;
    volcano.castShadow = true;
    volcano.receiveShadow = true;
    volcanoGroup.add(volcano);
    
    // Kráter s lávou
    const crater = new THREE.Mesh(
      new THREE.CylinderGeometry(2, 1.5, 0.5, 12),
      lavaMaterial
    );
    crater.position.y = 4;
    volcanoGroup.add(crater);
    
    // Lávové toky
    for (let i = 0; i < 3; i++) {
      const lavaFlow = new THREE.Mesh(
        new THREE.PlaneGeometry(1, 8),
        lavaMaterial
      );
      lavaFlow.rotation.x = -Math.PI / 2;
      lavaFlow.rotation.z = (i / 3) * Math.PI * 2;
      lavaFlow.position.set(
        Math.cos((i / 3) * Math.PI * 2) * 2,
        0.1,
        Math.sin((i / 3) * Math.PI * 2) * 2
      );
      volcanoGroup.add(lavaFlow);
    }
    
    volcanoGroup.position.copy(position);
    return volcanoGroup;
  },

  // 🕳️ Kráter
  createCrater(position) {
    const craterGroup = new THREE.Group();
    
    const dirtMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x8B4513,
      roughness: 0.9
    });
    
    // Kruhový kráter
    const geometry = new THREE.RingGeometry(1, 6, 32);
    const ringMesh = new THREE.Mesh(geometry, dirtMaterial);
    ringMesh.rotation.x = -Math.PI / 2;
    ringMesh.receiveShadow = true;
    craterGroup.add(ringMesh);
    
    // Vyvýšené okraje
    const rimGeometry = new THREE.TorusGeometry(5, 0.8, 8, 16);
    const rim = new THREE.Mesh(rimGeometry, dirtMaterial);
    rim.rotation.x = -Math.PI / 2;
    rim.position.y = 0.5;
    rim.castShadow = true;
    rim.receiveShadow = true;
    craterGroup.add(rim);
    
    // Hluboký střed
    const centerGeometry = new THREE.CylinderGeometry(1, 0.5, 2, 12);
    const center = new THREE.Mesh(centerGeometry, dirtMaterial);
    center.position.y = -1;
    center.receiveShadow = true;
    craterGroup.add(center);
    
    // Roztroušené kameny kolem
    const rockMaterial = new THREE.MeshStandardMaterial({ color: 0x696969 });
    for (let i = 0; i < 8; i++) {
      const rock = new THREE.Mesh(
        new THREE.SphereGeometry(0.3 + Math.random() * 0.4, 6, 4),
        rockMaterial
      );
      const angle = (i / 8) * Math.PI * 2;
      const radius = 6 + Math.random() * 3;
      rock.position.set(
        Math.cos(angle) * radius,
        0.3,
        Math.sin(angle) * radius
      );
      rock.castShadow = true;
      craterGroup.add(rock);
    }
    
    craterGroup.position.copy(position);
    return craterGroup;
  },

  // ⚡ Hřeben
  createRidge(position) {
    const ridgeGroup = new THREE.Group();
    
    const rockMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x696969,
      roughness: 0.9
    });
    
    const geometry = new THREE.PlaneGeometry(15, 3, 60, 12);
    const positions = geometry.attributes.position;
    
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      
      // Ostrý hřeben - nejvyšší uprostřed (y=0)
      const distanceFromRidge = Math.abs(y);
      const height = Math.max(0, 4 - distanceFromRidge * 2.5);
      
      // Přidej ostré špičky
      const spikes = Math.sin(x * 0.8) * 0.5;
      positions.setZ(i, height + spikes);
    }
    
    geometry.computeVertexNormals();
    
    const ridge = new THREE.Mesh(geometry, rockMaterial);
    ridge.rotation.x = -Math.PI / 2;
    ridge.castShadow = true;
    ridge.receiveShadow = true;
    ridgeGroup.add(ridge);
    
    // Přidej sníh na vrcholky
    const snowMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xFFFAFA,
      roughness: 0.9
    });
    
    for (let i = 0; i < 5; i++) {
      const snowPatch = new THREE.Mesh(
        new THREE.SphereGeometry(0.5, 8, 6),
        snowMaterial
      );
      snowPatch.position.set(
        (i - 2) * 3,
        3.5 + Math.random() * 0.5,
        (Math.random() - 0.5) * 0.5
      );
      snowPatch.scale.y = 0.3; // Zploštělý sníh
      ridgeGroup.add(snowPatch);
    }
    
    ridgeGroup.position.copy(position);
    return ridgeGroup;
  },

  // 🏗️ HLAVNÍ METODA pro vytvoření terénního útvaru
  createElement(elementType, position, options = {}) {
    console.log(`🏔️ StadiumBuilderSculpting.createElement: ${elementType}`);
    
    switch (elementType) {
      case 'hill_small':
        return this.createHillSmall(position);
      case 'hill_large':
        return this.createHillLarge(position);
      case 'valley_small':
        return this.createValleySmall(position);
      case 'plateau':
        return this.createPlateau(position);
      case 'canyon':
        return this.createCanyon(position);
      case 'volcano':
        return this.createVolcano(position);
      case 'crater':
        return this.createCrater(position);
      case 'ridge':
        return this.createRidge(position);
      default:
        console.warn(`❌ StadiumBuilderSculpting: Neznámý typ prvku: ${elementType}`);
        return null;
    }
  }
};