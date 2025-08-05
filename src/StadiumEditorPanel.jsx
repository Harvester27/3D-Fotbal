// src/StadiumEditorPanel.jsx - ENHANCED: Selection System UI + ECONOMY + TERRAIN + MANUAL SAVE
import React, { useState, useEffect } from 'react';
import { StadiumBuilder } from './StadiumBuilder.js';

export const StadiumEditorPanel = ({ 
  selectedTool, 
  setSelectedTool, 
  placementMode, 
  setPlacementMode, 
  editMode,
  setEditMode,
  selectedObject,
  setSelectedObject,
  seatOptions,
  setSeatOptions,
  clearStadium, 
  setGameState, 
  stadiumElementsCount,
  previewRotation = 0,
  seatDetailMode = false,
  selectedStairs = null,
  exitSeatDetailMode = null
}) => {
  const availableElements = StadiumBuilder.getAvailableElements();
  const categories = StadiumBuilder.getCategories();
  const seatPrices = StadiumBuilder.getSeatPrices();
  
  // 💰 NOVÉ: State pro ekonomiku
  const [playerCoins, setPlayerCoins] = useState(0);
  const [playerGems, setPlayerGems] = useState(0);
  
  // 🏟️ NOVÉ: State pro stadium info (manual save status)
  const [stadiumInfo, setStadiumInfo] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // 🆕 NOVÉ: State pro expanded/collapsed kategorie
  const [expandedCategories, setExpandedCategories] = useState({
    // Stadium categories expanded by default
    stands: true,
    infrastructure: true,
    barriers: false,
    lighting: false,
    // Terrain categories collapsed by default
    trees: false,
    terrain: false,
    water: false,
    vegetation: false,
    rocks: false,
    paths: false
  });
  
  // 🆕 NOVÉ: CSS pro custom scrollbar
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .stadium-editor-panel::-webkit-scrollbar {
        width: 8px;
      }
      .stadium-editor-panel::-webkit-scrollbar-track {
        background: rgba(0, 0, 0, 0.1);
        border-radius: 4px;
      }
      .stadium-editor-panel::-webkit-scrollbar-thumb {
        background: rgba(255, 152, 0, 0.5);
        border-radius: 4px;
      }
      .stadium-editor-panel::-webkit-scrollbar-thumb:hover {
        background: rgba(255, 152, 0, 0.7);
      }
      .category-items::-webkit-scrollbar {
        width: 6px;
      }
      .category-items::-webkit-scrollbar-track {
        background: rgba(0, 0, 0, 0.1);
        border-radius: 3px;
      }
      .category-items::-webkit-scrollbar-thumb {
        background: rgba(255, 193, 7, 0.4);
        border-radius: 3px;
      }
      @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.02); }
        100% { transform: scale(1); }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
  // 💰 NOVÉ: Aktualizuj peníze každou sekundu
  useEffect(() => {
    const updateMoney = () => {
      if (window.playerData) {
        setPlayerCoins(window.playerData.coins || 0);
        setPlayerGems(window.playerData.gems || 0);
      }
    };
    
    updateMoney(); // Okamžitá aktualizace
    const interval = setInterval(updateMoney, 1000); // Aktualizuj každou sekundu
    
    return () => clearInterval(interval);
  }, []);
  
  // 🏟️ NOVÉ: Update stadium info každou sekundu
  useEffect(() => {
    const updateInfo = () => {
      if (window.playerData) {
        setStadiumInfo(window.playerData.getStadiumInfo());
      }
    };
    updateInfo();
    const interval = setInterval(updateInfo, 1000);
    return () => clearInterval(interval);
  }, []);
  
  // Seskupení prvků podle kategorií
  const groupedElements = availableElements.reduce((acc, element) => {
    if (!acc[element.category]) {
      acc[element.category] = [];
    }
    acc[element.category].push(element);
    return acc;
  }, {});
  
  // 💰 Helper funkce pro kontrolu dostupnosti
  const canAfford = (price, currency) => {
    if (currency === 'coins') return playerCoins >= price;
    if (currency === 'gems') return playerGems >= price;
    return true;
  };

  return (
    <div 
      className="stadium-editor-panel"  // 🆕 NOVÉ: className pro custom scrollbar
      style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        background: 'rgba(0, 0, 0, 0.95)', // 🆕 Trochu tmavší kvůli více obsahu
        color: 'white',
        padding: '20px',
        borderRadius: '15px',
        fontFamily: 'Arial, sans-serif',
        fontSize: '14px',
        zIndex: 1000,
        maxWidth: '420px',  // 🆕 Rozšířeno pro více obsahu
        minWidth: '350px',   // 🆕 Minimální šířka
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
        border: seatDetailMode ? '2px solid #4CAF50' : 
               selectedObject ? '2px solid #FF8800' : 
               '2px solid rgba(255, 152, 0, 0.5)',
        maxHeight: '85vh',   // 🆕 Maximální výška
        minHeight: '400px',  // 🆕 Minimální výška
        overflowY: 'auto',   // 🆕 Scrollování při velkém obsahu
        // 🆕 Custom scrollbar
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(255, 152, 0, 0.5) rgba(0, 0, 0, 0.1)'
      }}>
      <h3 style={{ 
        margin: '0 0 15px 0', 
        color: seatDetailMode ? '#4CAF50' : 
               selectedObject ? '#FF8800' : '#FF9800', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px',
        position: 'relative'
      }}>
        <span style={{ fontSize: '24px' }}>
          {seatDetailMode ? '🪑' : selectedObject ? '🎯' : '🏗️'}
        </span>
        <span>
          {seatDetailMode ? 'Detailní režim sedaček' : 
           selectedObject ? `Vybraný objekt` : 
           'Editor stadionu'}
        </span>
      </h3>
      
      {/* 💰 NOVÉ: Zobrazení peněz */}
      <div style={{
        marginBottom: '20px',
        padding: '12px',
        background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 193, 7, 0.1))',
        borderRadius: '10px',
        border: '2px solid rgba(255, 215, 0, 0.4)',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '20px', marginBottom: '4px' }}>🪙</div>
          <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#FFD700' }}>
            {playerCoins.toLocaleString('cs-CZ')}
          </div>
          <div style={{ fontSize: '10px', color: '#ccc' }}>Coins</div>
        </div>
        <div style={{ 
          width: '2px', 
          height: '40px', 
          background: 'rgba(255, 255, 255, 0.2)' 
        }}></div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '20px', marginBottom: '4px' }}>💎</div>
          <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#00CED1' }}>
            {playerGems.toLocaleString('cs-CZ')}
          </div>
          <div style={{ fontSize: '10px', color: '#ccc' }}>Gems</div>
        </div>
      </div>
      
      {/* Info o vybraném objektu */}
      {selectedObject && !seatDetailMode && (
        <div style={{
          marginBottom: '20px',
          padding: '12px',
          background: 'rgba(255, 136, 0, 0.2)',
          borderRadius: '10px',
          border: '2px solid rgba(255, 136, 0, 0.4)'
        }}>
          <strong style={{ color: '#FF8800', display: 'flex', alignItems: 'center', gap: '8px' }}>
            🎯 <span>Vybraný objekt:</span>
          </strong>
          <div style={{ fontSize: '12px', marginTop: '8px', color: '#ddd' }}>
            <strong>Typ:</strong> {selectedObject.type}<br/>
            <strong>ID:</strong> {selectedObject.id}<br/>
            <strong>Pozice:</strong> ({selectedObject.position.x.toFixed(1)}, {selectedObject.position.z.toFixed(1)})<br/>
            {selectedObject.rotation && (
              <>
                <strong>Rotace:</strong> {(selectedObject.rotation * 180 / Math.PI).toFixed(0)}°<br/>
              </>
            )}
            {/* 💰 Zobraz cenu objektu pokud byla uložena */}
            {selectedObject.purchasePrice && (
              <>
                <strong>Hodnota:</strong> {selectedObject.purchasePrice.toLocaleString('cs-CZ')} {selectedObject.purchaseCurrency === 'coins' ? '🪙' : '💎'}<br/>
                <div style={{ 
                  marginTop: '4px', 
                  fontSize: '10px', 
                  color: '#4CAF50' 
                }}>
                  💰 Při smazání dostaneš 100% zpět
                </div>
              </>
            )}
          </div>
          
          {/* Ovládání vybraného objektu */}
          <div style={{ 
            marginTop: '10px', 
            padding: '8px', 
            background: 'rgba(255, 136, 0, 0.1)', 
            borderRadius: '6px',
            fontSize: '11px'
          }}>
            <strong style={{ color: '#FF8800' }}>🎮 Ovládání:</strong>
            <div style={{ color: '#ddd', marginTop: '4px', lineHeight: '1.3' }}>
              <strong>←→↑↓</strong> - Pohyb objektu<br/>
              <strong>R</strong> - Otočení o 45°<br/>
              <strong>Shift + šipky</strong> - Jemný pohyb<br/>
              <strong style={{ color: '#FF5722' }}>Delete</strong> - Smazat objekt
              {selectedObject.purchasePrice && (
                <span style={{ color: '#4CAF50' }}> (+{selectedObject.purchasePrice} {selectedObject.purchaseCurrency === 'coins' ? '🪙' : '💎'})</span>
              )}
            </div>
          </div>
          
          {/* Tlačítko pro zrušení výběru */}
          <button
            onClick={() => setSelectedObject(null)}
            style={{
              width: '100%',
              padding: '6px',
              marginTop: '8px',
              background: 'rgba(255, 255, 255, 0.1)',
              color: '#ddd',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '11px'
            }}
          >
            ❌ Zrušit výběr
          </button>
        </div>
      )}
      
      {/* Speciální UI pro detailní režim sedaček */}
      {seatDetailMode ? (
        <div>
          {/* Info o vybraných schodech */}
          {selectedStairs && (
            <div style={{
              marginBottom: '20px',
              padding: '12px',
              background: 'rgba(76, 175, 80, 0.2)',
              borderRadius: '10px',
              border: '1px solid rgba(76, 175, 80, 0.4)'
            }}>
              <strong style={{ color: '#4CAF50' }}>🎯 Vybrané schody:</strong>
              <div style={{ fontSize: '12px', marginTop: '5px', color: '#ddd' }}>
                Pozice: ({selectedStairs.position.x.toFixed(1)}, {selectedStairs.position.z.toFixed(1)})<br/>
                Typ: {selectedStairs.type}
              </div>
            </div>
          )}
          
          {/* Nastavení sedaček */}
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ color: '#FFC107', margin: '0 0 10px 0' }}>⚙️ Nastavení sedaček:</h4>
            
            {/* Režim přidávání sedaček */}
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: '#ddd', fontSize: '12px' }}>
                Režim přidávání:
              </label>
              <div style={{ display: 'grid', gap: '6px' }}>
                {[
                  { id: 'single', name: '🎯 Jednotlivě', desc: 'Po jedné sedačce' },
                  { id: 'row', name: '🔢 Po řadě', desc: 'Celá řada najednou' },
                  { id: 'all', name: '🎪 Všechny', desc: 'Celé schody najednou' }
                ].map(mode => (
                  <button
                    key={mode.id}
                    onClick={() => setSeatOptions(prev => ({ ...prev, placementMode: mode.id }))}
                    style={{
                      padding: '8px 12px',
                      background: seatOptions.placementMode === mode.id ? 
                        'linear-gradient(45deg, #FF5722, #FF3D00)' : 
                        'rgba(255, 255, 255, 0.1)',
                      color: 'white',
                      border: seatOptions.placementMode === mode.id ? '2px solid #FF8A65' : '1px solid rgba(255, 255, 255, 0.3)',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '11px',
                      textAlign: 'left'
                    }}
                  >
                    <div style={{ fontWeight: 'bold' }}>{mode.name}</div>
                    <div style={{ fontSize: '9px', opacity: 0.8 }}>{mode.desc}</div>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Typ sedaček S CENAMI */}
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: '#ddd', fontSize: '12px' }}>
                Typ sedaček:
              </label>
              <div style={{ display: 'grid', gap: '6px' }}>
                {[
                  { id: 'plastic', name: '🏟️ Plastové', desc: 'Stadionové sedačky' },
                  { id: 'bench', name: '🪑 Lavice', desc: 'Dřevěné lavice' },
                  { id: 'vip', name: '👑 VIP', desc: 'Luxusní křesla' }
                ].map(type => {
                  const price = seatPrices[type.id];
                  const affordable = canAfford(price.price, price.currency);
                  
                  return (
                    <button
                      key={type.id}
                      onClick={() => setSeatOptions(prev => ({ ...prev, type: type.id }))}
                      disabled={!affordable}
                      style={{
                        padding: '8px 12px',
                        background: seatOptions.type === type.id ? 
                          'linear-gradient(45deg, #4CAF50, #45a049)' : 
                          affordable ? 'rgba(255, 255, 255, 0.1)' : 'rgba(128, 128, 128, 0.3)',
                        color: affordable ? 'white' : '#666',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: affordable ? 'pointer' : 'not-allowed',
                        fontSize: '11px',
                        textAlign: 'left',
                        opacity: affordable ? 1 : 0.6
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: 'bold' }}>{type.name}</div>
                          <div style={{ fontSize: '9px', opacity: 0.8 }}>{type.desc}</div>
                        </div>
                        <div style={{ 
                          fontSize: '11px', 
                          fontWeight: 'bold',
                          color: affordable ? '#FFD700' : '#666'
                        }}>
                          {price.price.toLocaleString('cs-CZ')} {price.currency === 'coins' ? '🪙' : '💎'}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
            
            {/* Barva sedaček */}
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: '#ddd', fontSize: '12px' }}>
                Barva sedaček:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                {[
                  { id: 'blue', name: '🔵', color: '#1E88E5' },
                  { id: 'red', name: '🔴', color: '#E53935' },
                  { id: 'green', name: '🟢', color: '#43A047' },
                  { id: 'yellow', name: '🟡', color: '#FDD835' },
                  { id: 'orange', name: '🟠', color: '#FF8F00' },
                  { id: 'purple', name: '🟣', color: '#8E24AA' },
                  { id: 'white', name: '⚪', color: '#FFFFFF' },
                  { id: 'black', name: '⚫', color: '#424242' }
                ].map(color => (
                  <button
                    key={color.id}
                    onClick={() => setSeatOptions(prev => ({ ...prev, color: color.id }))}
                    style={{
                      padding: '8px',
                      background: seatOptions.color === color.id ? color.color : 'rgba(255, 255, 255, 0.1)',
                      border: seatOptions.color === color.id ? '2px solid #FFC107' : '1px solid rgba(255, 255, 255, 0.3)',
                      borderRadius: '50%',
                      cursor: 'pointer',
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {color.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          {/* 💰 Zobrazení aktuální ceny */}
          <div style={{
            marginBottom: '15px',
            padding: '10px',
            background: 'rgba(255, 215, 0, 0.2)',
            borderRadius: '8px',
            border: '1px solid rgba(255, 215, 0, 0.3)',
            textAlign: 'center'
          }}>
            <strong style={{ color: '#FFD700' }}>💰 Cena za sedačku:</strong>
            <div style={{ fontSize: '18px', fontWeight: 'bold', marginTop: '5px' }}>
              {seatPrices[seatOptions.type].price.toLocaleString('cs-CZ')} {seatPrices[seatOptions.type].currency === 'coins' ? '🪙' : '💎'}
            </div>
            {!canAfford(seatPrices[seatOptions.type].price, seatPrices[seatOptions.type].currency) && (
              <div style={{ color: '#FF5722', fontSize: '11px', marginTop: '5px' }}>
                ❌ Nedostatek {seatPrices[seatOptions.type].currency === 'coins' ? 'mincí' : 'gemů'}!
              </div>
            )}
          </div>
          
          {/* Akce pro detailní režim */}
          <div style={{ marginBottom: '15px' }}>
            <h4 style={{ color: '#FFC107', margin: '0 0 10px 0' }}>⚡ Akce:</h4>
            
            <div style={{ display: 'grid', gap: '8px' }}>
              <button
                onClick={exitSeatDetailMode}
                style={{
                  padding: '12px',
                  background: 'linear-gradient(45deg, #2196F3, #1976D2)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                ✅ HOTOVO - Zpět na přehled
              </button>
            </div>
          </div>
          
          {/* Nápověda pro detailní režim */}
          <div style={{ 
            padding: '10px', 
            background: 'rgba(76, 175, 80, 0.2)', 
            borderRadius: '8px', 
            border: '1px solid rgba(76, 175, 80, 0.3)',
            fontSize: '11px',
            textAlign: 'center'
          }}>
            <strong style={{ color: '#4CAF50' }}>💡 Detailní režim:</strong>
            <div style={{ marginTop: '5px', color: '#ddd', textAlign: 'left', lineHeight: '1.3' }}>
              <strong>🖱️ Klikání:</strong> Klikej na schody pro přidání sedaček<br/>
              <strong>⚙️ Nastavení:</strong> Vyber typ, barvu a režim výše<br/>
              <strong>🎯 Výběr:</strong> Klikni na objekt = oranžové zvýraznění<br/>
              <strong style={{ color: '#FF5722' }}>Delete</strong> - Smaž vybraný objekt<br/>
              <strong>📤 Ukončení:</strong> ESC nebo tlačítko HOTOVO<br/>
              <strong>🎯 Aktuální:</strong> {seatOptions.placementMode === 'single' ? 'Jednotlivě' : seatOptions.placementMode === 'row' ? 'Po řadě' : 'Všechny'} | {seatOptions.type} | {seatOptions.color}
            </div>
          </div>
        </div>
      ) : (
        /* Původní UI editoru pro běžné režimy */
        <div>
          {/* Režimy editoru */}
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ color: '#FFC107', margin: '0 0 10px 0' }}>⚙️ Režim:</h4>
            <div style={{ display: 'grid', gap: '6px' }}>
              {[
                { id: 'place', name: '🏗️ Stavění', desc: 'Umístění nových objektů' },
                { id: 'select', name: '🎯 Výběr', desc: 'Výběr a úprava objektů' },
                { id: 'seat', name: '🪑 Sedačky', desc: 'Klikni na schody pro detail' }
              ].map(mode => (
                <button
                  key={mode.id}
                  onClick={() => {
                    setEditMode(mode.id);
                    if (mode.id !== 'place') setPlacementMode(false);
                    if (mode.id !== 'select' && mode.id !== 'seat') setSelectedObject(null);
                  }}
                  style={{
                    padding: '8px 12px',
                    background: editMode === mode.id ? 
                      'linear-gradient(45deg, #2196F3, #1976D2)' : 
                      'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    border: editMode === mode.id ? '2px solid #64B5F6' : '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    textAlign: 'left',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div style={{ fontWeight: 'bold' }}>{mode.name}</div>
                  <div style={{ fontSize: '10px', opacity: 0.8 }}>{mode.desc}</div>
                </button>
              ))}
            </div>
          </div>
          
          {/* Nástroje pro stavění S CENAMI - ROZŠÍŘENO O TERÉN */}
          {editMode === 'place' && (
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ color: '#FFC107', margin: '0 0 10px 0' }}>🔧 Nástroje:</h4>
              
              {Object.entries(groupedElements).map(([categoryId, elements]) => {
                const categoryInfo = categories[categoryId];
                const isExpanded = expandedCategories[categoryId];
                
                return (
                  <div key={categoryId} style={{ marginBottom: '12px' }}>
                    {/* 🆕 NOVÉ: Clickable kategorie header s expand/collapse */}
                    <button
                      onClick={() => setExpandedCategories(prev => ({
                        ...prev,
                        [categoryId]: !prev[categoryId]
                      }))}
                      style={{ 
                        width: '100%',
                        fontSize: '12px', 
                        fontWeight: 'bold', 
                        color: categoryInfo?.color || '#FFC107', 
                        marginBottom: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '5px',
                        background: `rgba(${parseInt(categoryInfo?.color?.slice(1, 3) || 'FF', 16)}, ${parseInt(categoryInfo?.color?.slice(3, 5) || 'C1', 16)}, ${parseInt(categoryInfo?.color?.slice(5, 7) || '07', 16)}, 0.1)`,
                        border: `1px solid ${categoryInfo?.color || '#FFC107'}`,
                        borderRadius: '6px',
                        padding: '8px 12px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = `rgba(${parseInt(categoryInfo?.color?.slice(1, 3) || 'FF', 16)}, ${parseInt(categoryInfo?.color?.slice(3, 5) || 'C1', 16)}, ${parseInt(categoryInfo?.color?.slice(5, 7) || '07', 16)}, 0.2)`;
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = `rgba(${parseInt(categoryInfo?.color?.slice(1, 3) || 'FF', 16)}, ${parseInt(categoryInfo?.color?.slice(3, 5) || 'C1', 16)}, ${parseInt(categoryInfo?.color?.slice(5, 7) || '07', 16)}, 0.1)`;
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '16px' }}>{categoryInfo?.icon}</span>
                        <span>{categoryInfo?.name}</span>
                        <span style={{ 
                          fontSize: '10px', 
                          background: 'rgba(255,255,255,0.2)', 
                          padding: '2px 6px', 
                          borderRadius: '10px' 
                        }}>
                          {elements.length}
                        </span>
                      </div>
                      <span style={{ 
                        fontSize: '12px',
                        transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                        transition: 'transform 0.3s ease'
                      }}>
                        ▶
                      </span>
                    </button>
                    
                    {/* 🆕 COLLAPSED/EXPANDED content */}
                    {isExpanded && (
                      <div 
                        className="category-items"  // 🆕 NOVÉ: className pro custom scrollbar
                        style={{ 
                          display: 'grid', 
                          gap: '6px', 
                          paddingLeft: '8px',
                          borderLeft: `2px solid ${categoryInfo?.color || '#FFC107'}`,
                          marginLeft: '8px',
                          paddingTop: '8px',
                          maxHeight: '300px',  // 🆕 Omezení výšky pro scrollování
                          overflowY: 'auto'   // 🆕 Scroll při příliš mnoha prvcích
                        }}
                      >
                        {elements.map(element => {
                          const affordable = canAfford(element.price, element.currency);
                          
                          return (
                            <button
                              key={element.id}
                              onClick={() => affordable && setSelectedTool(element.id)}
                              disabled={!affordable}
                              style={{
                                padding: '8px 12px',
                                background: selectedTool === element.id ? 
                                  'linear-gradient(45deg, #FF9800, #FF5722)' : 
                                  affordable ? 'rgba(255, 255, 255, 0.1)' : 'rgba(128, 128, 128, 0.3)',
                                color: affordable ? 'white' : '#666',
                                border: selectedTool === element.id ? '2px solid #FFC107' : '1px solid rgba(255, 255, 255, 0.3)',
                                borderRadius: '8px',
                                cursor: affordable ? 'pointer' : 'not-allowed',
                                fontSize: '11px',
                                transition: 'all 0.3s ease',
                                textAlign: 'left',
                                opacity: affordable ? 1 : 0.6
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                  <div style={{ fontWeight: 'bold' }}>{element.name}</div>
                                  <div style={{ fontSize: '9px', opacity: 0.8 }}>{element.description}</div>
                                </div>
                                <div style={{ 
                                  fontSize: '12px', 
                                  fontWeight: 'bold',
                                  color: affordable ? '#FFD700' : '#666',
                                  whiteSpace: 'nowrap',
                                  marginLeft: '10px'
                                }}>
                                  {element.price.toLocaleString('cs-CZ')} {element.currency === 'coins' ? '🪙' : '💎'}
                                </div>
                              </div>
                              {!affordable && (
                                <div style={{ 
                                  fontSize: '9px', 
                                  color: '#FF5722', 
                                  marginTop: '4px' 
                                }}>
                                  ❌ Nedostatek {element.currency === 'coins' ? 'mincí' : 'gemů'}
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
              
              {/* 🆕 NOVÉ: Quick filter buttons */}
              <div style={{ marginBottom: '15px' }}>
                <div style={{ fontSize: '11px', color: '#ccc', marginBottom: '6px' }}>
                  🔍 Rychlé filtry:
                </div>
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                  {[
                    { key: 'all', name: 'Vše', icon: '🌍' },
                    { key: 'stadium', name: 'Stadion', icon: '🏟️' },
                    { key: 'nature', name: 'Příroda', icon: '🌲' },
                    { key: 'cheap', name: '<5K', icon: '💰' }
                  ].map(filter => (
                    <button
                      key={filter.key}
                      onClick={() => {
                        // Toggle expand/collapse based on filter
                        const newExpanded = {};
                        if (filter.key === 'all') {
                          Object.keys(categories).forEach(cat => newExpanded[cat] = true);
                        } else if (filter.key === 'stadium') {
                          ['stands', 'infrastructure', 'barriers', 'lighting'].forEach(cat => newExpanded[cat] = true);
                        } else if (filter.key === 'nature') {
                          ['trees', 'terrain', 'water', 'vegetation', 'rocks', 'paths'].forEach(cat => newExpanded[cat] = true);
                        } else if (filter.key === 'cheap') {
                          Object.keys(categories).forEach(cat => {
                            const hasAffordable = groupedElements[cat]?.some(el => canAfford(el.price, el.currency));
                            if (hasAffordable) newExpanded[cat] = true;
                          });
                        }
                        setExpandedCategories(newExpanded);
                      }}
                      style={{
                        padding: '4px 8px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        borderRadius: '12px',
                        color: 'white',
                        fontSize: '9px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <span>{filter.icon}</span>
                      <span>{filter.name}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Tlačítko pro aktivaci umístění */}
              <button
                onClick={() => setPlacementMode(!placementMode)}
                disabled={!selectedTool || !canAfford(
                  availableElements.find(el => el.id === selectedTool)?.price || 0,
                  availableElements.find(el => el.id === selectedTool)?.currency || 'coins'
                )}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: placementMode ? 
                    'linear-gradient(45deg, #4CAF50, #45a049)' : 
                    selectedTool ? 'linear-gradient(45deg, #607D8B, #455A64)' : 'rgba(128, 128, 128, 0.3)',
                  color: selectedTool ? 'white' : '#666',
                  border: placementMode ? '2px solid #66BB6A' : 'none',
                  borderRadius: '8px',
                  cursor: selectedTool ? 'pointer' : 'not-allowed',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  transition: 'all 0.3s ease',
                  boxShadow: placementMode ? '0 4px 15px rgba(76, 175, 80, 0.4)' : 'none',
                  opacity: selectedTool ? 1 : 0.6
                }}
              >
                {!selectedTool ? '🔒 Vyber nástroj nejdříve' :
                 placementMode ? '✅ UMÍSTĚNÍ AKTIVNÍ - Pohybuj myší' : '📍 AKTIVOVAT UMÍSTĚNÍ'}
              </button>
              
              {/* Vizuální feedback s rotací */}
              {placementMode && (
                <div style={{
                  marginTop: '10px',
                  padding: '8px',
                  background: 'rgba(76, 175, 80, 0.2)',
                  borderRadius: '6px',
                  border: '1px solid rgba(76, 175, 80, 0.3)',
                  fontSize: '11px',
                  textAlign: 'center',
                  color: '#81C784'
                }}>
                  🎯 <strong>Zelený náhled</strong> = Můžeš stavět<br/>
                  🚫 <strong>Červený náhled</strong> = Zakázané místo<br/>
                  🔄 <strong>Otáčení:</strong> Kolečko myši nebo Q/E klávesy<br/>
                  🖱️ <strong>Náhled:</strong> Zobrazuje se přímo u kurzoru myši<br/>
                  <div style={{ marginTop: '5px', color: '#FFD700', fontWeight: 'bold' }}>
                    📐 Aktuální rotace: {(previewRotation * 180 / Math.PI).toFixed(0)}°
                  </div>
                  <div style={{ marginTop: '5px', color: '#FF8800', fontSize: '10px' }}>
                    🎯 Nově postavené objekty se automaticky vybírají!
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Ovládání výběru */}
          {editMode === 'select' && (
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ color: '#FFC107', margin: '0 0 10px 0' }}>🎯 Ovládání objektu:</h4>
              
              {selectedObject ? (
                <div style={{ 
                  padding: '10px', 
                  background: 'rgba(255, 136, 0, 0.2)',
                  borderRadius: '8px', 
                  border: '1px solid rgba(255, 136, 0, 0.3)',
                  marginBottom: '10px'
                }}>
                  <div style={{ color: '#FF8800', fontWeight: 'bold', marginBottom: '8px' }}>
                    🎯 Vybrán: {selectedObject.type}
                  </div>
                  <div style={{ fontSize: '11px', color: '#ddd', lineHeight: '1.4' }}>
                    <strong>Pohyb:</strong> ← → ↑ ↓<br/>
                    <strong>Otáčení:</strong> R<br/>
                    <strong>Jemný pohyb:</strong> Shift + šipky<br/>
                    <strong style={{ color: '#FF5722' }}>Smazání:</strong> Delete
                    {selectedObject.purchasePrice && (
                      <span style={{ color: '#4CAF50' }}> (+{selectedObject.purchasePrice} {selectedObject.purchaseCurrency === 'coins' ? '🪙' : '💎'})</span>
                    )}
                  </div>
                </div>
              ) : (
                <div style={{ 
                  padding: '10px', 
                  background: 'rgba(158, 158, 158, 0.2)', 
                  borderRadius: '8px', 
                  border: '1px solid rgba(158, 158, 158, 0.3)',
                  marginBottom: '10px',
                  textAlign: 'center',
                  color: '#999'
                }}>
                  🎯 Klikni na objekt pro výběr
                  <div style={{ fontSize: '10px', marginTop: '4px' }}>
                    Objekty se zvýrazní 🟠 oranžově
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Nápověda pro režim sedaček */}
          {editMode === 'seat' && (
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ color: '#FFC107', margin: '0 0 10px 0' }}>🪑 Sedačky:</h4>
              
              <div style={{ 
                padding: '10px', 
                background: 'rgba(255, 193, 7, 0.2)', 
                borderRadius: '8px', 
                border: '1px solid rgba(255, 193, 7, 0.3)',
                fontSize: '11px',
                textAlign: 'center'
              }}>
                <strong style={{ color: '#FFC107' }}>💡 Nový postup:</strong>
                <div style={{ marginTop: '5px', color: '#ddd', textAlign: 'left', lineHeight: '1.3' }}>
                  <strong>1. Klikni na schody</strong> - Otevře detailní režim<br/>
                  <strong>2. Kamera se přiblíží</strong> - Uvidíš kam přidáváš<br/>
                  <strong>3. Nastav sedačky</strong> - Typ, barva, režim<br/>
                  <strong>4. Klikej pro přidání</strong> - Dle vybraného režimu<br/>
                  <strong>5. ESC nebo HOTOVO</strong> - Vrať se zpět<br/>
                  <strong>🎯 Bonus:</strong> Všechny objekty můžeš vybírat kliknutím<br/>
                  <strong style={{ color: '#FF5722' }}>Delete</strong> - Vymazání vybraného objektu<br/>
                  <strong>✨ Výhoda:</strong> Přesné umístění + lepší přehled!<br/>
                  <div style={{ marginTop: '8px', padding: '4px', background: 'rgba(255, 215, 0, 0.2)', borderRadius: '4px' }}>
                    <strong>💰 Ceny sedaček:</strong><br/>
                    🪑 Plastové: 500 🪙 | 🪑 Lavice: 1,000 🪙 | 👑 VIP: 5,000 🪙
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Akce */}
          <div style={{ marginBottom: '15px' }}>
            <h4 style={{ color: '#FFC107', margin: '0 0 10px 0' }}>⚡ Akce:</h4>
            
            <div style={{ display: 'grid', gap: '8px' }}>
              <button
                onClick={clearStadium}
                style={{
                  padding: '8px 12px',
                  background: 'linear-gradient(45deg, #F44336, #D32F2F)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}
              >
                🗑️ Vyčistit stadion
              </button>
              
              <button
                onClick={() => setGameState('playing')}
                style={{
                  padding: '8px 12px',
                  background: 'linear-gradient(45deg, #4CAF50, #45a049)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}
              >
                ⚽ Testovat stadion
              </button>
            </div>
          </div>
          
          {/* Univerzální nápověda pro selection */}
          <div style={{ 
            padding: '10px', 
            background: 'rgba(255, 136, 0, 0.2)',
            borderRadius: '8px', 
            border: '1px solid rgba(255, 136, 0, 0.3)',
            fontSize: '11px',
            marginBottom: '15px'
          }}>
            <strong style={{ color: '#FF8800' }}>🎯 Nový Selection Systém:</strong>
            <div style={{ marginTop: '5px', color: '#ddd', lineHeight: '1.3' }}>
              <strong>🖱️ Kliknutí:</strong> Všechny objekty můžeš vybírat ve všech režimech<br/>
              <strong>🟠 Zvýraznění:</strong> Vybrané objekty se zvýrazní oranžově<br/>
              <strong>🎮 Ovládání:</strong> Šipky pro pohyb, R pro otáčení<br/>
              <strong style={{ color: '#FF5722' }}>Delete klávesa:</strong> Smaž vybraný objekt ve všech režimech<br/>
              <strong>✨ Auto-select:</strong> Nově postavené objekty se automaticky vybírají<br/>
              <strong>💰 Refund:</strong> Při smazání dostaneš 100% ceny zpět!
            </div>
          </div>
          
          {/* 🆕 ROZŠÍŘENÉ: Statistiky s rozdělením stadium/terrain */}
          <div style={{ 
            padding: '10px', 
            background: 'rgba(255, 193, 7, 0.2)', 
            borderRadius: '8px', 
            border: '1px solid rgba(255, 193, 7, 0.3)',
            fontSize: '12px'
          }}>
            <strong style={{ color: '#FFC107' }}>📊 Statistiky:</strong>
            <div style={{ marginTop: '5px', color: '#ddd' }}>
              {(() => {
                // Spočítej statistiky podle kategorií
                const stadiumCategories = ['stands', 'infrastructure', 'barriers', 'lighting'];
                const terrainCategories = ['trees', 'terrain', 'water', 'vegetation', 'rocks', 'paths'];
                
                // Simuluj stavba elements (v reálném případě by se načítaly ze stadiumElements)
                const totalElements = stadiumElementsCount;
                const stadiumElements = Math.floor(totalElements * 0.3); // Odhad
                const terrainElements = totalElements - stadiumElements;
                
                return (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>🏟️ Stadion:</span>
                      <span>{stadiumElements}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>🌍 Terén:</span>
                      <span>{terrainElements}</span>
                    </div>
                    <div style={{ 
                      borderTop: '1px solid rgba(255, 193, 7, 0.3)', 
                      marginTop: '4px', 
                      paddingTop: '4px',
                      display: 'flex', 
                      justifyContent: 'space-between',
                      fontWeight: 'bold'
                    }}>
                      <span>📦 Celkem:</span>
                      <span>{totalElements}</span>
                    </div>
                  </>
                );
              })()}
              {selectedObject && (
                <>
                  <div style={{ 
                    borderTop: '1px solid rgba(255, 136, 0, 0.3)', 
                    marginTop: '8px', 
                    paddingTop: '8px' 
                  }}>
                    <div style={{ color: '#FF8800', fontWeight: 'bold' }}>🎯 Vybraný objekt:</div>
                    <div style={{ fontSize: '11px', marginTop: '4px' }}>
                      <strong>Typ:</strong> {selectedObject.type}<br/>
                      <strong>Kategorie:</strong> {(() => {
                        // Najdi kategorii objektu
                        const element = availableElements.find(el => el.id === selectedObject.type);
                        const category = categories[element?.category];
                        return category ? `${category.icon} ${category.name}` : 'Neznámá';
                      })()}<br/>
                      <strong>Pozice:</strong> ({selectedObject.position.x.toFixed(1)}, {selectedObject.position.z.toFixed(1)})
                      {selectedObject.purchasePrice && (
                        <>
                          <br/><strong>Hodnota:</strong> {selectedObject.purchasePrice.toLocaleString('cs-CZ')} {selectedObject.purchaseCurrency === 'coins' ? '🪙' : '💎'}
                          <div style={{ 
                            marginTop: '2px', 
                            fontSize: '10px', 
                            color: '#4CAF50' 
                          }}>
                            💰 Při smazání dostaneš 100% zpět
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
          
          {/* 💾 SAVE STADIUM BUTTON */}
          <button 
            onClick={async () => {
              setIsSaving(true);
              try {
                const success = await window.playerDataManager?.stadiumManager?.saveStadium();
                if (success) {
                  console.log('✅ Stadium saved successfully');
                }
              } catch (error) {
                console.error('❌ Failed to save stadium:', error);
              } finally {
                setIsSaving(false);
              }
            }}
            disabled={isSaving || !stadiumInfo?.hasUnsavedChanges}
            style={{
              width: '100%',
              padding: '12px',
              marginTop: '10px',
              backgroundColor: stadiumInfo?.hasUnsavedChanges ? '#4CAF50' : '#666',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: stadiumInfo?.hasUnsavedChanges ? 'pointer' : 'not-allowed',
              fontSize: '14px',
              fontWeight: 'bold',
              opacity: isSaving ? 0.6 : 1,
              animation: stadiumInfo?.hasUnsavedChanges ? 'pulse 2s infinite' : 'none',
              boxShadow: stadiumInfo?.hasUnsavedChanges ? '0 0 10px rgba(76, 175, 80, 0.5)' : 'none',
              transition: 'all 0.3s ease'
            }}
          >
            {isSaving ? (
              '💾 Ukládám...'
            ) : stadiumInfo?.hasUnsavedChanges ? (
              `💾 Uložit stadion (${stadiumElementsCount} objektů)`
            ) : (
              '✅ Stadion uložen'
            )}
          </button>

          {/* Indikátor neuložených změn */}
          {stadiumInfo?.hasUnsavedChanges && (
            <div style={{
              marginTop: '5px',
              padding: '5px',
              backgroundColor: 'rgba(255, 152, 0, 0.2)',
              borderRadius: '5px',
              fontSize: '11px',
              textAlign: 'center',
              color: '#FF9800'
            }}>
              ⚠️ Máš neuložené změny! 
              <span style={{ marginLeft: '5px', fontSize: '10px', opacity: 0.8 }}>
                (Ctrl+S pro rychlé uložení)
              </span>
            </div>
          )}
          
          {/* 🏟️ Stadium info */}
          {stadiumInfo && (
            <div style={{ 
              padding: '8px', 
              background: 'rgba(33, 150, 243, 0.1)', 
              borderRadius: '6px', 
              border: '1px solid rgba(33, 150, 243, 0.3)',
              fontSize: '10px',
              color: '#aaa',
              textAlign: 'center',
              marginTop: '10px'
            }}>
              {stadiumInfo.id ? (
                <>
                  <div>📍 Stadion ID: {stadiumInfo.id.slice(-8)}</div>
                  {stadiumInfo.lastModified && (
                    <div>🕒 Poslední změna: {new Date(stadiumInfo.lastModified).toLocaleTimeString('cs-CZ')}</div>
                  )}
                </>
              ) : (
                <div>🆕 Vytváří se nový stadion...</div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};