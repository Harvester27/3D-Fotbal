// src/OfflineLeagueMenu.jsx
import React, { useState } from 'react';
import { playerDataManager } from './PlayerDataManager.js';
import { firebaseManager } from './FirebaseManager.js';

export const OfflineLeagueMenu = ({ onStartMatch, onBack }) => {
  const [selectedMode, setSelectedMode] = useState('testMatch'); // 'testMatch', 'league', 'tournament' 
  const playerSummary = playerDataManager.getPlayerSummary();
  
  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #7303c0 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Arial, sans-serif',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated background pattern */}
      <div style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        opacity: 0.05,
        backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,.5) 35px, rgba(255,255,255,.5) 70px)',
        animation: 'slide 20s linear infinite'
      }} />
      
      {/* Trophy decoration */}
      <div style={{
        position: 'absolute',
        top: '50px',
        left: '50%',
        transform: 'translateX(-50%)',
        fontSize: '100px',
        opacity: 0.1,
        animation: 'float 4s ease-in-out infinite'
      }}>
        🏆
      </div>
      
      {/* Main container */}
      <div style={{
        maxWidth: '900px',
        width: '90%',
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '30px',
        backdropFilter: 'blur(20px)',
        border: '2px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)',
        padding: '50px',
        position: 'relative'
      }}>
        {/* Back button */}
        <button
          onClick={onBack}
          style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            background: 'rgba(255, 255, 255, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: '20px',
            color: 'white',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.3)';
            e.target.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.2)';
            e.target.style.transform = 'scale(1)';
          }}
        >
          ←
        </button>
        
        {/* Title */}
        <h1 style={{
          fontSize: '3rem',
          fontWeight: 'bold',
          color: 'white',
          textAlign: 'center',
          marginBottom: '20px',
          textShadow: '0 4px 8px rgba(0, 0, 0, 0.3)'
        }}>
          🏆 OFFLINE LIGA
        </h1>
        
        {/* Player info bar */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.3)',
          borderRadius: '15px',
          padding: '20px',
          marginBottom: '30px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '15px'
        }}>
          <div style={{ color: 'white' }}>
            <strong style={{ fontSize: '1.2rem' }}>{playerSummary.name}</strong>
            <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>
              Level {playerSummary.level} • OVR {playerSummary.overallRating}
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '20px', color: 'white' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>Výhry</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                {playerDataManager.stats.matchesWon}
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>Góly</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                {playerDataManager.stats.goalsScored}
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>Win Rate</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                {playerSummary.winRate}%
              </div>
            </div>
          </div>
        </div>
        
        {/* Game modes */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          marginBottom: '40px'
        }}>
          {/* Test Match */}
          <button
            onClick={() => onStartMatch('testMatch')}
            style={{
              background: selectedMode === 'testMatch' ? 
                'linear-gradient(45deg, #4CAF50, #45a049)' : 
                'rgba(255, 255, 255, 0.1)',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '20px',
              padding: '30px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              if (selectedMode !== 'testMatch') {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
              }
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.3)';
            }}
            onMouseLeave={(e) => {
              if (selectedMode !== 'testMatch') {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              }
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{ fontSize: '40px', marginBottom: '10px' }}>⚽</div>
            <h3 style={{ color: 'white', margin: '0 0 10px 0' }}>Testovací zápas</h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.9rem', margin: 0 }}>
              Rychlý zápas proti AI soupeři
            </p>
            <div style={{
              marginTop: '15px',
              fontSize: '0.8rem',
              color: '#FFD700'
            }}>
              🎁 Odměna: 50-150 coins
            </div>
          </button>
          
          {/* League Mode - Coming Soon */}
          <button
            disabled
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '2px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '20px',
              padding: '30px',
              cursor: 'not-allowed',
              opacity: 0.5,
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{ fontSize: '40px', marginBottom: '10px' }}>🏆</div>
            <h3 style={{ color: 'white', margin: '0 0 10px 0' }}>Liga</h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.9rem', margin: 0 }}>
              Kompletní ligová sezóna
            </p>
            <div style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              background: '#FF5722',
              color: 'white',
              padding: '5px 10px',
              borderRadius: '10px',
              fontSize: '0.7rem',
              fontWeight: 'bold'
            }}>
              BRZY
            </div>
          </button>
          
          {/* Tournament Mode - Coming Soon */}
          <button
            disabled
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '2px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '20px',
              padding: '30px',
              cursor: 'not-allowed',
              opacity: 0.5,
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{ fontSize: '40px', marginBottom: '10px' }}>🥇</div>
            <h3 style={{ color: 'white', margin: '0 0 10px 0' }}>Turnaj</h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.9rem', margin: 0 }}>
              Knockout turnaj
            </p>
            <div style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              background: '#FF5722',
              color: 'white',
              padding: '5px 10px',
              borderRadius: '10px',
              fontSize: '0.7rem',
              fontWeight: 'bold'
            }}>
              BRZY
            </div>
          </button>
        </div>
        
        {/* Info panel */}
        <div style={{
          background: 'rgba(33, 150, 243, 0.2)',
          border: '1px solid rgba(33, 150, 243, 0.3)',
          borderRadius: '15px',
          padding: '20px',
          color: 'white',
          fontSize: '0.9rem',
          textAlign: 'center'
        }}>
          <strong>💡 TIP:</strong> Vyhraj zápasy a získej coins a EXP! 
          Čím vyšší level soupeře, tím větší odměny.
        </div>
      </div>
      
      {/* CSS animations */}
      <style jsx>{`
        @keyframes slide {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(100px);
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateX(-50%) translateY(0);
          }
          50% {
            transform: translateX(-50%) translateY(-20px);
          }
        }
      `}</style>
    </div>
  );
};