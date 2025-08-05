// src/GameUI.jsx
import React, { useState, useEffect } from 'react';

// 🔥 NOVÝ: Player Stats Overlay - zobrazuje staminu a atributy live
export const PlayerStatsOverlay = ({ player }) => {
  const [stats, setStats] = useState(null);
  
  useEffect(() => {
    if (!player) return;
    
    const updateStats = () => {
      if (player.getDetailedStatus) {
        const detailedStatus = player.getDetailedStatus();
        setStats({
          // Stamina info
          stamina: player.currentStamina || 0,
          maxStamina: player.maxStamina || 100,
          staminaPercent: player.getStaminaPercent ? player.getStaminaPercent() : 1,
          isExhausted: player.isExhausted || false,
          
          // Performance
          performance: player.getPerformanceRating ? player.getPerformanceRating() : 100,
          confidence: player.getConfidenceLevel ? player.getConfidenceLevel() : 50,
          
          // Key attributes
          pace: Math.round(player.attributes?.physical?.pace || 1),
          dribbling: Math.round(player.attributes?.technical?.dribbling || 1),
          finishing: Math.round(player.attributes?.technical?.finishing || 1),
          stamina_attr: Math.round(player.attributes?.physical?.stamina || 1),
          
          // Current state
          speed: parseFloat(detailedStatus.speed) || 0,
          maxSpeed: parseFloat(detailedStatus.maxSpeed) || 0,
          isDribbling: detailedStatus.isDribbling || false,
          isSprinting: detailedStatus.isSprinting || false,
          isOnGround: detailedStatus.isOnGround !== false
        });
      }
    };
    
    // Update every 100ms for smooth stamina bar
    const interval = setInterval(updateStats, 100);
    updateStats(); // Initial update
    
    return () => clearInterval(interval);
  }, [player]);
  
  if (!stats || !player) return null;
  
  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      left: '20px',
      background: 'rgba(0, 0, 0, 0.9)',
      color: 'white',
      padding: '15px',
      borderRadius: '12px',
      fontFamily: 'Arial, sans-serif',
      fontSize: '12px',
      minWidth: '280px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
      border: '2px solid rgba(76, 175, 80, 0.3)',
      zIndex: 1500
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '12px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
        paddingBottom: '8px'
      }}>
        <span style={{ fontSize: '18px' }}>📊</span>
        <span style={{ fontWeight: 'bold', color: '#4CAF50' }}>PLAYER STATS LIVE</span>
        <span style={{
          background: stats.performance >= 80 ? 'rgba(76, 175, 80, 0.3)' : 
                     stats.performance >= 60 ? 'rgba(255, 193, 7, 0.3)' : 'rgba(244, 67, 54, 0.3)',
          color: stats.performance >= 80 ? '#4CAF50' : 
                 stats.performance >= 60 ? '#FFC107' : '#F44336',
          padding: '2px 6px',
          borderRadius: '4px',
          fontSize: '10px',
          fontWeight: 'bold'
        }}>
          {stats.performance}%
        </span>
      </div>
      
      {/* Stamina Bar - Main Focus */}
      <div style={{ marginBottom: '12px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '4px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontWeight: 'bold'
          }}>
            <span style={{ fontSize: '16px' }}>🔋</span>
            <span style={{ color: '#4CAF50' }}>STAMINA</span>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{
              color: stats.isExhausted ? '#F44336' : '#4CAF50',
              fontSize: '14px',
              fontWeight: 'bold'
            }}>
              {Math.round(stats.stamina)}/{stats.maxStamina}
            </span>
            <span style={{
              background: 'rgba(76, 175, 80, 0.2)',
              color: '#4CAF50',
              padding: '2px 6px',
              borderRadius: '4px',
              fontSize: '10px',
              fontWeight: 'bold'
            }}>
              LVL {stats.stamina_attr}
            </span>
          </div>
        </div>
        
        {/* Stamina Progress Bar */}
        <div style={{
          width: '100%',
          height: '12px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '6px',
          overflow: 'hidden',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <div style={{
            width: `${stats.staminaPercent * 100}%`,
            height: '100%',
            background: stats.isExhausted ? 
              'linear-gradient(90deg, #F44336, #D32F2F)' :
              stats.staminaPercent > 0.6 ? 
                'linear-gradient(90deg, #4CAF50, #45a049)' :
                stats.staminaPercent > 0.3 ?
                  'linear-gradient(90deg, #FFC107, #FF9800)' :
                  'linear-gradient(90deg, #FF5722, #D32F2F)',
            transition: 'width 0.2s ease, background 0.3s ease',
            boxShadow: stats.staminaPercent > 0.1 ? `0 0 8px ${
              stats.isExhausted ? '#F44336' : 
              stats.staminaPercent > 0.6 ? '#4CAF50' : 
              stats.staminaPercent > 0.3 ? '#FFC107' : '#FF5722'
            }` : 'none'
          }} />
        </div>
        
        {/* Stamina Status */}
        {stats.isExhausted && (
          <div style={{
            marginTop: '4px',
            color: '#F44336',
            fontSize: '10px',
            fontWeight: 'bold',
            textAlign: 'center',
            animation: 'pulse 1s ease-in-out infinite'
          }}>
            😴 VYČERPÁN! Pomalší pohyb a horší přesnost!
          </div>
        )}
      </div>
      
      {/* Key Attributes */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '8px',
        marginBottom: '10px'
      }}>
        {/* Pace/Running */}
        <div style={{
          background: 'rgba(255, 193, 7, 0.1)',
          border: '1px solid rgba(255, 193, 7, 0.3)',
          borderRadius: '6px',
          padding: '6px',
          textAlign: 'center'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            marginBottom: '2px'
          }}>
            <span style={{ fontSize: '14px' }}>🏃</span>
            <span style={{ color: '#FFC107', fontSize: '10px', fontWeight: 'bold' }}>
              RYCHLOST
            </span>
          </div>
          <div style={{
            color: '#FFC107',
            fontSize: '16px',
            fontWeight: 'bold'
          }}>
            LVL {stats.pace}
          </div>
          <div style={{
            fontSize: '9px',
            color: '#999',
            marginTop: '2px'
          }}>
            {stats.speed.toFixed(1)}/{stats.maxSpeed.toFixed(1)}
            {stats.isSprinting && <span style={{ color: '#FF9800' }}> 🔥 SPRINT</span>}
          </div>
        </div>
        
        {/* Dribbling */}
        <div style={{
          background: 'rgba(156, 39, 176, 0.1)',
          border: '1px solid rgba(156, 39, 176, 0.3)',
          borderRadius: '6px',
          padding: '6px',
          textAlign: 'center'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            marginBottom: '2px'
          }}>
            <span style={{ fontSize: '14px' }}>⚽</span>
            <span style={{ color: '#9C27B0', fontSize: '10px', fontWeight: 'bold' }}>
              DRIBLING
            </span>
          </div>
          <div style={{
            color: '#9C27B0',
            fontSize: '16px',
            fontWeight: 'bold'
          }}>
            LVL {stats.dribbling}
          </div>
          <div style={{
            fontSize: '9px',
            color: '#999',
            marginTop: '2px'
          }}>
            {stats.isDribbling ? (
              <span style={{ color: '#9C27B0' }}>🎯 AKTIVNÍ</span>
            ) : (
              <span>ČEKÁM</span>
            )}
          </div>
        </div>
        
        {/* Finishing */}
        <div style={{
          background: 'rgba(244, 67, 54, 0.1)',
          border: '1px solid rgba(244, 67, 54, 0.3)',
          borderRadius: '6px',
          padding: '6px',
          textAlign: 'center'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            marginBottom: '2px'
          }}>
            <span style={{ fontSize: '14px' }}>🎯</span>
            <span style={{ color: '#F44336', fontSize: '10px', fontWeight: 'bold' }}>
              STŘELBA
            </span>
          </div>
          <div style={{
            color: '#F44336',
            fontSize: '16px',
            fontWeight: 'bold'
          }}>
            LVL {stats.finishing}
          </div>
          <div style={{
            fontSize: '9px',
            color: '#999',
            marginTop: '2px'
          }}>
            {(player.controls && player.controls.isCharging && player.controls.isCharging()) ? (
              <span style={{ color: '#F44336' }}>⚡ NABÍJÍ</span>
            ) : (
              <span>PŘIPRAVEN</span>
            )}
          </div>
        </div>
        
        {/* Confidence */}
        <div style={{
          background: 'rgba(33, 150, 243, 0.1)',
          border: '1px solid rgba(33, 150, 243, 0.3)',
          borderRadius: '6px',
          padding: '6px',
          textAlign: 'center'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            marginBottom: '2px'
          }}>
            <span style={{ fontSize: '14px' }}>💪</span>
            <span style={{ color: '#2196F3', fontSize: '10px', fontWeight: 'bold' }}>
              SEBEVĚDOMÍ
            </span>
          </div>
          <div style={{
            color: '#2196F3',
            fontSize: '16px',
            fontWeight: 'bold'
          }}>
            {stats.confidence}%
          </div>
          <div style={{
            fontSize: '9px',
            color: '#999',
            marginTop: '2px'
          }}>
            {stats.confidence >= 80 ? '🔥 VYSOKÉ' :
             stats.confidence >= 60 ? '👍 DOBRÉ' :
             stats.confidence >= 40 ? '😐 STŘEDNÍ' : '😰 NÍZKÉ'}
          </div>
        </div>
      </div>
      
      {/* Performance Info */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '6px',
        padding: '6px',
        fontSize: '10px',
        textAlign: 'center',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ color: '#999' }}>Performance Modifier:</span>
          <span style={{
            color: stats.performance >= 80 ? '#4CAF50' : 
                   stats.performance >= 60 ? '#FFC107' : '#F44336',
            fontWeight: 'bold'
          }}>
            {stats.performance}%
          </span>
        </div>
        <div style={{ 
          fontSize: '9px', 
          color: '#666', 
          marginTop: '2px' 
        }}>
          {stats.performance < 70 && 'Únava snižuje výkon! '}
          {!stats.isOnGround && 'Ve vzduchu! '}
          {stats.isDribbling && 'Kontroluje míč! '}
        </div>
      </div>
      
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </div>
  );
};

// 🔥 OPRAVENÝ: Indikátor střelby se sledováním skutečné pozice myši
export const ShootingIndicator = ({ player }) => {
  const [mousePos, setMousePos] = useState({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const [isPointerLocked, setIsPointerLocked] = useState(false);
  
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    
    // Zabránit pointer lock při nabíjení
    const preventPointerLock = (e) => {
      if (player && player.controls && player.controls.isCharging()) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    
    // Sledování pointer lock stavu
    const handlePointerLockChange = () => {
      setIsPointerLocked(document.pointerLockElement !== null);
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('pointerlockchange', preventPointerLock);
    document.addEventListener('pointerlockerror', preventPointerLock);
    document.addEventListener('pointerlockchange', handlePointerLockChange);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('pointerlockchange', preventPointerLock);
      document.removeEventListener('pointerlockerror', preventPointerLock);
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
    };
  }, [player]);
  
  if (!player || !player.controls || !player.controls.isCharging()) return null;
  
  const chargePower = player.controls.getChargePower();
  const maxChargePower = player.controls.getMaxChargePower();
  const powerPercent = (chargePower / maxChargePower) * 100;
  
  const accuracyData = player.controls.getAccuracyData();
  const { sweetSpotStart, sweetSpotEnd } = accuracyData;
  
  // Sweet spot position in percent
  const sweetStart = sweetSpotStart * 100;
  const sweetEnd = sweetSpotEnd * 100;
  
  // Colors based on power level
  let powerColor = '#FF5722'; // Red for low power
  if (powerPercent > 30) powerColor = '#FF9800'; // Orange for medium
  if (powerPercent > 60) powerColor = '#FFC107'; // Yellow for good
  if (powerPercent > 80) powerColor = '#4CAF50'; // Green for high
  
  return (
    <>
      {/* 🔥 OPRAVENO: Crosshair sleduje skutečnou pozici myši */}
      <div style={{
        position: 'fixed', // Změněno z absolute na fixed
        left: `${mousePos.x}px`,
        top: `${mousePos.y}px`,
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
        zIndex: 9999 // Zvýšeno aby bylo vždy nahoře
      }}>
        {/* Crosshair - vylepšený design pro volné míření */}
        <div style={{
          width: '40px',
          height: '40px',
          border: `3px solid ${powerColor}`,
          borderRadius: '50%',
          position: 'relative',
          animation: 'aimPulse 1s ease-in-out infinite alternate',
          boxShadow: `0 0 20px ${powerColor}, inset 0 0 10px rgba(255,255,255,0.3)`,
          background: 'rgba(0,0,0,0.3)' // Mírné pozadí pro lepší viditelnost
        }}>
          {/* Vertical line */}
          <div style={{
            position: 'absolute',
            left: '50%',
            top: '20%',
            transform: 'translateX(-50%)',
            width: '3px',
            height: '60%',
            background: powerColor,
            boxShadow: `0 0 10px ${powerColor}`,
            borderRadius: '2px'
          }} />
          {/* Horizontal line */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '20%',
            transform: 'translateY(-50%)',
            height: '3px',
            width: '60%',
            background: powerColor,
            boxShadow: `0 0 10px ${powerColor}`,
            borderRadius: '2px'
          }} />
          
          {/* Center dot */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '4px',
            height: '4px',
            background: powerColor,
            borderRadius: '50%',
            boxShadow: `0 0 6px ${powerColor}`
          }} />
        </div>
        
        {/* Power indicator kolem crosshairu - vylepšený */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: `conic-gradient(${powerColor} ${powerPercent * 3.6}deg, rgba(255,255,255,0.2) ${powerPercent * 3.6}deg)`,
          animation: powerPercent > 60 && powerPercent < 80 ? 'sweetSpotGlow 0.5s ease-in-out infinite alternate' : 'none',
          border: '2px solid rgba(255,255,255,0.4)'
        }} />
        
        {/* Sweet spot indicator */}
        {powerPercent > 60 && powerPercent < 80 && (
          <div style={{
            position: 'absolute',
            top: '-30px',
            left: '50%',
            transform: 'translateX(-50%)',
            color: '#4CAF50',
            fontSize: '14px',
            fontWeight: 'bold',
            textShadow: '0 0 10px #4CAF50, 0 0 20px #4CAF50',
            animation: 'sweetSpotText 0.5s ease-in-out infinite alternate',
            background: 'rgba(0,0,0,0.7)',
            padding: '4px 8px',
            borderRadius: '8px',
            border: '1px solid #4CAF50'
          }}>
            SWEET SPOT!
          </div>
        )}
      </div>

      {/* Power Bar - kompaktní */}
      <div style={{
        position: 'fixed', // Změněno z absolute na fixed
        bottom: '80px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(0, 0, 0, 0.9)',
        color: 'white',
        padding: '15px 20px',
        borderRadius: '15px',
        fontFamily: 'Arial, sans-serif',
        fontSize: '14px',
        fontWeight: 'bold',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
        border: '2px solid rgba(255, 255, 255, 0.2)',
        minWidth: '300px',
        textAlign: 'center',
        zIndex: 9998
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '10px',
          marginBottom: '10px'
        }}>
          <span style={{ fontSize: '18px' }}>⚡</span>
          <span style={{ color: powerColor }}>SÍLA: {powerPercent.toFixed(0)}%</span>
        </div>
        
        <div style={{
          position: 'relative',
          width: '100%',
          height: '20px',
          background: 'rgba(255, 255, 255, 0.2)',
          borderRadius: '10px',
          overflow: 'hidden',
          border: '2px solid rgba(255, 255, 255, 0.3)'
        }}>
          {/* Hidden Sweet Spot - pouze lehce naznačený */}
          <div style={{
            position: 'absolute',
            left: `${sweetStart}%`,
            width: `${sweetEnd - sweetStart}%`,
            height: '100%',
            background: 'rgba(76, 175, 80, 0.4)', // Velmi transparentní zelená
            boxShadow: 'inset 0 0 8px rgba(76, 175, 80, 0.6)',
            zIndex: 1
          }} />
          
          {/* Power Fill */}
          <div style={{
            width: `${powerPercent}%`,
            height: '100%',
            background: `linear-gradient(90deg, #FF5722 0%, #FF9800 30%, #FFC107 60%, #4CAF50 80%)`,
            borderRadius: '10px',
            transition: 'width 0.1s ease',
            boxShadow: powerPercent > 50 ? `0 0 10px ${powerColor}` : 'none',
            zIndex: 2,
            position: 'relative'
          }} />
        </div>
        
        <div style={{ 
          fontSize: '11px', 
          marginTop: '8px', 
          opacity: 0.8,
          color: '#ddd'
        }}>
          🎯 Sweet spot je skrytý!
        </div>
      </div>
      
      {/* 🔥 NOVÝ: Indikátor pointer lock režimu */}
      {isPointerLocked && (
        <div style={{
          position: 'fixed',
          top: '60px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(33, 150, 243, 0.9)',
          color: 'white',
          padding: '8px 16px',
          borderRadius: '20px',
          fontSize: '13px',
          fontWeight: 'bold',
          boxShadow: '0 2px 10px rgba(33, 150, 243, 0.4)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          zIndex: 9997
        }}>
          <span>🔒</span>
          <span>Rozhlížení aktivní - ESC pro uvolnění</span>
        </div>
      )}
      
      <style jsx>{`
        @keyframes aimPulse {
          0% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) scale(1.1);
            opacity: 0.8;
          }
        }
        @keyframes sweetSpotGlow {
          0% {
            box-shadow: 0 0 15px rgba(76, 175, 80, 0.5);
          }
          100% {
            box-shadow: 0 0 25px rgba(76, 175, 80, 0.9);
          }
        }
        @keyframes sweetSpotText {
          0% {
            transform: translateX(-50%) scale(1);
            opacity: 1;
          }
          100% {
            transform: translateX(-50%) scale(1.2);
            opacity: 0.8;
          }
        }
      `}</style>
    </>
  );
};

// 🔥 NOVÝ: Systém pro herní zprávy - UPRAVENO PRO SUBTEXT
export const GameMessageSystem = () => {
  const [messages, setMessages] = useState([]);
  
  useEffect(() => {
    // Globální funkce pro zobrazení zpráv
    window.showGameMessage = (text, type = 'info', duration = 5000, subtext = '') => {
      const id = Date.now();
      const newMessage = { id, text, type, subtext };
      
      setMessages(prev => [...prev, newMessage]);
      
      setTimeout(() => {
        setMessages(prev => prev.filter(msg => msg.id !== id));
      }, duration);
    };
    
    // 💾 Rozšíření pro game message system
    if (!window.gameMessageSystem) {
      window.gameMessageSystem = {
        showMessage: (text, type = 'info', subtext = '', duration = 5000) => {
          window.showGameMessage(text, type, duration, subtext);
        }
      };
    }
    
    return () => {
      delete window.showGameMessage;
      delete window.gameMessageSystem;
    };
  }, []);
  
  return (
    <div style={{
      position: 'fixed', // Změněno z absolute na fixed
      bottom: '20px',
      right: '20px',
      pointerEvents: 'none',
      zIndex: 2000,
      display: 'flex',
      flexDirection: 'column-reverse',
      gap: '10px'
    }}>
      {messages.map((message, index) => {
        const colors = {
          success: '#4CAF50',
          error: '#F44336',
          warning: '#FF9800',
          info: '#2196F3'
        };
        
        return (
          <div
            key={message.id}
            style={{
              background: colors[message.type] || colors.info,
              color: 'white',
              padding: '10px 16px',
              borderRadius: '12px',
              fontSize: '13px',
              fontWeight: '600',
              marginBottom: '0',
              boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
              animation: 'slideInUp 0.3s ease-out',
              textAlign: 'left',
              fontFamily: 'Arial, sans-serif',
              maxWidth: '250px',
              whiteSpace: 'pre-wrap',
              border: '1px solid rgba(255,255,255,0.2)'
            }}
          >
            <div>{message.text}</div>
            {message.subtext && (
              <div style={{
                fontSize: '11px',
                opacity: 0.8,
                marginTop: '4px'
              }}>
                {message.subtext}
              </div>
            )}
          </div>
        );
      })}
      
      <style jsx>{`
        @keyframes pulseDot {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.5);
          }
        }
        @keyframes pulseControl {
          0%, 100% {
            transform: translateX(-50%) scale(1);
          }
          50% {
            transform: translateX(-50%) scale(1.02);
          }
        }
        @keyframes pulse {
          from {
            transform: scale(1);
            box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4);
          }
          to {
            transform: scale(1.05);
            box-shadow: 0 6px 16px rgba(76, 175, 80, 0.6);
          }
        }
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

// 🔥 NOVÝ: Indikátor kontroly míče
export const BallControlIndicator = ({ player, ball }) => {
  if (!player || !ball) return null;
  
  const distance = Math.sqrt(
    Math.pow(player.mesh.position.x - ball.mesh.position.x, 2) +
    Math.pow(player.mesh.position.y - ball.mesh.position.y, 2) +
    Math.pow(player.mesh.position.z - ball.mesh.position.z, 2)
  );
  
  const isDribbling = (player.getDribblingStatus ? player.getDribblingStatus() : false) && distance <= player.controlRadius;
  const isInRange = distance <= player.controlRadius;
  const isNearby = distance <= player.controlRadius * 1.5;
  
  // Různé stavy
  let status, color, bgColor, icon, description;
  
  if (isDribbling) {
    status = "AUTOMATICKÝ DRIBLING";
    description = "Míč je pod kontrolou";
    color = "#4CAF50";
    bgColor = "rgba(76, 175, 80, 0.2)";
    icon = "⚽";
  } else if (isInRange) {
    status = "PŘIBLIŽ SE K MÍČI";
    description = "Dotkni se míče pro převzetí";
    color = "#FFC107";
    bgColor = "rgba(255, 193, 7, 0.2)";
    icon = "👟";
  } else if (isNearby) {
    status = "MÍČ JE BLÍZKO";
    description = `Vzdálenost: ${distance.toFixed(1)}m`;
    color = "#FF9800";
    bgColor = "rgba(255, 152, 0, 0.2)";
    icon = "🏃";
  } else {
    status = "NAJDI MÍČ";
    description = `Vzdálenost: ${distance.toFixed(1)}m`;
    color = "#9E9E9E";
    bgColor = "rgba(158, 158, 158, 0.1)";
    icon = "📍";
  }
  
  return (
    <div style={{
      position: 'fixed', // Změněno z absolute na fixed
      bottom: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      background: bgColor,
      border: `2px solid ${color}`,
      color: color,
      padding: '12px 20px',
      borderRadius: '25px',
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px',
      fontWeight: 'bold',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '4px',
      boxShadow: `0 4px 12px ${bgColor}`,
      transition: 'all 0.3s ease',
      animation: isDribbling ? 'pulseControl 2s ease-in-out infinite' : 'none',
      zIndex: 1000
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '24px' }}>{icon}</span>
        <span>{status}</span>
        {isDribbling && (
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: color,
            animation: 'pulseDot 1s ease-in-out infinite'
          }} />
        )}
      </div>
      <div style={{ fontSize: '12px', opacity: 0.8 }}>{description}</div>
      {player.skillLevel && (
        <div style={{ 
          fontSize: '10px', 
          marginTop: '4px',
          padding: '2px 8px',
          background: 'rgba(0,0,0,0.2)',
          borderRadius: '10px'
        }}>
          Skill Level {player.skillLevel}
        </div>
      )}
      
      <style jsx>{`
        @keyframes pulseControl {
          0%, 100% {
            transform: translateX(-50%) scale(1);
          }
          50% {
            transform: translateX(-50%) scale(1.02);
          }
        }
        @keyframes pulseDot {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.5);
          }
        }
      `}</style>
    </div>
  );
};

// Panel ovládání pro hru
export const GameControlsPanel = ({ isFirstPerson, showControls }) => {
  if (!showControls) return null;

  return (
    <div style={{
      position: 'fixed', // Změněno z absolute na fixed
      top: '220px', // Posunutý dolů kvůli Player Stats Overlay
      left: '20px',
      background: 'rgba(0, 0, 0, 0.8)',
      color: 'white',
      padding: '20px',
      borderRadius: '15px',
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px',
      zIndex: 1000,
      maxWidth: '350px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
      border: '1px solid rgba(255, 255, 255, 0.1)'
    }}>
      <h3 style={{ margin: '0 0 15px 0', color: '#4CAF50', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '24px' }}>⚽</span>
        <span>Vylepšená fotbalová hra!</span>
      </h3>
      
      <div style={{ marginBottom: '12px', padding: '10px', background: 'rgba(76, 175, 80, 0.2)', borderRadius: '8px', border: '1px solid rgba(76, 175, 80, 0.3)' }}>
        <strong style={{ color: '#4CAF50' }}>🎮 NOVÉ OVLÁDÁNÍ:</strong>
      </div>
      
      <div style={{ marginBottom: '8px' }}>🏃‍♂️ <strong>W/S</strong> nebo <strong>↑/↓</strong> - pohyb dopředu/dozadu</div>
      <div style={{ marginBottom: '8px' }}>🔄 <strong>A/D</strong> nebo <strong>←/→</strong> - otáčení vlevo/vpravo</div>
      <div style={{ marginBottom: '8px' }}>💨 <strong>SHIFT</strong> - sprint (2x rychlost)</div>
      <div style={{ marginBottom: '8px' }}>🦘 <strong>SPACE</strong> - skok</div>
      <div style={{ marginBottom: '8px', padding: '8px', background: 'rgba(255, 193, 7, 0.2)', borderRadius: '6px', border: '1px solid rgba(255, 193, 7, 0.3)' }}>
        <strong style={{ color: '#FFC107' }}>🎯 VOLNÉ MÍŘENÍ MYŠI:</strong><br/>
        <span style={{ fontSize: '12px', color: '#ddd' }}>
          <strong>Drž levé tlačítko</strong> - nabíjej + crosshair sleduje myš<br/>
          <strong>Hýbej myší</strong> - mířidlo se pohybuje volně po obrazovce<br/>
          <strong>Pusť tlačítko</strong> - střela tam kde je crosshair!<br/>
          <strong>Sweet spot 60-80%</strong> - perfektní přesnost<br/>
          <strong style={{ color: '#4CAF50' }}>🔥 TIP: Pravé tlačítko = rozhlížení (pointer lock)</strong>
        </span>
      </div>
      <div style={{ marginBottom: '8px' }}>📷 <strong>V</strong> - přepnout pohled ({isFirstPerson ? 'První osoba' : 'Třetí osoba'})</div>
      <div style={{ marginBottom: '8px' }}>🖱️ <strong>Pravé tlačítko myši</strong> - {isFirstPerson ? 'rozhlížení (zamkne kurzor)' : 'otáčení kamery'}</div>
      <div style={{ marginBottom: '8px' }}>🔄 <strong>R</strong> - reset pozice míče</div>
      <div style={{ marginBottom: '8px' }}>👁️ <strong>H</strong> - skrýt/zobrazit ovládání</div>
      <div style={{ marginBottom: '8px' }}>🏠 <strong>ESC</strong> - zpět do menu</div>
      
      <div style={{ marginTop: '15px', padding: '10px', background: 'rgba(255, 193, 7, 0.2)', borderRadius: '8px', border: '1px solid rgba(255, 193, 7, 0.3)' }}>
        <strong style={{ color: '#FFC107' }}>✨ AUTOMATICKÉ VEDENÍ MÍČE:</strong>
        <div style={{ fontSize: '12px', marginTop: '5px', color: '#ddd' }}>
          Přiblíž se k míči a automaticky ho budeš driblovat!<br/>
          <strong>💡 Tip:</strong> Během driblingu je střela silnější a má větší dosah!<br/>
          <strong>⚡ Sprint:</strong> Při sprintu kopneš míč dál dopředu<br/>
          <strong>🦘 Skok:</strong> Ve vzduchu slabší ale vyšší kopnutí<br/>
          <strong>🎯 Nová střelба:</strong> Drž myš pro nabíjení, trefi zelenou!
        </div>
      </div>
      
      <div style={{ fontSize: '12px', color: '#aaa', marginTop: '15px', paddingTop: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
        ✅ Volné míření po celé obrazovce + Sweet spot!<br/>
        📊 Sleduj staminu a atributy v levém horním rohu!
      </div>
    </div>
  );
};

// Indikátor dribblingu
export const DribblingIndicator = ({ isDribbling }) => {
  if (!isDribbling) return null;

  return (
    <div style={{
      position: 'fixed', // Změněno z absolute na fixed
      top: '80px',
      right: '420px', // Posunutý vlevo kvůli Player Stats Overlay
      background: 'linear-gradient(45deg, #FF6B35, #F7931E)',
      color: 'white',
      padding: '12px 18px',
      borderRadius: '25px',
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px',
      fontWeight: 'bold',
      boxShadow: '0 4px 20px rgba(255, 107, 53, 0.4)',
      animation: 'pulse 1.5s ease-in-out infinite alternate',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      zIndex: 1000
    }}>
      <span style={{ fontSize: '18px' }}>⚽</span>
      <span>DRIBLOVÁNÍ</span>
      <div style={{
        fontSize: '10px',
        background: 'rgba(255, 255, 255, 0.3)',
        padding: '2px 6px',
        borderRadius: '10px',
        marginLeft: '5px'
      }}>
        VOLNÉ MÍŘENÍ
      </div>
      
      <style jsx>{`
        @keyframes pulse {
          from {
            transform: scale(1);
            box-shadow: 0 4px 20px rgba(255, 107, 53, 0.4);
          }
          to {
            transform: scale(1.05);
            box-shadow: 0 6px 20px rgba(255, 107, 53, 0.4);
          }
        }
      `}</style>
    </div>
  );
};

// Univerzální tlačítko zpět
export const BackToMenuButton = ({ onClick, position = 'top-right' }) => {
  const positionStyles = {
    'top-right': { top: '20px', right: '20px' },
    'top-right-offset': { top: '20px', right: '140px' }
  };

  return (
    <button
      onClick={onClick}
      style={{
        position: 'fixed', // Změněno z absolute na fixed
        ...positionStyles[position],
        background: 'rgba(244, 67, 54, 0.9)',
        color: 'white',
        border: 'none',
        padding: position === 'top-right-offset' ? '10px 15px' : '12px 20px',
        borderRadius: position === 'top-right-offset' ? '20px' : '25px',
        fontSize: position === 'top-right-offset' ? '12px' : '14px',
        fontWeight: 'bold',
        cursor: 'pointer',
        boxShadow: '0 4px 15px rgba(244, 67, 54, 0.3)',
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        gap: position === 'top-right-offset' ? '6px' : '8px',
        zIndex: 1000
      }}
      onMouseEnter={(e) => {
        e.target.style.background = 'rgba(244, 67, 54, 1)';
        e.target.style.transform = 'translateY(-2px)';
        e.target.style.boxShadow = '0 6px 20px rgba(244, 67, 54, 0.4)';
      }}
      onMouseLeave={(e) => {
        e.target.style.background = 'rgba(244, 67, 54, 0.9)';
        e.target.style.transform = 'translateY(0)';
        e.target.style.boxShadow = '0 4px 15px rgba(244, 67, 54, 0.3)';
      }}
    >
      <span style={{ fontSize: position === 'top-right-offset' ? '14px' : '16px' }}>🏠</span>
      <span>MENU</span>
    </button>
  );
};

// Indikátor cooldownu kopnutí
export const KickCooldownIndicator = ({ kickCooldown, isDribbling }) => {
  if (kickCooldown <= 0) return null;

  return (
    <div style={{
      position: 'fixed', // Změněno z absolute na fixed
      top: isDribbling ? '140px' : '80px',
      right: '420px', // Posunutý vlevo kvůli Player Stats Overlay
      background: 'linear-gradient(45deg, #9E9E9E, #757575)',
      color: 'white',
      padding: '10px 16px',
      borderRadius: '20px',
      fontFamily: 'Arial, sans-serif',
      fontSize: '13px',
      fontWeight: 'bold',
      boxShadow: '0 4px 15px rgba(158, 158, 158, 0.4)',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      opacity: 0.9,
      zIndex: 1000
    }}>
      <span style={{ fontSize: '16px' }}>⏱️</span>
      <span>COOLDOWN: {kickCooldown.toFixed(1)}s</span>
    </div>
  );
};

// Indikátor kamery
export const CameraIndicator = ({ isFirstPerson }) => {
  return (
    <div style={{
      position: 'fixed', // Změněno z absolute na fixed
      top: '20px',
      right: '20px',
      background: 'rgba(0, 0, 0, 0.8)',
      color: 'white',
      padding: '12px 18px',
      borderRadius: '25px',
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px',
      fontWeight: 'bold',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      zIndex: 1000
    }}>
      {isFirstPerson ? '👤 Smart kamera' : '📹 Třetí osoba'}
    </div>
  );
};

// Status panel pro hru
export const GameStatusPanel = () => {
  return (
    <div style={{
      position: 'fixed', // Změněno z absolute na fixed
      bottom: '20px',
      left: '320px', // Posunutý vpravo kvůli Player Stats Overlay
      background: 'linear-gradient(45deg, #4CAF50, #45a049)',
      color: 'white',
      padding: '12px 24px',
      borderRadius: '30px',
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px',
      fontWeight: 'bold',
      boxShadow: '0 6px 20px rgba(76, 175, 80, 0.4)',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      zIndex: 1000
    }}>
      <span style={{ fontSize: '22px' }}>🖱️</span>
      <span>Volné míření po celé obrazovce!</span>
    </div>
  );
};

// 💾 NOVÝ: Indikátor neuložených změn
export const UnsavedChangesIndicator = () => {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState(null);
  const [savingInProgress, setSavingInProgress] = useState(false);
  
  useEffect(() => {
    const checkUnsavedChanges = () => {
      const manager = window.playerDataManager?.stadiumManager;
      if (manager) {
        const unsaved = manager.hasUnsavedChanges();
        setHasUnsavedChanges(unsaved);
      }
    };
    
    // Poslouchej události ukládání
    const handleSaveComplete = () => {
      setLastSaveTime(new Date());
      setSavingInProgress(false);
      setHasUnsavedChanges(false);
    };
    
    const handleSaveStart = () => {
      setSavingInProgress(true);
    };
    
    // Kontroluj změny každou sekundu
    const interval = setInterval(checkUnsavedChanges, 1000);
    
    // Poslouchej custom události
    window.addEventListener('stadiumSaveComplete', handleSaveComplete);
    window.addEventListener('stadiumSaveStart', handleSaveStart);
    
    // Cleanup
    return () => {
      clearInterval(interval);
      window.removeEventListener('stadiumSaveComplete', handleSaveComplete);
      window.removeEventListener('stadiumSaveStart', handleSaveStart);
    };
  }, []);
  
  const handleSave = () => {
    const manager = window.playerDataManager?.stadiumManager;
    if (manager && !savingInProgress) {
      console.log('💾 Manual save triggered from UI');
      manager.saveStadium();
    }
  };
  
  const formatTime = (date) => {
    if (!date) return '';
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    
    if (diffSec < 60) return `před ${diffSec}s`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `před ${diffMin}min`;
    const diffHour = Math.floor(diffMin / 60);
    return `před ${diffHour}h`;
  };
  
  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      left: '320px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      zIndex: 2000
    }}>
      {/* Hlavní indikátor */}
      <div style={{
        background: hasUnsavedChanges ? 'rgba(255, 152, 0, 0.9)' : 'rgba(76, 175, 80, 0.9)',
        color: 'white',
        padding: '10px 16px',
        borderRadius: '20px',
        fontFamily: 'Arial, sans-serif',
        fontSize: '13px',
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        boxShadow: `0 2px 10px ${hasUnsavedChanges ? 'rgba(255, 152, 0, 0.4)' : 'rgba(76, 175, 80, 0.4)'}`,
        transition: 'all 0.3s ease',
        animation: hasUnsavedChanges ? 'unsavedPulse 2s ease-in-out infinite' : 'none'
      }}>
        <span style={{ fontSize: '16px' }}>
          {savingInProgress ? '⏳' : hasUnsavedChanges ? '⚠️' : '✅'}
        </span>
        <span>
          {savingInProgress ? 'Ukládám...' : 
           hasUnsavedChanges ? 'Neuložené změny' : 
           'Vše uloženo'}
        </span>
        {lastSaveTime && !hasUnsavedChanges && !savingInProgress && (
          <span style={{ fontSize: '11px', opacity: 0.8 }}>
            ({formatTime(lastSaveTime)})
          </span>
        )}
      </div>
      
      {/* Tlačítko pro ruční save */}
      {hasUnsavedChanges && !savingInProgress && (
        <button
          onClick={handleSave}
          style={{
            background: 'rgba(33, 150, 243, 0.9)',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '16px',
            fontSize: '12px',
            fontWeight: 'bold',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 2px 8px rgba(33, 150, 243, 0.4)',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(33, 150, 243, 1)';
            e.target.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(33, 150, 243, 0.9)';
            e.target.style.transform = 'translateY(0)';
          }}
        >
          <span>💾</span>
          <span>ULOŽIT</span>
          <span style={{ fontSize: '10px', opacity: 0.8 }}>(Ctrl+S)</span>
        </button>
      )}
      
      {/* Klávesová zkratka hint */}
      {hasUnsavedChanges && (
        <div style={{
          background: 'rgba(0, 0, 0, 0.7)',
          color: 'white',
          padding: '6px 10px',
          borderRadius: '12px',
          fontSize: '11px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          <span>⌨️</span>
          <span>Ctrl+S pro rychlé uložení</span>
        </div>
      )}
      
      <style jsx>{`
        @keyframes unsavedPulse {
          0%, 100% {
            opacity: 0.9;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.02);
          }
        }
      `}</style>
    </div>
  );
};