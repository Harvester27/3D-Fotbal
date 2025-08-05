// src/GameMenu.jsx
import React, { useState, useEffect } from 'react';
import { PlayerInfoPanel } from './PlayerInfoPanel.jsx';
import { PlayerCustomizationPanel } from './PlayerCustomizationPanel.jsx';
import { firebaseManager } from './FirebaseManager.js';

export const GameMenu = ({ startGame, startEditor, startOfflineLeague }) => {
  const [showCustomization, setShowCustomization] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const isLoggedIn = firebaseManager.getCurrentUser() !== null;

  // Krátké zpoždění pro načtení stylů
  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Loading screen pro předcházení FOUC
  if (!isLoaded) {
    return (
      <div style={{
        width: '100vw',
        height: '100vh',
        background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 25%, #16213e 50%, #0f3460 75%, #533483 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
      }}>
        <div style={{
          textAlign: 'center',
          color: 'white'
        }}>
          <div style={{
            fontSize: '60px',
            marginBottom: '20px',
            animation: 'spin 1s linear infinite'
          }}>
            ⚽
          </div>
          <style jsx>{`
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 25%, #16213e 50%, #0f3460 75%, #533483 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* Modernější animovaný pattern na pozadí */}
      <div style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        opacity: 0.05,
        backgroundImage: `
          radial-gradient(circle at 25% 25%, #00ff88 0%, transparent 50%),
          radial-gradient(circle at 75% 75%, #0099ff 0%, transparent 50%),
          radial-gradient(circle at 75% 25%, #ff0099 0%, transparent 50%),
          radial-gradient(circle at 25% 75%, #ffff00 0%, transparent 50%)
        `,
        animation: 'modernFloat 8s ease-in-out infinite'
      }} />
      
      {/* Další vrstva efektů */}
      <div style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        opacity: 0.03,
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M40 40m-20 0a20 20 0 1 1 40 0a20 20 0 1 1 -40 0'/%3E%3Cpath d='M40 25l-5 10h10z'/%3E%3Cpath d='M40 55l5-10h-10z'/%3E%3Cpath d='M25 40l10-5v10z'/%3E%3Cpath d='M55 40l-10 5v-10z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        animation: 'modernFloat 12s ease-in-out infinite reverse'
      }} />
      
      {/* Player Info Panel - zobrazí se pouze když je uživatel přihlášen */}
      {isLoggedIn && (
        <PlayerInfoPanel 
          onCustomizeClick={() => setShowCustomization(true)}
        />
      )}
      
      {/* Player Customization Panel */}
      <PlayerCustomizationPanel 
        isOpen={showCustomization}
        onClose={() => setShowCustomization(false)}
      />
      
      {/* Hlavní menu kontejner */}
      <div style={{
        textAlign: 'center',
        color: 'white',
        zIndex: 10,
        maxWidth: '650px',
        padding: '50px',
        background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02))',
        borderRadius: '35px',
        backdropFilter: 'blur(25px) saturate(150%)',
        border: '1px solid rgba(255, 255, 255, 0.18)',
        boxShadow: `
          0 30px 60px rgba(0, 0, 0, 0.4),
          inset 0 1px 0 rgba(255, 255, 255, 0.2),
          0 0 100px rgba(83, 52, 131, 0.2)
        `,
        transform: 'translateY(-30px)',
        animation: 'modernSlideIn 1.2s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        {/* Modernější animovaný fotbalový míč */}
        <div style={{
          fontSize: '90px',
          marginBottom: '25px',
          animation: 'modernBounce 3s ease-in-out infinite',
          filter: 'drop-shadow(0 15px 30px rgba(0, 0, 0, 0.4)) drop-shadow(0 0 20px rgba(255, 255, 255, 0.1))',
          transform: 'perspective(100px) rotateX(10deg)'
        }}>
          ⚽
        </div>
        
        {/* Modernější název hry */}
        <h1 style={{
          fontSize: '4rem',
          fontWeight: '900',
          margin: '0 0 15px 0',
          background: 'linear-gradient(135deg, #00f5ff 0%, #ff6b6b 25%, #4ecdc4 50%, #45b7d1 75%, #96ceb4 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          backgroundSize: '300% 300%',
          textShadow: '0 0 30px rgba(0, 245, 255, 0.3)',
          animation: 'modernGlow 3s ease-in-out infinite, gradientShift 6s ease-in-out infinite',
          letterSpacing: '3px'
        }}>
          FOTBAL 3D
        </h1>
        
        {/* Modernější podtitul */}
        <p style={{
          fontSize: '1.4rem',
          margin: '0 0 45px 0',
          opacity: 0.85,
          fontStyle: 'italic',
          fontWeight: '300',
          background: 'linear-gradient(90deg, rgba(255,255,255,0.9), rgba(255,255,255,0.6), rgba(255,255,255,0.9))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundSize: '200% 100%',
          animation: 'textShimmer 4s ease-in-out infinite'
        }}>
          Nejlepší 3D fotbalová hra s automatickým driblováním!
        </p>
        
        {/* Modernější status přihlášení */}
        {!isLoggedIn && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.15), rgba(255, 152, 0, 0.1))',
            padding: '20px',
            borderRadius: '18px',
            marginBottom: '35px',
            border: '1px solid rgba(255, 193, 7, 0.25)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 25px rgba(255, 193, 7, 0.1)',
            animation: 'pulse 2s ease-in-out infinite'
          }}>
            <p style={{ 
              margin: 0, 
              fontSize: '15px', 
              color: '#FFD54F',
              fontWeight: '500',
              textShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}>
              <span style={{ fontSize: '18px', marginRight: '8px' }}>⚠️</span>
              Hraješ jako host - přihlas se pro ukládání postupu a odemknutí všech funkcí!
            </p>
          </div>
        )}
        
        {/* Modernější funkce hry */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '25px',
          margin: '35px 0 50px 0'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.2), rgba(46, 125, 50, 0.1))',
            padding: '25px 20px',
            borderRadius: '20px',
            border: '1px solid rgba(76, 175, 80, 0.3)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 10px 30px rgba(76, 175, 80, 0.1)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            cursor: 'default'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-5px) scale(1.02)';
            e.target.style.boxShadow = '0 15px 40px rgba(76, 175, 80, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0) scale(1)';
            e.target.style.boxShadow = '0 10px 30px rgba(76, 175, 80, 0.1)';
          }}>
            <div style={{ fontSize: '32px', marginBottom: '12px', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }}>🎮</div>
            <div style={{ fontSize: '16px', fontWeight: '600', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>Vylepšené ovládání</div>
          </div>
          
          <div style={{
            background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.2), rgba(255, 152, 0, 0.1))',
            padding: '25px 20px',
            borderRadius: '20px',
            border: '1px solid rgba(255, 193, 7, 0.3)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 10px 30px rgba(255, 193, 7, 0.1)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            cursor: 'default'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-5px) scale(1.02)';
            e.target.style.boxShadow = '0 15px 40px rgba(255, 193, 7, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0) scale(1)';
            e.target.style.boxShadow = '0 10px 30px rgba(255, 193, 7, 0.1)';
          }}>
            <div style={{ fontSize: '32px', marginBottom: '12px', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }}>⚽</div>
            <div style={{ fontSize: '16px', fontWeight: '600', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>Automatický dribbling</div>
          </div>
          
          <div style={{
            background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.2), rgba(21, 101, 192, 0.1))',
            padding: '25px 20px',
            borderRadius: '20px',
            border: '1px solid rgba(33, 150, 243, 0.3)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 10px 30px rgba(33, 150, 243, 0.1)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            cursor: 'default'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-5px) scale(1.02)';
            e.target.style.boxShadow = '0 15px 40px rgba(33, 150, 243, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0) scale(1)';
            e.target.style.boxShadow = '0 10px 30px rgba(33, 150, 243, 0.1)';
          }}>
            <div style={{ fontSize: '32px', marginBottom: '12px', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }}>📹</div>
            <div style={{ fontSize: '16px', fontWeight: '600', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>Dvě kamery</div>
          </div>
        </div>
        
        {/* Modernější tlačítka */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          justifyContent: 'center',
          marginBottom: '35px'
        }}>
          {/* První řada tlačítek */}
          <div style={{
            display: 'flex',
            gap: '25px',
            justifyContent: 'center'
          }}>
            {/* Modernější tlačítko START */}
            <button
              onClick={startGame}
              style={{
                fontSize: '1.4rem',
                fontWeight: '700',
                padding: '20px 45px',
                background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 50%, #2e7d32 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '60px',
                cursor: 'pointer',
                boxShadow: `
                  0 10px 30px rgba(76, 175, 80, 0.4),
                  inset 0 2px 0 rgba(255, 255, 255, 0.2),
                  0 0 20px rgba(76, 175, 80, 0.2)
                `,
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: 'translateY(0) scale(1)',
                position: 'relative',
                overflow: 'hidden',
                letterSpacing: '1px',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-8px) scale(1.08)';
                e.target.style.boxShadow = `
                  0 15px 45px rgba(76, 175, 80, 0.6),
                  inset 0 2px 0 rgba(255, 255, 255, 0.3),
                  0 0 30px rgba(76, 175, 80, 0.4)
                `;
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0) scale(1)';
                e.target.style.boxShadow = `
                  0 10px 30px rgba(76, 175, 80, 0.4),
                  inset 0 2px 0 rgba(255, 255, 255, 0.2),
                  0 0 20px rgba(76, 175, 80, 0.2)
                `;
              }}
            >
              ⚽ HRÁT
            </button>
            
            {/* Modernější tlačítko EDITOR */}
            <button
              onClick={startEditor}
              style={{
                fontSize: '1.4rem',
                fontWeight: '700',
                padding: '20px 45px',
                background: 'linear-gradient(135deg, #FF9800 0%, #FF5722 50%, #d84315 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '60px',
                cursor: 'pointer',
                boxShadow: `
                  0 10px 30px rgba(255, 152, 0, 0.4),
                  inset 0 2px 0 rgba(255, 255, 255, 0.2),
                  0 0 20px rgba(255, 152, 0, 0.2)
                `,
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: 'translateY(0) scale(1)',
                position: 'relative',
                overflow: 'hidden',
                letterSpacing: '1px',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-8px) scale(1.08)';
                e.target.style.boxShadow = `
                  0 15px 45px rgba(255, 152, 0, 0.6),
                  inset 0 2px 0 rgba(255, 255, 255, 0.3),
                  0 0 30px rgba(255, 152, 0, 0.4)
                `;
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0) scale(1)';
                e.target.style.boxShadow = `
                  0 10px 30px rgba(255, 152, 0, 0.4),
                  inset 0 2px 0 rgba(255, 255, 255, 0.2),
                  0 0 20px rgba(255, 152, 0, 0.2)
                `;
              }}
            >
              🏗️ EDITOR STADIONU
            </button>
          </div>
          
          {/* 🔥 NOVÉ: Modernější tlačítko OFFLINE LIGA */}
          <button
            onClick={startOfflineLeague}
            style={{
              fontSize: '1.4rem',
              fontWeight: '700',
              padding: '20px 45px',
              background: isLoggedIn 
                ? 'linear-gradient(135deg, #9C27B0 0%, #673AB7 50%, #512da8 100%)'
                : 'linear-gradient(135deg, rgba(156, 39, 176, 0.5) 0%, rgba(103, 58, 183, 0.5) 50%, rgba(81, 45, 168, 0.5) 100%)',
              color: isLoggedIn ? 'white' : 'rgba(255, 255, 255, 0.6)',
              border: 'none',
              borderRadius: '60px',
              cursor: isLoggedIn ? 'pointer' : 'not-allowed',
              boxShadow: isLoggedIn 
                ? `
                  0 10px 30px rgba(156, 39, 176, 0.4),
                  inset 0 2px 0 rgba(255, 255, 255, 0.2),
                  0 0 20px rgba(156, 39, 176, 0.2)
                `
                : '0 5px 15px rgba(156, 39, 176, 0.2)',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              transform: 'translateY(0) scale(1)',
              position: 'relative',
              overflow: 'hidden',
              width: '100%',
              maxWidth: '450px',
              margin: '0 auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              letterSpacing: '1px',
              textShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}
            onMouseEnter={(e) => {
              if (isLoggedIn) {
                e.target.style.transform = 'translateY(-8px) scale(1.05)';
                e.target.style.boxShadow = `
                  0 15px 45px rgba(156, 39, 176, 0.6),
                  inset 0 2px 0 rgba(255, 255, 255, 0.3),
                  0 0 30px rgba(156, 39, 176, 0.4)
                `;
              }
            }}
            onMouseLeave={(e) => {
              if (isLoggedIn) {
                e.target.style.transform = 'translateY(0) scale(1)';
                e.target.style.boxShadow = `
                  0 10px 30px rgba(156, 39, 176, 0.4),
                  inset 0 2px 0 rgba(255, 255, 255, 0.2),
                  0 0 20px rgba(156, 39, 176, 0.2)
                `;
              }
            }}
            disabled={!isLoggedIn}
            title={!isLoggedIn ? 'Přihlas se pro hraní offline ligy' : ''}
          >
            🏆 HRÁT OFFLINE LIGU
            {!isLoggedIn && <span style={{ fontSize: '0.85em', opacity: 0.8 }}>(Vyžaduje přihlášení)</span>}
          </button>
        </div>
        
        {/* Modernější tip pro uživatele */}
        <p style={{
          fontSize: '13px',
          margin: '30px 0 0 0',
          opacity: 0.75,
          color: '#e8eaf6',
          fontWeight: '400',
          background: 'linear-gradient(90deg, rgba(255,255,255,0.7), rgba(255,255,255,0.5), rgba(255,255,255,0.7))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundSize: '200% 100%',
          animation: 'textShimmer 6s ease-in-out infinite'
        }}>
          <span style={{ fontSize: '16px', marginRight: '8px' }}>💡</span>
          Tip: Po spuštění hry stiskni <strong style={{ 
            color: '#FFD54F', 
            textShadow: '0 0 10px rgba(255, 213, 79, 0.5)',
            WebkitTextFillColor: '#FFD54F'
          }}>H</strong> pro nápovědu ovládání
        </p>
      </div>
      
      {/* Modernější CSS animace */}
      <style jsx>{`
        @keyframes modernBounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0) rotate(0deg) perspective(100px) rotateX(10deg);
          }
          40% {
            transform: translateY(-25px) rotate(15deg) perspective(100px) rotateX(10deg);
          }
          60% {
            transform: translateY(-15px) rotate(-8deg) perspective(100px) rotateX(10deg);
          }
        }
        
        @keyframes modernFloat {
          0%, 100% {
            transform: translateY(0) translateX(0) rotate(0deg);
          }
          33% {
            transform: translateY(-30px) translateX(20px) rotate(2deg);
          }
          66% {
            transform: translateY(-15px) translateX(-15px) rotate(-1deg);
          }
        }
        
        @keyframes modernSlideIn {
          from {
            opacity: 0;
            transform: translateY(80px) scale(0.9);
            filter: blur(10px);
          }
          to {
            opacity: 1;
            transform: translateY(-30px) scale(1);
            filter: blur(0px);
          }
        }
        
        @keyframes modernGlow {
          0%, 100% {
            text-shadow: 
              0 0 30px rgba(0, 245, 255, 0.3),
              0 0 60px rgba(0, 245, 255, 0.1);
          }
          50% {
            text-shadow: 
              0 0 40px rgba(0, 245, 255, 0.5),
              0 0 80px rgba(0, 245, 255, 0.2),
              0 0 120px rgba(0, 245, 255, 0.1);
          }
        }
        
        @keyframes gradientShift {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        
        @keyframes textShimmer {
          0%, 100% {
            background-position: -200% 0;
          }
          50% {
            background-position: 200% 0;
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.9;
            transform: scale(1.02);
          }
        }
      `}</style>
    </div>
  );
};