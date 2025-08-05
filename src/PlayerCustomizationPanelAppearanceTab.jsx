// src/PlayerCustomizationPanelAppearanceTab.jsx - APPEARANCE TAB KOMPONENTA
import React from 'react';
import { playerDataManager } from './PlayerDataManager.js';
import { colorOptions } from './PlayerCustomizationPanelColorOptions.jsx';
import { hairStyles } from './PlayerCustomizationPanelHairStyles.jsx';

export const PlayerCustomizationPanelAppearanceTab = ({ customization, setCustomization }) => {
  return (
    <div>
      {/* Skin color */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ color: '#FFD700', marginBottom: '10px' }}>Barva pleti</h4>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {colorOptions.skin.map(color => (
            <button
              key={color.value}
              onClick={() => setCustomization({...customization, skinColor: color.value})}
              style={{
                width: '50px',
                height: '50px',
                background: `#${color.value.toString(16).padStart(6, '0')}`,
                border: customization.skinColor === color.value ? 
                  '3px solid #FFD700' : '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '8px',
                cursor: 'pointer',
                position: 'relative'
              }}
              title={color.name}
            >
              {customization.skinColor === color.value && (
                <span style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  fontSize: '20px'
                }}>✓</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Hair style */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ color: '#FFD700', marginBottom: '10px' }}>Účes</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
          {hairStyles.map(style => {
            const owned = playerDataManager.ownsItem('hairStyles', style.id) || style.price === 0;
            return (
              <button
                key={style.id}
                onClick={() => {
                  console.log('💇 Changing hair style to:', style.id);
                  if (owned) {
                    setCustomization(prev => ({...prev, hairStyle: style.id}));
                  } else if (playerDataManager.spendCoins(style.price, `Hair style: ${style.name}`)) {
                    playerDataManager.inventory.hairStyles.push(style.id);
                    setCustomization(prev => ({...prev, hairStyle: style.id}));
                  }
                }}
                style={{
                  padding: '10px',
                  background: (customization.hairStyle || 'realistic') === style.id ?
                    'linear-gradient(45deg, #FFD700, #FFA500)' :
                    'rgba(255, 255, 255, 0.1)',
                  color: (customization.hairStyle || 'realistic') === style.id ? '#000' : '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  position: 'relative'
                }}
              >
                <div>{style.name}</div>
                {!owned && (
                  <div style={{ 
                    marginTop: '5px', 
                    color: '#FFD700',
                    fontSize: '11px'
                  }}>
                    🪙 {style.price}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Hair color */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ color: '#FFD700', marginBottom: '10px' }}>Barva vlasů</h4>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {colorOptions.hair.map(color => (
            <button
              key={color.value}
              onClick={() => setCustomization({...customization, hairColor: color.value})}
              style={{
                width: '40px',
                height: '40px',
                background: `#${color.value.toString(16).padStart(6, '0')}`,
                border: customization.hairColor === color.value ? 
                  '3px solid #FFD700' : '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '50%',
                cursor: 'pointer',
                position: 'relative'
              }}
              title={color.name}
            >
              {customization.hairColor === color.value && (
                <span style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  fontSize: '18px',
                  color: '#fff',
                  textShadow: '0 0 3px rgba(0,0,0,0.8)'
                }}>✓</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Eye color */}
      <div>
        <h4 style={{ color: '#FFD700', marginBottom: '10px' }}>Barva očí</h4>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {colorOptions.eyes.map(color => (
            <button
              key={color.value}
              onClick={() => setCustomization({...customization, eyeColor: color.value})}
              style={{
                width: '40px',
                height: '40px',
                background: `#${color.value.toString(16).padStart(6, '0')}`,
                border: (customization.eyeColor || 0x3d2817) === color.value ? 
                  '3px solid #FFD700' : '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '50%',
                cursor: 'pointer',
                position: 'relative'
              }}
              title={color.name}
            >
              {(customization.eyeColor || 0x3d2817) === color.value && (
                <span style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  fontSize: '18px',
                  color: '#fff',
                  textShadow: '0 0 3px rgba(0,0,0,0.8)'
                }}>✓</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};