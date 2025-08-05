/**
 * StadiumBuilderStadiumIndividualSeat.js - INDIVIDUÁLNÍ SEDAČKY
 * 
 * OBSAH:
 * - createIndividualSeat() - VYLEPŠENÁ funkce pro vytvoření samostatné sedačky S DEBUG LOGOVÁNÍM
 */

import { THREE } from '../three.js';

export const StadiumBuilderStadiumIndividualSeat = {
  
  // 🪑 VYLEPŠENÁ funkce pro vytvoření samostatné sedačky S DEBUG LOGOVÁNÍM
  createIndividualSeat(position, seatType = 'plastic', seatColor = 'blue', rotation = 0) {
    console.log(`🪑 createIndividualSeat called with:`, {
      position: { x: position.x, y: position.y, z: position.z },
      seatType: seatType,
      seatColor: seatColor,
      rotation: rotation
    });
    
    const seatGroup = new THREE.Group();
    
    // 🎨 ROZŠÍŘENÁ PALETA BAREV
    const colors = {
      blue: 0x1E88E5, 
      red: 0xE53935, 
      green: 0x43A047, 
      yellow: 0xFDD835,
      orange: 0xFF8F00, 
      purple: 0x8E24AA, 
      white: 0xFFFFFF, 
      black: 0x424242,
      // 🆕 PŘIDANÉ BARVY
      pink: 0xE91E63,
      cyan: 0x00BCD4,
      lime: 0x8BC34A,
      brown: 0x795548,
      grey: 0x9E9E9E,
      navy: 0x0D47A1,
      maroon: 0x880E4F,
      teal: 0x009688
    };
    
    // 🎨 Kontrola validity barvy
    const selectedColor = colors[seatColor] || colors.blue;
    if (!colors[seatColor]) {
      console.warn(`🎨 Invalid seat color: ${seatColor}, using blue instead`);
    }
    
    console.log(`🎨 Using color: ${seatColor} = 0x${selectedColor.toString(16).toUpperCase()}`);
    
    const seatMaterial = new THREE.MeshStandardMaterial({
      color: selectedColor,
      roughness: 0.7,
      metalness: 0.1
    });
    
    const frameMaterial = new THREE.MeshStandardMaterial({
      color: 0x333333,
      roughness: 0.4,
      metalness: 0.6
    });
    
    console.log(`🪑 Creating seat of type: ${seatType}`);
    
    switch (seatType) {
      case 'plastic':
        console.log(`🪑 Building plastic seat...`);
        const seat = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.05, 0.35), seatMaterial);
        seat.position.set(0, 0.1, 0);
        seatGroup.add(seat);
        
        const backrest = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.35, 0.05), seatMaterial);
        backrest.position.set(0, 0.25, -0.15);
        seatGroup.add(backrest);
        
        const frame = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.02, 0.37), frameMaterial);
        frame.position.set(0, 0.08, 0);
        seatGroup.add(frame);
        console.log(`✅ Plastic seat created successfully`);
        break;
        
      case 'bench':
        console.log(`🪑 Building bench seat...`);
        const benchMaterial = new THREE.MeshStandardMaterial({ 
          color: selectedColor === colors.blue ? 0x8B4513 : selectedColor, // Pokud je modrá, použij hnědou pro dřevo
          roughness: 0.8 
        });
        
        const benchSeat = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.08, 0.3), benchMaterial);
        benchSeat.position.set(0, 0.12, 0);
        seatGroup.add(benchSeat);
        
        const benchBack = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.4, 0.05), benchMaterial);
        benchBack.position.set(0, 0.32, -0.125);
        seatGroup.add(benchBack);
        
        for (let i = -1; i <= 1; i += 2) {
          const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.25, 8), frameMaterial);
          leg.position.set(i * 0.6, 0.125, 0);
          seatGroup.add(leg);
        }
        console.log(`✅ Bench seat created successfully`);
        break;
        
      case 'vip':
        console.log(`🪑 Building VIP seat...`);
        const vipMaterial = new THREE.MeshStandardMaterial({ 
          color: selectedColor, 
          roughness: 0.3, 
          metalness: 0.2 
        });
        
        const vipSeat = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.1, 0.4), vipMaterial);
        vipSeat.position.set(0, 0.15, 0);
        seatGroup.add(vipSeat);
        
        const vipBack = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.45, 0.08), vipMaterial);
        vipBack.position.set(0, 0.35, -0.16);
        seatGroup.add(vipBack);
        
        for (let i = -1; i <= 1; i += 2) {
          const armrest = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.25, 0.3), frameMaterial);
          armrest.position.set(i * 0.29, 0.25, -0.05);
          seatGroup.add(armrest);
        }
        console.log(`✅ VIP seat created successfully`);
        break;
        
      default:
        console.error(`❌ Unknown seat type: ${seatType}, falling back to plastic`);
        // Fallback to plastic
        const fallbackSeat = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.05, 0.35), seatMaterial);
        fallbackSeat.position.set(0, 0.1, 0);
        seatGroup.add(fallbackSeat);
        
        const fallbackBackrest = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.35, 0.05), seatMaterial);
        fallbackBackrest.position.set(0, 0.25, -0.15);
        seatGroup.add(fallbackBackrest);
        break;
    }
    
    // Aplikuj transformace
    seatGroup.position.copy(position);
    seatGroup.rotation.y = rotation;
    seatGroup.scale.set(0.8, 0.8, 0.8);
    
    // Nastav stíny
    seatGroup.children.forEach(child => {
      child.castShadow = true;
      child.receiveShadow = true;
    });
    
    console.log(`✅ Individual seat completed: ${seatType} (${seatColor}) at position (${position.x}, ${position.y}, ${position.z})`);
    
    return seatGroup;
  }
};