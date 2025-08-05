// src/PlayerCustomizationPanelJerseyTab.jsx - JERSEY TAB KOMPONENTA
import React from 'react';
import { colorOptions } from './PlayerCustomizationPanelColorOptions.jsx';

export const PlayerCustomizationPanelJerseyTab = ({ customization, setCustomization }) => {
  return (
    <div>
      {/* Jersey color */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ color: '#FFD700', marginBottom: '10px' }}>Barva dresu</h4>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {colorOptions.jersey.map(color => (
            <button
              key={color.value}
              onClick={() => setCustomization({...customization, jerseyColor: color.value})}
              style={{
                width: '50px',
                height: '50px',
                background: `#${color.value.toString(16).padStart(6, '0')}`,
                border: customization.jerseyColor === color.value ? 
                  '3px solid #FFD700' : '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '8px',
                cursor: 'pointer',
                position: 'relative'
              }}
              title={color.name}
            >
              {customization.jerseyColor === color.value && (
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

      {/* Shorts color */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ color: '#FFD700', marginBottom: '10px' }}>Barva šortek</h4>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {colorOptions.shorts.map(color => (
            <button
              key={color.value}
              onClick={() => setCustomization({...customization, shortsColor: color.value})}
              style={{
                width: '50px',
                height: '50px',
                background: `#${color.value.toString(16).padStart(6, '0')}`,
                border: (customization.shortsColor || 0xe8e8e8) === color.value ? 
                  '3px solid #FFD700' : '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '8px',
                cursor: 'pointer',
                position: 'relative'
              }}
              title={color.name}
            >
              {customization.shortsColor === color.value && (
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

      {/* Socks color */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ color: '#FFD700', marginBottom: '10px' }}>Barva ponožek</h4>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {colorOptions.socks.map(color => (
            <button
              key={color.value}
              onClick={() => setCustomization({...customization, socksColor: color.value})}
              style={{
                width: '50px',
                height: '50px',
                background: `#${color.value.toString(16).padStart(6, '0')}`,
                border: customization.socksColor === color.value ? 
                  '3px solid #FFD700' : '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '8px',
                cursor: 'pointer',
                position: 'relative'
              }}
              title={color.name}
            >
              {customization.socksColor === color.value && (
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

      {/* Shoes color */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ color: '#FFD700', marginBottom: '10px' }}>Barva kopaček</h4>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {colorOptions.shoes.map(color => (
            <button
              key={color.value}
              onClick={() => setCustomization({...customization, shoesColor: color.value})}
              style={{
                width: '50px',
                height: '50px',
                background: `#${color.value.toString(16).padStart(6, '0')}`,
                border: customization.shoesColor === color.value ? 
                  '3px solid #FFD700' : '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '8px',
                cursor: 'pointer',
                position: 'relative'
              }}
              title={color.name}
            >
              {customization.shoesColor === color.value && (
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

      {/* Jersey number */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ color: '#FFD700', marginBottom: '10px' }}>Číslo dresu</h4>
        <input
          type="number"
          min="1"
          max="99"
          value={customization.jerseyNumber}
          onChange={(e) => setCustomization({
            ...customization, 
            jerseyNumber: Math.min(99, Math.max(1, parseInt(e.target.value) || 1))
          })}
          style={{
            width: '100px',
            padding: '10px',
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '8px',
            color: '#fff',
            fontSize: '18px',
            textAlign: 'center'
          }}
        />
      </div>

      {/* Jersey name */}
      <div>
        <h4 style={{ color: '#FFD700', marginBottom: '10px' }}>Jméno na dresu</h4>
        <input
          type="text"
          value={customization.jerseyName}
          onChange={(e) => setCustomization({...customization, jerseyName: e.target.value})}
          placeholder="Tvé jméno"
          maxLength="15"
          style={{
            width: '300px',
            padding: '10px',
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '8px',
            color: '#fff',
            fontSize: '16px'
          }}
        />
      </div>
    </div>
  );
};