// src/LoginScreen.jsx - Přihlašovací obrazovka pro start hry
import React, { useState } from 'react';
import { firebaseManager } from './FirebaseManager.js';

export const LoginScreen = ({ onLoginSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    
    try {
      const user = await firebaseManager.signInWithGoogle();
      console.log("✅ Úspěšně přihlášen:", user.displayName);
      
      // Krátká pauza pro UX
      setTimeout(() => {
        onLoginSuccess(user);
        setLoading(false);
      }, 500);
      
    } catch (error) {
      console.error("❌ Chyba při přihlašování:", error);
      setError(error.message);
      setLoading(false);
    }
  };

  const handleSkipLogin = () => {
    console.log("⚠️ Hraje bez přihlášení - limited features");
    onLoginSuccess(null); // null = anonymous user
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Arial, sans-serif',
      overflow: 'hidden',
      zIndex: 3000
    }}>
      {/* Animovaný fotbalový pattern na pozadí */}
      <div style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        opacity: 0.1,
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.3'%3E%3Ccircle cx='30' cy='30' r='15'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        animation: 'float 6s ease-in-out infinite'
      }} />
      
      {/* Hlavní přihlašovací panel */}
      <div style={{
        textAlign: 'center',
        color: 'white',
        zIndex: 10,
        maxWidth: '500px',
        padding: '50px 40px',
        background: 'rgba(255, 255, 255, 0.15)',
        borderRadius: '25px',
        backdropFilter: 'blur(20px)',
        border: '2px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)',
        transform: 'translateY(-20px)',
        animation: loading ? 'pulse 2s ease-in-out infinite' : 'slideIn 1s ease-out'
      }}>
        {/* Logo/ikona */}
        <div style={{
          fontSize: '80px',
          marginBottom: '20px',
          animation: loading ? 'spin 2s linear infinite' : 'bounce 3s ease-in-out infinite',
          filter: 'drop-shadow(0 10px 20px rgba(0, 0, 0, 0.3))'
        }}>
          {loading ? '⚡' : '⚽'}
        </div>
        
        {/* Název hry */}
        <h1 style={{
          fontSize: '3rem',
          fontWeight: 'bold',
          margin: '0 0 10px 0',
          background: 'linear-gradient(45deg, #FFD700, #FFA500, #FF6B35)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          textShadow: '0 4px 8px rgba(0, 0, 0, 0.3)'
        }}>
          FOTBAL 3D ONLINE
        </h1>
        
        {/* Popis */}
        <p style={{
          fontSize: '1.2rem',
          margin: '0 0 30px 0',
          opacity: 0.9,
          fontStyle: 'italic'
        }}>
          {loading ? 'Přihlašuji...' : 'Přihlas se pro nejlepší zážitek!'}
        </p>
        
        {/* Výhody přihlášení */}
        {!loading && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '15px',
            margin: '20px 0 40px 0'
          }}>
            <div style={{
              background: 'rgba(76, 175, 80, 0.2)',
              padding: '12px',
              borderRadius: '12px',
              border: '1px solid rgba(76, 175, 80, 0.3)'
            }}>
              <div style={{ fontSize: '20px', marginBottom: '5px' }}>💾</div>
              <div style={{ fontSize: '12px', fontWeight: 'bold' }}>Ukládání stadionů</div>
            </div>
            
            <div style={{
              background: 'rgba(33, 150, 243, 0.2)',
              padding: '12px',
              borderRadius: '12px',
              border: '1px solid rgba(33, 150, 243, 0.3)'
            }}>
              <div style={{ fontSize: '20px', marginBottom: '5px' }}>🎮</div>
              <div style={{ fontSize: '12px', fontWeight: 'bold' }}>Online multiplayer</div>
            </div>
            
            <div style={{
              background: 'rgba(255, 193, 7, 0.2)',
              padding: '12px',
              borderRadius: '12px',
              border: '1px solid rgba(255, 193, 7, 0.3)'
            }}>
              <div style={{ fontSize: '20px', marginBottom: '5px' }}>🏆</div>
              <div style={{ fontSize: '12px', fontWeight: 'bold' }}>Statistiky & žebříčky</div>
            </div>
          </div>
        )}
        
        {/* Chybová zpráva */}
        {error && (
          <div style={{
            background: 'rgba(244, 67, 54, 0.2)',
            border: '1px solid rgba(244, 67, 54, 0.5)',
            borderRadius: '8px',
            padding: '10px',
            marginBottom: '20px',
            color: '#ffcdd2',
            fontSize: '14px'
          }}>
            ❌ {error}
          </div>
        )}
        
        {/* Přihlašovací tlačítka */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '15px',
          marginBottom: '25px'
        }}>
          {/* Google přihlášení */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            style={{
              padding: '15px 30px',
              background: loading ? 
                'linear-gradient(45deg, #ccc, #aaa)' : 
                'linear-gradient(45deg, #4285f4, #34a853, #fbbc05, #ea4335)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              transition: 'all 0.3s ease',
              transform: loading ? 'scale(0.98)' : 'scale(1)',
              boxShadow: loading ? 'none' : '0 8px 25px rgba(66, 133, 244, 0.4)'
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.transform = 'scale(1.02) translateY(-2px)';
                e.target.style.boxShadow = '0 12px 35px rgba(66, 133, 244, 0.6)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.target.style.transform = 'scale(1) translateY(0)';
                e.target.style.boxShadow = '0 8px 25px rgba(66, 133, 244, 0.4)';
              }
            }}
          >
            <span style={{ fontSize: '20px' }}>
              {loading ? '⏳' : '🔍'}
            </span>
            <span>
              {loading ? 'Přihlašuji...' : 'Přihlásit se přes Google'}
            </span>
          </button>
          
          {/* Hrát bez přihlášení */}
          {!loading && (
            <button
              onClick={handleSkipLogin}
              style={{
                padding: '12px 25px',
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'rgba(255, 255, 255, 0.8)',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '10px',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                e.target.style.color = 'white';
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                e.target.style.color = 'rgba(255, 255, 255, 0.8)';
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
              }}
            >
              🎮 Hrát bez přihlášení (omezené funkce)
            </button>
          )}
        </div>
        
        {/* Informace o zabezpečení */}
        <div style={{
          fontSize: '11px',
          opacity: 0.7,
          color: '#ddd',
          lineHeight: '1.4'
        }}>
          🔒 Tvoje data jsou v bezpečí díky Firebase zabezpečení<br/>
          📧 Používáme pouze základní informace z Google účtu
        </div>
      </div>
      
      {/* CSS animace */}
      <style jsx>{`
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          40% {
            transform: translateY(-15px) rotate(10deg);
          }
          60% {
            transform: translateY(-8px) rotate(-5deg);
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
          }
          50% {
            transform: translateY(-20px) translateX(10px);
          }
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(50px);
          }
          to {
            opacity: 1;
            transform: translateY(-20px);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            transform: translateY(-20px) scale(1);
          }
          50% {
            transform: translateY(-20px) scale(1.02);
          }
        }
        
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};