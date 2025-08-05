// PlayerUtilities.js - Utility metody a gettery pro FootballPlayer - FIXED FOR AI

export class PlayerUtilities {
  
    // Gettery pro základní informace
    static getCurrentRotation(player) {
      return player.currentRotation;
    }
  
    static getMovementDirection(player) {
      return player.currentRotation;
    }
  
    // 🔥 OPRAVA: Kontrola existence controls pro AI hráče
    static isCurrentlyMoving(player) {
      // AI hráč nemá controls, kontrolujeme rychlost místo toho
      if (!player.controls) {
        return player.speed > 0.1; // AI hráč se pohybuje pokud má rychlost
      }
      return player.controls.isMoving();
    }
    
    static getLastDribbleTime(player) {
      return player.lastDribbleTime || 0;
    }
    
    // Gettery pro atributy a výkon
    static getStaminaPercent(player) {
      return player.currentStamina / player.maxStamina;
    }
    
    static getPerformanceRating(player) {
      return Math.round(player.performanceModifier * 100);
    }
    
    static getConfidenceLevel(player) {
      return Math.round(player.confidence * 100);
    }
    
    static getSkillRating(player, category, attribute) {
      return player.attributes[category][attribute];
    }
    
    // Driblování status
    static getDribblingStatus(player) {
      return player.isDribbling;
    }
    
    // Metoda pro skrytí/zobrazení hlavy (pro first-person pohled)
    static setHeadVisible(player, visible) {
      // 🔥 OPRAVA: Bezpečnostní kontrola existence meshe
      if (!player || !player.mesh) {
        console.warn('Cannot set head visibility - player or mesh not found');
        return;
      }
      
      // Najdi skupinu hlavy
      const headGroup = player.mesh.children.find(child => 
        child.position.y > 1.4 && child.type === 'Group'
      );
      
      if (headGroup) {
        headGroup.visible = visible;
      }
      
      // Skryj také krk
      const neck = player.mesh.children.find(child => 
        child.position.y > 1.3 && child.position.y < 1.4 && 
        child.geometry && child.geometry.type === 'CylinderGeometry'
      );
      
      if (neck) {
        neck.visible = visible;
      }
    }
    
    // Detailní status pro debugging a monitoring
    static getDetailedStatus(player) {
      // 🔥 OPRAVA: Bezpečnostní kontrola existence hráče a meshe
      if (!player) {
        return {
          error: 'Player not found',
          playerType: 'Unknown'
        };
      }
      
      if (!player.mesh) {
        return {
          error: 'Player mesh not initialized',
          playerType: player.isAI ? 'AI' : 'Human',
          hasControls: !!player.controls
        };
      }
      
      return {
        // Basic info
        overall: PlayerUtilities.getOverallRating(player),
        position: { 
          x: player.mesh.position.x.toFixed(1), 
          y: player.mesh.position.y.toFixed(1), 
          z: player.mesh.position.z.toFixed(1) 
        },
        
        // Physical state
        speed: player.speed.toFixed(1),
        maxSpeed: player.maxSpeed.toFixed(1),
        stamina: `${player.currentStamina.toFixed(0)}/${player.maxStamina}`,
        staminaPercent: (PlayerUtilities.getStaminaPercent(player) * 100).toFixed(0) + '%',
        
        // Performance
        performance: PlayerUtilities.getPerformanceRating(player) + '%',
        confidence: PlayerUtilities.getConfidenceLevel(player) + '%',
        pressure: (player.pressureLevel * 100).toFixed(0) + '%',
        
        // Ball control
        isDribbling: player.isDribbling,
        controlRadius: player.controlRadius.toFixed(1),
        
        // States
        isOnGround: player.isOnGround,
        isSprinting: player.isSprinting,
        isExhausted: player.isExhausted,
        
        // 🔥 NOVÉ: Indikátor typu hráče
        playerType: player.isAI ? 'AI' : 'Human',
        hasControls: !!player.controls,
        
        // Key attributes
        pace: player.attributes.physical.pace,
        dribbling: player.attributes.technical.dribbling,
        finishing: player.attributes.technical.finishing,
        stamina_attr: player.attributes.physical.stamina
      };
    }
    
    // Overall rating calculation helper
    static getOverallRating(player) {
      // 🔥 OPRAVA: Bezpečnostní kontrola existence hráče a atributů
      if (!player || !player.attributes) {
        console.warn('Cannot calculate overall rating - player or attributes not found');
        return 0;
      }
      
      const tech = player.attributes.technical;
      const ment = player.attributes.mental;
      const phys = player.attributes.physical;
      
      if (!tech || !ment || !phys) {
        console.warn('Cannot calculate overall rating - missing attribute categories');
        return 0;
      }
      
      const techAvg = Object.values(tech).reduce((a, b) => a + b, 0) / Object.keys(tech).length;
      const mentAvg = Object.values(ment).reduce((a, b) => a + b, 0) / Object.keys(ment).length;
      const physAvg = Object.values(phys).reduce((a, b) => a + b, 0) / Object.keys(phys).length;
      
      const overall = (techAvg * 0.4) + (physAvg * 0.35) + (mentAvg * 0.25);
      return Math.round(overall);
    }
    
    // 🔥 OPRAVA: Bezpečný cleanup utility s kontrolou AI hráče
    static dispose(player) {
      try {
        // Dispose controls pouze pokud existují (lidský hráč)
        if (player.controls && typeof player.controls.dispose === 'function') {
          player.controls.dispose();
          console.log(`🧹 Controls disposed for ${player.isAI ? 'AI' : 'human'} player`);
        } else if (player.isAI) {
          console.log('🤖 AI player - no controls to dispose');
        }
        
        // Dispose mesh ze scény
        if (player.mesh && player.scene) {
          player.scene.remove(player.mesh);
          console.log(`🗑️ Mesh removed from scene for ${player.isAI ? 'AI' : 'human'} player`);
        }
        
        // Vyčisti reference
        player.controls = null;
        player.mesh = null;
        player.leftArm = null;
        player.rightArm = null;
        player.leftLeg = null;
        player.rightLeg = null;
        player.torso = null;
        player.head = null;
        player.headParts = null;
        
        console.log(`✅ ${player.isAI ? 'AI' : 'Human'} player disposed successfully via PlayerUtilities`);
        
      } catch (error) {
        console.error(`❌ Error in PlayerUtilities.dispose() for ${player.isAI ? 'AI' : 'human'} player:`, error);
        throw error; // Re-throw pro debugging
      }
    }
  }