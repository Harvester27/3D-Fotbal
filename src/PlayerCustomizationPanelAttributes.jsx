// src/PlayerCustomizationPanelAttributes.jsx - ATTRIBUTES TAB KOMPONENTA
import React from 'react';
import { attributeDefinitions } from './PlayerCustomizationPanelAttributeDefinitions.jsx';

export const PlayerCustomizationPanelAttributes = ({ 
  attributes, 
  trainingPoints, 
  setQuickAttribute, 
  applyPreset 
}) => {
  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h4 style={{ color: '#FFD700', margin: 0 }}>⚽ Quick Atributy Editor</h4>
        <div style={{
          display: 'flex',
          gap: '10px',
          alignItems: 'center'
        }}>
          <div style={{ 
            color: '#4CAF50', 
            fontSize: '14px',
            background: 'rgba(76, 175, 80, 0.1)',
            padding: '5px 10px',
            borderRadius: '5px',
            border: '1px solid rgba(76, 175, 80, 0.3)'
          }}>
            🏋️ {trainingPoints} bodů zbývá
          </div>
        </div>
      </div>

      {/* Preset Buttons */}
      <div style={{
        marginBottom: '20px',
        padding: '15px',
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '10px'
      }}>
        <h4 style={{ color: '#FFD700', marginBottom: '10px' }}>🎯 Rychlé presety</h4>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '10px'
        }}>
          {[
            { id: 'beginner', name: '🐣 Začátečník', desc: '25 všude' },
            { id: 'average', name: '👤 Průměrný', desc: '50 všude' },
            { id: 'skilled', name: '⭐ Zkušený', desc: '70+ všude' },
            { id: 'superstar', name: '🌟 Superstar', desc: '90+ všude' },
            { id: 'speedster', name: '💨 Rychlonožka', desc: 'Rychlost 95' },
            { id: 'playmaker', name: '🎨 Playmaker', desc: 'Pasy 95' },
            { id: 'striker', name: '⚽ Střelec', desc: 'Finishing 95' }
          ].map(preset => (
            <button
              key={preset.id}
              onClick={() => applyPreset(preset.id)}
              style={{
                padding: '10px',
                background: 'rgba(76, 175, 80, 0.2)',
                color: '#fff',
                border: '1px solid rgba(76, 175, 80, 0.3)',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '12px',
                textAlign: 'center'
              }}
            >
              <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>
                {preset.name}
              </div>
              <div style={{ fontSize: '10px', opacity: 0.8 }}>
                {preset.desc}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Atributy podle kategorií */}
      {Object.keys(attributeDefinitions).map(category => {
        const categoryData = attributeDefinitions[category];
        return (
          <div key={category} style={{ marginBottom: '30px' }}>
            <h5 style={{
              color: categoryData.color,
              margin: '0 0 15px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '16px'
            }}>
              <span style={{ fontSize: '20px' }}>{categoryData.icon}</span>
              {categoryData.name}
              <span style={{
                color: '#999',
                fontSize: '14px',
                marginLeft: '10px'
              }}>
                Průměr: {Math.round(
                  Object.values(attributes[category]).reduce((a, b) => a + b, 0) / 
                  Object.keys(attributes[category]).length
                )}
              </span>
            </h5>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '10px'
            }}>
              {Object.keys(categoryData.attributes).map(attrKey => {
                const attrData = categoryData.attributes[attrKey];
                const currentValue = attributes[category][attrKey];
                
                return (
                  <div key={attrKey} style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '8px'
                    }}>
                      <div>
                        <div style={{ 
                          color: '#fff', 
                          fontSize: '13px', 
                          fontWeight: 'bold' 
                        }}>
                          {attrData.name}
                        </div>
                        <div style={{ 
                          color: '#999', 
                          fontSize: '11px' 
                        }}>
                          {attrData.desc}
                        </div>
                      </div>
                      <div style={{
                        color: categoryData.color,
                        fontSize: '16px',
                        fontWeight: 'bold',
                        minWidth: '30px',
                        textAlign: 'center'
                      }}>
                        {Math.round(currentValue)}
                      </div>
                    </div>
                    
                    {/* Range slider pro rychlé úpravy */}
                    <div>
                      <input
                        type="range"
                        min="1"
                        max="100"
                        value={currentValue}
                        onChange={(e) => setQuickAttribute(category, attrKey, parseInt(e.target.value))}
                        style={{
                          width: '100%',
                          accentColor: categoryData.color,
                          marginBottom: '5px'
                        }}
                      />
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '10px',
                        color: '#666'
                      }}>
                        <span>1</span>
                        <span>{Math.round(currentValue)}</span>
                        <span>100</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};