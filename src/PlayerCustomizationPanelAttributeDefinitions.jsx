// src/PlayerCustomizationPanelAttributeDefinitions.jsx - ATRIBUTY DEFINICE
export const attributeDefinitions = {
  technical: {
    name: 'TECHNICKÉ',
    color: '#FFD700',
    icon: '⚽',
    attributes: {
      corners: { name: 'Rohové kopy', desc: 'Přesnost centrů z rohů' },
      crossing: { name: 'Centrování', desc: 'Kvalita přihrávek z křídel' },
      dribbling: { name: 'Dribling', desc: 'Schopnost obejít soupeře' },
      finishing: { name: 'Zakončování', desc: 'Přesnost střelby v šestnáctce' },
      firstTouch: { name: 'První dotek', desc: 'Kontrola míče při přijetí' },
      freeKickTaking: { name: 'Přímé kopy', desc: 'Přesnost a síla volných kopů' },
      heading: { name: 'Hlavičkování', desc: 'Efektivita hry hlavou' },
      longShots: { name: 'Daleké střely', desc: 'Síla a přesnost z dálky' },
      longThrows: { name: 'Dlouhé auty', desc: 'Dosah a přesnost autů' },
      marking: { name: 'Obsazování', desc: 'Schopnost bránit soupeře' },
      passing: { name: 'Přihrávání', desc: 'Přesnost krátkých přihrávek' },
      penaltyTaking: { name: 'Penalty', desc: 'Přesnost pokutových kopů' },
      tackling: { name: 'Skluzování', desc: 'Efektivita obranných zákroků' },
      technique: { name: 'Technika', desc: 'Celková technická úroveň' }
    }
  },
  mental: {
    name: 'MENTÁLNÍ',
    color: '#00CED1',
    icon: '🧠',
    attributes: {
      aggression: { name: 'Agresivita', desc: 'Tendence k tvrdé hře' },
      anticipation: { name: 'Předvídání', desc: 'Čtení hry a reakce' },
      bravery: { name: 'Odvaha', desc: 'Ochota jít do soubojů' },
      composure: { name: 'Chladnokrevnost', desc: 'Klid v tlaku' },
      concentration: { name: 'Soustředění', desc: 'Udržení pozornosti' },
      decisions: { name: 'Rozhodování', desc: 'Rychlost a kvalita rozhodnutí' },
      determination: { name: 'Odhodlání', desc: 'Vůle vyhrát' },
      flair: { name: 'Kreativita', desc: 'Schopnost překvapit' },
      leadership: { name: 'Vedení', desc: 'Vliv na spoluhráče' },
      offTheBall: { name: 'Pohyb bez míče', desc: 'Inteligentní běh' },
      positioning: { name: 'Postavení', desc: 'Správná pozice na hřišti' },
      teamwork: { name: 'Týmová práce', desc: 'Spolupráce s ostatními' },
      vision: { name: 'Vidění hry', desc: 'Schopnost vidět přihrávky' },
      workRate: { name: 'Pracovitost', desc: 'Množství úsilí v zápase' }
    }
  },
  physical: {
    name: 'FYZICKÉ',
    color: '#FF6B6B',
    icon: '💪',
    attributes: {
      acceleration: { name: 'Zrychlení', desc: 'Rychlost nástupu do běhu' },
      agility: { name: 'Hbitost', desc: 'Schopnost rychle měnit směr' },
      balance: { name: 'Rovnováha', desc: 'Stabilita v soubojích' },
      jumpingReach: { name: 'Výskok', desc: 'Výška skoku pro hlavičky' },
      naturalFitness: { name: 'Přirozená kondice', desc: 'Odolnost únavě' },
      pace: { name: 'Rychlost', desc: 'Maximální běžecká rychlost' },
      stamina: { name: 'Vytrvalost', desc: 'Schopnost dlouho běžet' },
      strength: { name: 'Síla', desc: 'Fyzická převaha v soubojích' }
    }
  }
};