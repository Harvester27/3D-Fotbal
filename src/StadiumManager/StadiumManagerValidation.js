// src/StadiumManager/StadiumManagerValidation.js - 🌍 VALIDATION SYSTEM

import * as logger from '../utils/logger.js';
export class StadiumManagerValidation {
    constructor(stadiumManager) {
      this.stadiumManager = stadiumManager;
      
      // Konstanty pro validaci
      this.MAP_BOUNDS = {
        minX: -60, maxX: 60,  // Rozšířeno z -40/+40
        minZ: -50, maxZ: 50   // Rozšířeno z -30/+30
      };
      
      this.FIELD_BOUNDS = {
        minX: -20, maxX: 20,
        minZ: -13, maxZ: 13
      };
      
      this.ELEMENT_TYPES = {
        // 🌀 AKTUALIZOVÁNO: Přidané nové typy zatáčecích schodů
        stadium: ['small_stand', 'large_stand', 'concrete_stairs', 'curved_stairs', 'turning_stairs', 'width_divided_stairs', 'progressive_turning_stairs', 'fence', 'corner_fence', 'floodlight'],
        terrain: ['tree_oak', 'tree_pine', 'rock_small', 'rock_large', 'bush_small', 'bush_large', 'flower_patch', 'water_pond', 'path_stone', 'path_dirt', 'fence_wood', 'bench_park'],
        terrainTiles: ['terrain_grass', 'terrain_dirt', 'terrain_sand', 'terrain_snow', 'terrain_concrete', 'terrain_forest', 'terrain_desert', 'terrain_water'],
        terrainSculpting: ['hill_small', 'hill_large', 'valley_small', 'plateau', 'canyon', 'volcano', 'crater', 'ridge'],
        terrainPainting: ['terrain_raise', 'terrain_lower', 'terrain_raise_large', 'terrain_lower_large', 'terrain_flatten', 'terrain_smooth']
      };
    }
  
    // 🌍 ROZŠÍŘENÁ: Validace pozice pro větší mapu (120x100 místo 80x60)
    isValidPosition(position, stadiumElements, elementType = null) {
      // Kontrola zda jsme v rámci rozšířené mapy
      if (position.x < this.MAP_BOUNDS.minX || position.x > this.MAP_BOUNDS.maxX ||
          position.z < this.MAP_BOUNDS.minZ || position.z > this.MAP_BOUNDS.maxZ) {
        return false;
      }
      
      // Stadium objekty nesmí na hřiště
      if (this.ELEMENT_TYPES.stadium.includes(elementType)) {
        if (position.x >= this.FIELD_BOUNDS.minX && position.x <= this.FIELD_BOUNDS.maxX &&
            position.z >= this.FIELD_BOUNDS.minZ && position.z <= this.FIELD_BOUNDS.maxZ) {
          return false;
        }
      }
      
      // 🌲 Terrain objekty můžou být blíž k hřišti (ale ne přímo na něm)
      if (this.ELEMENT_TYPES.terrain.includes(elementType)) {
        const terrainFieldBuffer = {
          minX: -22, maxX: 22,
          minZ: -15, maxZ: 15
        };
        
        if (position.x >= terrainFieldBuffer.minX && position.x <= terrainFieldBuffer.maxX &&
            position.z >= terrainFieldBuffer.minZ && position.z <= terrainFieldBuffer.maxZ) {
          return false; // Stále ne přímo u hřiště
        }
      }
      
      // 🗺️ Terrain plochy můžou být kdekoliv mimo fotbalové hřiště
      if (this.ELEMENT_TYPES.terrainTiles.includes(elementType)) {
        // Pro terrain plochy jen základní check - nesmí být na hřišti
        if (position.x >= this.FIELD_BOUNDS.minX && position.x <= this.FIELD_BOUNDS.maxX &&
            position.z >= this.FIELD_BOUNDS.minZ && position.z <= this.FIELD_BOUNDS.maxZ) {
          return false;
        }
        // Jinak můžou být kdekoliv (včetně překrývání)
        return true;
      }
      
      // 🏔️ Terrain sculpting objekty - větší buffer kolem hřiště
      if (this.ELEMENT_TYPES.terrainSculpting.includes(elementType)) {
        const sculptingFieldBuffer = {
          minX: -25, maxX: 25,
          minZ: -18, maxZ: 18
        };
        
        if (position.x >= sculptingFieldBuffer.minX && position.x <= sculptingFieldBuffer.maxX &&
            position.z >= sculptingFieldBuffer.minZ && position.z <= sculptingFieldBuffer.maxZ) {
          return false; // Dál od hřiště kvůli velikosti
        }
      }
      
      // 🎨 Terrain painting brushes - vždy validní mimo hřiště
      if (this.ELEMENT_TYPES.terrainPainting.includes(elementType)) {
        const paintingFieldBuffer = {
          minX: -22, maxX: 22,
          minZ: -15, maxZ: 15
        };
        
        if (position.x >= paintingFieldBuffer.minX && position.x <= paintingFieldBuffer.maxX &&
            position.z >= paintingFieldBuffer.minZ && position.z <= paintingFieldBuffer.maxZ) {
          return false;
        }
        // Terrain brushes můžou být kdekoliv a překrývat se
        return true;
      }
      
      // Kontrola překrývání s existujícími objekty (POUZE pro ne-terrain objekty)
      if (!this._isTerrainRelatedType(elementType)) {
        for (const element of stadiumElements) {
          if (element.mesh && element.position) {
            const distance = Math.sqrt(
              Math.pow(position.x - element.position.x, 2) + 
              Math.pow(position.z - element.position.z, 2)
            );
            
            // 🌲 RŮZNÉ MINIMÁLNÍ VZDÁLENOSTI podle typu objektu
            let minDistance = 3; // Default pro stadium objekty
            
            if (this.ELEMENT_TYPES.terrain.includes(elementType)) {
              minDistance = 1.5; // Terrain objekty můžou být blíž k sobě
              
              // Ale dál od stadium objektů
              if (this.ELEMENT_TYPES.stadium.includes(element.type)) {
                minDistance = 4;
              }
            }
            
            if (distance < minDistance) {
              return false;
            }
          }
        }
      }
      
      return true;
    }
  
    // Helper metoda pro kontrolu zda je typ terrain-related
    _isTerrainRelatedType(elementType) {
      return this.ELEMENT_TYPES.terrain.includes(elementType) || 
             this.ELEMENT_TYPES.terrainTiles.includes(elementType) || 
             this.ELEMENT_TYPES.terrainSculpting.includes(elementType) || 
             this.ELEMENT_TYPES.terrainPainting.includes(elementType);
    }
  }