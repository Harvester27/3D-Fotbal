// src/PlayerInfoPanel.jsx - S Quick Attributes tlačítkem
import React, { useState, useEffect } from 'react';
import { playerDataManager } from './PlayerDataManager.js';

export const PlayerInfoPanel = ({ onCustomizeClick }) => {
  const [playerData, setPlayerData] = useState(playerDataManager.getPlayerSummary());
  const [moneyFormat, setMoneyFormat] = useState(playerDataManager.getFormattedMoney());
  const [showDailyReward, setShowDailyReward] = useState(false);
  const [rewardCooldown, setRewardCooldown] = useState(null);
  
  // 🔥 NOVÉ: Quick Attributes panel
  const [showQuickAttributes, setShowQuickAttributes] = useState(false);
  const [quickAttributes, setQuickAttributes] = useState({});
  
  // Atributy a rating states
  const [playerRatings, setPlayerRatings] = useState({
    overall: playerDataManager.getOverallRating(),
    position: playerDataManager.getPositionRating('CAM'),
    topAttributes: getTopAttributes()
  });
  const [trainingInfo, setTrainingInfo] = useState({
    dailyPoints: playerDataManager.training.dailyTrainingPoints,
    focus: playerDataManager.training.focus,
    coachLevel: playerDataManager.training.coachLevel
  });

  const monthlyRewards = Array.from({ length: 30 }, (_, i) => {
    const day = i + 1;
    const baseReward = 500000;
    const streakBonus = Math.min(day * 100000, 2000000);
    const coins = baseReward + streakBonus;
    const gems = day % 7 === 0 ? 5 * Math.floor(day / 7) : 0;
    const training = day % 3 === 0 ? 1 : 0;
    return { day, coins, gems, training };
  });

  // Získej top 3 atributy hráče
  function getTopAttributes() {
    const allAttributes = [];
    
    Object.keys(playerDataManager.attributes).forEach(category => {
      Object.keys(playerDataManager.attributes[category]).forEach(attr => {
        const value = playerDataManager.attributes[category][attr];
        allAttributes.push({
          name: attr,
          category: category,
          value: value,
          displayName: getAttributeDisplayName(category, attr)
        });
      });
    });
    
    return allAttributes
      .sort((a, b) => b.value - a.value)
      .slice(0, 3);
  }

  // Získej český název atributu
  function getAttributeDisplayName(category, attr) {
    const attributeNames = {
      // Technical
      corners: 'Rohové kopy', crossing: 'Centrování', dribbling: 'Dribling',
      finishing: 'Zakončování', firstTouch: 'První dotek', freeKickTaking: 'Přímé kopy',
      heading: 'Hlavičkování', longShots: 'Daleké střely', longThrows: 'Dlouhé auty',
      marking: 'Obsazování', passing: 'Přihrávání', penaltyTaking: 'Penalty',
      tackling: 'Skluzování', technique: 'Technika',
      
      // Mental
      aggression: 'Agresivita', anticipation: 'Předvídání', bravery: 'Odvaha',
      composure: 'Chladnokrevnost', concentration: 'Soustředění', decisions: 'Rozhodování',
      determination: 'Odhodlání', flair: 'Kreativita', leadership: 'Vedení',
      offTheBall: 'Pohyb bez míče', positioning: 'Postavení', teamwork: 'Týmová práce',
      vision: 'Vidění hry', workRate: 'Pracovitost',
      
      // Physical
      acceleration: 'Zrychlení', agility: 'Hbitost', balance: 'Rovnováha',
      jumpingReach: 'Výskok', naturalFitness: 'Přirozená kondice', pace: 'Rychlost',
      stamina: 'Vytrvalost', strength: 'Síla'
    };
    
    return attributeNames[attr] || attr;
  }

  // Získej barvu kategorie
  function getCategoryColor(category) {
    const colors = {
      technical: '#FFD700',
      mental: '#00CED1', 
      physical: '#FF6B6B'
    };
    return colors[category] || '#FFF';
  }

  // Získej ikonu kategorie
  function getCategoryIcon(category) {
    const icons = {
      technical: '⚽',
      mental: '🧠',
      physical: '💪'
    };
    return icons[category] || '📊';
  }

  // 🔥 NOVÁ FUNKCE: Otevři Quick Attributes
  const openQuickAttributes = () => {
    // Načti aktuální atributy
    const current = {};
    Object.keys(playerDataManager.attributes).forEach(category => {
      current[category] = {};
      Object.keys(playerDataManager.attributes[category]).forEach(attr => {
        current[category][attr] = Math.round(playerDataManager.attributes[category][attr]);
      });
    });
    setQuickAttributes(current);
    setShowQuickAttributes(true);
  };

  // 🔥 NOVÁ FUNKCE: Nastav atribut
  const setQuickAttribute = (category, attr, value) => {
    const newAttrs = { ...quickAttributes };
    newAttrs[category][attr] = value;
    setQuickAttributes(newAttrs);
    
    // Okamžitě aplikuj změnu
    if (window.debugPlayer) {
      window.debugPlayer.setAttribute(category, attr, value);
    } else {
      playerDataManager.setAttribute(category, attr, value);
    }
    
    // Aktualizuj ratings
    setTimeout(() => {
      setPlayerRatings({
        overall: playerDataManager.getOverallRating(),
        position: playerDataManager.getPositionRating('CAM'),
        topAttributes: getTopAttributes()
      });
    }, 100);
  };

  // 🔥 NOVÁ FUNKCE: Preset hodnoty
  const applyPreset = (presetName) => {
    let values = {};
    
    switch(presetName) {
      case 'beginner':
        values = { technical: 25, mental: 25, physical: 25 };
        break;
      case 'average':
        values = { technical: 50, mental: 50, physical: 50 };
        break;
      case 'skilled':
        values = { technical: 75, mental: 70, physical: 70 };
        break;
      case 'superstar':
        values = { technical: 95, mental: 90, physical: 90 };
        break;
      case 'speedster':
        values = { 
          technical: 60, mental: 50, physical: 80,
          overrides: { pace: 95, acceleration: 90, agility: 85, stamina: 80 }
        };
        break;
      case 'playmaker':
        values = { 
          technical: 90, mental: 85, physical: 50,
          overrides: { passing: 95, vision: 90, technique: 85, dribbling: 80 }
        };
        break;
      case 'striker':
        values = { 
          technical: 80, mental: 70, physical: 75,
          overrides: { finishing: 95, longShots: 85, positioning: 90, composure: 80 }
        };
        break;
    }
    
    // Aplikuj preset
    Object.keys(playerDataManager.attributes).forEach(category => {
      Object.keys(playerDataManager.attributes[category]).forEach(attr => {
        let value = values[category] || 50;
        
        // Speciální overrides
        if (values.overrides && values.overrides[attr]) {
          value = values.overrides[attr];
        }
        
        setQuickAttribute(category, attr, value);
      });
    });
  };

  useEffect(() => {
    // Poslouchej změny v player datech
    const updateData = () => {
      setPlayerData(playerDataManager.getPlayerSummary());
      setMoneyFormat(playerDataManager.getFormattedMoney());

      setPlayerRatings({
        overall: playerDataManager.getOverallRating(),
        position: playerDataManager.getPositionRating('CAM'),
        topAttributes: getTopAttributes()
      });
      setTrainingInfo({
        dailyPoints: playerDataManager.training.dailyTrainingPoints,
        focus: playerDataManager.training.focus,
        coachLevel: playerDataManager.training.coachLevel
      });

      // Po načtení dat znovu ověř denní odměnu
      checkDailyReward();
    };

    playerDataManager.addEventListener('coinsChanged', updateData);
    playerDataManager.addEventListener('levelUp', updateData);
    playerDataManager.addEventListener('profileUpdated', updateData);
    playerDataManager.addEventListener('dataLoaded', updateData);
    playerDataManager.addEventListener('attributeTrained', updateData);
    playerDataManager.addEventListener('attributeChanged', updateData);

    // Initial check for daily reward
    checkDailyReward();

    return () => {
      playerDataManager.removeEventListener('coinsChanged', updateData);
      playerDataManager.removeEventListener('levelUp', updateData);
      playerDataManager.removeEventListener('profileUpdated', updateData);
      playerDataManager.removeEventListener('dataLoaded', updateData);
      playerDataManager.removeEventListener('attributeTrained', updateData);
      playerDataManager.removeEventListener('attributeChanged', updateData);
    };
  }, []);

  const checkDailyReward = () => {
    const lastClaim = playerDataManager.dailyRewards.lastClaim;
    if (lastClaim) {
      const hoursSince = (new Date() - new Date(lastClaim)) / (1000 * 60 * 60);
      if (hoursSince < 24) {
        setRewardCooldown(Math.ceil(24 - hoursSince));
        setShowDailyReward(false);
      } else {
        setShowDailyReward(true);
      }
    } else {
      setShowDailyReward(true);
    }
  };

  const claimDailyReward = () => {
    const result = playerDataManager.claimDailyReward();
    if (result.success) {
      let message = `🎁 Získal jsi ${result.reward} coinů!\nStreak: ${result.streak} dní`;
      
      if (result.gemReward > 0) {
        message += `\n💎 Bonus: ${result.gemReward} gems!`;
      }
      if (result.trainingPointBonus > 0) {
        message += `\n🏋️ Bonus: +${result.trainingPointBonus} tréningový bod!`;
      }
      
      alert(message);
      setShowDailyReward(false);
      setRewardCooldown(24);
    } else if (result.hoursRemaining) {
      setRewardCooldown(result.hoursRemaining);
    }
  };

  return (
    <div style={{
      position: 'absolute',
      top: '20px',
      right: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '15px',
      alignItems: 'flex-end',
      zIndex: 1000
    }}>
      {/* Hlavní info panel */}
      <div style={{
        background: 'rgba(0, 0, 0, 0.85)',
        color: 'white',
        padding: '15px 20px',
        borderRadius: '15px',
        fontSize: '14px',
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        border: '2px solid rgba(255, 215, 0, 0.3)',
        backdropFilter: 'blur(10px)',
        minWidth: '520px'
      }}>
        {/* Avatar a jméno */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          cursor: 'pointer'
        }}
        onClick={onCustomizeClick}>
          {playerData.avatar && (
            <img 
              src={playerData.avatar} 
              alt="Avatar" 
              style={{ 
                width: '40px', 
                height: '40px', 
                borderRadius: '50%',
                border: '2px solid #FFD700'
              }} 
            />
          )}
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
              {playerData.name}
            </div>
            <div style={{ 
              fontSize: '12px', 
              color: '#FFD700',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}>
              <span>Level {playerData.level}</span>
              <div style={{
                width: '60px',
                height: '4px',
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '2px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${playerData.levelProgress * 100}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #FFD700, #FFA500)',
                  transition: 'width 0.3s ease'
                }} />
              </div>
            </div>
          </div>
          <div style={{
            fontSize: '10px',
            color: '#4CAF50',
            marginLeft: '-5px'
          }}>
            ✏️ Upravit
          </div>
        </div>

        {/* Player Rating Section */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '5px',
          borderLeft: '1px solid rgba(255, 255, 255, 0.2)',
          borderRight: '1px solid rgba(255, 255, 255, 0.2)',
          paddingLeft: '15px',
          paddingRight: '15px'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #FFD700, #FFA500)',
            color: '#000',
            padding: '8px 12px',
            borderRadius: '8px',
            textAlign: 'center',
            minWidth: '60px',
            fontWeight: 'bold'
          }}>
            <div style={{ fontSize: '18px', lineHeight: '1' }}>
              {playerRatings.overall}
            </div>
            <div style={{ fontSize: '10px', marginTop: '2px' }}>
              OVR
            </div>
          </div>
          
          <div style={{
            background: 'rgba(76, 175, 80, 0.2)',
            color: '#4CAF50',
            padding: '4px 8px',
            borderRadius: '5px',
            fontSize: '11px',
            border: '1px solid rgba(76, 175, 80, 0.3)'
          }}>
            CAM {playerRatings.position}
          </div>
        </div>

        {/* Ekonomika */}
        <div style={{
          display: 'flex',
          gap: '15px',
          borderRight: '1px solid rgba(255, 255, 255, 0.2)',
          paddingRight: '15px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(255, 215, 0, 0.1)',
            padding: '5px 12px',
            borderRadius: '8px',
            border: '1px solid rgba(255, 215, 0, 0.3)'
          }}>
            <span style={{ fontSize: '20px' }}>🪙</span>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#FFD700' }}>
                {moneyFormat.coins}
              </div>
              <div style={{ fontSize: '10px', color: '#999' }}>Coins</div>
            </div>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(138, 43, 226, 0.1)',
            padding: '5px 12px',
            borderRadius: '8px',
            border: '1px solid rgba(138, 43, 226, 0.3)'
          }}>
            <span style={{ fontSize: '20px' }}>💎</span>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#8A2BE2' }}>
                {moneyFormat.gems}
              </div>
              <div style={{ fontSize: '10px', color: '#999' }}>Gems</div>
            </div>
          </div>
        </div>

        {/* Training Info */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(76, 175, 80, 0.1)',
          padding: '5px 12px',
          borderRadius: '8px',
          border: '1px solid rgba(76, 175, 80, 0.3)'
        }}>
          <span style={{ fontSize: '20px' }}>🏋️</span>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#4CAF50' }}>
              {trainingInfo.dailyPoints}
            </div>
            <div style={{ fontSize: '10px', color: '#999' }}>Training</div>
          </div>
        </div>

        {/* Quick stats */}
        <div style={{
          display: 'flex',
          gap: '10px',
          fontSize: '12px'
        }}>
          <div title="Win rate" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '4px',
            background: 'rgba(255, 255, 255, 0.05)',
            padding: '4px 8px',
            borderRadius: '4px'
          }}>
            🏆 {playerData.winRate}%
          </div>
        </div>
      </div>

      {/* 🔥 NOVÉ: Quick Attributes Button */}
      <button
        onClick={openQuickAttributes}
        style={{
          padding: '12px 20px',
          background: 'linear-gradient(45deg, #FF6B6B, #FF5252)',
          color: 'white',
          border: 'none',
          borderRadius: '12px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          boxShadow: '0 4px 15px rgba(255, 107, 107, 0.4)',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'scale(1)';
        }}
      >
        <span style={{ fontSize: '20px' }}>⚙️</span>
        <span>QUICK ATRIBUTY</span>
      </button>

      {/* Top Attributes Panel */}
      <div style={{
        background: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '12px 16px',
        borderRadius: '12px',
        fontSize: '12px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        backdropFilter: 'blur(10px)',
        minWidth: '280px'
      }}>
        <div style={{
          fontSize: '13px',
          fontWeight: 'bold',
          marginBottom: '8px',
          color: '#FFD700',
          textAlign: 'center'
        }}>
          🌟 Nejlepší atributy
        </div>
        
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: '8px'
        }}>
          {playerRatings.topAttributes.map((attr, index) => (
            <div key={attr.name} style={{
              flex: 1,
              textAlign: 'center',
              background: 'rgba(255, 255, 255, 0.05)',
              padding: '6px 4px',
              borderRadius: '6px',
              border: `1px solid ${getCategoryColor(attr.category)}33`
            }}>
              <div style={{
                fontSize: '10px',
                color: getCategoryColor(attr.category),
                marginBottom: '2px'
              }}>
                {getCategoryIcon(attr.category)}
              </div>
              <div style={{
                fontSize: '14px',
                fontWeight: 'bold',
                color: getCategoryColor(attr.category),
                marginBottom: '2px'
              }}>
                {Math.round(attr.value)}
              </div>
              <div style={{
                fontSize: '9px',
                color: '#999',
                lineHeight: '1.1'
              }}>
                {attr.displayName}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 🔥 NOVÝ: Quick Attributes Panel */}
      {showQuickAttributes && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
            borderRadius: '20px',
            padding: '30px',
            width: '90%',
            maxWidth: '800px',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
            border: '2px solid rgba(255, 107, 107, 0.5)'
          }}>
            {/* Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h2 style={{
                margin: 0,
                color: '#FF6B6B',
                fontSize: '28px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <span>⚙️</span>
                <span>Quick Atributy</span>
                <span style={{
                  background: 'linear-gradient(45deg, #FFD700, #FFA500)',
                  color: '#000',
                  padding: '5px 10px',
                  borderRadius: '8px',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  marginLeft: '10px'
                }}>
                  OVR {playerRatings.overall}
                </span>
              </h2>
              <button
                onClick={() => setShowQuickAttributes(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#fff',
                  fontSize: '24px',
                  cursor: 'pointer'
                }}
              >
                ✖️
              </button>
            </div>

            {/* Preset Buttons */}
            <div style={{
              marginBottom: '20px',
              padding: '15px',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '10px'
            }}>
              <h4 style={{ color: '#FFD700', marginBottom: '10px' }}>🎯 Rychlé presety</h4>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '10px'
              }}>
                {[
                  { id: 'beginner', name: '🐣 Začátečník', desc: '25 všude' },
                  { id: 'average', name: '👤 Průměrný', desc: '50 všude' },
                  { id: 'skilled', name: '⭐ Zkušený', desc: '70+ všude' },
                  { id: 'superstar', name: '🌟 Superstar', desc: '90+ všude' },
                  { id: 'speedster', name: '💨 Rychlonožka', desc: 'Rychlost 95' },
                  { id: 'playmaker', name: '🎨 Playmaker', desc: 'Pasy 95' },
                  { id: 'striker', name: '⚽ Střelec', desc: 'Finishing 95' }
                ].map(preset => (
                  <button
                    key={preset.id}
                    onClick={() => applyPreset(preset.id)}
                    style={{
                      padding: '10px',
                      background: 'rgba(255, 107, 107, 0.2)',
                      color: '#fff',
                      border: '1px solid rgba(255, 107, 107, 0.3)',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      textAlign: 'center'
                    }}
                  >
                    <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>
                      {preset.name}
                    </div>
                    <div style={{ fontSize: '10px', opacity: 0.8 }}>
                      {preset.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Attributes Editor */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '20px'
            }}>
              {Object.keys(quickAttributes).map(category => {
                const categoryData = {
                  technical: { name: 'TECHNICKÉ', color: '#FFD700', icon: '⚽' },
                  mental: { name: 'MENTÁLNÍ', color: '#00CED1', icon: '🧠' },
                  physical: { name: 'FYZICKÉ', color: '#FF6B6B', icon: '💪' }
                }[category];

                return (
                  <div key={category} style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    padding: '15px',
                    borderRadius: '10px',
                    border: `1px solid ${categoryData.color}33`
                  }}>
                    <h4 style={{
                      color: categoryData.color,
                      marginBottom: '15px',
                      textAlign: 'center',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '5px'
                    }}>
                      <span>{categoryData.icon}</span>
                      {categoryData.name}
                    </h4>

                    {Object.keys(quickAttributes[category]).map(attr => (
                      <div key={attr} style={{
                        marginBottom: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <div style={{
                          flex: 1,
                          fontSize: '11px',
                          color: '#fff',
                          minWidth: '80px'
                        }}>
                          {getAttributeDisplayName(category, attr)}
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="100"
                          value={quickAttributes[category][attr]}
                          onChange={(e) => setQuickAttribute(category, attr, parseInt(e.target.value))}
                          style={{
                            flex: 1,
                            accentColor: categoryData.color
                          }}
                        />
                        <div style={{
                          color: categoryData.color,
                          fontSize: '12px',
                          fontWeight: 'bold',
                          minWidth: '25px',
                          textAlign: 'right'
                        }}>
                          {quickAttributes[category][attr]}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div style={{
              marginTop: '20px',
              textAlign: 'center',
              color: '#999',
              fontSize: '12px'
            }}>
              Změny se aplikují okamžitě! 🚀 Jdi hrát a pocítíš rozdíl!
            </div>
          </div>
        </div>
      )}

      {/* Daily reward tlačítko */}
      {showDailyReward && (
        <button
          onClick={claimDailyReward}
          style={{
            padding: '12px 20px',
            background: 'linear-gradient(45deg, #FFD700, #FFA500)',
            color: '#000',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            boxShadow: '0 4px 15px rgba(255, 215, 0, 0.4)',
            animation: 'pulse 2s ease-in-out infinite',
            minWidth: '200px'
          }}
        >
          <span style={{ fontSize: '24px' }}>🎁</span>
          <div style={{ textAlign: 'left' }}>
            <div>Denní odměna!</div>
            <div style={{ 
              fontSize: '11px',
              opacity: 0.8,
              display: 'flex',
              gap: '8px',
              marginTop: '2px'
            }}>
              <span>🪙 +{playerDataManager.dailyRewards.nextReward}</span>
              {playerDataManager.dailyRewards.streak > 0 && playerDataManager.dailyRewards.streak % 3 === 0 && (
                <span>🏋️ +1</span>
              )}
              {playerDataManager.dailyRewards.streak > 0 && playerDataManager.dailyRewards.streak % 7 === 0 && (
                <span>💎 +{Math.floor(playerDataManager.dailyRewards.streak / 7) * 5}</span>
              )}
            </div>
          </div>
        </button>
      )}

      {/* Cooldown info */}
      {rewardCooldown && !showDailyReward && (
        <div style={{
          padding: '10px 15px',
          background: 'rgba(0, 0, 0, 0.7)',
          color: '#999',
          borderRadius: '10px',
          fontSize: '12px',
          textAlign: 'center',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div style={{ marginBottom: '4px' }}>🎁 Denní odměna za {rewardCooldown}h</div>
          <div style={{ fontSize: '10px', opacity: 0.7 }}>
          Streak: {playerDataManager.dailyRewards.streak} dní
          </div>
        </div>
      )}

      {/* Měsíční přehled odměn */}
      <details style={{ marginTop: '10px', fontSize: '12px', color: '#ccc' }}>
        <summary style={{ cursor: 'pointer' }}>📅 Odměny na 30 dní</summary>
        <ul style={{ listStyle: 'none', padding: 0, margin: '5px 0', maxHeight: '150px', overflowY: 'auto' }}>
          {monthlyRewards.map(r => (
            <li key={r.day} style={{ marginBottom: '2px' }}>
              Den {r.day}: 🪙 +{r.coins}
              {r.training > 0 && <span> 🏋️ +{r.training}</span>}
              {r.gems > 0 && <span> 💎 +{r.gems}</span>}
            </li>
          ))}
        </ul>
      </details>

      {/* Quick Training Reminder */}
      {trainingInfo.dailyPoints > 0 && (
        <div style={{
          padding: '8px 12px',
          background: 'rgba(76, 175, 80, 0.1)',
          color: '#4CAF50',
          borderRadius: '8px',
          fontSize: '11px',
          border: '1px solid rgba(76, 175, 80, 0.3)',
          textAlign: 'center',
          cursor: 'pointer'
        }}
        onClick={onCustomizeClick}
        title="Klikni pro otevření tréninku"
        >
          🏋️ {trainingInfo.dailyPoints} tréningových bodů k použití!
          <div style={{ fontSize: '9px', opacity: 0.8, marginTop: '2px' }}>
            Klikni pro trénink atributů
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
      `}</style>
    </div>
  );
};