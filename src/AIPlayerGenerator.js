// src/AIPlayerGenerator.js
export class AIPlayerGenerator {
  static firstNames = [
    'Jan', 'Petr', 'Tomáš', 'Martin', 'Pavel', 'Jiří', 'Lukáš', 'David', 'Ondřej', 'Jakub',
    'Adam', 'Filip', 'Marek', 'Michal', 'Daniel', 'Vojtěch', 'Matěj', 'Dominik', 'Erik', 'Viktor',
    'Carlos', 'Diego', 'Luis', 'Marco', 'Alex', 'Max', 'Leon', 'Felix', 'Oscar', 'Hugo'
  ];
  
  static lastNames = [
    'Novák', 'Svoboda', 'Novotný', 'Dvořák', 'Černý', 'Procházka', 'Kučera', 'Veselý', 'Horák', 'Němec',
    'Silva', 'Santos', 'Costa', 'Ferreira', 'Martinez', 'Garcia', 'Rodriguez', 'Müller', 'Schmidt', 'Rossi'
  ];
  
  static hairStyles = ['short', 'buzz', 'mohawk', 'spiky', 'undercut', 'afro', 'long', 'ponytail', 'bald'];
  
  static jerseyColors = [
    0xff0000, // Červená
    0x0000ff, // Modrá
    0xffff00, // Žlutá
    0x00ff00, // Zelená
    0xff00ff, // Fialová
    0xff8800, // Oranžová
    0x000000, // Černá
    0x00ffff, // Tyrkysová
    0x800080, // Purpurová
    0x008000  // Tmavě zelená
  ];
  
  /**
   * Generuje AI hráče podle zadaného levelu
   * @param {number} level - Level AI hráče (1-100)
   * @param {string} difficulty - Obtížnost: 'easy', 'normal', 'hard'
   * @returns {Object} AI player data
   */
  static generateAIPlayer(level = 1, difficulty = 'normal') {
    // Základní info
    const firstName = this.getRandomElement(this.firstNames);
    const lastName = this.getRandomElement(this.lastNames);
    const name = `${firstName} ${lastName}`;
    
    // Customizace vzhledu
    const customization = this.generateAppearance();
    
    // Atributy podle levelu a obtížnosti
    const attributes = this.generateAttributes(level, difficulty);
    
    // Traits
    const traits = this.generateTraits(level);
    
    // Overall rating
    const overallRating = this.calculateOverallRating(attributes);
    
    return {
      id: `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: name,
      firstName: firstName,
      lastName: lastName,
      level: level,
      overallRating: overallRating,
      difficulty: difficulty,
      attributes: attributes,
      traits: traits,
      customization: customization,
      stats: {
        matchesPlayed: Math.floor(level * 5 + Math.random() * 20),
        goalsScored: Math.floor(level * 2 + Math.random() * 10),
        assists: Math.floor(level * 1.5 + Math.random() * 8),
        yellowCards: Math.floor(Math.random() * 5),
        redCards: Math.floor(Math.random() * 2)
      },
      behavior: this.generateBehaviorProfile(attributes, traits, difficulty)
    };
  }
  
  /**
   * Generuje vzhled AI hráče
   */
  static generateAppearance() {
    // Různé barvy pleti
    const skinColors = [0xf4c2a1, 0xd4a76a, 0x8d5524, 0xc68642, 0xe0ac69];
    
    // Různé barvy vlasů
    const hairColors = [0x000000, 0x1a0f08, 0x3d2817, 0x8b4513, 0xd2691e, 0xffd700, 0xdc143c];
    
    // Barvy očí
    const eyeColors = [0x3d2817, 0x006400, 0x4169e1, 0x808080, 0x8b4513];
    
    return {
      skinColor: this.getRandomElement(skinColors),
      hairColor: this.getRandomElement(hairColors),
      hairStyle: this.getRandomElement(this.hairStyles),
      eyeColor: this.getRandomElement(eyeColors),
      height: 0.9 + Math.random() * 0.3, // 0.9 - 1.2
      build: 0.9 + Math.random() * 0.3,  // 0.9 - 1.2
      jerseyColor: this.getRandomElement(this.jerseyColors),
      jerseyNumber: Math.floor(Math.random() * 89) + 1, // 1-89
      jerseyName: Math.random() > 0.7 ? this.getRandomElement(this.lastNames).toUpperCase() : '',
      shortsColor: Math.random() > 0.5 ? 0x000000 : 0xffffff,
      socksColor: this.getRandomElement(this.jerseyColors),
      shoesColor: Math.random() > 0.5 ? 0x000000 : 0xffffff,
      accessories: {
        gloves: Math.random() > 0.8,
        headband: Math.random() > 0.9,
        wristbands: Math.random() > 0.85,
        captain_band: Math.random() > 0.95,
        shin_guards: true // Všichni AI mají chrániče
      }
    };
  }
  
  /**
   * Generuje atributy podle levelu a obtížnosti
   */
  static generateAttributes(level, difficulty) {
    // Base hodnoty podle obtížnosti
    const difficultyMultipliers = {
      easy: 0.8,
      normal: 1.0,
      hard: 1.2
    };
    
    const multiplier = difficultyMultipliers[difficulty] || 1.0;
    
    // Základní hodnota atributu podle levelu (1-100)
    const baseValue = (level / 100) * 80 + 10; // 10-90 range
    
    // Generuj atributy s variací
    const generateAttributeValue = (base, variance = 10) => {
      const value = base + (Math.random() - 0.5) * variance * 2;
      return Math.max(1, Math.min(100, Math.round(value * multiplier)));
    };
    
    return {
      technical: {
        corners: generateAttributeValue(baseValue * 0.8),
        crossing: generateAttributeValue(baseValue * 0.85),
        dribbling: generateAttributeValue(baseValue),
        finishing: generateAttributeValue(baseValue * 0.95),
        firstTouch: generateAttributeValue(baseValue * 0.9),
        freeKickTaking: generateAttributeValue(baseValue * 0.7),
        heading: generateAttributeValue(baseValue * 0.85),
        longShots: generateAttributeValue(baseValue * 0.8),
        longThrows: generateAttributeValue(baseValue * 0.6),
        marking: generateAttributeValue(baseValue * 0.9),
        passing: generateAttributeValue(baseValue),
        penaltyTaking: generateAttributeValue(baseValue * 0.85),
        tackling: generateAttributeValue(baseValue * 0.85),
        technique: generateAttributeValue(baseValue)
      },
      mental: {
        aggression: generateAttributeValue(baseValue * 0.9, 15),
        anticipation: generateAttributeValue(baseValue),
        bravery: generateAttributeValue(baseValue * 0.95, 15),
        composure: generateAttributeValue(baseValue * 0.9),
        concentration: generateAttributeValue(baseValue),
        decisions: generateAttributeValue(baseValue * 0.95),
        determination: generateAttributeValue(baseValue, 15),
        flair: generateAttributeValue(baseValue * 0.8, 20),
        leadership: generateAttributeValue(baseValue * 0.7, 20),
        offTheBall: generateAttributeValue(baseValue * 0.9),
        positioning: generateAttributeValue(baseValue),
        teamwork: generateAttributeValue(baseValue * 0.9),
        vision: generateAttributeValue(baseValue * 0.85),
        workRate: generateAttributeValue(baseValue, 15)
      },
      physical: {
        acceleration: generateAttributeValue(baseValue * 0.95),
        agility: generateAttributeValue(baseValue * 0.9),
        balance: generateAttributeValue(baseValue),
        jumpingReach: generateAttributeValue(baseValue * 0.85),
        naturalFitness: generateAttributeValue(baseValue * 0.95),
        pace: generateAttributeValue(baseValue),
        stamina: generateAttributeValue(baseValue * 1.05),
        strength: generateAttributeValue(baseValue * 0.9)
      }
    };
  }
  
  /**
   * Generuje traits podle levelu
   */
  static generateTraits(level) {
    const positiveTraits = [
      'speedster', 'technical_genius', 'leader', 'power_shooter',
      'long_throw', 'finesse_shot', 'outside_foot_shot', 'chip_shot',
      'solid_player', 'early_crosser', 'giant_throw', 'playmaker'
    ];
    
    const negativeTraits = [
      'injury_prone', 'selfish', 'argues_with_officials',
      'dives_into_tackles', 'avoids_weaker_foot', 'one_club_player'
    ];
    
    const traits = {
      positive: [],
      negative: []
    };
    
    // Vyšší level = více pozitivních traits
    const positiveCount = Math.floor(level / 25) + (Math.random() > 0.5 ? 1 : 0);
    const negativeCount = Math.max(0, 2 - Math.floor(level / 40));
    
    // Náhodně vyber traits
    for (let i = 0; i < positiveCount && i < positiveTraits.length; i++) {
      const trait = this.getRandomElement(positiveTraits);
      if (!traits.positive.includes(trait)) {
        traits.positive.push(trait);
      }
    }
    
    for (let i = 0; i < negativeCount && i < negativeTraits.length; i++) {
      const trait = this.getRandomElement(negativeTraits);
      if (!traits.negative.includes(trait)) {
        traits.negative.push(trait);
      }
    }
    
    return traits;
  }
  
  /**
   * Generuje profil chování AI
   */
  static generateBehaviorProfile(attributes, traits, difficulty) {
    return {
      // Agresivita v soubojích
      aggressiveness: attributes.mental.aggression / 100,
      
      // Tendence driblovat vs přihrávat
      dribblingTendency: attributes.technical.dribbling > attributes.technical.passing ? 0.7 : 0.3,
      
      // Vzdálenost pro střelbu
      shootingDistance: attributes.technical.longShots > 70 ? 25 : 15,
      
      // Rychlost rozhodování (ms)
      decisionSpeed: 2000 - (attributes.mental.decisions * 15),
      
      // Preference rychlých protiútoků
      counterAttackPreference: attributes.physical.pace > 70 ? 0.8 : 0.4,
      
      // Defenzivní styl
      defensiveStyle: attributes.physical.strength > attributes.physical.pace ? 'physical' : 'tactical',
      
      // Pravděpodobnost riskantních akcí
      riskTaking: traits.positive.includes('flair') ? 0.7 : 0.3,
      
      // Reakce na tlak
      pressureResistance: attributes.mental.composure / 100
    };
  }
  
  /**
   * Vypočítá celkové hodnocení
   */
  static calculateOverallRating(attributes) {
    const weights = {
      technical: 0.4,
      physical: 0.35,
      mental: 0.25
    };
    
    let total = 0;
    let count = 0;
    
    Object.keys(weights).forEach(category => {
      const categorySum = Object.values(attributes[category]).reduce((a, b) => a + b, 0);
      const categoryAvg = categorySum / Object.keys(attributes[category]).length;
      total += categoryAvg * weights[category];
      count += weights[category];
    });
    
    return Math.round(total / count);
  }
  
  /**
   * Pomocná funkce pro náhodný výběr z pole
   */
  static getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
  }
  
  /**
   * Generuje tým AI hráčů
   */
  static generateAITeam(teamLevel = 1, teamSize = 1, difficulty = 'normal') {
    const team = [];
    
    for (let i = 0; i < teamSize; i++) {
      // Variace levelu v týmu (±10%)
      const playerLevel = Math.max(1, Math.min(100, 
        teamLevel + Math.floor((Math.random() - 0.5) * teamLevel * 0.2)
      ));
      
      const player = this.generateAIPlayer(playerLevel, difficulty);
      team.push(player);
    }
    
    return team;
  }
  
  /**
   * Generuje AI hráče podle pozice (pro budoucí použití)
   */
  static generatePositionalPlayer(position, level, difficulty = 'normal') {
    const player = this.generateAIPlayer(level, difficulty);
    
    // Upravit atributy podle pozice
    switch (position) {
      case 'GK':
        // Brankář - zvýšit reflexy, positioning
        player.attributes.mental.positioning *= 1.3;
        player.attributes.mental.concentration *= 1.2;
        player.attributes.physical.agility *= 1.2;
        break;
      case 'DEF':
        // Obránce - zvýšit tackling, marking
        player.attributes.technical.tackling *= 1.3;
        player.attributes.technical.marking *= 1.3;
        player.attributes.physical.strength *= 1.2;
        break;
      case 'MID':
        // Záložník - vyvážené atributy
        player.attributes.technical.passing *= 1.2;
        player.attributes.mental.vision *= 1.2;
        player.attributes.physical.stamina *= 1.2;
        break;
      case 'ATT':
        // Útočník - zvýšit finishing, pace
        player.attributes.technical.finishing *= 1.3;
        player.attributes.technical.dribbling *= 1.2;
        player.attributes.physical.pace *= 1.2;
        break;
    }
    
    // Přepočítat overall rating
    player.overallRating = this.calculateOverallRating(player.attributes);
    
    return player;
  }
}