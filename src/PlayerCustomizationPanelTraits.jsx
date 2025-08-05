// src/PlayerCustomizationPanelTraits.jsx - TRAITS TAB KOMPONENTA
import React from 'react';
import { playerDataManager } from './PlayerDataManager.js';
import { traitDefinitions } from './PlayerCustomizationPanelTraitDefinitions.jsx';

export const PlayerCustomizationPanelTraits = ({ traits, setTraits }) => {
  return (
    <div>
      <h4 style={{ color: '#FFD700', marginBottom: '20px' }}>
        🎭 Vlastnosti hráče
      </h4>
      
      {/* Pozitivní traits */}
      <div style={{ marginBottom: '30px' }}>
        <h5 style={{ 
          color: '#4CAF50', 
          marginBottom: '15px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          ✨ Pozitivní vlastnosti ({traits.positive.length}/3)
        </h5>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '10px',
          marginBottom: '15px'
        }}>
          {traits.positive.map(traitId => {
            const traitData = traitDefinitions.positive[traitId];
            if (!traitData) return null;
            
            return (
              <div key={traitId} style={{
                background: 'rgba(76, 175, 80, 0.1)',
                border: '1px solid rgba(76, 175, 80, 0.3)',
                padding: '10px',
                borderRadius: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ color: '#4CAF50', fontSize: '13px', fontWeight: 'bold' }}>
                    {traitData.name}
                  </div>
                  <div style={{ color: '#999', fontSize: '11px' }}>
                    {traitData.desc}
                  </div>
                </div>
                <button
                  onClick={() => {
                    playerDataManager.removeTrait(traitId, 'positive');
                    setTraits({ ...playerDataManager.traits });
                  }}
                  style={{
                    background: 'rgba(244, 67, 54, 0.2)',
                    color: '#F44336',
                    border: '1px solid rgba(244, 67, 54, 0.3)',
                    borderRadius: '4px',
                    padding: '4px 8px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  ✖
                </button>
              </div>
            );
          })}
        </div>
        
        {/* Dostupné pozitivní traits */}
        <div style={{ color: '#999', fontSize: '12px', marginBottom: '10px' }}>
          Dostupné pozitivní vlastnosti:
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '8px'
        }}>
          {Object.keys(traitDefinitions.positive)
            .filter(traitId => !traits.positive.includes(traitId))
            .map(traitId => {
              const traitData = traitDefinitions.positive[traitId];
              const canAdd = traits.positive.length < 3;
              
              return (
                <button
                  key={traitId}
                  onClick={() => {
                    if (canAdd) {
                      playerDataManager.addTrait(traitId, 'positive');
                      setTraits({ ...playerDataManager.traits });
                    }
                  }}
                  disabled={!canAdd}
                  style={{
                    background: canAdd ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.02)',
                    color: canAdd ? '#fff' : '#666',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '6px',
                    padding: '8px',
                    cursor: canAdd ? 'pointer' : 'not-allowed',
                    fontSize: '11px',
                    textAlign: 'left'
                  }}
                >
                  <div style={{ fontWeight: 'bold' }}>{traitData.name}</div>
                  <div>{traitData.desc}</div>
                </button>
              );
            })}
        </div>
      </div>

      {/* Negativní traits */}
      <div>
        <h5 style={{ 
          color: '#FF5722', 
          marginBottom: '15px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          ⚠️ Negativní vlastnosti ({traits.negative.length}/2)
        </h5>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '10px',
          marginBottom: '15px'
        }}>
          {traits.negative.map(traitId => {
            const traitData = traitDefinitions.negative[traitId];
            if (!traitData) return null;
            
            return (
              <div key={traitId} style={{
                background: 'rgba(255, 87, 34, 0.1)',
                border: '1px solid rgba(255, 87, 34, 0.3)',
                padding: '10px',
                borderRadius: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ color: '#FF5722', fontSize: '13px', fontWeight: 'bold' }}>
                    {traitData.name}
                  </div>
                  <div style={{ color: '#999', fontSize: '11px' }}>
                    {traitData.desc}
                  </div>
                </div>
                <button
                  onClick={() => {
                    playerDataManager.removeTrait(traitId, 'negative');
                    setTraits({ ...playerDataManager.traits });
                  }}
                  style={{
                    background: 'rgba(76, 175, 80, 0.2)',
                    color: '#4CAF50',
                    border: '1px solid rgba(76, 175, 80, 0.3)',
                    borderRadius: '4px',
                    padding: '4px 8px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  ✓
                </button>
              </div>
            );
          })}
        </div>
        
        {/* Info o negativních traits */}
        <div style={{
          background: 'rgba(255, 193, 7, 0.1)',
          border: '1px solid rgba(255, 193, 7, 0.3)',
          padding: '12px',
          borderRadius: '8px',
          color: '#FFC107',
          fontSize: '12px'
        }}>
          💡 <strong>Tip:</strong> Negativní vlastnosti se mohou objevit náhodně během hry podle tvých akcí. 
          Můžeš je odstranit tréninkem nebo speciálními předměty.
        </div>
      </div>
    </div>
  );
};