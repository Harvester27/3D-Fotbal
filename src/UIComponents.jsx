// src/UIComponents.jsx
// ✅ PŘEPRACOVÁNO: Tento soubor nyní pouze re-exportuje komponenty z modulárních souborů

// Import komponent z rozdělených souborů
export { GameMenu } from './GameMenu.jsx';
export { StadiumEditorPanel } from './StadiumEditorPanel.jsx';
export { 
  GameControlsPanel, 
  DribblingIndicator, 
  BackToMenuButton,
  KickCooldownIndicator,
  CameraIndicator,
  GameStatusPanel,
  BallControlIndicator,    // 🔥 NOVÝ EXPORT
  GameMessageSystem,       // 🔥 NOVÝ EXPORT
  ShootingIndicator,       // 🔥 NOVÝ EXPORT pro mouse shooting
  UnsavedChangesIndicator  // 💾 NOVÝ EXPORT pro save indikátor
} from './GameUI.jsx';

// Poznámka: Tento soubor slouží jako centrální místo pro export všech UI komponent
// Umožňuje zachovat kompatibilitu se stávajícím kódem, zatímco komponenty 
// jsou nyní rozděleny do menších, lépe spravovatelných souborů:
//
// GameMenu.jsx          - Hlavní menu s animacemi (~160 řádků)
// StadiumEditorPanel.jsx - Kompletní editor panel (~420 řádků) 
// GameUI.jsx            - Herní UI komponenty (~580+ řádků s novými komponentami)
//
// Celkem: ~1160+ řádků rozděleno do 3 specializovaných souborů
// + CameraController.js (~120 řádků) pro správu kamery
// + ShootingIndicator pro mouse shooting systém
// + UnsavedChangesIndicator pro manuální ukládání