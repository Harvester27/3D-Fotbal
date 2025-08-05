// src/PlayerAppearance.js
import { THREE } from './three.js';

export class PlayerAppearance {
  static createPlayer(scene, position, customizationOverride = null) {
    const playerGroup = new THREE.Group();
    
    // Použij override customizace pokud je předána, jinak vezmi z playerDataManager
    const customization = customizationOverride || window.playerDataManager?.playerCustomization || {};
    
    // Debug log pro kontrolu
    console.log('🎨 Creating player with customization:', {
      skinColor: customization.skinColor ? `0x${customization.skinColor.toString(16)}` : 'default',
      hairColor: customization.hairColor ? `0x${customization.hairColor.toString(16)}` : 'default',
      hairStyle: customization.hairStyle || 'default',
      eyeColor: customization.eyeColor ? `0x${customization.eyeColor.toString(16)}` : 'default',
      jerseyColor: customization.jerseyColor ? `0x${customization.jerseyColor.toString(16)}` : 'default',
      jerseyNumber: customization.jerseyNumber || 'default'
    });
    
    // Barvy s fallback hodnotami
    const skinColor = customization.skinColor || 0xf4c2a1;
    const hairColor = customization.hairColor || 0x1a0f08;
    const eyeColor = customization.eyeColor || 0x3d2817;
    const jerseyColor = customization.jerseyColor || 0xfafafa;
    const accentColor = 0x4a90e2; // Světle modrá pro detaily
    const shortsColor = customization.shortsColor || 0xe8e8e8;
    const socksColor = customization.socksColor || 0x4a90e2;
    const shoesColor = customization.shoesColor || 0x0a0a0a;
    
    // Velikost postavy
    const heightScale = customization.height || 1.0;
    const buildScale = customization.build || 1.0;
    
    // TĚLO - realističtější proporce s detaily
    const torsoGroup = new THREE.Group();
    
    // Hlavní torso s realistickými proporcemi
    const torsoGeometry = new THREE.CylinderGeometry(0.28, 0.24, 0.8, 32, 16);
    torsoGeometry.scale(1.3, 1, 0.8);
    const torso = new THREE.Mesh(
      torsoGeometry,
      new THREE.MeshStandardMaterial({
        color: jerseyColor,
        roughness: 0.7,
        metalness: 0.05,
        flatShading: false
      })
    );
    torso.position.y = 0.9;
    torso.castShadow = true;
    torsoGroup.add(torso);
    
    // Přidáme jemné detaily - záhyby na dresu
    const wrinkle1 = new THREE.Mesh(
      new THREE.TorusGeometry(0.32, 0.01, 4, 32),
      new THREE.MeshStandardMaterial({
        color: 0xdddddd,
        roughness: 0.8
      })
    );
    wrinkle1.position.set(0, 0.7, 0);
    wrinkle1.rotation.x = Math.PI / 2;
    wrinkle1.scale.set(1, 0.7, 1);
    torsoGroup.add(wrinkle1);
    
    // Japonský znak na dresu
    const symbolCanvas = document.createElement('canvas');
    symbolCanvas.width = 256;
    symbolCanvas.height = 256;
    const ctx = symbolCanvas.getContext('2d');
    ctx.fillStyle = '#4a90e2';
    ctx.font = 'bold 140px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('翼', 128, 128);
    
    const symbol = new THREE.Mesh(
      new THREE.PlaneGeometry(0.35, 0.35, 32, 32),
      new THREE.MeshBasicMaterial({
        map: new THREE.CanvasTexture(symbolCanvas),
        transparent: true,
        opacity: 0.9
      })
    );
    symbol.position.set(0, 0.9, 0.23);
    torsoGroup.add(symbol);
    
    // Číslo na zádech
    const jerseyNumber = customization.jerseyNumber || '10';
    const numberCanvas = document.createElement('canvas');
    numberCanvas.width = 128;
    numberCanvas.height = 128;
    const nctx = numberCanvas.getContext('2d');
    nctx.fillStyle = '#4a90e2';
    nctx.font = 'bold 80px Arial';
    nctx.textAlign = 'center';
    nctx.textBaseline = 'middle';
    nctx.fillText(jerseyNumber.toString(), 64, 64);
    
    const number = new THREE.Mesh(
      new THREE.PlaneGeometry(0.25, 0.25),
      new THREE.MeshBasicMaterial({
        map: new THREE.CanvasTexture(numberCanvas),
        transparent: true
      })
    );
    number.position.set(0, 0.9, -0.21);
    number.rotation.y = Math.PI;
    torsoGroup.add(number);
    
    // Jméno na dresu (pokud je nastavené)
    if (customization.jerseyName) {
      const nameCanvas = document.createElement('canvas');
      nameCanvas.width = 256;
      nameCanvas.height = 64;
      const namectx = nameCanvas.getContext('2d');
      namectx.fillStyle = '#4a90e2';
      namectx.font = 'bold 24px Arial';
      namectx.textAlign = 'center';
      namectx.textBaseline = 'middle';
      namectx.fillText(customization.jerseyName.toUpperCase(), 128, 32);
      
      const nameTag = new THREE.Mesh(
        new THREE.PlaneGeometry(0.5, 0.125),
        new THREE.MeshBasicMaterial({
          map: new THREE.CanvasTexture(nameCanvas),
          transparent: true
        })
      );
      nameTag.position.set(0, 1.15, -0.21);
      nameTag.rotation.y = Math.PI;
      torsoGroup.add(nameTag);
    }
    
    playerGroup.add(torsoGroup);
    
    // HLAVA - realističtější proporce
    console.log('🎯 Creating head with hair style:', customization.hairStyle || 'realistic');
    const headGroup = this.createRealisticHead(skinColor, hairColor, eyeColor, customization.hairStyle || 'realistic');
    headGroup.position.y = 1.5;
    playerGroup.add(headGroup);
    
    // KRK
    const neck = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.1, 0.15, 16, 8),
      new THREE.MeshStandardMaterial({
        color: skinColor,
        roughness: 0.5,
        flatShading: false
      })
    );
    neck.position.y = 1.35;
    playerGroup.add(neck);
    
    // RUCE s realistickými proporcemi
    const leftArm = this.createRealisticArm(-1, jerseyColor, skinColor);
    const rightArm = this.createRealisticArm(1, jerseyColor, skinColor);
    playerGroup.add(leftArm);
    playerGroup.add(rightArm);
    
    // NOHY s realistickými proporcemi
    const leftLeg = this.createRealisticLeg(-1, shortsColor, skinColor);
    const rightLeg = this.createRealisticLeg(1, shortsColor, skinColor);
    playerGroup.add(leftLeg);
    playerGroup.add(rightLeg);
    
    // PONOŽKY s detaily
    playerGroup.add(this.createRealisticSock(-1, socksColor));
    playerGroup.add(this.createRealisticSock(1, socksColor));
    
    // KOPAČKY s detaily
    playerGroup.add(this.createRealisticShoe(-1, shoesColor));
    playerGroup.add(this.createRealisticShoe(1, shoesColor));
    
    // DOPLŇKY
    const accessories = customization.accessories || {};
    
    // Čelenka
    if (accessories.headband) {
      const headband = new THREE.Mesh(
        new THREE.TorusGeometry(0.18, 0.02, 8, 32),
        new THREE.MeshStandardMaterial({ 
          color: jerseyColor,
          roughness: 0.5 
        })
      );
      headband.position.y = 1.55;
      headband.rotation.x = Math.PI / 2;
      playerGroup.add(headband);
    }
    
    // Rukavice
    if (accessories.gloves) {
      for (let side of [-1, 1]) {
        const glove = new THREE.Mesh(
          new THREE.SphereGeometry(0.09, 12, 8),
          new THREE.MeshStandardMaterial({ 
            color: 0x1a1a1a,
            roughness: 0.6 
          })
        );
        glove.position.set(side * 0.35, 0.6, 0);
        glove.scale.set(1, 1.3, 0.9);
        playerGroup.add(glove);
      }
    }
    
    // Potítka
    if (accessories.wristbands) {
      for (let side of [-1, 1]) {
        const wristband = new THREE.Mesh(
          new THREE.CylinderGeometry(0.055, 0.055, 0.08, 12, 4),
          new THREE.MeshStandardMaterial({ 
            color: jerseyColor,
            roughness: 0.5 
          })
        );
        wristband.position.set(side * 0.35, 0.85, 0);
        playerGroup.add(wristband);
      }
    }
    
    // Kapitánská páska
    if (accessories.captain_band) {
      const captainBand = new THREE.Mesh(
        new THREE.CylinderGeometry(0.095, 0.095, 0.08, 16, 4),
        new THREE.MeshStandardMaterial({ 
          color: 0xffd700,
          roughness: 0.3,
          metalness: 0.2
        })
      );
      captainBand.position.set(-0.35, 1.0, 0);
      playerGroup.add(captainBand);
      
      // "C" na pásce
      const cCanvas = document.createElement('canvas');
      cCanvas.width = 64;
      cCanvas.height = 64;
      const cctx = cCanvas.getContext('2d');
      cctx.fillStyle = '#000';
      cctx.font = 'bold 48px Arial';
      cctx.textAlign = 'center';
      cctx.textBaseline = 'middle';
      cctx.fillText('C', 32, 32);
      
      const cSymbol = new THREE.Mesh(
        new THREE.PlaneGeometry(0.06, 0.06),
        new THREE.MeshBasicMaterial({
          map: new THREE.CanvasTexture(cCanvas),
          transparent: true
        })
      );
      cSymbol.position.set(-0.45, 1.0, 0);
      cSymbol.rotation.y = -Math.PI / 2;
      playerGroup.add(cSymbol);
    }
    
    playerGroup.position.set(position.x, position.y, position.z);
    playerGroup.castShadow = true;
    
    // Aplikace výšky a postavy
    playerGroup.scale.set(buildScale, heightScale, buildScale);
    
    scene.add(playerGroup);
    
    return {
      mesh: playerGroup,
      leftArm: leftArm,
      rightArm: rightArm,
      leftLeg: leftLeg,
      rightLeg: rightLeg
    };
  }

  static createRealisticHead(skinColor, hairColor, eyeColor, hairStyle = 'realistic') {
    const headGroup = new THREE.Group();
    
    // Realističtější tvar hlavy
    const headGeometry = new THREE.SphereGeometry(0.18, 32, 24);
    headGeometry.scale(1, 1.15, 0.95);
    const head = new THREE.Mesh(
      headGeometry,
      new THREE.MeshStandardMaterial({
        color: skinColor,
        roughness: 0.5,
        flatShading: false
      })
    );
    head.castShadow = true;
    headGroup.add(head);
    
    // Vlasy podle vybraného stylu
    const hairMaterial = new THREE.MeshStandardMaterial({
      color: hairColor,
      roughness: 0.9,
      metalness: 0.05,
      flatShading: false
    });
    
    console.log('👱 Creating hair style:', hairStyle);
    
    if (hairStyle !== 'bald') {
      console.log('👱 Applying hair style:', hairStyle);
      
      if (hairStyle === 'realistic' || hairStyle === 'short') {
        // Základní vlasová vrstva
        const baseHair = new THREE.Mesh(
          new THREE.SphereGeometry(0.19, 24, 16),
          hairMaterial
        );
        baseHair.position.y = 0.08;
        baseHair.scale.set(1.1, 0.9, 1.05);
        headGroup.add(baseHair);
        
        // Přední vlasy s přirozeným tvarem
        const frontHair = new THREE.Mesh(
          new THREE.SphereGeometry(0.12, 16, 12),
          hairMaterial
        );
        frontHair.position.set(0, 0.12, 0.15);
        frontHair.scale.set(1.4, 0.7, 0.8);
        headGroup.add(frontHair);
        
        // Postranní vlasy
        for (let side of [-1, 1]) {
          const sideHair = new THREE.Mesh(
            new THREE.SphereGeometry(0.1, 16, 12),
            hairMaterial
          );
          sideHair.position.set(side * 0.15, 0.05, 0);
          sideHair.scale.set(0.8, 1.2, 1);
          headGroup.add(sideHair);
        }
      } else if (hairStyle === 'buzz') {
        // Na ježka - velmi krátké vlasy
        const buzzCut = new THREE.Mesh(
          new THREE.SphereGeometry(0.185, 24, 16),
          hairMaterial
        );
        buzzCut.position.y = 0.05;
        buzzCut.scale.set(1.05, 0.85, 1.05);
        headGroup.add(buzzCut);
      } else if (hairStyle === 'mohawk') {
        // Číro
        const mohawkGeometry = new THREE.BoxGeometry(0.08, 0.3, 0.4);
        const mohawk = new THREE.Mesh(mohawkGeometry, hairMaterial);
        mohawk.position.set(0, 0.2, 0);
        headGroup.add(mohawk);
        
        // Boční části vyholené
        for (let side of [-1, 1]) {
          const sideBuzz = new THREE.Mesh(
            new THREE.SphereGeometry(0.08, 12, 8),
            hairMaterial
          );
          sideBuzz.position.set(side * 0.15, 0, 0);
          sideBuzz.scale.set(1, 0.5, 1.2);
          headGroup.add(sideBuzz);
        }
      } else if (hairStyle === 'afro') {
        // Afro
        const afro = new THREE.Mesh(
          new THREE.SphereGeometry(0.28, 24, 16),
          hairMaterial
        );
        afro.position.y = 0.15;
        headGroup.add(afro);
        
        // Dodatečné kudrnaté detaily
        for (let i = 0; i < 12; i++) {
          const curl = new THREE.Mesh(
            new THREE.SphereGeometry(0.08, 8, 6),
            hairMaterial
          );
          const angle = (i / 12) * Math.PI * 2;
          const radius = 0.25;
          curl.position.set(
            Math.cos(angle) * radius,
            0.15 + Math.sin(i * 0.5) * 0.1,
            Math.sin(angle) * radius
          );
          curl.scale.set(0.9, 0.9, 0.9);
          headGroup.add(curl);
        }
      } else if (hairStyle === 'long') {
        // Dlouhé vlasy
        const baseHair = new THREE.Mesh(
          new THREE.SphereGeometry(0.2, 24, 16),
          hairMaterial
        );
        baseHair.position.y = 0.08;
        baseHair.scale.set(1.2, 1.4, 1.1);
        headGroup.add(baseHair);
        
        // Zadní část dlouhých vlasů
        const backHair = new THREE.Mesh(
          new THREE.CylinderGeometry(0.15, 0.18, 0.4, 16, 8),
          hairMaterial
        );
        backHair.position.set(0, -0.1, -0.1);
        headGroup.add(backHair);
      } else if (hairStyle === 'spiky') {
        // Ostré špičky
        for (let i = 0; i < 12; i++) {
          const spike = new THREE.Mesh(
            new THREE.ConeGeometry(0.03, 0.1, 8),
            hairMaterial
          );
          const angle = (i / 12) * Math.PI * 2;
          spike.position.set(
            Math.cos(angle) * 0.12,
            0.18,
            Math.sin(angle) * 0.12
          );
          spike.rotation.z = -angle;
          spike.rotation.x = 0.3;
          headGroup.add(spike);
        }
        
        // Základní vlasová vrstva pod špičkami
        const baseSpiky = new THREE.Mesh(
          new THREE.SphereGeometry(0.17, 16, 12),
          hairMaterial
        );
        baseSpiky.position.y = 0.05;
        baseSpiky.scale.set(1.1, 0.7, 1.1);
        headGroup.add(baseSpiky);
      } else if (hairStyle === 'ponytail') {
        // Culík
        const baseHair = new THREE.Mesh(
          new THREE.SphereGeometry(0.18, 24, 16),
          hairMaterial
        );
        baseHair.position.y = 0.08;
        baseHair.scale.set(1.1, 0.9, 1.05);
        headGroup.add(baseHair);
        
        // Culík vzadu
        const ponytailBase = new THREE.Mesh(
          new THREE.SphereGeometry(0.08, 12, 8),
          hairMaterial
        );
        ponytailBase.position.set(0, 0.05, -0.15);
        headGroup.add(ponytailBase);
        
        const ponytailTail = new THREE.Mesh(
          new THREE.CylinderGeometry(0.04, 0.06, 0.25, 12, 6),
          hairMaterial
        );
        ponytailTail.position.set(0, -0.05, -0.18);
        ponytailTail.rotation.x = -0.3;
        headGroup.add(ponytailTail);
      } else if (hairStyle === 'dreadlocks') {
        // Dredy
        const dreadCount = 20;
        for (let i = 0; i < dreadCount; i++) {
          const dread = new THREE.Mesh(
            new THREE.CylinderGeometry(0.015, 0.02, 0.2 + Math.random() * 0.1, 8, 4),
            hairMaterial
          );
          const angle = (i / dreadCount) * Math.PI * 2;
          const radius = 0.12 + (i % 2) * 0.03;
          dread.position.set(
            Math.cos(angle) * radius,
            0.1,
            Math.sin(angle) * radius
          );
          dread.rotation.z = (Math.random() - 0.5) * 0.3;
          dread.rotation.x = (Math.random() - 0.5) * 0.3;
          headGroup.add(dread);
        }
      } else if (hairStyle === 'manbun') {
        // Drdol
        const baseHair = new THREE.Mesh(
          new THREE.SphereGeometry(0.18, 24, 16),
          hairMaterial
        );
        baseHair.position.y = 0.06;
        baseHair.scale.set(1.1, 0.8, 1.05);
        headGroup.add(baseHair);
        
        // Drdol nahoře
        const bun = new THREE.Mesh(
          new THREE.SphereGeometry(0.08, 16, 12),
          hairMaterial
        );
        bun.position.set(0, 0.22, -0.05);
        bun.scale.set(1.2, 1, 1.2);
        headGroup.add(bun);
        
        // Detail drdolu
        const bunDetail = new THREE.Mesh(
          new THREE.TorusGeometry(0.06, 0.02, 8, 16),
          hairMaterial
        );
        bunDetail.position.set(0, 0.22, -0.05);
        bunDetail.rotation.x = Math.PI / 2;
        headGroup.add(bunDetail);
      } else if (hairStyle === 'undercut') {
        // Podholení
        const topHair = new THREE.Mesh(
          new THREE.SphereGeometry(0.18, 24, 16),
          hairMaterial
        );
        topHair.position.y = 0.12;
        topHair.scale.set(1.2, 0.8, 1.1);
        headGroup.add(topHair);
        
        // Boční části velmi krátké
        for (let side of [-1, 1]) {
          const sideUndercut = new THREE.Mesh(
            new THREE.SphereGeometry(0.1, 12, 8),
            hairMaterial
          );
          sideUndercut.position.set(side * 0.14, -0.02, 0);
          sideUndercut.scale.set(0.8, 0.4, 1.2);
          headGroup.add(sideUndercut);
        }
        
        // Přední část stylovaná nahoru
        const frontSwept = new THREE.Mesh(
          new THREE.SphereGeometry(0.1, 16, 12),
          hairMaterial
        );
        frontSwept.position.set(0, 0.15, 0.12);
        frontSwept.scale.set(1.2, 0.9, 0.8);
        frontSwept.rotation.x = -0.3;
        headGroup.add(frontSwept);
      } else {
        // Fallback pro neznámý účes - použij realistic
        console.warn('⚠️ Unknown hair style:', hairStyle, '- using realistic');
        
        // Základní vlasová vrstva
        const baseHair = new THREE.Mesh(
          new THREE.SphereGeometry(0.19, 24, 16),
          hairMaterial
        );
        baseHair.position.y = 0.08;
        baseHair.scale.set(1.1, 0.9, 1.05);
        headGroup.add(baseHair);
      }
    } else {
      console.log('👨‍🦲 Bald style selected - no hair');
    }
    
    // Realističtější oči
    const eyeWhiteGeometry = new THREE.SphereGeometry(0.04, 24, 16);
    const eyeWhiteMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xf5f5f5,
      roughness: 0.3
    });
    
    for (let side of [-1, 1]) {
      const eyeSocket = new THREE.Mesh(
        new THREE.SphereGeometry(0.05, 16, 12),
        new THREE.MeshStandardMaterial({ color: skinColor })
      );
      eyeSocket.position.set(side * 0.06, 0.02, 0.14);
      eyeSocket.scale.set(1.2, 0.8, 0.6);
      headGroup.add(eyeSocket);
      
      const eyeWhite = new THREE.Mesh(eyeWhiteGeometry, eyeWhiteMaterial);
      eyeWhite.position.set(side * 0.06, 0.02, 0.16);
      eyeWhite.scale.set(1, 0.9, 0.7);
      headGroup.add(eyeWhite);
      
      // Duhovka
      const iris = new THREE.Mesh(
        new THREE.SphereGeometry(0.025, 16, 12),
        new THREE.MeshStandardMaterial({ 
          color: eyeColor,
          roughness: 0.2,
          metalness: 0.1
        })
      );
      iris.position.set(side * 0.06, 0.02, 0.17);
      iris.scale.set(1, 1, 0.5);
      headGroup.add(iris);
      
      // Zornice
      const pupil = new THREE.Mesh(
        new THREE.SphereGeometry(0.012, 12, 8),
        new THREE.MeshBasicMaterial({ color: 0x000000 })
      );
      pupil.position.set(side * 0.06, 0.02, 0.175);
      headGroup.add(pupil);
      
      // Odlesk v oku
      const eyeHighlight = new THREE.Mesh(
        new THREE.SphereGeometry(0.005, 8, 6),
        new THREE.MeshBasicMaterial({ color: 0xffffff })
      );
      eyeHighlight.position.set(side * 0.065, 0.03, 0.18);
      headGroup.add(eyeHighlight);
      
      // Obočí
      const eyebrow = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 0.01, 0.02),
        new THREE.MeshStandardMaterial({ color: hairColor })
      );
      eyebrow.position.set(side * 0.06, 0.1, 0.16);
      eyebrow.rotation.z = side * 0.1;
      headGroup.add(eyebrow);
    }
    
    // Realističtější nos
    const noseGeometry = new THREE.BufferGeometry();
    const noseShape = new THREE.Shape();
    noseShape.moveTo(0, 0);
    noseShape.lineTo(-0.015, -0.02);
    noseShape.lineTo(0, -0.03);
    noseShape.lineTo(0.015, -0.02);
    noseShape.closePath();
    
    const nose = new THREE.Mesh(
      new THREE.ExtrudeGeometry(noseShape, {
        depth: 0.025,
        bevelEnabled: true,
        bevelThickness: 0.005,
        bevelSize: 0.005,
        bevelSegments: 8
      }),
      new THREE.MeshStandardMaterial({
        color: skinColor,
        roughness: 0.5
      })
    );
    nose.position.set(0, -0.01, 0.16);
    nose.rotation.x = -0.3;
    headGroup.add(nose);
    
    // Ústa s realistickými rty
    const mouthGroup = new THREE.Group();
    
    // Horní ret
    const upperLip = new THREE.Mesh(
      new THREE.TorusGeometry(0.04, 0.008, 8, 16, Math.PI),
      new THREE.MeshStandardMaterial({ 
        color: 0xd4886a,
        roughness: 0.4
      })
    );
    upperLip.position.set(0, -0.06, 0.16);
    upperLip.rotation.z = Math.PI;
    upperLip.scale.set(1, 0.8, 1);
    mouthGroup.add(upperLip);
    
    // Dolní ret
    const lowerLip = new THREE.Mesh(
      new THREE.TorusGeometry(0.035, 0.01, 8, 16, Math.PI),
      new THREE.MeshStandardMaterial({ 
        color: 0xd4886a,
        roughness: 0.4
      })
    );
    lowerLip.position.set(0, -0.075, 0.16);
    mouthGroup.add(lowerLip);
    
    headGroup.add(mouthGroup);
    
    // Uši
    for (let side of [-1, 1]) {
      const ear = new THREE.Mesh(
        new THREE.SphereGeometry(0.04, 12, 8),
        new THREE.MeshStandardMaterial({ 
          color: skinColor,
          roughness: 0.5
        })
      );
      ear.position.set(side * 0.18, 0, 0);
      ear.scale.set(0.8, 1.2, 0.6);
      ear.rotation.y = side * 0.3;
      headGroup.add(ear);
    }
    
    return headGroup;
  }

  static createRealisticArm(side, jerseyColor, skinColor) {
    const armGroup = new THREE.Group();
    
    // Rameno s anatomickými detaily
    const shoulder = new THREE.Mesh(
      new THREE.SphereGeometry(0.11, 16, 12),
      new THREE.MeshPhongMaterial({
        color: jerseyColor,
        shininess: 20,
        flatShading: false
      })
    );
    armGroup.add(shoulder);
    
    // Horní část paže (biceps)
    const upperArm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.09, 0.25, 16, 8),
      new THREE.MeshPhongMaterial({
        color: jerseyColor,
        shininess: 20,
        flatShading: false
      })
    );
    upperArm.position.y = -0.125;
    armGroup.add(upperArm);
    
    // Loket
    const elbow = new THREE.Mesh(
      new THREE.SphereGeometry(0.05, 12, 8),
      new THREE.MeshPhongMaterial({
        color: skinColor,
        shininess: 10
      })
    );
    elbow.position.y = -0.25;
    armGroup.add(elbow);
    
    // Předloktí
    const forearm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.07, 0.25, 16, 8),
      new THREE.MeshPhongMaterial({
        color: skinColor,
        shininess: 10,
        flatShading: false
      })
    );
    forearm.position.y = -0.375;
    armGroup.add(forearm);
    
    // Zápěstí
    const wrist = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.05, 0.05, 12, 4),
      new THREE.MeshPhongMaterial({
        color: skinColor,
        shininess: 10
      })
    );
    wrist.position.y = -0.5;
    armGroup.add(wrist);
    
    // Ruka s prsty
    const handGroup = new THREE.Group();
    
    // Dlaň
    const palm = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.1, 0.03),
      new THREE.MeshPhongMaterial({
        color: skinColor,
        shininess: 10
      })
    );
    palm.position.y = -0.05;
    handGroup.add(palm);
    
    // Zjednodušené prsty
    for (let i = 0; i < 4; i++) {
      const finger = new THREE.Mesh(
        new THREE.CylinderGeometry(0.008, 0.01, 0.06, 8, 4),
        new THREE.MeshPhongMaterial({
          color: skinColor,
          shininess: 10
        })
      );
      finger.position.set((i - 1.5) * 0.018, -0.13, 0);
      finger.rotation.z = (i - 1.5) * 0.05;
      handGroup.add(finger);
    }
    
    // Palec
    const thumb = new THREE.Mesh(
      new THREE.CylinderGeometry(0.01, 0.012, 0.04, 8, 4),
      new THREE.MeshPhongMaterial({
        color: skinColor,
        shininess: 10
      })
    );
    thumb.position.set(side * 0.04, -0.08, 0.01);
    thumb.rotation.z = side * 0.6;
    handGroup.add(thumb);
    
    handGroup.position.y = -0.5;
    armGroup.add(handGroup);
    
    armGroup.position.set(side * 0.35, 1.1, 0);
    armGroup.rotation.z = side * 0.2;
    armGroup.castShadow = true;
    
    return armGroup;
  }

  static createRealisticLeg(side, shortsColor, skinColor) {
    const legGroup = new THREE.Group();
    
    // Stehno s anatomickými detaily
    const thighGeometry = new THREE.CylinderGeometry(0.13, 0.11, 0.35, 16, 8);
    const thigh = new THREE.Mesh(
      thighGeometry,
      new THREE.MeshPhongMaterial({
        color: shortsColor,
        shininess: 20,
        flatShading: false
      })
    );
    thigh.position.y = -0.175;
    legGroup.add(thigh);
    
    // Koleno
    const knee = new THREE.Mesh(
      new THREE.SphereGeometry(0.06, 12, 8),
      new THREE.MeshPhongMaterial({
        color: skinColor,
        shininess: 10
      })
    );
    knee.position.y = -0.35;
    knee.scale.set(1, 0.8, 1);
    legGroup.add(knee);
    
    // Lýtko s anatomickým tvarem
    const calfGeometry = new THREE.CylinderGeometry(0.08, 0.06, 0.35, 16, 8);
    const calf = new THREE.Mesh(
      calfGeometry,
      new THREE.MeshPhongMaterial({
        color: skinColor,
        shininess: 10,
        flatShading: false
      })
    );
    calf.position.y = -0.525;
    legGroup.add(calf);
    
    // Kotník
    const ankle = new THREE.Mesh(
      new THREE.SphereGeometry(0.055, 12, 8),
      new THREE.MeshPhongMaterial({
        color: skinColor,
        shininess: 10
      })
    );
    ankle.position.y = -0.7;
    ankle.scale.set(1, 0.8, 1);
    legGroup.add(ankle);
    
    legGroup.position.set(side * 0.15, 0.5, 0);
    legGroup.castShadow = true;
    
    return legGroup;
  }

  static createRealisticSock(side, socksColor) {
    const sockGroup = new THREE.Group();
    
    // Hlavní část ponožky
    const sock = new THREE.Mesh(
      new THREE.CylinderGeometry(0.065, 0.075, 0.2, 16, 8),
      new THREE.MeshStandardMaterial({
        color: socksColor,
        roughness: 0.6,
        flatShading: false
      })
    );
    sock.position.y = 0;
    sockGroup.add(sock);
    
    // Bílé pruhy na ponožce
    for (let i = 0; i < 2; i++) {
      const stripe = new THREE.Mesh(
        new THREE.TorusGeometry(0.072, 0.003, 4, 16),
        new THREE.MeshBasicMaterial({ color: 0xffffff })
      );
      stripe.position.y = 0.06 - i * 0.05;
      stripe.rotation.x = Math.PI / 2;
      sockGroup.add(stripe);
    }
    
    sockGroup.position.set(side * 0.15, -0.3, 0);
    sockGroup.castShadow = true;
    return sockGroup;
  }

  static createRealisticShoe(side, shoesColor) {
    const shoeGroup = new THREE.Group();
    
    // Podrážka
    const soleGeometry = new THREE.BoxGeometry(0.12, 0.02, 0.28);
    const sole = new THREE.Mesh(
      soleGeometry,
      new THREE.MeshStandardMaterial({
        color: 0x333333,
        roughness: 0.8,
        metalness: 0.1
      })
    );
    sole.position.set(0, -0.01, 0.03);
    shoeGroup.add(sole);
    
    // Hlavní část boty s realističtějším tvarem
    const shoeBody = new THREE.Group();
    
    // Zadní část
    const heel = new THREE.Mesh(
      new THREE.SphereGeometry(0.08, 16, 12),
      new THREE.MeshStandardMaterial({
        color: shoesColor,
        roughness: 0.3,
        metalness: 0.1
      })
    );
    heel.position.set(0, 0.04, -0.08);
    heel.scale.set(0.8, 1, 1.2);
    shoeBody.add(heel);
    
    // Střední část
    const middle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.065, 0.07, 0.15, 16, 8),
      new THREE.MeshStandardMaterial({
        color: shoesColor,
        roughness: 0.3,
        metalness: 0.1
      })
    );
    middle.rotation.z = Math.PI / 2;
    middle.position.set(0, 0.04, 0.02);
    shoeBody.add(middle);
    
    // Přední část (špička)
    const toeCap = new THREE.Mesh(
      new THREE.SphereGeometry(0.08, 16, 12),
      new THREE.MeshStandardMaterial({
        color: shoesColor,
        roughness: 0.3,
        metalness: 0.1
      })
    );
    toeCap.position.set(0, 0.03, 0.12);
    toeCap.scale.set(0.9, 0.8, 1.4);
    shoeBody.add(toeCap);
    
    // Logo značky (tři pruhy)
    for (let i = 0; i < 3; i++) {
      const stripe = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 0.003, 0.02),
        new THREE.MeshBasicMaterial({ color: 0xffffff })
      );
      stripe.position.set(side * 0.055, 0.05 - i * 0.015, 0.02);
      stripe.rotation.y = side * 0.3;
      shoeBody.add(stripe);
    }
    
    // Tkaničky
    const laceHoles = 6;
    for (let i = 0; i < laceHoles; i++) {
      // Očka na tkaničky
      const eyelet = new THREE.Mesh(
        new THREE.RingGeometry(0.003, 0.005, 8),
        new THREE.MeshBasicMaterial({ color: 0x666666 })
      );
      eyelet.position.set(
        side * (0.02 + (i % 2) * 0.02), 
        0.08, 
        -0.05 + i * 0.025
      );
      eyelet.rotation.y = side * Math.PI / 2;
      shoeBody.add(eyelet);
    }
    
    // Samotná tkanička
    const laceGeometry = new THREE.CylinderGeometry(0.003, 0.003, 0.2, 8);
    const lace = new THREE.Mesh(
      laceGeometry,
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    lace.position.set(0, 0.08, 0);
    lace.rotation.z = Math.PI / 2;
    shoeBody.add(lace);
    
    shoeGroup.add(shoeBody);
    
    shoeGroup.position.set(side * 0.15, -0.45, 0.05);
    shoeGroup.rotation.y = side * 0.05;
    shoeGroup.castShadow = true;
    
    return shoeGroup;
  }
}