// src/StadiumManager/StadiumManagerSeat.js - 🪑 SEAT MANAGEMENT SYSTEM
import { THREE } from '../three.js';
import { StadiumBuilder } from '../StadiumBuilder.js';

export class StadiumManagerSeat {
  constructor(stadiumManager) {
    this.stadiumManager = stadiumManager;
  }

  // 🪑 Kontrola jestli už na pozici existuje sedačka
  isPositionOccupied(position, stadiumElements, tolerance = 0.3) {
    return stadiumElements.some(element => {
      if (element.type === 'individual_seat' && element.position) {
        const distance = Math.sqrt(
          Math.pow(position.x - element.position.x, 2) +
          Math.pow(position.z - element.position.z, 2)
        );
        return distance < tolerance;
      }
      return false;
    });
  }

  isValidSeatPosition(mousePosition, selectedStairs, tolerance = 1.0) {
    if (!selectedStairs) return false;
    
    const nearestSeatPos = StadiumBuilder.findNearestSeatPosition(mousePosition, selectedStairs, tolerance);
    return nearestSeatPos !== null;
  }

  // 🪑 Vytvoření preview sedačky
  createSeatPreview(seatType, seatColor) {
    console.log(`🪑 Creating seat preview: ${seatType}, ${seatColor}`);
    
    const previewSeat = StadiumBuilder.createElement('individual_seat', { x: 0, y: 0, z: 0 }, {
      seatType: seatType,
      seatColor: seatColor,
      rotation: 0
    });
    
    if (!previewSeat) {
      console.error('❌ Failed to create seat preview');
      return null;
    }
    
    // Nastav průhlednost a základní barvu pro všechny materiály
    previewSeat.traverse((child) => {
      if (child.isMesh && child.material) {
        if (Array.isArray(child.material)) {
          child.material = child.material.map(mat => {
            const newMat = mat.clone();
            newMat.transparent = true;
            newMat.opacity = 0.7;
            return newMat;
          });
        } else {
          child.material = child.material.clone();
          child.material.transparent = true;
          child.material.opacity = 0.7;
        }
      }
    });
    
    console.log(`✅ Seat preview created successfully`);
    return previewSeat;
  }

  // 🪑 Aktualizace barvy preview sedačky podle validity
  updateSeatPreviewColor(previewSeat, isValid) {
    if (!previewSeat) return;
    
    const color = isValid ? 0x00ff00 : 0xff0000; // Zelená/Červená
    
    previewSeat.traverse((child) => {
      if (child.isMesh && child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach(mat => {
            // Zachovej původní barvu ale přidej tint
            const originalColor = new THREE.Color(mat.color);
            const tintColor = new THREE.Color(color);
            mat.color.copy(originalColor.lerp(tintColor, 0.5)); // 50% mix
          });
        } else {
          const originalColor = new THREE.Color(child.material.color);
          const tintColor = new THREE.Color(color);
          child.material.color.copy(originalColor.lerp(tintColor, 0.5));
        }
      }
    });
  }

  // 🪑 Vytvoření/aktualizace preview sedaček na pozici myši (MULTIPLE PREVIEW)
  updateSeatPreviewAtMousePosition(mouseScreen, camera, selectedStairs, seatOptions, stadiumElements) {
    console.log(`🪑 Updating seat preview at mouse position`, { 
      placementMode: seatOptions.placementMode,
      seatType: seatOptions.type,
      seatColor: seatOptions.color
    });
    
    if (!selectedStairs || !seatOptions) {
      this.clearSeatPreview();
      return null;
    }
    
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouseScreen, camera);
    
    // Raycast na vybrané schody
    const stairIntersects = raycaster.intersectObjects([selectedStairs.mesh], true);
    
    if (stairIntersects.length > 0) {
      const intersectionPoint = stairIntersects[0].point;
      
      // Najdi nejbližší validní pozici sedačky
      const nearestSeatPos = StadiumBuilder.findNearestSeatPosition(intersectionPoint, selectedStairs, 2.0);
      
      if (nearestSeatPos) {
        // Získej pozice podle placement módu
        let previewPositions = [];
        
        switch (seatOptions.placementMode) {
          case 'single':
            previewPositions = [nearestSeatPos];
            break;
            
          case 'row':
            // Všechny pozice na stejném schodu
            const allSeatPositions = StadiumBuilder.getStairSeatPositions(selectedStairs);
            previewPositions = allSeatPositions.filter(pos => pos.stepIndex === nearestSeatPos.stepIndex);
            break;
            
          case 'all':
            // Všechny pozice na všech schodech
            previewPositions = StadiumBuilder.getStairSeatPositions(selectedStairs);
            break;
        }
        
        // Vyfiltruj pozice kde už sedačky jsou
        const availablePositions = previewPositions.filter(pos => 
          !this.isPositionOccupied(pos.position, stadiumElements || [])
        );
        
        console.log(`🪑 Preview positions: ${previewPositions.length} total, ${availablePositions.length} available`);
        
        // Pokud se změnily options nebo počet pozic, vytvoř nové preview
        if (!this.stadiumManager.seatPreviewObjects.length || 
            this.stadiumManager.lastSeatType !== seatOptions.type || 
            this.stadiumManager.lastSeatColor !== seatOptions.color ||
            this.stadiumManager.lastPreviewCount !== availablePositions.length) {
          
          this.clearSeatPreview();
          
          // Vytvoř preview pro všechny dostupné pozice
          availablePositions.forEach(seatPos => {
            const previewSeat = this.createSeatPreview(seatOptions.type, seatOptions.color);
            if (previewSeat) {
              previewSeat.position.copy(seatPos.position);
              previewSeat.rotation.y = seatPos.rotation;
              this.stadiumManager.scene.add(previewSeat);
              this.stadiumManager.seatPreviewObjects.push(previewSeat);
            }
          });
          
          this.stadiumManager.lastSeatType = seatOptions.type;
          this.stadiumManager.lastSeatColor = seatOptions.color;
          this.stadiumManager.lastPreviewCount = availablePositions.length;
          
          console.log(`🪑 Created ${this.stadiumManager.seatPreviewObjects.length} preview seats for ${seatOptions.placementMode} mode`);
        } else {
          // Jen aktualizuj pozice existujících preview objektů
          availablePositions.forEach((seatPos, index) => {
            if (this.stadiumManager.seatPreviewObjects[index]) {
              this.stadiumManager.seatPreviewObjects[index].position.copy(seatPos.position);
              this.stadiumManager.seatPreviewObjects[index].rotation.y = seatPos.rotation;
            }
          });
        }
        
        // Aktualizuj barvu všech preview objektů (zelená = validní)
        this.stadiumManager.seatPreviewObjects.forEach(previewSeat => {
          this.updateSeatPreviewColor(previewSeat, true);
        });
        
        this.stadiumManager.seatPreviewValid = true;
        
        return {
          position: nearestSeatPos.position.clone(),
          rotation: nearestSeatPos.rotation,
          isValid: true,
          stepIndex: nearestSeatPos.stepIndex,
          seatIndex: nearestSeatPos.seatIndex,
          totalSeats: availablePositions.length,
          placementMode: seatOptions.placementMode
        };
      } else {
        // Není validní pozice - vymaž preview
        this.clearSeatPreview();
        
        return {
          position: intersectionPoint,
          rotation: 0,
          isValid: false
        };
      }
    } else {
      // Myš není nad schody - skryj preview
      this.clearSeatPreview();
    }
    
    return null;
  }

  // 🪑 Vymazání všech preview sedaček
  clearSeatPreview() {
    this.stadiumManager.seatPreviewObjects.forEach(previewSeat => {
      if (this.stadiumManager.scene.children.includes(previewSeat)) {
        this.stadiumManager.scene.remove(previewSeat);
        previewSeat.traverse((child) => {
          if (child.isMesh) {
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
              if (Array.isArray(child.material)) {
                child.material.forEach(mat => mat.dispose());
              } else {
                child.material.dispose();
              }
            }
          }
        });
      }
    });
    
    this.stadiumManager.seatPreviewObjects = [];
    this.stadiumManager.lastSeatType = null;
    this.stadiumManager.lastSeatColor = null;
    this.stadiumManager.lastPreviewCount = 0;
    
    if (this.stadiumManager.seatPreviewObjects.length === 0) {
      console.log(`🧹 All seat previews cleared`);
    }
  }

  // 🔥 Přidání sedaček na schody s POKROČILOU LOGIKOU pro všechny módy
  addSeatsToStairs(targetStairs, intersectionPoint, seatOptions, stadiumElements, setStadiumElements, seatPrice = null) {
    console.log(`🔥🔥🔥 addSeatsToStairs ENTRY POINT:`);
    console.log(`🔥 targetStairs:`, targetStairs?.id || 'null');
    console.log(`🔥 seatOptions RAW:`, seatOptions);
    console.log(`🔥 seatOptions.type = "${seatOptions?.type}", seatOptions.color = "${seatOptions?.color}", placementMode = "${seatOptions?.placementMode}"`);
    
    const { placementMode, type, color } = seatOptions;
    console.log(`🪑 Destructured options: placementMode=${placementMode}, type=${type}, color=${color}`);
    
    let seatsToAdd = [];
    
    switch (placementMode) {
      case 'single':
        // Najdi nejbližší pozici sedačky
        const nearestSeatPos = StadiumBuilder.findNearestSeatPosition(intersectionPoint, targetStairs);
        if (nearestSeatPos && !this.isPositionOccupied(nearestSeatPos.position, stadiumElements)) {
          seatsToAdd = [nearestSeatPos];
          console.log(`🪑 Single mode: Adding 1 seat at step ${nearestSeatPos.stepIndex}`);
        } else {
          console.log(`🪑 Single mode: Position occupied or invalid`);
        }
        break;
        
      case 'row':
        // Najdi nejbližší pozici a přidej celou řadu
        const targetSeatPos = StadiumBuilder.findNearestSeatPosition(intersectionPoint, targetStairs);
        if (targetSeatPos) {
          const allSeatPositions = StadiumBuilder.getStairSeatPositions(targetStairs);
          const rowPositions = allSeatPositions.filter(pos => pos.stepIndex === targetSeatPos.stepIndex);
          
          // Vyfiltruj pozice kde už sedačky jsou
          seatsToAdd = rowPositions.filter(pos => !this.isPositionOccupied(pos.position, stadiumElements));
          
          console.log(`🪑 Row mode: Step ${targetSeatPos.stepIndex} - ${rowPositions.length} total positions, ${seatsToAdd.length} available`);
        }
        break;
        
      case 'all':
        // Přidej sedačky na všechny dostupné pozice
        const allPositions = StadiumBuilder.getStairSeatPositions(targetStairs);
        
        // Vyfiltruj pozice kde už sedačky jsou
        seatsToAdd = allPositions.filter(pos => !this.isPositionOccupied(pos.position, stadiumElements));
        
        console.log(`🪑 All mode: ${allPositions.length} total positions, ${seatsToAdd.length} available`);
        break;
        
      default:
        console.error(`❌ Unknown placement mode: ${placementMode}`);
        return;
    }
    
    if (seatsToAdd.length === 0) {
      console.log(`🪑 No seats to add - all positions occupied or invalid`);
      return;
    }
    
    console.log(`🪑 Creating ${seatsToAdd.length} seats with type=${type}, color=${color}`);
    
    // Vytvoř všechny sedačky
    const newSeats = [];
    seatsToAdd.forEach((seatPos, index) => {
      const seatMesh = StadiumBuilder.createElement('individual_seat', seatPos.position, {
        seatType: type,
        seatColor: color,
        rotation: seatPos.rotation
      });
      
      if (seatMesh) {
        this.stadiumManager.scene.add(seatMesh);
        const newSeat = {
          id: Date.now() + Math.random() + index,
          type: 'individual_seat',
          position: seatPos.position.clone(),
          rotation: seatPos.rotation,
          mesh: seatMesh,
          parentStairs: targetStairs.id,
          seatType: type,
          seatColor: color,
          stepIndex: seatPos.stepIndex,
          seatIndex: seatPos.seatIndex,
          // 💰 Přidej cenu pro refund
          purchasePrice: seatPrice?.price || 0,
          purchaseCurrency: seatPrice?.currency || 'coins'
        };
        newSeats.push(newSeat);
      }
    });
    
    // Přidej všechny nové sedačky do state najednou
    if (newSeats.length > 0) {
      setStadiumElements(prev => [...prev, ...newSeats]);
      console.log(`✅ Added ${newSeats.length} ${type} (${color}) seats in ${placementMode} mode`);
    }
  }
}