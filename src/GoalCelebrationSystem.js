/**
 * GoalCelebrationSystem.js
 * 🎆 Spektakulární systém oslav gólů s ohňostroji a efekty!
 *
 * Tento systém vytváří úžasné vizuální efekty když hráč vstřelí gól:
 * - Ohňostroje a confetti
 * - Camera shake
 * - Slow motion okamžik
 * - Různé úrovně oslav podle kvality gólu
 */

import * as THREE from 'three';

class GoalCelebrationSystem {
  constructor(scene, camera) {
    this.scene = scene;
    this.camera = camera;
    this.particles = [];
    this.fireworks = [];
    this.isActive = false;
    this.celebrationLevel = 1; // 1-3 (normal, great, amazing)
    this.cameraShakeIntensity = 0;
    this.originalCameraPosition = new THREE.Vector3();
    this.timeScale = 1.0; // Pro slow motion efekt

    // Konfigurace barev pro různé efekty
    this.colors = {
      fireworks: [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff, 0xffffff],
      confetti: [0xff0066, 0x00ff66, 0x6600ff, 0xffaa00, 0x00aaff, 0xff0099],
      golden: 0xffd700
    };
  }

  /**
   * Spustí oslavy gólu
   * @param {THREE.Vector3} goalPosition - Pozice kde byl gól vstřelen
   * @param {number} shotPower - Síla střely (0-100)
   * @param {number} distance - Vzdálenost od branky
   * @param {boolean} isWinningGoal - Je to vítězný gól?
   */
  celebrate(goalPosition, shotPower = 50, distance = 5, isWinningGoal = false) {
    console.log('🎆 GOAL CELEBRATION ACTIVATED! 🎆');

    // Určit úroveň oslavy podle kvality gólu
    this.celebrationLevel = this.calculateCelebrationLevel(shotPower, distance, isWinningGoal);

    this.isActive = true;
    this.originalCameraPosition.copy(this.camera.position);

    // Spustit různé efekty podle úrovně
    this.launchFireworks(goalPosition);
    this.launchConfetti(goalPosition);

    if (this.celebrationLevel >= 2) {
      this.createExplosionRing(goalPosition);
    }

    if (this.celebrationLevel >= 3 || isWinningGoal) {
      this.createGoldenRain(goalPosition);
      console.log('✨ ZLATÝ GÓL! EXTRA OSLAVY! ✨');
    }

    // Camera shake
    this.cameraShakeIntensity = this.celebrationLevel * 0.3;

    // Slow motion efekt
    this.startSlowMotion();

    // Automaticky ukončit oslavy po 3 sekundách
    setTimeout(() => {
      this.endCelebration();
    }, 3000);
  }

  /**
   * Vypočítá úroveň oslavy (1-3) podle kvality gólu
   */
  calculateCelebrationLevel(shotPower, distance, isWinningGoal) {
    if (isWinningGoal) return 3;

    let score = 0;

    // Hodnocení podle síly střely
    if (shotPower > 80) score += 2;
    else if (shotPower > 60) score += 1;

    // Hodnocení podle vzdálenosti
    if (distance > 15) score += 2; // Gól z velké vzdálenosti
    else if (distance > 10) score += 1;

    // Určit úroveň
    if (score >= 3) return 3; // Amazing!
    if (score >= 2) return 2; // Great!
    return 1; // Normal
  }

  /**
   * Vytvoří ohňostroje
   */
  launchFireworks(position) {
    const fireworkCount = this.celebrationLevel * 3;

    for (let i = 0; i < fireworkCount; i++) {
      setTimeout(() => {
        this.createFirework(position, i * 0.5);
      }, i * 200);
    }
  }

  /**
   * Vytvoří jednotlivý ohňostroj
   */
  createFirework(basePosition, spread) {
    const geometry = new THREE.BufferGeometry();
    const particleCount = 100;
    const positions = new Float32Array(particleCount * 3);
    const velocities = [];
    const colors = new Float32Array(particleCount * 3);

    // Random barva z palety
    const color = new THREE.Color(this.colors.fireworks[Math.floor(Math.random() * this.colors.fireworks.length)]);

    // Startovní pozice (vysoko nad brankou)
    const startPos = new THREE.Vector3(
      basePosition.x + (Math.random() - 0.5) * spread * 4,
      basePosition.y + 5 + Math.random() * 3,
      basePosition.z + (Math.random() - 0.5) * spread * 4
    );

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;

      // Všechny částice začínají na stejné pozici
      positions[i3] = startPos.x;
      positions[i3 + 1] = startPos.y;
      positions[i3 + 2] = startPos.z;

      // Random rychlost pro explozi
      const velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 0.3,
        (Math.random() - 0.5) * 0.3,
        (Math.random() - 0.5) * 0.3
      );
      velocities.push(velocity);

      // Barva
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.15,
      vertexColors: true,
      transparent: true,
      opacity: 1.0,
      blending: THREE.AdditiveBlending
    });

    const points = new THREE.Points(geometry, material);
    this.scene.add(points);

    this.fireworks.push({
      mesh: points,
      velocities: velocities,
      lifetime: 0,
      maxLifetime: 1.5
    });
  }

  /**
   * Vytvoří padající confetti
   */
  launchConfetti(position) {
    const geometry = new THREE.BufferGeometry();
    const particleCount = 200 * this.celebrationLevel;
    const positions = new Float32Array(particleCount * 3);
    const velocities = [];
    const colors = new Float32Array(particleCount * 3);
    const rotations = [];

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;

      // Startovní pozice nad brankou
      positions[i3] = position.x + (Math.random() - 0.5) * 10;
      positions[i3 + 1] = position.y + 8 + Math.random() * 5;
      positions[i3 + 2] = position.z + (Math.random() - 0.5) * 10;

      // Rychlost (padání dolů s mírným rozptylem)
      const velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 0.05,
        -0.05 - Math.random() * 0.05,
        (Math.random() - 0.5) * 0.05
      );
      velocities.push(velocity);

      // Random rotace
      rotations.push(Math.random() * Math.PI * 2);

      // Random barva z palety
      const color = new THREE.Color(this.colors.confetti[Math.floor(Math.random() * this.colors.confetti.length)]);
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.2,
      vertexColors: true,
      transparent: true,
      opacity: 1.0
    });

    const points = new THREE.Points(geometry, material);
    this.scene.add(points);

    this.particles.push({
      mesh: points,
      velocities: velocities,
      rotations: rotations,
      lifetime: 0,
      maxLifetime: 3.0
    });
  }

  /**
   * Vytvoří explozní kruh (pro velké góly)
   */
  createExplosionRing(position) {
    const geometry = new THREE.RingGeometry(0.1, 0.2, 32);
    const material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 1.0
    });

    const ring = new THREE.Mesh(geometry, material);
    ring.position.copy(position);
    ring.rotation.x = Math.PI / 2;
    this.scene.add(ring);

    // Animovat expansion a fade
    let scale = 1;
    const expandInterval = setInterval(() => {
      scale += 0.5;
      ring.scale.set(scale, scale, 1);
      material.opacity -= 0.05;

      if (material.opacity <= 0) {
        clearInterval(expandInterval);
        this.scene.remove(ring);
        geometry.dispose();
        material.dispose();
      }
    }, 50);
  }

  /**
   * Vytvoří zlatý déšť (pro extra speciální góly)
   */
  createGoldenRain(position) {
    const geometry = new THREE.BufferGeometry();
    const particleCount = 300;
    const positions = new Float32Array(particleCount * 3);
    const velocities = [];

    const goldenColor = new THREE.Color(this.colors.golden);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;

      // Startovní pozice vysoko nad brankou v širokém poli
      positions[i3] = position.x + (Math.random() - 0.5) * 20;
      positions[i3 + 1] = position.y + 12 + Math.random() * 8;
      positions[i3 + 2] = position.z + (Math.random() - 0.5) * 20;

      // Rychlost (víceméně přímý pád)
      const velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 0.02,
        -0.08 - Math.random() * 0.04,
        (Math.random() - 0.5) * 0.02
      );
      velocities.push(velocity);

      // Zlatá barva
      colors[i3] = goldenColor.r;
      colors[i3 + 1] = goldenColor.g;
      colors[i3 + 2] = goldenColor.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.25,
      vertexColors: true,
      transparent: true,
      opacity: 1.0,
      blending: THREE.AdditiveBlending
    });

    const points = new THREE.Points(geometry, material);
    this.scene.add(points);

    this.particles.push({
      mesh: points,
      velocities: velocities,
      lifetime: 0,
      maxLifetime: 4.0
    });
  }

  /**
   * Spustí slow motion efekt
   */
  startSlowMotion() {
    this.timeScale = 0.3; // Zpomalení na 30%

    // Po 1 sekundě vrátit normální rychlost
    setTimeout(() => {
      this.timeScale = 1.0;
    }, 1000);
  }

  /**
   * Ukončí oslavy
   */
  endCelebration() {
    this.isActive = false;
    this.cameraShakeIntensity = 0;
    console.log('🎆 Oslavy ukončeny! 🎆');
  }

  /**
   * Update loop - volat každý frame
   */
  update(deltaTime) {
    if (!this.isActive && this.particles.length === 0 && this.fireworks.length === 0) {
      return;
    }

    const dt = deltaTime * this.timeScale;

    // Update camera shake
    if (this.cameraShakeIntensity > 0) {
      this.camera.position.x = this.originalCameraPosition.x + (Math.random() - 0.5) * this.cameraShakeIntensity;
      this.camera.position.y = this.originalCameraPosition.y + (Math.random() - 0.5) * this.cameraShakeIntensity;
      this.camera.position.z = this.originalCameraPosition.z + (Math.random() - 0.5) * this.cameraShakeIntensity;

      // Postupně snižovat intenzitu
      this.cameraShakeIntensity *= 0.95;

      if (this.cameraShakeIntensity < 0.01) {
        this.cameraShakeIntensity = 0;
        this.camera.position.copy(this.originalCameraPosition);
      }
    }

    // Update fireworks
    for (let i = this.fireworks.length - 1; i >= 0; i--) {
      const firework = this.fireworks[i];
      firework.lifetime += dt;

      if (firework.lifetime >= firework.maxLifetime) {
        // Remove firework
        this.scene.remove(firework.mesh);
        firework.mesh.geometry.dispose();
        firework.mesh.material.dispose();
        this.fireworks.splice(i, 1);
        continue;
      }

      // Update positions
      const positions = firework.mesh.geometry.attributes.position.array;
      for (let j = 0; j < firework.velocities.length; j++) {
        const j3 = j * 3;
        const vel = firework.velocities[j];

        // Apply velocity
        positions[j3] += vel.x * dt * 60;
        positions[j3 + 1] += vel.y * dt * 60;
        positions[j3 + 2] += vel.z * dt * 60;

        // Apply gravity to fireworks
        vel.y -= 0.01 * dt * 60;
      }

      firework.mesh.geometry.attributes.position.needsUpdate = true;

      // Fade out
      const fadeProgress = firework.lifetime / firework.maxLifetime;
      firework.mesh.material.opacity = 1.0 - fadeProgress;
    }

    // Update particles (confetti, golden rain)
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];
      particle.lifetime += dt;

      if (particle.lifetime >= particle.maxLifetime) {
        // Remove particle system
        this.scene.remove(particle.mesh);
        particle.mesh.geometry.dispose();
        particle.mesh.material.dispose();
        this.particles.splice(i, 1);
        continue;
      }

      // Update positions
      const positions = particle.mesh.geometry.attributes.position.array;
      for (let j = 0; j < particle.velocities.length; j++) {
        const j3 = j * 3;
        const vel = particle.velocities[j];

        positions[j3] += vel.x * dt * 60;
        positions[j3 + 1] += vel.y * dt * 60;
        positions[j3 + 2] += vel.z * dt * 60;

        // Zastavit pád na úrovni země
        if (positions[j3 + 1] < 0.1) {
          positions[j3 + 1] = 0.1;
          vel.y = 0;
        }
      }

      particle.mesh.geometry.attributes.position.needsUpdate = true;

      // Fade out towards end
      const fadeStart = 0.7;
      const fadeProgress = particle.lifetime / particle.maxLifetime;
      if (fadeProgress > fadeStart) {
        const fadeFactor = (fadeProgress - fadeStart) / (1.0 - fadeStart);
        particle.mesh.material.opacity = 1.0 - fadeFactor;
      }
    }
  }

  /**
   * Vrátí aktuální time scale (pro synchronizaci s game loop)
   */
  getTimeScale() {
    return this.timeScale;
  }

  /**
   * Vyčistí všechny efekty
   */
  cleanup() {
    // Remove all particles
    for (const particle of this.particles) {
      this.scene.remove(particle.mesh);
      particle.mesh.geometry.dispose();
      particle.mesh.material.dispose();
    }
    this.particles = [];

    // Remove all fireworks
    for (const firework of this.fireworks) {
      this.scene.remove(firework.mesh);
      firework.mesh.geometry.dispose();
      firework.mesh.material.dispose();
    }
    this.fireworks = [];

    this.isActive = false;
    this.cameraShakeIntensity = 0;
  }
}

export default GoalCelebrationSystem;
