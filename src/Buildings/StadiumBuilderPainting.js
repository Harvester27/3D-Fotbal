/**
 * StadiumBuilderPainting.js - TERRAIN BRUSHES (MANUÁLNÍ ÚPRAVA VÝŠKY)
 * 
 * OBSAH:
 * - createTerrainRaise() - Zvedni terén o +1m (brush 5x5m)
 * - createTerrainLower() - Sniž terén o -1m (brush 5x5m)
 * - createTerrainRaiseLarge() - Zvedni terén o +2m (brush 8x8m) + louže
 * - createTerrainLowerLarge() - Sniž terén o -2m (brush 8x8m)
 * - createTerrainFlatten() - Srovnej na úroveň 0m (brush 6x6m)
 * - createTerrainSmooth() - Vyhlaď nerovnosti jemnými vlnami (brush 4x4m)
 * 
 * PODPOROVANÉ TYPY:
 * - terrain_raise, terrain_lower, terrain_raise_large, terrain_lower_large
 * - terrain_flatten, terrain_smooth
 * 
 * PRINCIPY: Používá Gaussovy funkce pro plynulé přechody terénu
 * BRUSHES: Různé velikosti štětců pro různé úpravy
 * 
 * POZNÁMKA: Při aktualizaci tohoto souboru aktualizuj i tento popis!
 */

import { THREE } from '../three.js';

export const StadiumBuilderPainting = {
  
  // 📋 SEZNAM PODPOROVANÝCH TYPŮ
  supportedTypes: [
    'terrain_raise', 'terrain_lower', 'terrain_raise_large', 
    'terrain_lower_large', 'terrain_flatten', 'terrain_smooth'
  ],

  // ✅ KONTROLA, zda modul podporuje daný typ
  hasElement(elementType) {
    return this.supportedTypes.includes(elementType);
  },

  // ⬆️ Zvednout terén
  createTerrainRaise(position) {
    const raiseGroup = new THREE.Group();
    
    const grassMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x4a7c26,
      roughness: 0.9
    });
    
    // 5x5m brush s gaussovým profilem
    const geometry = new THREE.PlaneGeometry(5, 5, 20, 20);
    const positions = geometry.attributes.position;
    
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      
      // Gaussova funkce - nejvyšší uprostřed, plynulý pokles k okrajům
      const distance = Math.sqrt(x*x + y*y);
      const height = Math.max(0, 1 * Math.exp(-distance*distance / 2));
      
      positions.setZ(i, height);
    }
    
    geometry.computeVertexNormals();
    
    const raise = new THREE.Mesh(geometry, grassMaterial);
    raise.rotation.x = -Math.PI / 2;
    raise.castShadow = true;
    raise.receiveShadow = true;
    raiseGroup.add(raise);
    
    raiseGroup.position.copy(position);
    return raiseGroup;
  },

  // ⬇️ Snížit terén
  createTerrainLower(position) {
    const lowerGroup = new THREE.Group();
    
    const dirtMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x8B4513,
      roughness: 0.9
    });
    
    // 5x5m brush s negativním profilem
    const geometry = new THREE.PlaneGeometry(5, 5, 20, 20);
    const positions = geometry.attributes.position;
    
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      
      // Inverzní gaussova - nejnižší uprostřed
      const distance = Math.sqrt(x*x + y*y);
      const height = -Math.max(0, 1 * Math.exp(-distance*distance / 2));
      
      positions.setZ(i, height);
    }
    
    geometry.computeVertexNormals();
    
    const lower = new THREE.Mesh(geometry, dirtMaterial);
    lower.rotation.x = -Math.PI / 2;
    lower.castShadow = true;
    lower.receiveShadow = true;
    lowerGroup.add(lower);
    
    lowerGroup.position.copy(position);
    return lowerGroup;
  },

  // ⏫ Zvednout více (velký brush)
  createTerrainRaiseLarge(position) {
    const raiseGroup = new THREE.Group();
    
    const grassMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x3d6b1f,
      roughness: 0.9
    });
    
    // 8x8m brush, vyšší nárůst
    const geometry = new THREE.PlaneGeometry(8, 8, 30, 30);
    const positions = geometry.attributes.position;
    
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      
      // Větší gaussova s vyšším vrcholem
      const distance = Math.sqrt(x*x + y*y);
      const height = Math.max(0, 2 * Math.exp(-distance*distance / 6));
      
      positions.setZ(i, height);
    }
    
    geometry.computeVertexNormals();
    
    const raise = new THREE.Mesh(geometry, grassMaterial);
    raise.rotation.x = -Math.PI / 2;
    raise.castShadow = true;
    raise.receiveShadow = true;
    raiseGroup.add(raise);
    
    raiseGroup.position.copy(position);
    return raiseGroup;
  },

  // ⏬ Snížit více (velký brush)
  createTerrainLowerLarge(position) {
    const lowerGroup = new THREE.Group();
    
    const mudMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x654321,
      roughness: 0.95
    });
    
    // 8x8m brush, hlubší propad
    const geometry = new THREE.PlaneGeometry(8, 8, 30, 30);
    const positions = geometry.attributes.position;
    
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      
      // Větší inverzní gaussova
      const distance = Math.sqrt(x*x + y*y);
      const height = -Math.max(0, 2 * Math.exp(-distance*distance / 6));
      
      positions.setZ(i, height);
    }
    
    geometry.computeVertexNormals();
    
    const lower = new THREE.Mesh(geometry, mudMaterial);
    lower.rotation.x = -Math.PI / 2;
    lower.castShadow = true;
    lower.receiveShadow = true;
    lowerGroup.add(lower);
    
    // Přidej malou louži na dno
    const waterMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x4169E1,
      roughness: 0.1,
      transparent: true,
      opacity: 0.6
    });
    
    const puddle = new THREE.Mesh(
      new THREE.CircleGeometry(2, 16),
      waterMaterial
    );
    puddle.rotation.x = -Math.PI / 2;
    puddle.position.y = -1.8;
    lowerGroup.add(puddle);
    
    lowerGroup.position.copy(position);
    return lowerGroup;
  },

  // 📏 Srovnat terén
  createTerrainFlatten(position) {
    const flattenGroup = new THREE.Group();
    
    const grassMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x228B22,
      roughness: 0.8
    });
    
    // 6x6m perfectly flat area
    const geometry = new THREE.PlaneGeometry(6, 6, 1, 1); // Bez subdivisions = perfektně plochý
    
    const flatten = new THREE.Mesh(geometry, grassMaterial);
    flatten.rotation.x = -Math.PI / 2;
    flatten.position.y = 0.01; // Mírně nad zemí
    flatten.castShadow = true;
    flatten.receiveShadow = true;
    flattenGroup.add(flatten);
    
    // Přidej okraj pro vizuální oddělení
    const edgeMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x8B4513,
      roughness: 0.9
    });
    
    const edge = new THREE.Mesh(
      new THREE.RingGeometry(3, 3.2, 16),
      edgeMaterial
    );
    edge.rotation.x = -Math.PI / 2;
    edge.position.y = 0.005;
    flattenGroup.add(edge);
    
    flattenGroup.position.copy(position);
    return flattenGroup;
  },

  // 🌊 Vyhladit terén
  createTerrainSmooth(position) {
    const smoothGroup = new THREE.Group();
    
    const grassMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x90EE90,
      roughness: 0.8
    });
    
    // 4x4m brush s velmi jemnými vlnami
    const geometry = new THREE.PlaneGeometry(4, 4, 25, 25);
    const positions = geometry.attributes.position;
    
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      
      // Velmi jemné sine waves pro "smooth" efekt
      const height = Math.sin(x * 0.5) * Math.cos(y * 0.5) * 0.1 + 
                    (Math.random() - 0.5) * 0.05; // Minimal noise
      
      positions.setZ(i, height);
    }
    
    geometry.computeVertexNormals();
    
    const smooth = new THREE.Mesh(geometry, grassMaterial);
    smooth.rotation.x = -Math.PI / 2;
    smooth.castShadow = true;
    smooth.receiveShadow = true;
    smoothGroup.add(smooth);
    
    smoothGroup.position.copy(position);
    return smoothGroup;
  },

  // 🏗️ HLAVNÍ METODA pro vytvoření terrain brush
  createElement(elementType, position, options = {}) {
    console.log(`🎨 StadiumBuilderPainting.createElement: ${elementType}`);
    
    switch (elementType) {
      case 'terrain_raise':
        return this.createTerrainRaise(position);
      case 'terrain_lower':
        return this.createTerrainLower(position);
      case 'terrain_raise_large':
        return this.createTerrainRaiseLarge(position);
      case 'terrain_lower_large':
        return this.createTerrainLowerLarge(position);
      case 'terrain_flatten':
        return this.createTerrainFlatten(position);
      case 'terrain_smooth':
        return this.createTerrainSmooth(position);
      default:
        console.warn(`❌ StadiumBuilderPainting: Neznámý typ prvku: ${elementType}`);
        return null;
    }
  }
};