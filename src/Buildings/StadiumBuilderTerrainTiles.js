/**
 * StadiumBuilderTerrainTiles.js - TERÉNNÍ PLOCHY (20x20m ČTVERCE)
 * 
 * OBSAH:
 * - createTerrainGrass() - Zelená travnatá plocha s procedurální texturou
 * - createTerrainDirt() - Hnědá zemní plocha s nerovnostmi
 * - createTerrainSand() - Žlutá písečná plocha s dunami
 * - createTerrainSnow() - Bílá sněhová plocha s návějemi a sněhovými koulemi
 * - createTerrainConcrete() - Šedá betonová plocha s praslinami
 * - createTerrainForest() - Hustý les s náhodnými stromy
 * - createTerrainDesert() - Pouštní plocha s dunami a kaktusy
 * - createTerrainWater() - Vodní plocha s vlnkami
 * 
 * PODPOROVANÉ TYPY:
 * - terrain_grass, terrain_dirt, terrain_sand, terrain_snow
 * - terrain_concrete, terrain_forest, terrain_desert, terrain_water
 * 
 * ROZMĚRY: Všechny plochy jsou 20x20 metrů pro konzistentní rozšiřování mapy
 * 
 * POZNÁMKA: Při aktualizaci tohoto souboru aktualizuj i tento popis!
 */

import { THREE } from '../three.js';

export const StadiumBuilderTerrainTiles = {
  
  // 📋 SEZNAM PODPOROVANÝCH TYPŮ
  supportedTypes: [
    'terrain_grass', 'terrain_dirt', 'terrain_sand', 'terrain_snow',
    'terrain_concrete', 'terrain_forest', 'terrain_desert', 'terrain_water'
  ],

  // ✅ KONTROLA, zda modul podporuje daný typ
  hasElement(elementType) {
    return this.supportedTypes.includes(elementType);
  },

  // 🌱 Travnatá plocha
  createTerrainGrass(position) {
    const grassGroup = new THREE.Group();
    
    // Vytvoření procedurální grass textury
    const createGrassTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const context = canvas.getContext('2d');
      
      // Základní zelená barva
      context.fillStyle = '#2d5016';
      context.fillRect(0, 0, 512, 512);
      
      const grassColors = ['#3d6b1f', '#4a7c26', '#2a4d14', '#5d8f2f', '#1e3d0c'];
      
      // Stébla trávy
      for (let i = 0; i < 2000; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const color = grassColors[Math.floor(Math.random() * grassColors.length)];
        const length = 2 + Math.random() * 4;
        const width = 0.5 + Math.random() * 1;
        
        context.fillStyle = color;
        context.fillRect(x, y, width, length);
      }
      
      const texture = new THREE.CanvasTexture(canvas);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(4, 4);
      return texture;
    };
    
    const grassMaterial = new THREE.MeshStandardMaterial({ 
      map: createGrassTexture(),
      roughness: 0.9,
      metalness: 0.0
    });
    
    // Hlavní plocha s mírným terénem
    const geometry = new THREE.PlaneGeometry(20, 20, 50, 50);
    const positions = geometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      const height = (Math.random() - 0.5) * 0.3; // Mírné nerovnosti
      positions.setZ(i, height);
    }
    geometry.computeVertexNormals();
    
    const grass = new THREE.Mesh(geometry, grassMaterial);
    grass.rotation.x = -Math.PI / 2;
    grass.receiveShadow = true;
    grassGroup.add(grass);
    
    grassGroup.position.copy(position);
    return grassGroup;
  },

  // 🟤 Zemní plocha
  createTerrainDirt(position) {
    const dirtGroup = new THREE.Group();
    
    const dirtMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x8B4513,
      roughness: 0.95,
      metalness: 0.0
    });
    
    const geometry = new THREE.PlaneGeometry(20, 20, 40, 40);
    const positions = geometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      const height = (Math.random() - 0.5) * 0.2;
      positions.setZ(i, height);
    }
    geometry.computeVertexNormals();
    
    const dirt = new THREE.Mesh(geometry, dirtMaterial);
    dirt.rotation.x = -Math.PI / 2;
    dirt.receiveShadow = true;
    dirtGroup.add(dirt);
    
    dirtGroup.position.copy(position);
    return dirtGroup;
  },

  // 🟨 Písečná plocha
  createTerrainSand(position) {
    const sandGroup = new THREE.Group();
    
    const sandMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xF4A460,
      roughness: 0.8,
      metalness: 0.0
    });
    
    const geometry = new THREE.PlaneGeometry(20, 20, 60, 60);
    const positions = geometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      const height = (Math.random() - 0.5) * 0.5; // Víc nerovností jako duny
      positions.setZ(i, height);
    }
    geometry.computeVertexNormals();
    
    const sand = new THREE.Mesh(geometry, sandMaterial);
    sand.rotation.x = -Math.PI / 2;
    sand.receiveShadow = true;
    sandGroup.add(sand);
    
    sandGroup.position.copy(position);
    return sandGroup;
  },

  // ⬜ Sněhová plocha
  createTerrainSnow(position) {
    const snowGroup = new THREE.Group();
    
    const snowMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xFFFAFA,
      roughness: 0.9,
      metalness: 0.1
    });
    
    const geometry = new THREE.PlaneGeometry(20, 20, 30, 30);
    const positions = geometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      const height = Math.random() * 0.4; // Sněhové návěje
      positions.setZ(i, height);
    }
    geometry.computeVertexNormals();
    
    const snow = new THREE.Mesh(geometry, snowMaterial);
    snow.rotation.x = -Math.PI / 2;
    snow.receiveShadow = true;
    snowGroup.add(snow);
    
    // Přidej pár sněhových koulí pro detail
    for (let i = 0; i < 5; i++) {
      const snowball = new THREE.Mesh(
        new THREE.SphereGeometry(0.2 + Math.random() * 0.3, 8, 6),
        snowMaterial
      );
      snowball.position.set(
        (Math.random() - 0.5) * 18,
        0.2,
        (Math.random() - 0.5) * 18
      );
      snowball.castShadow = true;
      snowGroup.add(snowball);
    }
    
    snowGroup.position.copy(position);
    return snowGroup;
  },

  // ⬛ Betonová plocha
  createTerrainConcrete(position) {
    const concreteGroup = new THREE.Group();
    
    const concreteMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x696969,
      roughness: 0.7,
      metalness: 0.2
    });
    
    const concrete = new THREE.Mesh(
      new THREE.PlaneGeometry(20, 20),
      concreteMaterial
    );
    concrete.rotation.x = -Math.PI / 2;
    concrete.receiveShadow = true;
    concreteGroup.add(concrete);
    
    // Přidej několik prasklin pro realismus
    const crackMaterial = new THREE.MeshStandardMaterial({ color: 0x2F2F2F });
    for (let i = 0; i < 3; i++) {
      const crack = new THREE.Mesh(
        new THREE.PlaneGeometry(Math.random() * 10 + 5, 0.1),
        crackMaterial
      );
      crack.rotation.x = -Math.PI / 2;
      crack.rotation.z = Math.random() * Math.PI;
      crack.position.set(
        (Math.random() - 0.5) * 15,
        0.01,
        (Math.random() - 0.5) * 15
      );
      concreteGroup.add(crack);
    }
    
    concreteGroup.position.copy(position);
    return concreteGroup;
  },

  // 🌲 Lesní plocha
  createTerrainForest(position) {
    const forestGroup = new THREE.Group();
    
    // Základní zemní podklad
    const groundMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x2F4F2F,
      roughness: 0.9
    });
    
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(20, 20),
      groundMaterial
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    forestGroup.add(ground);
    
    // Náhodně rozmístěný les
    const treeMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
    const foliageMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 });
    
    for (let i = 0; i < 15; i++) {
      // Kmen
      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1 + Math.random() * 0.1, 0.15, 2 + Math.random() * 2, 6),
        treeMaterial
      );
      trunk.position.set(
        (Math.random() - 0.5) * 18,
        1 + Math.random(),
        (Math.random() - 0.5) * 18
      );
      trunk.castShadow = true;
      forestGroup.add(trunk);
      
      // Koruna
      const foliage = new THREE.Mesh(
        new THREE.SphereGeometry(0.8 + Math.random() * 0.5, 8, 6),
        foliageMaterial
      );
      foliage.position.copy(trunk.position);
      foliage.position.y += 2;
      foliage.castShadow = true;
      foliage.receiveShadow = true;
      forestGroup.add(foliage);
    }
    
    forestGroup.position.copy(position);
    return forestGroup;
  },

  // 🏜️ Pouštní plocha
  createTerrainDesert(position) {
    const desertGroup = new THREE.Group();
    
    const sandMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xDEB887,
      roughness: 0.85
    });
    
    // Duny s velkými nerovnostmi
    const geometry = new THREE.PlaneGeometry(20, 20, 80, 80);
    const positions = geometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      const height = Math.sin(positions.getX(i) * 0.3) * Math.cos(positions.getY(i) * 0.2) * 2; // Vlnité duny
      positions.setZ(i, height);
    }
    geometry.computeVertexNormals();
    
    const desert = new THREE.Mesh(geometry, sandMaterial);
    desert.rotation.x = -Math.PI / 2;
    desert.receiveShadow = true;
    desertGroup.add(desert);
    
    // Pár kaktusů
    const cactusMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 });
    for (let i = 0; i < 3; i++) {
      const cactus = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.15, 1 + Math.random(), 6),
        cactusMaterial
      );
      cactus.position.set(
        (Math.random() - 0.5) * 15,
        0.5,
        (Math.random() - 0.5) * 15
      );
      cactus.castShadow = true;
      desertGroup.add(cactus);
    }
    
    desertGroup.position.copy(position);
    return desertGroup;
  },

  // 🌊 Vodní plocha
  createTerrainWater(position) {
    const waterGroup = new THREE.Group();
    
    const waterMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x4169E1,
      roughness: 0.1,
      metalness: 0.1,
      transparent: true,
      opacity: 0.8
    });
    
    const water = new THREE.Mesh(
      new THREE.PlaneGeometry(20, 20),
      waterMaterial
    );
    water.rotation.x = -Math.PI / 2;
    water.receiveShadow = true;
    waterGroup.add(water);
    
    // Vodní vlnky (animované později)
    const waveGeometry = new THREE.PlaneGeometry(20, 20, 50, 50);
    const wavePositions = waveGeometry.attributes.position;
    for (let i = 0; i < wavePositions.count; i++) {
      const wave = Math.sin(wavePositions.getX(i) * 0.5) * Math.cos(wavePositions.getY(i) * 0.3) * 0.1;
      wavePositions.setZ(i, wave);
    }
    waveGeometry.computeVertexNormals();
    
    const waves = new THREE.Mesh(waveGeometry, waterMaterial);
    waves.rotation.x = -Math.PI / 2;
    waves.position.y = 0.05;
    waterGroup.add(waves);
    
    waterGroup.position.copy(position);
    return waterGroup;
  },

  // 🏗️ HLAVNÍ METODA pro vytvoření terénní plochy
  createElement(elementType, position, options = {}) {
    console.log(`🗺️ StadiumBuilderTerrainTiles.createElement: ${elementType}`);
    
    switch (elementType) {
      case 'terrain_grass':
        return this.createTerrainGrass(position);
      case 'terrain_dirt':
        return this.createTerrainDirt(position);
      case 'terrain_sand':
        return this.createTerrainSand(position);
      case 'terrain_snow':
        return this.createTerrainSnow(position);
      case 'terrain_concrete':
        return this.createTerrainConcrete(position);
      case 'terrain_forest':
        return this.createTerrainForest(position);
      case 'terrain_desert':
        return this.createTerrainDesert(position);
      case 'terrain_water':
        return this.createTerrainWater(position);
      default:
        console.warn(`❌ StadiumBuilderTerrainTiles: Neznámý typ prvku: ${elementType}`);
        return null;
    }
  }
};