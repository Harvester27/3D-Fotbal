// src/PlayerCustomizationPanelUtils.jsx - UTILITY FUNKCE
import { playerDataManager } from './PlayerDataManager.js';

// Utility funkce pro práci s barvami
export const colorUtils = {
  // Převede hex hodnotu na CSS string
  hexToCSS: (hex) => `#${hex.toString(16).padStart(6, '0')}`,
  
  // Zkontroluje jestli je barva tmavá nebo světlá
  isDarkColor: (hex) => {
    const r = (hex >> 16) & 255;
    const g = (hex >> 8) & 255;
    const b = hex & 255;
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness < 128;
  }
};

// Utility funkce pro práci s inventory
export const inventoryUtils = {
  // Zkontroluje jestli hráč vlastní item
  ownsItem: (category, itemId) => {
    return playerDataManager.ownsItem(category, itemId);
  },
  
  // Nakoupí item pokud má hráč dost mincí
  purchaseItem: (category, itemId, price, name) => {
    if (playerDataManager.spendCoins(price, `${category}: ${name}`)) {
      playerDataManager.inventory[category].push(itemId);
      return true;
    }
    return false;
  }
};

// Utility funkce pro práce s atributy
export const attributeUtils = {
  // Vypočítá průměr atributů v kategorii
  getCategoryAverage: (attributes, category) => {
    const categoryAttrs = attributes[category];
    const values = Object.values(categoryAttrs);
    return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
  },
  
  // Najde nejlepší a nejhorší atribut v kategorii
  getCategoryExtremes: (attributes, category) => {
    const categoryAttrs = attributes[category];
    const entries = Object.entries(categoryAttrs);
    
    let min = entries[0];
    let max = entries[0];
    
    entries.forEach(([key, value]) => {
      if (value < min[1]) min = [key, value];
      if (value > max[1]) max = [key, value];
    });
    
    return { min, max };
  }
};

// Utility funkce pro práci se styly
export const styleUtils = {
  // Základní buttony styly
  buttonStyle: (isActive = false, customColors = {}) => ({
    padding: '10px 20px',
    background: isActive ? 
      (customColors.active || 'linear-gradient(45deg, #FFD700, #FFA500)') : 
      (customColors.inactive || 'rgba(255, 255, 255, 0.1)'),
    color: isActive ? (customColors.activeText || '#000') : (customColors.inactiveText || '#fff'),
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
    transition: 'all 0.3s ease'
  }),
  
  // Input styly
  inputStyle: (customProps = {}) => ({
    padding: '10px',
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '16px',
    ...customProps
  }),
  
  // Card styly
  cardStyle: (customProps = {}) => ({
    background: 'rgba(255, 255, 255, 0.05)',
    padding: '15px',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    ...customProps
  })
};

// Konstanty používané napříč komponentami
export const constants = {
  COLORS: {
    PRIMARY: '#FFD700',
    SUCCESS: '#4CAF50',
    DANGER: '#F44336',
    WARNING: '#FF9800',
    INFO: '#2196F3'
  },
  
  SIZES: {
    PREVIEW_WIDTH: 250,
    PREVIEW_HEIGHT: 350,
    MAX_JERSEY_NUMBER: 99,
    MIN_JERSEY_NUMBER: 1,
    MAX_JERSEY_NAME_LENGTH: 15
  },
  
  LIMITS: {
    MAX_POSITIVE_TRAITS: 3,
    MAX_NEGATIVE_TRAITS: 2,
    MIN_ATTRIBUTE_VALUE: 1,
    MAX_ATTRIBUTE_VALUE: 100
  }
};

// Debug utility funkce
export const debugUtils = {
  // Loguje stav customization
  logCustomization: (customization) => {
    console.log('🎨 Current Customization State:', customization);
  },
  
  // Loguje stav atributů
  logAttributes: (attributes) => {
    console.log('⚽ Current Attributes State:', attributes);
    Object.keys(attributes).forEach(category => {
      const avg = attributeUtils.getCategoryAverage(attributes, category);
      console.log(`  ${category}: průměr ${avg}`);
    });
  },
  
  // Loguje stav traits
  logTraits: (traits) => {
    console.log('🎭 Current Traits State:', traits);
    console.log(`  Positive: ${traits.positive.length}/3`);
    console.log(`  Negative: ${traits.negative.length}/2`);
  }
};