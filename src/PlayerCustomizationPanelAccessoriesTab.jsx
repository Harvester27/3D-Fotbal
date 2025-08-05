// src/PlayerCustomizationPanelAccessoriesTab.jsx - ACCESSORIES TAB KOMPONENTA
import React from 'react';
import { playerDataManager } from './PlayerDataManager.js';
import { accessories } from './PlayerCustomizationPanelAccessoriesData.jsx';

export const PlayerCustomizationPanelAccessoriesTab = ({ customization, setCustomization }) => {
  return (
    <div>
      <h4 style={{ color: '#FFD700', marginBottom: '15px' }}>Doplňky</h4>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
        {accessories.map(item => {
          const owned = playerDataManager.ownsItem('accessories', item.id);
          const equipped = customization.accessories?.[item.id];
          
          return (
            <button
              key={item.id}
              onClick={() => {
                if (owned) {
                  setCustomization({
                    ...customization,
                    accessories: {
                      ...customization.accessories,
                      [item.id]: !equipped
                    }
                  });
                } else if (playerDataManager.spendCoins(item.price, `Accessory: ${item.name}`)) {
                  playerDataManager.inventory.accessories.push(item.id);
                  setCustomization({
                    ...customization,
                    accessories: {
                      ...customization.accessories,
                      [item.id]: true
                    }
                  });
                }
              }}
              style={{
                padding: '15px',
                background: equipped ?
                  'linear-gradient(45deg, #4CAF50, #45a049)' :
                  'rgba(255, 255, 255, 0.1)',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <span>{item.name}</span>
              {!owned ? (
                <span style={{ color: '#FFD700', fontSize: '12px' }}>
                  🪙 {item.price}
                </span>
              ) : equipped ? (
                <span style={{ color: '#4CAF50' }}>✓</span>
              ) : (
                <span style={{ opacity: 0.5 }}>○</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};