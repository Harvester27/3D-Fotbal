/**
 * StadiumBuilder.js - HLAVNÍ KOORDINAČNÍ SOUBOR
 * 
 * OBSAH:
 * - Import všech stavebních modulů
 * - Hlavní metoda createElement() pro koordinaci tvorby objektů
 * - Export hlavního StadiumBuilder objektu
 * 
 * POZNÁMKA: Při aktualizaci tohoto souboru aktualizuj i tento popis!
 * 
 * MODULY:
 * - StadiumBuilderStadium.js - Stadium objekty (tribuny, reflektory)
 * - StadiumBuilderTerrain.js - Základní terénní objekty (stromy, skály)
 * - StadiumBuilderTerrainTiles.js - Terénní plochy 20x20m
 * - StadiumBuilderSculpting.js - Terénní útvary (kopce, údolí)
 * - StadiumBuilderPainting.js - Terrain brushes (zvedání, snižování)
 * - StadiumBuilderUtils.js - Utility funkce (ceny, kategorie)
 */

import { THREE } from './three.js';
import { StadiumBuilderStadium } from './Buildings/StadiumBuilderStadium.js';
import { StadiumBuilderTerrain } from './Buildings/StadiumBuilderTerrain.js';
import { StadiumBuilderTerrainTiles } from './Buildings/StadiumBuilderTerrainTiles.js';
import { StadiumBuilderSculpting } from './Buildings/StadiumBuilderSculpting.js';
import { StadiumBuilderPainting } from './Buildings/StadiumBuilderPainting.js';
import { StadiumBuilderUtils } from './Buildings/StadiumBuilderUtils.js';

export const StadiumBuilder = {
  
  // 🔥 HLAVNÍ FUNKCE pro vytvoření prvku stadionu S DEBUG LOGOVÁNÍM
  createElement(elementType, position, options = {}) {
    console.log(`🏗️ StadiumBuilder.createElement called:`, {
      elementType: elementType,
      position: { x: position.x, y: position.y, z: position.z },
      options: options
    });
    
    // 🏟️ STADIUM objekty
    if (StadiumBuilderStadium.hasElement(elementType)) {
      return StadiumBuilderStadium.createElement(elementType, position, options);
    }
    
    // 🌲 ZÁKLADNÍ TERÉNNÍ objekty
    if (StadiumBuilderTerrain.hasElement(elementType)) {
      return StadiumBuilderTerrain.createElement(elementType, position, options);
    }
    
    // 🗺️ TERÉNNÍ PLOCHY (20x20m)
    if (StadiumBuilderTerrainTiles.hasElement(elementType)) {
      return StadiumBuilderTerrainTiles.createElement(elementType, position, options);
    }
    
    // 🏔️ TERÉNNÍ ÚTVARY (kopce, údolí)
    if (StadiumBuilderSculpting.hasElement(elementType)) {
      return StadiumBuilderSculpting.createElement(elementType, position, options);
    }
    
    // 🎨 TERRAIN BRUSHES (zvedání, snižování)
    if (StadiumBuilderPainting.hasElement(elementType)) {
      return StadiumBuilderPainting.createElement(elementType, position, options);
    }
    
    // ❌ Neznámý typ prvku
    console.warn(`❌ Neznámý typ prvku: ${elementType}`);
    return null;
  },

  // 🔍 PROXY METODY pro přístup k utility funkcím
  getAvailableElements() {
    return StadiumBuilderUtils.getAvailableElements();
  },

  getSeatPrices() {
    return StadiumBuilderUtils.getSeatPrices();
  },

  getCategories() {
    return StadiumBuilderUtils.getCategories();
  },

  // 🪑 PROXY METODY pro práci se sedačkami (delegace na Stadium modul)
  getStairSeatPositions(stairElement) {
    return StadiumBuilderStadium.getStairSeatPositions(stairElement);
  },

  findNearestSeatPosition(targetPosition, stairElement, tolerance = 1.0) {
    return StadiumBuilderStadium.findNearestSeatPosition(targetPosition, stairElement, tolerance);
  }
};