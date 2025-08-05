// src/PlayerCustomizationPanelStatsTab.jsx - STATS TAB KOMPONENTA
import React from 'react';
import { playerDataManager } from './PlayerDataManager.js';

export const PlayerCustomizationPanelStatsTab = ({ playerRatings }) => {
  return (
    <div style={{ color: '#fff' }}>
      <h4 style={{ color: '#FFD700', marginBottom: '15px' }}>Statistiky hráče</h4>
      <div style={{ display: 'grid', gap: '15px' }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          padding: '15px',
          borderRadius: '8px'
        }}>
          <div style={{ fontSize: '12px', color: '#999', marginBottom: '5px' }}>
            Odehrané zápasy
          </div>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
            {playerDataManager.stats.matchesPlayed}
          </div>
        </div>
        
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          padding: '15px',
          borderRadius: '8px'
        }}>
          <div style={{ fontSize: '12px', color: '#999', marginBottom: '5px' }}>
            Vítězství
          </div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#4CAF50' }}>
            {playerDataManager.stats.matchesWon}
          </div>
        </div>
        
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          padding: '15px',
          borderRadius: '8px'
        }}>
          <div style={{ fontSize: '12px', color: '#999', marginBottom: '5px' }}>
            Vstřelené góly
          </div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#FFD700' }}>
            {playerDataManager.stats.goalsScored}
          </div>
        </div>
        
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          padding: '15px',
          borderRadius: '8px'
        }}>
          <div style={{ fontSize: '12px', color: '#999', marginBottom: '5px' }}>
            Vytvořené stadiony
          </div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2196F3' }}>
            {playerDataManager.stats.stadiumsCreated}
          </div>
        </div>

        {/* Player rating display */}
        <div style={{
          background: 'rgba(255, 215, 0, 0.1)',
          padding: '15px',
          borderRadius: '8px',
          border: '1px solid rgba(255, 215, 0, 0.3)'
        }}>
          <div style={{ fontSize: '12px', color: '#999', marginBottom: '5px' }}>
            Overall Rating
          </div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#FFD700' }}>
            {playerRatings.overall}
          </div>
          <div style={{ fontSize: '10px', color: '#999', marginTop: '5px' }}>
            Position Rating (CAM): {playerRatings.position}
          </div>
        </div>
      </div>
    </div>
  );
};