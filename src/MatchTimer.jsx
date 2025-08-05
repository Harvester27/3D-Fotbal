// src/MatchTimer.jsx - Časomíra a skóre pro AI zápasy
import React, { useState, useEffect } from 'react';
import { matchManager } from './MatchManager.js';

const MatchTimer = ({ aiOpponent, onMatchEnd }) => {
  const [matchState, setMatchState] = useState(matchManager.getCurrentState());
  const [isVisible, setIsVisible] = useState(true);
  const [goalCelebration, setGoalCelebration] = useState(null);

  useEffect(() => {
    // Event listeners pro real-time updates
    const handleTimeUpdate = (data) => {
      setMatchState(prevState => ({
        ...prevState,
        time: data.currentTime,
        formattedTime: data.formattedTime,
        remainingTime: data.remainingTime,
        progress: data.currentTime / 60 // 60 sekund
      }));
    };

    const handleGoalScored = (data) => {
      setMatchState(prevState => ({
        ...prevState,
        score: data.score
      }));
      
      // Goal celebration effect
      setGoalCelebration({
        team: data.team,
        time: Date.now()
      });
      
      // Blikání při gólu
      setIsVisible(false);
      setTimeout(() => setIsVisible(true), 200);
      setTimeout(() => setIsVisible(false), 400);
      setTimeout(() => setIsVisible(true), 600);
      
      // Clear celebration after 3 seconds
      setTimeout(() => {
        setGoalCelebration(null);
      }, 3000);
    };

    const handleStateChange = (data) => {
      setMatchState(prevState => ({
        ...prevState,
        matchState: data.state,
        score: data.score,
        time: data.time
      }));
    };

    const handleMatchEnd = (data) => {
      setMatchState(prevState => ({
        ...prevState,
        matchState: 'ended',
        matchResult: data.result,
        score: data.score
      }));
      
      // Notify parent component
      if (onMatchEnd) {
        onMatchEnd(data);
      }
    };

    // Register event listeners
    matchManager.addEventListener('timeUpdate', handleTimeUpdate);
    matchManager.addEventListener('goalScored', handleGoalScored);
    matchManager.addEventListener('stateChange', handleStateChange);
    matchManager.addEventListener('matchEnd', handleMatchEnd);

    // Initial state update
    setMatchState(matchManager.getCurrentState());

    // Cleanup
    return () => {
      matchManager.removeEventListener('timeUpdate', handleTimeUpdate);
      matchManager.removeEventListener('goalScored', handleGoalScored);
      matchManager.removeEventListener('stateChange', handleStateChange);
      matchManager.removeEventListener('matchEnd', handleMatchEnd);
    };
  }, [onMatchEnd]);

  // Não render if not visible during celebration
  if (!isVisible) return null;

  const getTimerColor = () => {
    if (matchState.remainingTime < 10) return '#ff4444';
    if (matchState.remainingTime < 30) return '#ff9800';
    return '#00ff88';
  };

  return (
    <>
      {/* Main timer display */}
      <div style={{
        position: 'fixed',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'center',
        gap: '30px',
        background: 'rgba(0, 0, 0, 0.85)',
        padding: '15px 30px',
        borderRadius: '20px',
        fontFamily: "'Segoe UI', Arial, sans-serif",
        fontWeight: 'bold',
        color: 'white',
        backdropFilter: 'blur(15px)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        zIndex: 1000,
        userSelect: 'none',
        minWidth: '400px'
      }}>
        {/* Timer section */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '5px'
        }}>
          <div style={{
            fontSize: '12px',
            opacity: 0.7,
            letterSpacing: '1px',
            textTransform: 'uppercase'
          }}>
            ČAS
          </div>
          <div style={{
            fontSize: '28px',
            fontWeight: '900',
            color: getTimerColor(),
            textShadow: `0 0 10px ${getTimerColor()}40`,
            minWidth: '80px',
            textAlign: 'center',
            fontFamily: 'monospace'
          }}>
            {matchState.formattedTime}
          </div>
        </div>

        {/* Score section */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          fontSize: '24px'
        }}>
          {/* Player score */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '5px'
          }}>
            <div style={{
              fontSize: '11px',
              opacity: 0.7,
              letterSpacing: '1px',
              textTransform: 'uppercase'
            }}>
              TY
            </div>
            <div style={{
              fontSize: '36px',
              fontWeight: '900',
              color: '#4CAF50',
              textShadow: '0 0 10px rgba(76, 175, 80, 0.4)',
              minWidth: '50px',
              textAlign: 'center'
            }}>
              {matchState.score.player}
            </div>
          </div>

          {/* Separator */}
          <div style={{
            fontSize: '24px',
            opacity: 0.5,
            fontWeight: 'normal'
          }}>
            -
          </div>

          {/* AI score */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '5px'
          }}>
            <div style={{
              fontSize: '36px',
              fontWeight: '900',
              color: '#F44336',
              textShadow: '0 0 10px rgba(244, 67, 54, 0.4)',
              minWidth: '50px',
              textAlign: 'center'
            }}>
              {matchState.score.opponent}
            </div>
            <div style={{
              fontSize: '11px',
              opacity: 0.7,
              letterSpacing: '1px',
              textTransform: 'uppercase'
            }}>
              {aiOpponent?.name?.substring(0, 8) || 'AI'}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{
          position: 'absolute',
          bottom: '0',
          left: '0',
          width: '100%',
          height: '3px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '0 0 20px 20px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${(matchState.progress || 0) * 100}%`,
            height: '100%',
            background: `linear-gradient(90deg, ${getTimerColor()}, ${getTimerColor()}80)`,
            transition: 'width 0.1s linear'
          }} />
        </div>
      </div>

      {/* Match state indicator */}
      {matchState.matchState !== 'playing' && (
        <div style={{
          position: 'fixed',
          top: '90px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: matchState.matchState === 'ready' ? 'rgba(76, 175, 80, 0.9)' :
                     matchState.matchState === 'paused' ? 'rgba(255, 193, 7, 0.9)' :
                     matchState.matchState === 'ended' ? 'rgba(33, 150, 243, 0.9)' :
                     'rgba(158, 158, 158, 0.9)',
          color: 'white',
          padding: '10px 20px',
          borderRadius: '15px',
          fontSize: '16px',
          fontWeight: 'bold',
          textAlign: 'center',
          zIndex: 999,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
          animation: matchState.matchState === 'ready' ? 'pulse 1.5s ease-in-out infinite' : 'none'
        }}>
          {matchState.matchState === 'ready' && '🚀 PŘIPRAVEN - zápas začne brzy!'}
          {matchState.matchState === 'paused' && '⏸️ PAUZA'}
          {matchState.matchState === 'ended' && (
            <>
              🏁 KONEC ZÁPASU - {matchState.matchResult === 'win' ? '🏆 VÝHRA!' : 
                                 matchState.matchResult === 'lose' ? '😞 PROHRA' : 
                                 '🤝 REMÍZA'}
            </>
          )}
        </div>
      )}

      {/* Goal celebration */}
      {goalCelebration && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: goalCelebration.team === 'player' ? 
            'linear-gradient(45deg, #4CAF50, #66BB6A)' : 
            'linear-gradient(45deg, #F44336, #EF5350)',
          color: 'white',
          padding: '30px 50px',
          borderRadius: '25px',
          fontSize: '2.5rem',
          fontWeight: 'bold',
          textAlign: 'center',
          zIndex: 1001,
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
          animation: 'goalCelebration 3s ease-out forwards',
          textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)'
        }}>
          {goalCelebration.team === 'player' ? '⚽ GÓL!' : '😞 AI SKÓROVALO'}
          <div style={{
            fontSize: '1.2rem',
            marginTop: '10px',
            opacity: 0.9
          }}>
            {matchState.score.player} - {matchState.score.opponent}
          </div>
        </div>
      )}

      {/* Match controls hint */}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        background: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        padding: '12px 16px',
        borderRadius: '12px',
        fontSize: '12px',
        zIndex: 998,
        opacity: 0.8,
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div><strong>P</strong> - Pauza/Pokračovat</div>
        <div><strong>T</strong> - Debug čas</div>
        <div><strong>Shift+R</strong> - Reset zápasu</div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { 
            opacity: 1; 
            transform: translateX(-50%) scale(1);
          }
          50% { 
            opacity: 0.8; 
            transform: translateX(-50%) scale(0.98);
          }
        }
        
        @keyframes goalCelebration {
          0% {
            transform: translate(-50%, -50%) scale(0.5);
            opacity: 0;
          }
          20% {
            transform: translate(-50%, -50%) scale(1.2);
            opacity: 1;
          }
          80% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) scale(0.8);
            opacity: 0;
          }
        }
        
        /* Responsive design */
        @media (max-width: 768px) {
          div[style*="minWidth: 400px"] {
            min-width: 300px !important;
            padding: 12px 20px !important;
            gap: 20px !important;
          }
          
          div[style*="fontSize: 28px"] {
            font-size: 24px !important;
          }
          
          div[style*="fontSize: 36px"] {
            font-size: 28px !important;
          }
        }
      `}</style>
    </>
  );
};

export default MatchTimer;