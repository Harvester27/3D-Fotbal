/**
 * StadiumBuilderTerrain.js - ZÁKLADNÍ TERÉNNÍ OBJEKTY
 * 
 * OBSAH:
 * - createTreeOak() - Mohutný listnatý dub s kulovitou korunou
 * - createTreePine() - Vysoký jehličnatý strom (borovice)
 * - createRockSmall() - Skupina malých kamenů
 * - createRockLarge() - Mohutná skalní formace
 * - createBushSmall() - Nízký okrasný keř
 * - createBushLarge() - Rozsáhlý živý plot
 * - createFlowerPatch() - Barevný květinový kruh
 * - createWaterPond() - Okrasné malé jezírko
 * - createPathStone() - Dlážděná kamenná cesta 4m
 * - createPathDirt() - Zemní pěšina 3m
 * - createFenceWood() - Rustikální dřevěné oplocení
 * - createBenchPark() - Dřevěná parková lavička s opěradlem
 * 
 * PODPOROVANÉ TYPY:
 * - tree_oak, tree_pine, rock_small, rock_large
 * - bush_small, bush_large, flower_patch, water_pond
 * - path_stone, path_dirt, fence_wood, bench_park
 * 
 * POZNÁMKA: Při aktualizaci tohoto souboru aktualizuj i tento popis!
 */

import { THREE } from '../three.js';

export const StadiumBuilderTerrain = {
  
  // 📋 SEZNAM PODPOROVANÝCH TYPŮ
  supportedTypes: [
    'tree_oak', 'tree_pine', 'rock_small', 'rock_large',
    'bush_small', 'bush_large', 'flower_patch', 'water_pond',
    'path_stone', 'path_dirt', 'fence_wood', 'bench_park'
  ],

  // ✅ KONTROLA, zda modul podporuje daný typ
  hasElement(elementType) {
    return this.supportedTypes.includes(elementType);
  },

  // 🌳 Dub
  createTreeOak(position) {
    const treeGroup = new THREE.Group();
    
    // Kmen
    const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513, roughness: 0.8 });
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.4, 3, 8), trunkMaterial);
    trunk.position.y = 1.5;
    trunk.castShadow = true;
    treeGroup.add(trunk);
    
    // Koruna - několik kulovitých částí
    const foliageMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22, roughness: 0.7 });
    
    for (let i = 0; i < 3; i++) {
      const foliage = new THREE.Mesh(new THREE.SphereGeometry(1.2 + Math.random() * 0.5, 8, 6), foliageMaterial);
      foliage.position.set(
        (Math.random() - 0.5) * 1.5,
        2.5 + i * 0.8,
        (Math.random() - 0.5) * 1.5
      );
      foliage.castShadow = true;
      foliage.receiveShadow = true;
      treeGroup.add(foliage);
    }
    
    treeGroup.position.copy(position);
    return treeGroup;
  },

  // 🌲 Borovice
  createTreePine(position) {
    const treeGroup = new THREE.Group();
    
    // Kmen
    const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x654321, roughness: 0.8 });
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.3, 4, 8), trunkMaterial);
    trunk.position.y = 2;
    trunk.castShadow = true;
    treeGroup.add(trunk);
    
    // Jehličnatá koruna - kuželovitá
    const foliageMaterial = new THREE.MeshStandardMaterial({ color: 0x1F4F1F, roughness: 0.7 });
    
    for (let i = 0; i < 4; i++) {
      const foliage = new THREE.Mesh(new THREE.ConeGeometry(1.5 - i * 0.3, 1.5, 8), foliageMaterial);
      foliage.position.y = 2.5 + i * 0.8;
      foliage.castShadow = true;
      foliage.receiveShadow = true;
      treeGroup.add(foliage);
    }
    
    treeGroup.position.copy(position);
    return treeGroup;
  },

  // 🪨 Malý kámen
  createRockSmall(position) {
    const rockGroup = new THREE.Group();
    
    const rockMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x696969, 
      roughness: 0.9,
      metalness: 0.1 
    });
    
    // Nepravidelný kámen z několika koulí
    for (let i = 0; i < 3; i++) {
      const rock = new THREE.Mesh(
        new THREE.SphereGeometry(0.3 + Math.random() * 0.2, 6, 4), 
        rockMaterial
      );
      rock.position.set(
        (Math.random() - 0.5) * 0.8,
        0.2 + Math.random() * 0.3,
        (Math.random() - 0.5) * 0.8
      );
      rock.scale.y = 0.6 + Math.random() * 0.4; // Zploštělý
      rock.castShadow = true;
      rock.receiveShadow = true;
      rockGroup.add(rock);
    }
    
    rockGroup.position.copy(position);
    return rockGroup;
  },

  // ⛰️ Velký kámen
  createRockLarge(position) {
    const rockGroup = new THREE.Group();
    
    const rockMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x555555, 
      roughness: 0.9,
      metalness: 0.1 
    });
    
    // Hlavní kámen
    const mainRock = new THREE.Mesh(
      new THREE.SphereGeometry(1.2, 8, 6), 
      rockMaterial
    );
    mainRock.position.y = 0.8;
    mainRock.scale.set(1, 0.7, 1.3); // Nepravidelný tvar
    mainRock.castShadow = true;
    mainRock.receiveShadow = true;
    rockGroup.add(mainRock);
    
    // Menší kameny okolo
    for (let i = 0; i < 2; i++) {
      const smallRock = new THREE.Mesh(
        new THREE.SphereGeometry(0.4, 6, 4), 
        rockMaterial
      );
      const angle = (i / 2) * Math.PI * 2;
      smallRock.position.set(
        Math.cos(angle) * 1.5,
        0.2,
        Math.sin(angle) * 1.5
      );
      smallRock.scale.y = 0.5;
      smallRock.castShadow = true;
      smallRock.receiveShadow = true;
      rockGroup.add(smallRock);
    }
    
    rockGroup.position.copy(position);
    return rockGroup;
  },

  // 🌿 Malý keř
  createBushSmall(position) {
    const bushGroup = new THREE.Group();
    
    const bushMaterial = new THREE.MeshStandardMaterial({ color: 0x32CD32, roughness: 0.8 });
    
    // Keř z několik malých koulí
    for (let i = 0; i < 4; i++) {
      const bush = new THREE.Mesh(
        new THREE.SphereGeometry(0.3 + Math.random() * 0.2, 6, 4), 
        bushMaterial
      );
      bush.position.set(
        (Math.random() - 0.5) * 1,
        0.3 + Math.random() * 0.2,
        (Math.random() - 0.5) * 1
      );
      bush.scale.y = 0.8; // Trochu zplošťělý
      bush.castShadow = true;
      bush.receiveShadow = true;
      bushGroup.add(bush);
    }
    
    bushGroup.position.copy(position);
    return bushGroup;
  },

  // 🫐 Velký keř
  createBushLarge(position) {
    const bushGroup = new THREE.Group();
    
    const bushMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22, roughness: 0.8 });
    
    // Větší keř
    for (let i = 0; i < 6; i++) {
      const bush = new THREE.Mesh(
        new THREE.SphereGeometry(0.5 + Math.random() * 0.3, 8, 6), 
        bushMaterial
      );
      bush.position.set(
        (Math.random() - 0.5) * 2,
        0.5 + Math.random() * 0.5,
        (Math.random() - 0.5) * 2
      );
      bush.scale.y = 0.7;
      bush.castShadow = true;
      bush.receiveShadow = true;
      bushGroup.add(bush);
    }
    
    bushGroup.position.copy(position);
    return bushGroup;
  },

  // 🌸 Květinový záhon
  createFlowerPatch(position) {
    const flowerGroup = new THREE.Group();
    
    // Základ - zelená tráva
    const grassMaterial = new THREE.MeshStandardMaterial({ color: 0x90EE90, roughness: 0.8 });
    const grassPatch = new THREE.Mesh(
      new THREE.CylinderGeometry(1, 1, 0.1, 8), 
      grassMaterial
    );
    grassPatch.position.y = 0.05;
    grassPatch.receiveShadow = true;
    flowerGroup.add(grassPatch);
    
    // Květiny - malé barevné koule
    const flowerColors = [0xFF69B4, 0xFF4500, 0xFFFF00, 0xFF1493, 0x9370DB];
    
    for (let i = 0; i < 8; i++) {
      const flowerMaterial = new THREE.MeshStandardMaterial({ 
        color: flowerColors[Math.floor(Math.random() * flowerColors.length)],
        roughness: 0.5
      });
      
      const flower = new THREE.Mesh(
        new THREE.SphereGeometry(0.08, 6, 4), 
        flowerMaterial
      );
      
      const angle = (Math.random() * Math.PI * 2);
      const radius = Math.random() * 0.8;
      flower.position.set(
        Math.cos(angle) * radius,
        0.15,
        Math.sin(angle) * radius
      );
      flower.castShadow = true;
      flowerGroup.add(flower);
    }
    
    flowerGroup.position.copy(position);
    return flowerGroup;
  },

  // 🌊 Malé jezírko
  createWaterPond(position) {
    const pondGroup = new THREE.Group();
    
    // Vodní plocha
    const waterMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x4169E1, 
      roughness: 0.1,
      metalness: 0.1,
      transparent: true,
      opacity: 0.8
    });
    
    const water = new THREE.Mesh(
      new THREE.CylinderGeometry(2, 2, 0.2, 16), 
      waterMaterial
    );
    water.position.y = 0.1;
    water.receiveShadow = true;
    pondGroup.add(water);
    
    // Okraj - tmavší
    const edgeMaterial = new THREE.MeshStandardMaterial({ color: 0x2F4F4F, roughness: 0.9 });
    const edge = new THREE.Mesh(
      new THREE.RingGeometry(2, 2.3, 16), 
      edgeMaterial
    );
    edge.rotation.x = -Math.PI / 2;
    edge.position.y = 0.05;
    edge.receiveShadow = true;
    pondGroup.add(edge);
    
    pondGroup.position.copy(position);
    return pondGroup;
  },

  // 🛤️ Kamenná cesta
  createPathStone(position) {
    const pathGroup = new THREE.Group();
    
    const stoneMaterial = new THREE.MeshStandardMaterial({ color: 0x708090, roughness: 0.8 });
    
    // Hlavní cesta
    const path = new THREE.Mesh(
      new THREE.BoxGeometry(4, 0.1, 1), 
      stoneMaterial
    );
    path.position.y = 0.05;
    path.castShadow = true;
    path.receiveShadow = true;
    pathGroup.add(path);
    
    // Jednotlivé kameny pro detail
    for (let i = 0; i < 6; i++) {
      const stone = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 0.08, 0.3), 
        stoneMaterial
      );
      stone.position.set(
        (i - 2.5) * 0.6,
        0.08,
        (Math.random() - 0.5) * 0.6
      );
      stone.rotation.y = Math.random() * Math.PI;
      stone.castShadow = true;
      stone.receiveShadow = true;
      pathGroup.add(stone);
    }
    
    pathGroup.position.copy(position);
    return pathGroup;
  },

  // 🌾 Pěšina
  createPathDirt(position) {
    const pathGroup = new THREE.Group();
    
    const dirtMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513, roughness: 0.9 });
    
    // Zemní cesta
    const path = new THREE.Mesh(
      new THREE.BoxGeometry(3, 0.05, 0.8), 
      dirtMaterial
    );
    path.position.y = 0.025;
    path.receiveShadow = true;
    pathGroup.add(path);
    
    // Okraje s trávou
    const grassMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22, roughness: 0.8 });
    
    for (let side = -1; side <= 1; side += 2) {
      const grass = new THREE.Mesh(
        new THREE.BoxGeometry(3, 0.03, 0.3), 
        grassMaterial
      );
      grass.position.set(0, 0.015, side * 0.55);
      grass.receiveShadow = true;
      pathGroup.add(grass);
    }
    
    pathGroup.position.copy(position);
    return pathGroup;
  },

  // 🪵 Dřevěný plot
  createFenceWood(position) {
    const fenceGroup = new THREE.Group();
    
    const woodMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513, roughness: 0.8 });
    
    // Sloupky
    for (let i = 0; i < 3; i++) {
      const post = new THREE.Mesh(
        new THREE.BoxGeometry(0.1, 1.2, 0.1), 
        woodMaterial
      );
      post.position.set((i - 1) * 1.5, 0.6, 0);
      post.castShadow = true;
      fenceGroup.add(post);
    }
    
    // Horizontální desky
    for (let i = 0; i < 2; i++) {
      const plank = new THREE.Mesh(
        new THREE.BoxGeometry(3, 0.08, 0.6), 
        woodMaterial
      );
      plank.position.set(0, 0.4 + i * 0.4, 0);
      plank.castShadow = true;
      fenceGroup.add(plank);
    }
    
    fenceGroup.position.copy(position);
    return fenceGroup;
  },

  // 🪑 Parková lavička
  createBenchPark(position) {
    const benchGroup = new THREE.Group();
    
    const woodMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513, roughness: 0.8 });
    const metalMaterial = new THREE.MeshStandardMaterial({ color: 0x2F4F4F, roughness: 0.6, metalness: 0.3 });
    
    // Sedací plocha
    const seat = new THREE.Mesh(
      new THREE.BoxGeometry(2, 0.08, 0.4), 
      woodMaterial
    );
    seat.position.y = 0.45;
    seat.castShadow = true;
    seat.receiveShadow = true;
    benchGroup.add(seat);
    
    // Opěradlo
    const backrest = new THREE.Mesh(
      new THREE.BoxGeometry(2, 0.6, 0.08), 
      woodMaterial
    );
    backrest.position.set(0, 0.75, -0.16);
    backrest.castShadow = true;
    backrest.receiveShadow = true;
    benchGroup.add(backrest);
    
    // Kovové nohy
    for (let i = -1; i <= 1; i += 2) {
      const leg = new THREE.Mesh(
        new THREE.BoxGeometry(0.05, 0.9, 0.05), 
        metalMaterial
      );
      leg.position.set(i * 0.8, 0.45, 0.15);
      leg.castShadow = true;
      benchGroup.add(leg);
      
      const backLeg = new THREE.Mesh(
        new THREE.BoxGeometry(0.05, 0.9, 0.05), 
        metalMaterial
      );
      backLeg.position.set(i * 0.8, 0.45, -0.15);
      backLeg.castShadow = true;
      benchGroup.add(backLeg);
    }
    
    benchGroup.position.copy(position);
    return benchGroup;
  },

  // 🏗️ HLAVNÍ METODA pro vytvoření terénního prvku
  createElement(elementType, position, options = {}) {
    console.log(`🌲 StadiumBuilderTerrain.createElement: ${elementType}`);
    
    switch (elementType) {
      case 'tree_oak':
        return this.createTreeOak(position);
      case 'tree_pine':
        return this.createTreePine(position);
      case 'rock_small':
        return this.createRockSmall(position);
      case 'rock_large':
        return this.createRockLarge(position);
      case 'bush_small':
        return this.createBushSmall(position);
      case 'bush_large':
        return this.createBushLarge(position);
      case 'flower_patch':
        return this.createFlowerPatch(position);
      case 'water_pond':
        return this.createWaterPond(position);
      case 'path_stone':
        return this.createPathStone(position);
      case 'path_dirt':
        return this.createPathDirt(position);
      case 'fence_wood':
        return this.createFenceWood(position);
      case 'bench_park':
        return this.createBenchPark(position);
      default:
        console.warn(`❌ StadiumBuilderTerrain: Neznámý typ prvku: ${elementType}`);
        return null;
    }
  }
};