// src/MatchSetupScreen.jsx
import React, { useState, useEffect } from 'react';
import { playerDataManager } from './PlayerDataManager.js';
import { AIPlayerGenerator } from './AIPlayerGenerator.js'; // Vytvoříme později

export const MatchSetupScreen = ({ onStartMatch, onBack, matchType = 'testMatch' }) => {
  const [playerReady, setPlayerReady] = useState(false);
  const [aiOpponent, setAiOpponent] = useState(null);
  const [countdown, setCountdown] = useState(null);
  
  // Generate AI opponent on mount
  useEffect(() => {
    // Určit level AI podle hráčova levelu
    const playerLevel = playerDataManager.level;
    let aiLevel = 1;
    let difficulty = 'normal';
    
    // AI level scaling - soupeř bude mít podobný level jako hráč (±20%)
    if (matchType === 'testMatch') {
      const variance = 0.2;
      const minLevel = Math.max(1, Math.floor(playerLevel * (1 - variance)));
      const maxLevel = Math.min(100, Math.ceil(playerLevel * (1 + variance)));
      aiLevel = Math.floor(Math.random() * (maxLevel - minLevel + 1)) + minLevel;
      
      // Náhodná obtížnost pro testovací zápas
      const difficultyRoll = Math.random();
      if (difficultyRoll < 0.3) difficulty = 'easy';
      else if (difficultyRoll > 0.7) difficulty = 'hard';
    }
    
    // Generovat AI hráče
    const generatedAI = AIPlayerGenerator.generateAIPlayer(aiLevel, difficulty);
    setAiOpponent(generatedAI);
    
    console.log('🤖 Generated AI opponent:', generatedAI.name, 'Level:', aiLevel, 'OVR:', generatedAI.overallRating);
  }, [matchType]);
  
  const playerSummary = playerDataManager.getPlayerSummary();
  const playerAttributes = playerDataManager.attributes;
  
  const handleReady = () => {
    setPlayerReady(true);
    // Start countdown
    let count = 3;
    setCountdown(count);
    
    const interval = setInterval(() => {
      count--;
      if (count > 0) {
        setCountdown(count);
      } else {
        clearInterval(interval);
        onStartMatch(aiOpponent);
      }
    }, 1000);
  };
  
  const AttributeBar = ({ label, value, maxValue = 100, color = '#4CAF50' }) => (
    <div style={{ marginBottom: '8px' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        marginBottom: '2px',
        fontSize: '0.8rem'
      }}>
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div style={{
        width: '100%',
        height: '8px',
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '4px',
        overflow: 'hidden'
      }}>
        <div style={{
          width: `${(value / maxValue) * 100}%`,
          height: '100%',
          background: color,
          borderRadius: '4px',
          transition: 'width 0.3s ease'
        }} />
      </div>
    </div>
  );
  
  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Arial, sans-serif',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Stadium background effect */}
      <div style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        opacity: 0.1,
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='field' patternUnits='userSpaceOnUse' width='100' height='100'%3E%3Crect width='100' height='100' fill='%2300ff00' opacity='0.1'/%3E%3Cline x1='50' y1='0' x2='50' y2='100' stroke='%23ffffff' stroke-width='2' opacity='0.2'/%3E%3Ccircle cx='50' cy='50' r='30' fill='none' stroke='%23ffffff' stroke-width='2' opacity='0.2'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23field)'/%3E%3C/svg%3E")`,
        animation: 'pulse 4s ease-in-out infinite'
      }} />
      
      {/* Back button */}
      {!playerReady && (
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
            transition: 'all 0.3s ease',
            zIndex: 10
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
      )}
      
      {/* Match title */}
      <div style={{
        position: 'absolute',
        top: '30px',
        left: '50%',
        transform: 'translateX(-50%)',
        textAlign: 'center',
        color: 'white',
        zIndex: 10
      }}>
        <h2 style={{
          fontSize: '2rem',
          margin: 0,
          textShadow: '0 2px 10px rgba(0, 0, 0, 0.5)'
        }}>
          TESTOVACÍ ZÁPAS
        </h2>
        <div style={{
          fontSize: '1rem',
          opacity: 0.8,
          marginTop: '5px'
        }}>
          Příprava na zápas
        </div>
      </div>
      
      {/* Main content */}
      <div style={{
        display: 'flex',
        gap: '40px',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        maxWidth: '1200px',
        padding: '20px'
      }}>
        {/* Player team */}
        <div style={{
          flex: 1,
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '20px',
          padding: '30px',
          backdropFilter: 'blur(10px)',
          border: '2px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
        }}>
          <div style={{
            textAlign: 'center',
            marginBottom: '20px',
            color: 'white'
          }}>
            <h3 style={{ 
              fontSize: '1.5rem', 
              margin: '0 0 10px 0',
              color: '#4CAF50' 
            }}>
              TVŮJ TÝM
            </h3>
            <div style={{
              fontSize: '80px',
              marginBottom: '10px'
            }}>
              ⚽
            </div>
          </div>
          
          {/* Player info */}
          <div style={{
            background: 'rgba(0, 0, 0, 0.3)',
            borderRadius: '15px',
            padding: '20px',
            marginBottom: '20px',
            color: 'white'
          }}>
            <h4 style={{ margin: '0 0 15px 0', fontSize: '1.2rem' }}>
              {playerSummary.name}
            </h4>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              marginBottom: '15px'
            }}>
              <span>Level {playerSummary.level}</span>
              <span style={{ 
                fontWeight: 'bold',
                fontSize: '1.1rem',
                color: '#FFD700'
              }}>
                OVR {playerSummary.overallRating}
              </span>
            </div>
            
            {/* Key attributes */}
            <AttributeBar 
              label="Rychlost" 
              value={playerAttributes.physical.pace} 
              color="#2196F3"
            />
            <AttributeBar 
              label="Dribling" 
              value={playerAttributes.technical.dribbling} 
              color="#4CAF50"
            />
            <AttributeBar 
              label="Střelba" 
              value={playerAttributes.technical.finishing} 
              color="#FF9800"
            />
            <AttributeBar 
              label="Obrana" 
              value={playerAttributes.technical.tackling} 
              color="#9C27B0"
            />
          </div>
          
          {/* Formation */}
          <div style={{
            textAlign: 'center',
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '0.9rem'
          }}>
            Formace: 1-0-0 (Ty sám)
          </div>
        </div>
        
        {/* VS divider */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px'
        }}>
          <div style={{
            width: '100px',
            height: '100px',
            background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 70%)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            fontWeight: 'bold',
            color: 'white',
            textShadow: '0 2px 10px rgba(0, 0, 0, 0.5)'
          }}>
            VS
          </div>
          
          {/* Ready button or countdown */}
          {!playerReady ? (
            <button
              onClick={handleReady}
              style={{
                background: 'linear-gradient(45deg, #4CAF50, #45a049)',
                color: 'white',
                border: 'none',
                padding: '15px 40px',
                borderRadius: '30px',
                fontSize: '1.2rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 5px 20px rgba(76, 175, 80, 0.4)',
                transition: 'all 0.3s ease',
                animation: 'pulse 2s ease-in-out infinite'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.05)';
                e.target.style.boxShadow = '0 8px 30px rgba(76, 175, 80, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = '0 5px 20px rgba(76, 175, 80, 0.4)';
              }}
            >
              PŘIPRAVEN!
            </button>
          ) : countdown ? (
            <div style={{
              fontSize: '4rem',
              fontWeight: 'bold',
              color: '#FFD700',
              textShadow: '0 0 20px rgba(255, 215, 0, 0.5)',
              animation: 'zoomPulse 1s ease-out'
            }}>
              {countdown}
            </div>
          ) : (
            <div style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              color: '#4CAF50',
              textShadow: '0 0 20px rgba(76, 175, 80, 0.5)'
            }}>
              START!
            </div>
          )}
        </div>
        
        {/* AI team */}
        <div style={{
          flex: 1,
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '20px',
          padding: '30px',
          backdropFilter: 'blur(10px)',
          border: '2px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
        }}>
          <div style={{
            textAlign: 'center',
            marginBottom: '20px',
            color: 'white'
          }}>
            <h3 style={{ 
              fontSize: '1.5rem', 
              margin: '0 0 10px 0',
              color: '#F44336' 
            }}>
              SOUPEŘ
            </h3>
            <div style={{
              fontSize: '80px',
              marginBottom: '10px'
            }}>
              🤖
            </div>
          </div>
          
          {/* AI info */}
          {aiOpponent && (
            <div style={{
              background: 'rgba(0, 0, 0, 0.3)',
              borderRadius: '15px',
              padding: '20px',
              marginBottom: '20px',
              color: 'white'
            }}>
              <h4 style={{ margin: '0 0 15px 0', fontSize: '1.2rem' }}>
                {aiOpponent.name}
              </h4>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                marginBottom: '15px'
              }}>
                <span>Level {aiOpponent.level}</span>
                <span style={{ 
                  fontWeight: 'bold',
                  fontSize: '1.1rem',
                  color: '#FFD700'
                }}>
                  OVR {aiOpponent.overallRating}
                </span>
              </div>
              
              {/* Difficulty indicator */}
              <div style={{
                marginBottom: '15px',
                padding: '8px',
                borderRadius: '8px',
                background: aiOpponent.difficulty === 'easy' ? 'rgba(76, 175, 80, 0.2)' :
                           aiOpponent.difficulty === 'normal' ? 'rgba(255, 193, 7, 0.2)' :
                           'rgba(244, 67, 54, 0.2)',
                border: `1px solid ${
                  aiOpponent.difficulty === 'easy' ? 'rgba(76, 175, 80, 0.5)' :
                  aiOpponent.difficulty === 'normal' ? 'rgba(255, 193, 7, 0.5)' :
                  'rgba(244, 67, 54, 0.5)'
                }`,
                textAlign: 'center',
                fontSize: '0.9rem'
              }}>
                Obtížnost: {
                  aiOpponent.difficulty === 'easy' ? '⭐ Lehká' :
                  aiOpponent.difficulty === 'normal' ? '⭐⭐ Normální' :
                  '⭐⭐⭐ Těžká'
                }
              </div>
              
              {/* AI attributes */}
              <AttributeBar 
                label="Rychlost" 
                value={aiOpponent.attributes.physical.pace} 
                color="#2196F3"
              />
              <AttributeBar 
                label="Dribling" 
                value={aiOpponent.attributes.technical.dribbling} 
                color="#4CAF50"
              />
              <AttributeBar 
                label="Střelba" 
                value={aiOpponent.attributes.technical.finishing} 
                color="#FF9800"
              />
              <AttributeBar 
                label="Obrana" 
                value={aiOpponent.attributes.technical.passing} 
                color="#9C27B0"
              />
            </div>
          )}
          
          {/* Formation */}
          <div style={{
            textAlign: 'center',
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '0.9rem'
          }}>
            Formace: 1-0-0 (AI)
          </div>
        </div>
      </div>
      
      {/* Match info */}
      <div style={{
        position: 'absolute',
        bottom: '30px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(0, 0, 0, 0.5)',
        padding: '15px 30px',
        borderRadius: '15px',
        color: 'white',
        fontSize: '0.9rem',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        <strong>⚽ Pravidla:</strong> 5 minut • První na 3 góly • Standardní hřiště
      </div>
      
      {/* CSS animations */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(0.98);
          }
        }
        
        @keyframes zoomPulse {
          0% {
            transform: scale(0.5);
            opacity: 0;
          }
          50% {
            transform: scale(1.2);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};