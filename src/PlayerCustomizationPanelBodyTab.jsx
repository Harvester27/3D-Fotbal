// src/PlayerCustomizationPanelBodyTab.jsx - BODY TAB KOMPONENTA
import React from 'react';
import { bodyOptions } from './PlayerCustomizationPanelBodyOptions.jsx';

export const PlayerCustomizationPanelBodyTab = ({ customization, setCustomization }) => {
  return (
    <div>
      {/* Height */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ color: '#FFD700', marginBottom: '10px' }}>Výška postavy</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
          {bodyOptions.height.map(option => (
            <button
              key={option.value}
              onClick={() => setCustomization({...customization, height: option.value})}
              style={{
                padding: '15px',
                background: (customization.height || 1.0) === option.value ?
                  'linear-gradient(45deg, #FFD700, #FFA500)' :
                  'rgba(255, 255, 255, 0.1)',
                color: (customization.height || 1.0) === option.value ? '#000' : '#fff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              {option.name}
            </button>
          ))}
        </div>
      </div>

      {/* Build */}
      <div>
        <h4 style={{ color: '#FFD700', marginBottom: '10px' }}>Postava</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
          {bodyOptions.build.map(option => (
            <button
              key={option.value}
              onClick={() => setCustomization({...customization, build: option.value})}
              style={{
                padding: '15px',
                background: (customization.build || 1.0) === option.value ?
                  'linear-gradient(45deg, #FFD700, #FFA500)' :
                  'rgba(255, 255, 255, 0.1)',
                color: (customization.build || 1.0) === option.value ? '#000' : '#fff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              {option.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};