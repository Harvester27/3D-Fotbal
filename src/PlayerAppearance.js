// src/PlayerAppearance.js
import { THREE } from './three.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export class PlayerAppearance {
  static createPlayer(scene, position, customizationOverride = null) {
    const playerGroup = new THREE.Group();
    const loader = new GLTFLoader();

    const customization = customizationOverride || window.playerDataManager?.playerCustomization || {};

    const skinColor = customization.skinColor || 0xf4c2a1;
    const hairColor = customization.hairColor || 0x1a0f08;
    const eyeColor = customization.eyeColor || 0x3d2817;
    const jerseyColor = customization.jerseyColor || 0xfafafa;
    const shortsColor = customization.shortsColor || 0xe8e8e8;
    const socksColor = customization.socksColor || 0x4a90e2;
    const shoesColor = customization.shoesColor || 0x0a0a0a;

    loader.load('/models/player.gltf', (gltf) => {
      const model = gltf.scene;
      model.traverse((child) => {
        if (child.isMesh && child.material) {
          const name = child.material.name;
          if (name === 'Skin') child.material.color.setHex(skinColor);
          else if (name === 'Hair') child.material.color.setHex(hairColor);
          else if (name === 'Eyes') child.material.color.setHex(eyeColor);
          else if (name === 'Jersey') child.material.color.setHex(jerseyColor);
          else if (name === 'Shorts') child.material.color.setHex(shortsColor);
          else if (name === 'Socks') child.material.color.setHex(socksColor);
          else if (name === 'Shoes') child.material.color.setHex(shoesColor);
        }
      });

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
      model.add(symbol);

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
      model.add(number);

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
        model.add(nameTag);
      }

      playerGroup.add(model);
    });

    playerGroup.position.copy(position);
    scene.add(playerGroup);
    return playerGroup;
  }
}
