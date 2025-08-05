// src/FootballBall.js - S goal detection a goal post collision
import { THREE } from './three.js';
import { matchManager } from './MatchManager.js';  // 🔥 NOVÝ IMPORT

export default class FootballBall {
  constructor(scene, initialPosition = { x: 0, y: 1, z: 0 }) {
    this.scene = scene;
    this.velocity = new THREE.Vector3(0, 0, 0);
    this.acceleration = new THREE.Vector3(0, -9.81, 0);
    this.friction = 0.985;
    this.bounciness = 0.65;
    this.radius = 0.075;
    
    this.rollingFriction = 0.98;
    this.airResistance = 0.995;
    
    // 🔥 NOVÉ: Goal detection properties
    this.lastGoalCheck = 0;
    this.goalCheckInterval = 100; // Check every 100ms to prevent spam
    this.wasInGoalArea = { left: false, right: false };
    
    // 🔥 NOVÉ: Goal geometry (z FieldUtils.js)
    this.goals = {
      left: {
        x: -20,
        posts: [
          { x: -20, y: 0.75, z: -1.5 }, // Levá tyč
          { x: -20, y: 0.75, z: 1.5 },  // Pravá tyč
        ],
        crossbar: { x: -20, y: 1.5, z: 0 }, // Břevno
        goalLine: -20,
        goalDepth: 2,
        width: 3,
        height: 1.5
      },
      right: {
        x: 20,
        posts: [
          { x: 20, y: 0.75, z: -1.5 }, // Levá tyč
          { x: 20, y: 0.75, z: 1.5 },  // Pravá tyč
        ],
        crossbar: { x: 20, y: 1.5, z: 0 }, // Břevno
        goalLine: 20,
        goalDepth: 2,
        width: 3,
        height: 1.5
      }
    };
    
    this.createBall(initialPosition);
  }

  createBall(position) {
    const ballGeometry = new THREE.SphereGeometry(this.radius, 16, 16);
    
    // Vytvoření fotbalové textury
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const context = canvas.getContext('2d');
    
    // Bílý základ
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, 128, 128);
    
    // Černé pětiúhelníky
    context.fillStyle = '#000000';
    context.strokeStyle = '#000000';
    context.lineWidth = 1;
    
    const drawPentagon = (x, y, size) => {
      context.beginPath();
      for (let i = 0; i < 5; i++) {
        const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
        const px = x + Math.cos(angle) * size;
        const py = y + Math.sin(angle) * size;
        if (i === 0) context.moveTo(px, py);
        else context.lineTo(px, py);
      }
      context.closePath();
      context.fill();
    };
    
    // Střední pětiúhelník
    drawPentagon(64, 64, 15);
    
    // Menší pětiúhelníky kolem
    drawPentagon(32, 32, 10);
    drawPentagon(96, 96, 10);
    drawPentagon(32, 96, 8);
    drawPentagon(96, 32, 8);
    
    // Spojovací čáry
    context.beginPath();
    context.moveTo(25, 25);
    context.lineTo(103, 103);
    context.moveTo(103, 25);
    context.lineTo(25, 103);
    context.stroke();
    
    const ballTexture = new THREE.CanvasTexture(canvas);
    const ballMaterial = new THREE.MeshStandardMaterial({
      map: ballTexture,
      roughness: 0.8,
      metalness: 0.1
    });
    
    this.mesh = new THREE.Mesh(ballGeometry, ballMaterial);
    this.mesh.position.set(position.x, position.y, position.z);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    
    this.scene.add(this.mesh);
  }

  applyForce(force) {
    this.velocity.add(force);
  }

  kick(direction, power = 1) {
    const adjustedPower = power * 0.8;
    const kickForce = direction.clone().normalize().multiplyScalar(adjustedPower);
    this.applyForce(kickForce);
  }

  checkGroundCollision() {
    if (this.mesh.position.y <= this.radius) {
      this.mesh.position.y = this.radius;
      
      if (Math.abs(this.velocity.y) > 0.1) {
        this.velocity.y = Math.abs(this.velocity.y) * this.bounciness;
      } else {
        this.velocity.y = 0;
      }
      
      this.velocity.x *= this.rollingFriction;
      this.velocity.z *= this.rollingFriction;
    }
  }

  // 🔥 NOVÁ METODA: Collision s goal posts (tyčky a břevno)
  checkGoalPostCollision() {
    const ballPos = this.mesh.position;
    const postRadius = 0.06; // Poloměr tyčky z FieldUtils.js
    const minDistance = this.radius + postRadius;
    
    // Kontrola obou branek
    Object.values(this.goals).forEach(goal => {
      // Kontrola tyček
      goal.posts.forEach(post => {
        const distance = Math.sqrt(
          Math.pow(ballPos.x - post.x, 2) + 
          Math.pow(ballPos.z - post.z, 2)
        );
        
        // Collision pouze pokud je míč ve správné výšce (0 - 1.5m)
        if (distance < minDistance && ballPos.y >= 0 && ballPos.y <= goal.height + this.radius) {
          // Vypočítej směr odrazu
          const direction = new THREE.Vector3(
            ballPos.x - post.x,
            0,
            ballPos.z - post.z
          ).normalize();
          
          // Posuň míč pryč od tyčky
          this.mesh.position.x = post.x + direction.x * minDistance;
          this.mesh.position.z = post.z + direction.z * minDistance;
          
          // Odraz velocity
          const dotProduct = this.velocity.dot(direction);
          if (dotProduct < 0) {
            this.velocity.sub(direction.multiplyScalar(2 * dotProduct));
            this.velocity.multiplyScalar(this.bounciness);
          }
          
          console.log('⚽ Ball bounced off goal post!');
        }
      });
      
      // Kontrola břevna (crossbar)
      const crossbar = goal.crossbar;
      const distanceX = Math.abs(ballPos.x - crossbar.x);
      const distanceY = Math.abs(ballPos.y - crossbar.y);
      const distanceZ = Math.abs(ballPos.z - crossbar.z);
      
      // Collision s břevnem (horizontální tyč)
      if (distanceX < this.radius + postRadius && 
          distanceZ < goal.width/2 + this.radius && 
          distanceY < this.radius + postRadius) {
        
        // Odraz od břevna (především směrem dolů)
        if (this.velocity.y > 0) {
          this.velocity.y = -Math.abs(this.velocity.y) * this.bounciness;
          this.mesh.position.y = crossbar.y - this.radius - postRadius;
          
          console.log('⚽ Ball bounced off crossbar!');
        }
      }
    });
  }

  // 🔥 NOVÁ METODA: Goal line detection
  checkGoalScored() {
    // Pouze pokud je match aktivní
    if (!matchManager || !matchManager.isMatchRunning()) {
      return null;
    }
    
    // Throttle goal checks
    const now = Date.now();
    if (now - this.lastGoalCheck < this.goalCheckInterval) {
      return null;
    }
    this.lastGoalCheck = now;
    
    const ballPos = this.mesh.position;
    const ballVel = this.velocity;
    
    // Kontrola výšky míče (musí být pod břevnem a nad zemí)
    if (ballPos.y < 0 || ballPos.y > this.goals.left.height) {
      return null;
    }
    
    // Kontrola šířky (míč musí být mezi tyčemi)
    if (Math.abs(ballPos.z) > this.goals.left.width / 2) {
      return null;
    }
    
    // 🥅 LEVÁ BRANKA (hráč skóruje)
    const leftGoal = this.goals.left;
    const wasInLeftArea = this.wasInGoalArea.left;
    const isInLeftArea = ballPos.x <= leftGoal.goalLine && ballPos.x >= leftGoal.goalLine - leftGoal.goalDepth;
    
    // Detekce vstupu do branky (crossing goal line)
    if (!wasInLeftArea && ballPos.x <= leftGoal.goalLine && ballVel.x < 0) {
      this.wasInGoalArea.left = true;
      return 'player';
    }
    
    this.wasInGoalArea.left = isInLeftArea;
    
    // 🥅 PRAVÁ BRANKA (AI skóruje)
    const rightGoal = this.goals.right;
    const wasInRightArea = this.wasInGoalArea.right;
    const isInRightArea = ballPos.x >= rightGoal.goalLine && ballPos.x <= rightGoal.goalLine + rightGoal.goalDepth;
    
    // Detekce vstupu do branky (crossing goal line)
    if (!wasInRightArea && ballPos.x >= rightGoal.goalLine && ballVel.x > 0) {
      this.wasInGoalArea.right = true;
      return 'opponent';
    }
    
    this.wasInGoalArea.right = isInRightArea;
    
    return null;
  }

  // 🔥 UPRAVENÁ METODA: Boundary collisions s goal areas
  checkBoundaryCollisions() {
    const fieldWidth = 40;
    const fieldHeight = 26;
    const ballPos = this.mesh.position;
    
    // 🔥 NOVÉ: Povolit míči jít do goal areas
    const isInLeftGoalArea = ballPos.x <= -18 && Math.abs(ballPos.z) <= 2; // Před levou brankou
    const isInRightGoalArea = ballPos.x >= 18 && Math.abs(ballPos.z) <= 2; // Před pravou brankou
    
    // X-axis boundaries (s výjimkou goal areas)
    if (!isInLeftGoalArea && ballPos.x <= -fieldWidth/2 + this.radius) {
      this.mesh.position.x = -fieldWidth/2 + this.radius;
      this.velocity.x = Math.abs(this.velocity.x) * this.bounciness;
    }
    if (!isInRightGoalArea && ballPos.x >= fieldWidth/2 - this.radius) {
      this.mesh.position.x = fieldWidth/2 - this.radius;
      this.velocity.x = -Math.abs(this.velocity.x) * this.bounciness;
    }
    
    // Z-axis boundaries (normální)
    if (ballPos.z >= fieldHeight/2 - this.radius) {
      this.mesh.position.z = fieldHeight/2 - this.radius;
      this.velocity.z = -Math.abs(this.velocity.z) * this.bounciness;
    }
    if (ballPos.z <= -fieldHeight/2 + this.radius) {
      this.mesh.position.z = -fieldHeight/2 + this.radius;
      this.velocity.z = Math.abs(this.velocity.z) * this.bounciness;
    }
    
    // 🔥 NOVÉ: Hranice za brankami (zabránit míči jet do nekonečna)
    if (ballPos.x < -22) {
      this.mesh.position.x = -22;
      this.velocity.x = Math.abs(this.velocity.x) * this.bounciness;
    }
    if (ballPos.x > 22) {
      this.mesh.position.x = 22;
      this.velocity.x = -Math.abs(this.velocity.x) * this.bounciness;
    }
  }

  checkPlayerCollision(player) {
    if (!player || !player.mesh) return;
    
    const distance = this.mesh.position.distanceTo(player.mesh.position);
    const minDistance = this.radius + player.radius;
    
    if (distance < minDistance) {
      const direction = new THREE.Vector3()
        .subVectors(this.mesh.position, player.mesh.position)
        .normalize();
      
      this.mesh.position.copy(
        player.mesh.position
          .clone()
          .add(direction.clone().multiplyScalar(minDistance))
      );
      
      const bounceForce = direction.multiplyScalar(1.5 + player.speed * 0.3);
      this.applyForce(bounceForce);
    }
  }

  checkMultiplePlayersCollision(players) {
    if (!players || !Array.isArray(players)) return;
    
    players.forEach(player => {
      if (player && player.mesh) {
        this.checkPlayerCollision(player);
      }
    });
  }

  // 🔥 ROZŠÍŘENÁ update METODA s goal detection
  update(deltaTime, player = null, additionalPlayers = []) {
    // Aplikuj fyziku
    this.velocity.add(this.acceleration.clone().multiplyScalar(deltaTime));
    
    // Odpor vzduchu
    this.velocity.multiplyScalar(this.airResistance);
    
    // Pohyb míče
    this.mesh.position.add(this.velocity.clone().multiplyScalar(deltaTime));
    
    // Rotace míče podle rychlosti
    const rotationSpeed = this.velocity.length() * 1.5;
    this.mesh.rotation.x += this.velocity.z * deltaTime * rotationSpeed;
    this.mesh.rotation.z -= this.velocity.x * deltaTime * rotationSpeed;
    
    // === 🔥 NOVÉ: GOAL SYSTEM ===
    
    // 1. Goal post collision (tyčky a břevno)
    this.checkGoalPostCollision();
    
    // 2. Goal detection
    const goalTeam = this.checkGoalScored();
    if (goalTeam) {
      console.log(`⚽ GOAL DETECTED! Team: ${goalTeam}`);
      
      // Zavolej MatchManager
      const goalScored = matchManager.scoreGoal(goalTeam);
      if (goalScored) {
        // Reset míče na střed po gólu (s delay)
        setTimeout(() => {
          this.resetPosition({ x: 0, y: 0.5, z: 0 });
          this.wasInGoalArea.left = false;
          this.wasInGoalArea.right = false;
          console.log('🔄 Ball reset to center after goal');
        }, 1500); // 1.5 sekunda delay pro goal celebration
      }
    }
    
    // === PŮVODNÍ COLLISION DETECTION ===
    
    // Ground collision
    this.checkGroundCollision();
    
    // Boundary collisions (s goal area support)
    this.checkBoundaryCollisions();
    
    // Player collisions
    if (player) {
      this.checkPlayerCollision(player);
    }
    
    if (additionalPlayers.length > 0) {
      this.checkMultiplePlayersCollision(additionalPlayers);
    }
    
    // Zastavení velmi pomalého pohybu
    if (this.velocity.length() < 0.05 && this.mesh.position.y <= this.radius + 0.01) {
      this.velocity.set(0, 0, 0);
    }
  }

  // 🔥 ROZŠÍŘENÁ resetPosition metoda
  resetPosition(position = { x: 0, y: 0.1, z: 0 }) {
    this.mesh.position.set(position.x, position.y, position.z);
    this.velocity.set(0, 0, 0);
    
    // Reset goal area tracking
    this.wasInGoalArea.left = false;
    this.wasInGoalArea.right = false;
    
    console.log('🔄 Ball position and goal tracking reset');
  }

  // Metoda pro získání vzdálenosti od hráče
  getDistanceToPlayer(player) {
    if (!player || !player.mesh) return Infinity;
    return this.mesh.position.distanceTo(player.mesh.position);
  }

  getNearestPlayer(players) {
    let nearestPlayer = null;
    let minDistance = Infinity;
    
    players.forEach(player => {
      if (player && player.mesh) {
        const distance = this.mesh.position.distanceTo(player.mesh.position);
        if (distance < minDistance) {
          minDistance = distance;
          nearestPlayer = player;
        }
      }
    });
    
    return { player: nearestPlayer, distance: minDistance };
  }

  getControllingPlayer(players) {
    const allPlayers = [];
    
    players.forEach(player => {
      if (player && player.mesh) {
        allPlayers.push({
          player: player,
          distance: this.mesh.position.distanceTo(player.mesh.position)
        });
      }
    });
    
    allPlayers.sort((a, b) => a.distance - b.distance);
    
    if (allPlayers.length > 0 && allPlayers[0].distance <= allPlayers[0].player.controlRadius) {
      return allPlayers[0].player;
    }
    
    return null;
  }

  // 🔥 NOVÁ METODA: Debug goal areas
  debugGoalAreas() {
    const ballPos = this.mesh.position;
    console.log('⚽ Ball Debug:', {
      position: {
        x: ballPos.x.toFixed(2),
        y: ballPos.y.toFixed(2),
        z: ballPos.z.toFixed(2)
      },
      velocity: {
        x: this.velocity.x.toFixed(2),
        y: this.velocity.y.toFixed(2),
        z: this.velocity.z.toFixed(2)
      },
      inGoalAreas: {
        left: this.wasInGoalArea.left,
        right: this.wasInGoalArea.right
      },
      goalLines: {
        leftDistance: (ballPos.x - this.goals.left.goalLine).toFixed(2),
        rightDistance: (ballPos.x - this.goals.right.goalLine).toFixed(2)
      }
    });
  }

  dispose() {
    if (this.mesh) {
      this.scene.remove(this.mesh);
      this.mesh.geometry.dispose();
      this.mesh.material.dispose();
    }
  }
}