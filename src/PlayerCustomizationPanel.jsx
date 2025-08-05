// src/PlayerCustomizationPanel.jsx - HLAVNÍ SOUBOR
import React, { useState, useEffect, useRef } from 'react';
import { playerDataManager } from './PlayerDataManager.js';

// Import komponent
import { PlayerCustomizationPanelPreview } from './PlayerCustomizationPanelPreview.jsx';
import { PlayerCustomizationPanelAttributes } from './PlayerCustomizationPanelAttributes.jsx';
import { PlayerCustomizationPanelTraits } from './PlayerCustomizationPanelTraits.jsx';
import { PlayerCustomizationPanelAppearanceTab } from './PlayerCustomizationPanelAppearanceTab.jsx';
import { PlayerCustomizationPanelBodyTab } from './PlayerCustomizationPanelBodyTab.jsx';
import { PlayerCustomizationPanelJerseyTab } from './PlayerCustomizationPanelJerseyTab.jsx';
import { PlayerCustomizationPanelAccessoriesTab } from './PlayerCustomizationPanelAccessoriesTab.jsx';
import { PlayerCustomizationPanelStatsTab } from './PlayerCustomizationPanelStatsTab.jsx';

export const PlayerCustomizationPanel = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('appearance');
  
  // Načti aktuální hodnoty z playerDataManager při otevření
  const [customization, setCustomization] = useState(() => ({
    ...playerDataManager.playerCustomization,
    accessories: { ...playerDataManager.playerCustomization.accessories },
    hairStyle: playerDataManager.playerCustomization.hairStyle || 'realistic'
  }));
  
  const [profile, setProfile] = useState({ ...playerDataManager.playerProfile });
  
  // 🔥 Atributy state
  const [attributes, setAttributes] = useState(() => ({
    ...playerDataManager.attributes
  }));
  const [traits, setTraits] = useState(() => ({
    ...playerDataManager.traits
  }));
  const [trainingPoints, setTrainingPoints] = useState(playerDataManager.training.dailyTrainingPoints);
  const [playerRatings, setPlayerRatings] = useState({
    overall: playerDataManager.getOverallRating(),
    position: playerDataManager.getPositionRating('CAM')
  });

  // Obnovit hodnoty z playerDataManager když se panel otevře
  useEffect(() => {
    if (isOpen) {
      // Načti aktuální data z playerDataManager
      const currentCustomization = {
        ...playerDataManager.playerCustomization,
        accessories: { ...playerDataManager.playerCustomization.accessories },
        hairStyle: playerDataManager.playerCustomization.hairStyle || 'realistic'
      };
      setCustomization(currentCustomization);
      setProfile({ ...playerDataManager.playerProfile });
      
      // 🔥 Načti atributy
      setAttributes({ ...playerDataManager.attributes });
      setTraits({ ...playerDataManager.traits });
      setTrainingPoints(playerDataManager.training.dailyTrainingPoints);
      setPlayerRatings({
        overall: playerDataManager.getOverallRating(),
        position: playerDataManager.getPositionRating('CAM')
      });
      
      console.log('🔄 Loaded current customization:', currentCustomization);
      console.log('👱 Current hair style:', currentCustomization.hairStyle);
      console.log('⚽ Current attributes:', playerDataManager.attributes);
    }
  }, [isOpen]);

  // 🔥 NOVÉ: Synchronizuj React state s PlayerDataManager okamžitě
  useEffect(() => {
    if (isOpen) {
      // Aktualizuj PlayerDataManager při každé změně customization
      console.log('🔄 Syncing customization to PlayerDataManager:', customization);
      playerDataManager.playerCustomization = { ...customization };
      
      // Obnov herního hráče okamžitě
      if (window.playerRef?.current?.refreshAppearance) {
        window.playerRef.current.refreshAppearance();
        console.log('🎮 Game player refreshed immediately');
      }
    }
  }, [customization, isOpen]);

  // 🔥 FUNKCE: Trénovat atribut
  const trainAttribute = (category, attributeName, intensity = 'normal') => {
    const success = playerDataManager.trainAttribute(category, attributeName, intensity);
    if (success) {
      // Aktualizuj lokální state
      setAttributes({ ...playerDataManager.attributes });
      setTrainingPoints(playerDataManager.training.dailyTrainingPoints);
      setPlayerRatings({
        overall: playerDataManager.getOverallRating(),
        position: playerDataManager.getPositionRating('CAM')
      });
    }
  };

  // 🔥 FUNKCE: Reset daily training
  const resetTraining = () => {
    playerDataManager.resetDailyTraining();
    setTrainingPoints(playerDataManager.training.dailyTrainingPoints);
  };

  // 🔥 FUNKCE: Nastav atribut v lokálním state i PlayerDataManager
  const setQuickAttribute = (category, attr, value) => {
    // Aktualizuj lokální state
    const newAttrs = { ...attributes };
    newAttrs[category][attr] = value;
    setAttributes(newAttrs);
    
    // 🔥 HLAVNÍ OPRAVA: Okamžitě ulož do PlayerDataManager!
    playerDataManager.attributes[category][attr] = value;
    
    // Aktualizuj ratings
    setTimeout(() => {
      setPlayerRatings({
        overall: playerDataManager.getOverallRating(),
        position: playerDataManager.getPositionRating('CAM')
      });
    }, 10);
    
    console.log(`🔄 Quick attribute set: ${category}.${attr} = ${value}`);
  };

  // 🔥 FUNKCE: Preset hodnoty s ukládáním
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
    
    console.log(`🎯 Applying preset: ${presetName}`);
    
    // Aplikuj preset na všechny atributy
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
    
    console.log(`✅ Preset ${presetName} applied and saved!`);
  };

  // 🔥 Save changes s uložením atributů!
  const saveChanges = () => {
    console.log('💾 Saving customization changes:', customization);
    console.log('👱 Saving hair style:', customization.hairStyle);
    console.log('⚽ Saving attributes:', attributes);
    
    // 🔥 HLAVNÍ OPRAVA: Ulož atributy do PlayerDataManager!
    playerDataManager.attributes = { ...attributes };
    
    // Ulož všechny změny najednou jako appearance update
    playerDataManager.updateCustomization('appearance', customization);
    playerDataManager.updateProfile(profile);
    
    // 🔥 Oznám změnu atributů ostatním komponentám
    playerDataManager.notifyListeners('attributesUpdated', attributes);
    
    // 🔥 Pokud existuje aktivní hráč, obnov jeho atributy
    if (window.playerRef && window.playerRef.current && window.playerRef.current.refreshAttributes) {
      window.playerRef.current.refreshAttributes();
      console.log('🔄 Player attributes refreshed in game!');
    }
    
    console.log('✅ Changes saved with attributes!');
    onClose();
  };

  if (!isOpen) return null;

  return (
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
        width: '95%',
        maxWidth: '1200px',
        maxHeight: '95vh',
        overflow: 'auto',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
        border: '2px solid rgba(255, 215, 0, 0.3)'
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
            color: '#FFD700',
            fontSize: '28px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <span>⚽</span>
            <span>Úprava hráče</span>
            {/* Overall rating */}
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
            onClick={onClose}
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

        {/* Content */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '300px 1fr',
          gap: '30px'
        }}>
          {/* Preview komponenta */}
          <PlayerCustomizationPanelPreview
            isOpen={isOpen}
            customization={customization}
            profile={profile}
            setProfile={setProfile}
            playerRatings={playerRatings}
            trainingPoints={trainingPoints}
          />

          {/* Customization options */}
          <div>
            {/* Tabs */}
            <div style={{
              display: 'flex',
              gap: '10px',
              marginBottom: '20px',
              flexWrap: 'wrap'
            }}>
              {[
                { id: 'appearance', name: '👤 Vzhled' },
                { id: 'body', name: '💪 Postava' },
                { id: 'jersey', name: '👕 Dres' },
                { id: 'accessories', name: '🎁 Doplňky' },
                { id: 'attributes', name: '⚽ Atributy' },
                { id: 'traits', name: '🎭 Vlastnosti' },
                { id: 'stats', name: '📊 Statistiky' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    padding: '10px 20px',
                    background: activeTab === tab.id ? 
                      'linear-gradient(45deg, #FFD700, #FFA500)' : 
                      'rgba(255, 255, 255, 0.1)',
                    color: activeTab === tab.id ? '#000' : '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {tab.name}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '15px',
              padding: '20px',
              minHeight: '500px',
              maxHeight: '500px',
              overflowY: 'auto'
            }}>
              
              {/* ATTRIBUTES TAB */}
              {activeTab === 'attributes' && (
                <PlayerCustomizationPanelAttributes
                  attributes={attributes}
                  trainingPoints={trainingPoints}
                  setQuickAttribute={setQuickAttribute}
                  applyPreset={applyPreset}
                />
              )}

              {/* TRAITS TAB */}
              {activeTab === 'traits' && (
                <PlayerCustomizationPanelTraits
                  traits={traits}
                  setTraits={setTraits}
                />
              )}

              {/* APPEARANCE TAB */}
              {activeTab === 'appearance' && (
                <PlayerCustomizationPanelAppearanceTab
                  customization={customization}
                  setCustomization={setCustomization}
                />
              )}

              {/* BODY TAB */}
              {activeTab === 'body' && (
                <PlayerCustomizationPanelBodyTab
                  customization={customization}
                  setCustomization={setCustomization}
                />
              )}

              {/* JERSEY TAB */}
              {activeTab === 'jersey' && (
                <PlayerCustomizationPanelJerseyTab
                  customization={customization}
                  setCustomization={setCustomization}
                />
              )}

              {/* ACCESSORIES TAB */}
              {activeTab === 'accessories' && (
                <PlayerCustomizationPanelAccessoriesTab
                  customization={customization}
                  setCustomization={setCustomization}
                />
              )}

              {/* STATS TAB */}
              {activeTab === 'stats' && (
                <PlayerCustomizationPanelStatsTab
                  playerRatings={playerRatings}
                />
              )}
            </div>
          </div>
        </div>

        {/* Footer buttons */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '10px',
          marginTop: '20px'
        }}>
          <button
            onClick={() => {
              // Obnovit původní hodnoty při zrušení
              setCustomization({
                ...playerDataManager.playerCustomization,
                accessories: { ...playerDataManager.playerCustomization.accessories }
              });
              setProfile({ ...playerDataManager.playerProfile });
              setAttributes({ ...playerDataManager.attributes });
              onClose();
            }}
            style={{
              padding: '10px 30px',
              background: 'rgba(255, 255, 255, 0.1)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Zrušit
          </button>
          <button
            onClick={saveChanges}
            style={{
              padding: '10px 30px',
              background: 'linear-gradient(45deg, #4CAF50, #45a049)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            🔥 Uložit změny + Aplikovat atributy!
          </button>
        </div>
      </div>
    </div>
  );
};