// src/CameraControlPanel.jsx
import React from 'react';

export const CameraControlPanel = ({ 
  manualCameraMode, 
  setManualCameraMode, 
  cameraPosition, 
  cameraZoom,
  gameState,
  // 🆕 NEW: User controlled camera props
  userControlledCamera,
  resetCameraControl
}) => {
  // Zobrazit pouze v editoru
  if (gameState !== 'editor') return null;

  return (
    <div style={{
      position: 'absolute',
      top: '20px',
      right: '380px', // Vedle hlavního panelu
      background: 'rgba(0, 0, 0, 0.9)',
      color: 'white',
      padding: '15px',
      borderRadius: '12px',
      fontFamily: 'Arial, sans-serif',
      fontSize: '13px',
      zIndex: 1000,
      minWidth: '220px',
      boxShadow: '0 6px 25px rgba(0, 0, 0, 0.4)',
      // 🆕 UPDATED: Border color reflects both manual mode AND user control
      border: userControlledCamera ? '2px solid #4CAF50' : 
             manualCameraMode ? '2px solid #2196F3' : 
             '2px solid rgba(255, 255, 255, 0.2)',
      transition: 'all 0.3s ease'
    }}>
      {/* 🆕 UPDATED: Hlavička panelu s user control indikátorem */}
      <h4 style={{ 
        margin: '0 0 12px 0', 
        color: userControlledCamera ? '#4CAF50' : 
               manualCameraMode ? '#2196F3' : '#FFC107', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px',
        fontSize: '14px'
      }}>
        <span style={{ fontSize: '18px' }}>
          {userControlledCamera ? '🎮' : '📷'}
        </span>
        <span>
          {userControlledCamera ? 'Uživatelská kamera' : 'Ovládání kamery'}
        </span>
      </h4>
      
      {/* 🆕 UPDATED: Status indikátor */}
      <div style={{
        background: userControlledCamera ? 
          'rgba(76, 175, 80, 0.2)' : 
          'rgba(158, 158, 158, 0.2)',
        padding: '8px',
        borderRadius: '6px',
        border: userControlledCamera ? 
          '1px solid rgba(76, 175, 80, 0.3)' : 
          '1px solid rgba(158, 158, 158, 0.3)',
        marginBottom: '12px',
        fontSize: '11px',
        textAlign: 'center'
      }}>
        <div style={{ 
          color: userControlledCamera ? '#4CAF50' : '#999', 
          fontWeight: 'bold' 
        }}>
          {userControlledCamera ? 
            '✅ KAMERA POD UŽIVATELSKOU KONTROLOU' : 
            '🔒 Automatická kamera'}
        </div>
        <div style={{ color: '#ddd', fontSize: '10px', marginTop: '3px' }}>
          {userControlledCamera ? 
            'Pozice a pohled se nebudou automaticky měnit' : 
            'Kamera se může automaticky resetovat'}
        </div>
      </div>
      
      {/* Aktivační tlačítko pro manual mode */}
      <button
        onClick={() => setManualCameraMode(!manualCameraMode)}
        style={{
          width: '100%',
          padding: '10px 12px',
          background: manualCameraMode ? 
            'linear-gradient(45deg, #2196F3, #1976D2)' : 
            'linear-gradient(45deg, #666, #555)',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '12px',
          fontWeight: 'bold',
          marginBottom: '12px',
          transition: 'all 0.3s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px'
        }}
        onMouseEnter={(e) => {
          if (manualCameraMode) {
            e.target.style.background = 'linear-gradient(45deg, #1976D2, #1565C0)';
          } else {
            e.target.style.background = 'linear-gradient(45deg, #777, #666)';
          }
        }}
        onMouseLeave={(e) => {
          if (manualCameraMode) {
            e.target.style.background = 'linear-gradient(45deg, #2196F3, #1976D2)';
          } else {
            e.target.style.background = 'linear-gradient(45deg, #666, #555)';
          }
        }}
      >
        <span style={{ fontSize: '16px' }}>
          {manualCameraMode ? '📸' : '📷'}
        </span>
        <span>
          {manualCameraMode ? 'RUČNÍ REŽIM AKTIVNÍ' : 'AKTIVOVAT RUČNÍ REŽIM'}
        </span>
      </button>

      {/* Ovládání - zobrazí se pouze když je aktivní */}
      {manualCameraMode ? (
        <div>
          {/* Informace o pozici */}
          <div style={{
            background: 'rgba(33, 150, 243, 0.2)',
            padding: '8px',
            borderRadius: '6px',
            border: '1px solid rgba(33, 150, 243, 0.3)',
            marginBottom: '10px',
            fontSize: '11px'
          }}>
            <div style={{ color: '#64B5F6', fontWeight: 'bold', marginBottom: '4px' }}>
              📍 Pozice + Pohled kamery:
            </div>
            <div style={{ color: '#ddd', lineHeight: '1.3' }}>
              <strong>Pozice X:</strong> {cameraPosition?.x?.toFixed(1) || '0.0'}<br/>
              <strong>Pozice Y:</strong> {cameraPosition?.y?.toFixed(1) || '35.0'}<br/>
              <strong>Pozice Z:</strong> {cameraPosition?.z?.toFixed(1) || '50.0'}<br/>
              <strong>Zoom:</strong> {cameraZoom?.toFixed(1) || '1.0'}x
            </div>
          </div>

          {/* Ovládací nápověda */}
          <div style={{
            background: 'rgba(76, 175, 80, 0.2)',
            padding: '8px',
            borderRadius: '6px',
            border: '1px solid rgba(76, 175, 80, 0.3)',
            fontSize: '11px',
            lineHeight: '1.4',
            marginBottom: '8px'
          }}>
            <div style={{ color: '#4CAF50', fontWeight: 'bold', marginBottom: '4px' }}>
              🎮 Ovládání:
            </div>
            <div style={{ color: '#ddd' }}>
              <strong>↑↓←→</strong> - Otáčení pohledu (progresivní)<br/>
              <strong>Kolečko</strong> - Přiblížit/Oddálit<br/>
              <strong>+ / -</strong> - Zoom klávesami<br/>
              <strong>C</strong> - Zapnout/Vypnout ruční režim<br/>
              <strong>R</strong> - Reset pozice a pohledu<br/>
              <div style={{ fontSize: '10px', marginTop: '4px', color: '#aaa' }}>
                💡 Pohyb = automatická aktivace user kontroly
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Nápověda když je neaktivní */
        <div style={{
          background: 'rgba(158, 158, 158, 0.2)',
          padding: '8px',
          borderRadius: '6px',
          border: '1px solid rgba(158, 158, 158, 0.3)',
          fontSize: '11px',
          textAlign: 'center',
          color: '#999',
          marginBottom: '8px'
        }}>
          <div style={{ marginBottom: '4px' }}>
            <strong>Ruční režim neaktivní</strong>
          </div>
          <div>
            Aktivuj pro ruční ovládání<br/>
            <strong>Klávesa C</strong> nebo tlačítko výše
          </div>
        </div>
      )}

      {/* 🆕 NEW: Reset tlačítka */}
      <div style={{ display: 'grid', gap: '6px' }}>
        {/* Reset pozice kamery */}
        <button
          onClick={() => {
            if (window.resetManualCamera) {
              window.resetManualCamera(false); // false = preserve user control
            }
          }}
          style={{
            width: '100%',
            padding: '8px',
            background: 'linear-gradient(45deg, #FF9800, #F57C00)',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '11px',
            fontWeight: 'bold',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'linear-gradient(45deg, #F57C00, #EF6C00)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'linear-gradient(45deg, #FF9800, #F57C00)';
          }}
        >
          🔄 Reset pozice
        </button>

        {/* 🆕 NEW: Reset user control */}
        {userControlledCamera && (
          <button
            onClick={() => {
              if (resetCameraControl) {
                resetCameraControl();
              }
            }}
            style={{
              width: '100%',
              padding: '8px',
              background: 'linear-gradient(45deg, #F44336, #D32F2F)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: 'bold',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'linear-gradient(45deg, #D32F2F, #C62828)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'linear-gradient(45deg, #F44336, #D32F2F)';
            }}
          >
            🔓 Uvolnit kameru
          </button>
        )}
      </div>

      {/* 🆕 UPDATED: Varování/status */}
      {userControlledCamera ? (
        <div style={{
          background: 'rgba(76, 175, 80, 0.2)',
          padding: '6px',
          borderRadius: '4px',
          border: '1px solid rgba(76, 175, 80, 0.3)',
          fontSize: '10px',
          textAlign: 'center',
          color: '#4CAF50',
          marginTop: '8px'
        }}>
          ✅ Kamera je pod tvou kontrolou - nebude se resetovat
        </div>
      ) : manualCameraMode ? (
        <div style={{
          background: 'rgba(255, 193, 7, 0.2)',
          padding: '6px',
          borderRadius: '4px',
          border: '1px solid rgba(255, 193, 7, 0.3)',
          fontSize: '10px',
          textAlign: 'center',
          color: '#FFC107',
          marginTop: '8px'
        }}>
          ⚠️ Ruční režim aktivní - použij šipky pro aktivaci user kontroly
        </div>
      ) : (
        <div style={{
          background: 'rgba(158, 158, 158, 0.2)',
          padding: '6px',
          borderRadius: '4px',
          border: '1px solid rgba(158, 158, 158, 0.3)',
          fontSize: '10px',
          textAlign: 'center',
          color: '#999',
          marginTop: '8px'
        }}>
          ℹ️ Automatická kamera - může se resetovat při přepínání režimů
        </div>
      )}
    </div>
  );
};