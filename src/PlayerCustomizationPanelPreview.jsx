// src/PlayerCustomizationPanelPreview.jsx - OPRAVA PRO JEDNOHO HRÁČE
import React, { useEffect, useRef } from 'react';
import { playerDataManager } from './PlayerDataManager.js';
import { THREE } from './three.js';
import { PlayerAppearance } from './PlayerAppearance.js';

export const PlayerCustomizationPanelPreview = ({ 
  isOpen, 
  customization, 
  profile, 
  setProfile, 
  playerRatings, 
  trainingPoints 
}) => {
  // 3D Preview refs
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const playerMeshRef = useRef(null);
  const animationIdRef = useRef(null);

  // Setup 3D preview scene
  useEffect(() => {
    if (!isOpen || !mountRef.current) return;

    console.log('🎮 Setting up 3D preview scene');

    // Create scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x2a2a2a);
    sceneRef.current = scene;

    // Create camera
    const camera = new THREE.PerspectiveCamera(
      50,
      250 / 350,
      0.1,
      1000
    );
    camera.position.set(0, 2, 5);
    camera.lookAt(0, 1.5, 0);
    cameraRef.current = camera;

    // Create renderer
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true 
    });
    renderer.setSize(250, 350);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    // Add renderer to DOM
    mountRef.current.appendChild(renderer.domElement);

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Add a simple ground
    const groundGeometry = new THREE.CircleGeometry(3, 32);
    const groundMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x1a1a1a,
      roughness: 0.8
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.8;
    ground.receiveShadow = true;
    scene.add(ground);

    // 🔥 HLAVNÍ OPRAVA: Vytvoř POUZE preview hráče, ne klonovat herního
    createPreviewPlayer();

    // Start animation loop
    let rotation = 0;
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      
      // Auto-rotate preview player
      if (playerMeshRef.current) {
        rotation += 0.01;
        playerMeshRef.current.rotation.y = rotation;
      }
      
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      console.log('🧹 Cleaning up preview scene');
      
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      
      // Dispose of preview player
      if (playerMeshRef.current) {
        scene.remove(playerMeshRef.current);
        // Dispose all geometries and materials
        playerMeshRef.current.traverse((child) => {
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
        playerMeshRef.current = null;
      }
      
      renderer.dispose();
    };
  }, [isOpen]);

  // Update preview when customization changes
  useEffect(() => {
    if (isOpen && sceneRef.current && playerMeshRef.current) {
      console.log('🎨 Updating preview player with new customization');
      updatePreviewPlayer();
    }
  }, [customization, isOpen]);

  const createPreviewPlayer = () => {
    if (!sceneRef.current) return;

    console.log('🎭 Creating preview player');

    // Remove old preview player if exists
    if (playerMeshRef.current) {
      sceneRef.current.remove(playerMeshRef.current);
      playerMeshRef.current.traverse((child) => {
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

    // Create new preview player with current customization
    const playerData = PlayerAppearance.createPlayer(
      sceneRef.current, 
      { x: 0, y: 0, z: 0 }, 
      customization // Použij React state customization
    );
    
    if (playerData.mesh) {
      playerData.mesh.scale.set(1.2, 1.2, 1.2);
      playerData.mesh.position.y = -0.8;
      playerMeshRef.current = playerData.mesh;
      console.log('✅ Preview player created successfully');
    }
  };

  const updatePreviewPlayer = () => {
    if (!sceneRef.current || !playerMeshRef.current) return;

    console.log('🔄 Updating preview player appearance');

    // Zachovej rotaci
    const currentRotation = playerMeshRef.current.rotation.y;

    // Odstraň starého hráče
    sceneRef.current.remove(playerMeshRef.current);
    playerMeshRef.current.traverse((child) => {
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

    // Vytvoř nového s aktuální customizací
    const playerData = PlayerAppearance.createPlayer(
      sceneRef.current, 
      { x: 0, y: 0, z: 0 }, 
      customization
    );
    
    if (playerData.mesh) {
      playerData.mesh.scale.set(1.2, 1.2, 1.2);
      playerData.mesh.position.y = -0.8;
      playerData.mesh.rotation.y = currentRotation; // Obnov rotaci
      playerMeshRef.current = playerData.mesh;
      
      // 🔥 DŮLEŽITÉ: Okamžitě aktualizuj herního hráče
      if (window.playerRef?.current?.refreshAppearance) {
        // Nejdřív aktualizuj PlayerDataManager
        playerDataManager.playerCustomization = { ...customization };
        // Pak refresh herního hráče
        window.playerRef.current.refreshAppearance();
        console.log('🔄 Game player synced with preview changes');
      }
    }
  };

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.05)',
      borderRadius: '15px',
      padding: '20px',
      textAlign: 'center'
    }}>
      <h3 style={{ color: '#fff', marginBottom: '15px' }}>Náhled</h3>
      <div 
        ref={mountRef}
        style={{
          width: '250px',
          height: '350px',
          background: 'rgba(0, 0, 0, 0.3)',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}
      />
      
      {/* Player name */}
      <input
        type="text"
        value={profile.displayName}
        onChange={(e) => setProfile({...profile, displayName: e.target.value})}
        placeholder="Jméno hráče"
        style={{
          width: '100%',
          padding: '10px',
          marginTop: '15px',
          background: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '8px',
          color: '#fff',
          fontSize: '16px',
          textAlign: 'center'
        }}
      />

      {/* Player stats display */}
      <div style={{
        marginTop: '15px',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '10px'
      }}>
        <div style={{
          padding: '8px',
          background: 'rgba(255, 215, 0, 0.1)',
          borderRadius: '8px',
          border: '1px solid rgba(255, 215, 0, 0.3)'
        }}>
          <div style={{ color: '#FFD700', fontSize: '12px' }}>Overall</div>
          <div style={{ color: '#fff', fontSize: '20px', fontWeight: 'bold' }}>
            {playerRatings.overall}
          </div>
        </div>
        <div style={{
          padding: '8px',
          background: 'rgba(76, 175, 80, 0.1)',
          borderRadius: '8px',
          border: '1px solid rgba(76, 175, 80, 0.3)'
        }}>
          <div style={{ color: '#4CAF50', fontSize: '12px' }}>Position</div>
          <div style={{ color: '#fff', fontSize: '20px', fontWeight: 'bold' }}>
            {playerRatings.position}
          </div>
        </div>
      </div>

      {/* Coins and training points display */}
      <div style={{
        marginTop: '15px',
        padding: '10px',
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '8px',
        fontSize: '14px'
      }}>
        <div style={{ color: '#FFD700', marginBottom: '5px' }}>
          🪙 {playerDataManager.coins.toLocaleString()} mincí
        </div>
        <div style={{ color: '#4CAF50' }}>
          🏋️ {trainingPoints} tréningových bodů
        </div>
      </div>

      {/* Info text */}
      <div style={{
        marginTop: '10px',
        fontSize: '11px',
        color: '#888',
        fontStyle: 'italic'
      }}>
        💡 Tip: Změny se projeví okamžitě na tvém herním hráči!
      </div>
    </div>
  );
};