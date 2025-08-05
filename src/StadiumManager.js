// src/StadiumManager.js - HLAVNÍ SOUBOR s modulární architekturou
import { THREE } from './three.js';
import { StadiumBuilder } from './StadiumBuilder.js';

// Import modulů z podsložky
import { StadiumManagerPreview } from './StadiumManager/StadiumManagerPreview.js';
import { StadiumManagerSeat } from './StadiumManager/StadiumManagerSeat.js';
import { StadiumManagerTerrain } from './StadiumManager/StadiumManagerTerrain.js';
import { StadiumManagerValidation } from './StadiumManager/StadiumManagerValidation.js';
import { StadiumManagerSelection } from './StadiumManager/StadiumManagerSelection.js';
import { StadiumManagerUtility } from './StadiumManager/StadiumManagerUtility.js';

export class StadiumManager {
  constructor(scene) {
    this.scene = scene;
    
    // Základní properties
    this.previewObject = null;
    this.previewRotation = 0;
    this.selectedOutline = null;
    this.selectedGlow = null;
    
    // 🪑 Preview systém pro sedačky - PODPORUJE MÚLTIPLE PREVIEW
    this.seatPreviewObjects = [];
    this.seatPreviewValid = false;
    
    // 🎨 Additive Terrain Painting System
    this.heightMap = new Map();
    this.terrainMeshes = new Map();
    this.currentHeightPreview = 0;
    this.previewHeightChange = 0;
    
    // Vytvoření instancí modulů - předáváme referenci na this
    this.preview = new StadiumManagerPreview(this);
    this.seat = new StadiumManagerSeat(this);
    this.terrain = new StadiumManagerTerrain(this);
    this.validation = new StadiumManagerValidation(this);
    this.selection = new StadiumManagerSelection(this);
    this.utility = new StadiumManagerUtility(this);
  }

  // ===== DELEGACE METOD NA MODULY =====

  // 🎨 TERRAIN MODULE METHODS
  getGridKey(position, gridSize = 2) {
    return this.terrain.getGridKey(position, gridSize);
  }

  getCurrentHeight(position, gridSize = 2) {
    return this.terrain.getCurrentHeight(position, gridSize);
  }

  getHeightChange(brushType) {
    return this.terrain.getHeightChange(brushType);
  }

  createAccumulatedTerrain(position, totalHeight, brushType) {
    return this.terrain.createAccumulatedTerrain(position, totalHeight, brushType);
  }

  updatePreviewWithAccumulatedHeight(previewObj, currentHeight, heightChange, brushType) {
    return this.terrain.updatePreviewWithAccumulatedHeight(previewObj, currentHeight, heightChange, brushType);
  }

  getHeightPreviewInfo() {
    return this.terrain.getHeightPreviewInfo();
  }

  // 🌍 VALIDATION MODULE METHODS
  isValidPosition(position, stadiumElements, elementType = null) {
    return this.validation.isValidPosition(position, stadiumElements, elementType);
  }

  // 🪑 SEAT MODULE METHODS
  isPositionOccupied(position, stadiumElements, tolerance = 0.3) {
    return this.seat.isPositionOccupied(position, stadiumElements, tolerance);
  }

  isValidSeatPosition(mousePosition, selectedStairs, tolerance = 1.0) {
    return this.seat.isValidSeatPosition(mousePosition, selectedStairs, tolerance);
  }

  createSeatPreview(seatType, seatColor) {
    return this.seat.createSeatPreview(seatType, seatColor);
  }

  updateSeatPreviewColor(previewSeat, isValid) {
    return this.seat.updateSeatPreviewColor(previewSeat, isValid);
  }

  updateSeatPreviewAtMousePosition(mouseScreen, camera, selectedStairs, seatOptions, stadiumElements) {
    return this.seat.updateSeatPreviewAtMousePosition(mouseScreen, camera, selectedStairs, seatOptions, stadiumElements);
  }

  clearSeatPreview() {
    return this.seat.clearSeatPreview();
  }

  addSeatsToStairs(targetStairs, intersectionPoint, seatOptions, stadiumElements, setStadiumElements, seatPrice = null) {
    return this.seat.addSeatsToStairs(targetStairs, intersectionPoint, seatOptions, stadiumElements, setStadiumElements, seatPrice);
  }

  // 🎯 PREVIEW MODULE METHODS
  createPreviewObject(toolType) {
    return this.preview.createPreviewObject(toolType);
  }

  updatePreviewColor(previewObj, isValid) {
    return this.preview.updatePreviewColor(previewObj, isValid);
  }

  rotatePreviewObject(deltaRotation) {
    return this.preview.rotatePreviewObject(deltaRotation);
  }

  createPreviewAtMousePosition(mouseScreen, camera, toolType, stadiumElements) {
    return this.preview.createPreviewAtMousePosition(mouseScreen, camera, toolType, stadiumElements);
  }

  updatePreviewPosition(mouseScreen, camera, stadiumElements) {
    return this.preview.updatePreviewPosition(mouseScreen, camera, stadiumElements);
  }

  placeObjectFromPreview(selectedTool, stadiumElements) {
    return this.preview.placeObjectFromPreview(selectedTool, stadiumElements);
  }

  clearPreview() {
    return this.preview.clearPreview();
  }

  resetPreviewRotation() {
    return this.preview.resetPreviewRotation();
  }

  // 🎯 SELECTION MODULE METHODS
  createSelectionOutline(selectedObject) {
    return this.selection.createSelectionOutline(selectedObject);
  }

  updateSelectionOutline(selectedObject) {
    return this.selection.updateSelectionOutline(selectedObject);
  }

  clearSelectionOutline() {
    return this.selection.clearSelectionOutline();
  }

  // 🛠️ UTILITY MODULE METHODS
  createExistingElements(stadiumElements) {
    return this.utility.createExistingElements(stadiumElements);
  }

  clearAllStadiumElements(stadiumElements) {
    return this.utility.clearAllStadiumElements(stadiumElements);
  }

  dispose() {
    return this.utility.dispose();
  }
}