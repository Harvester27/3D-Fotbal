// src/FirebaseManager.js - REAL CONFIG for football3d-game + Player Data
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp as firestoreServerTimestamp
} from 'firebase/firestore';
import { 
  getDatabase, 
  ref, 
  set, 
  onValue, 
  push,
  remove,
  serverTimestamp,
  get
} from 'firebase/database';

// 🔥 TVOJE SKUTEČNÁ FIREBASE KONFIGURACE
const firebaseConfig = {
  apiKey: "AIzaSyCYoEg_wm1b6OVZ_mrXb2-EaQm7FoATJ6g",
  authDomain: "football3d-game.firebaseapp.com",
  databaseURL: "https://football3d-game-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "football3d-game",
  storageBucket: "football3d-game.firebasestorage.app",
  messagingSenderId: "267043501644",
  appId: "1:267043501644:web:343f06a43959d36a036e9",
  measurementId: "G-Z08ZFFR8K2"
};

export class FirebaseManager {
  constructor() {
    try {
      // Initialize Firebase
      this.app = initializeApp(firebaseConfig);
      this.auth = getAuth(this.app);
      this.firestore = getFirestore(this.app);
      this.realtimeDB = getDatabase(this.app);
      
      // Current user
      this.currentUser = null;
      this.currentGameRoom = null;
      
      // Callbacks - ZMĚNA: Použití Set pro více listenerů
      this.authListeners = new Set();
      this.onPlayerPositionUpdate = null;
      this.onGameStateUpdate = null;
      
      // Setup auth listener
      this.setupAuthListener();
      
      console.log("🔥 Firebase Manager initialized successfully!");
      console.log("🎯 Project:", firebaseConfig.projectId);
    } catch (error) {
      console.error("❌ Firebase initialization error:", error);
    }
  }

  // 🔐 AUTHENTICATION - UPRAVENO pro podporu více listenerů
  setupAuthListener() {
    onAuthStateChanged(this.auth, (user) => {
      this.currentUser = user;
      
      // Zavolej všechny registrované listenery
      this.authListeners.forEach(callback => {
        try {
          callback(user);
        } catch (error) {
          console.error("Error in auth listener:", error);
        }
      });
      
      console.log("👤 Auth state changed:", user ? `${user.displayName} (${user.email})` : "Not logged in");
    });
  }

  // NOVÁ METODA: Registrace auth listenerů s unsubscribe funkcí
  onAuthStateChanged(callback) {
    this.authListeners.add(callback);
    
    // Pokud už je user přihlášen, zavolej callback okamžitě
    if (this.currentUser) {
      callback(this.currentUser);
    }
    
    // Vrať funkci pro odstranění listeneru
    return () => {
      this.authListeners.delete(callback);
    };
  }

  async signInWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('profile');
      provider.addScope('email');
      
      const result = await signInWithPopup(this.auth, provider);
      console.log("✅ Successfully signed in:", result.user.displayName);
      console.log("📧 Email:", result.user.email);
      console.log("🖼️ Photo:", result.user.photoURL);
      
      return result.user;
    } catch (error) {
      console.error("❌ Google sign in error:", error.code, error.message);
      
      // User-friendly error messages
      switch (error.code) {
        case 'auth/popup-closed-by-user':
          throw new Error("Přihlášení bylo zrušeno");
        case 'auth/popup-blocked':
          throw new Error("Popup byl blokován prohlížečem");
        case 'auth/network-request-failed':
          throw new Error("Chyba připojení k internetu");
        default:
          throw new Error("Chyba při přihlašování: " + error.message);
      }
    }
  }

  async signOut() {
    try {
      // Leave game room before signing out
      if (this.currentGameRoom) {
        await this.leaveGameRoom();
      }
      
      await signOut(this.auth);
      console.log("👋 Successfully signed out");
    } catch (error) {
      console.error("❌ Sign out error:", error);
    }
  }

  // 👤 PLAYER DATA MANAGEMENT
  async savePlayerData(userId, playerData) {
    if (!userId) {
      throw new Error("User ID required for saving player data");
    }

    try {
      console.log("💾 Saving player data for user:", userId);
      
      const playerRef = doc(this.firestore, 'players', userId);
      await setDoc(playerRef, {
        ...playerData,
        userId: userId,
        lastUpdated: new Date()
      }, { merge: true }); // Merge aby se nepřepsala existující data
      
      console.log("✅ Player data saved successfully");
      return true;
    } catch (error) {
      console.error("❌ Save player data error:", error);
      throw new Error("Chyba při ukládání dat hráče: " + error.message);
    }
  }

  async getPlayerData(userId) {
    if (!userId) {
      throw new Error("User ID required for loading player data");
    }

    try {
      console.log("📥 Loading player data for user:", userId);
      
      const playerRef = doc(this.firestore, 'players', userId);
      const playerSnap = await getDoc(playerRef);
      
      if (playerSnap.exists()) {
        const data = playerSnap.data();
        console.log("✅ Player data loaded successfully");
        return data;
      } else {
        console.log("ℹ️ No player data found - new player");
        return null;
      }
    } catch (error) {
      console.error("❌ Get player data error:", error);
      throw new Error("Chyba při načítání dat hráče: " + error.message);
    }
  }

  // 🏟️ MAIN STADIUM MANAGEMENT (pro hlavní stadion hráče) - UPRAVENO
  async saveMainStadium(stadiumName, elements) {
    const user = this.auth.currentUser;
    if (!user) {
      console.warn('⚠️ No user logged in - cannot save stadium');
      return null;
    }

    try {
      console.log('💾 Saving main stadium to Firebase...', elements.length, 'elements');
      
      // Elements už jsou vyčištěné z PlayerDataManagerStadium
      // Jen je ulož do Firebase
      const stadiumRef = doc(this.firestore, 'users', user.uid, 'stadiums', 'main');
      await setDoc(stadiumRef, {
        name: stadiumName,
        elements: elements, // Už jsou vyčištěné
        lastModified: firestoreServerTimestamp(),
        elementCount: elements.length,
        userId: user.uid,
        createdAt: firestoreServerTimestamp()
      }, { merge: true });
      
      console.log('✅ Main stadium saved successfully');
      return true;
      
    } catch (error) {
      console.error('❌ Failed to save main stadium:', error);
      throw error;
    }
  }

  async loadMainStadium() {
    const user = this.auth.currentUser;
    if (!user) {
      console.warn('⚠️ No user logged in - cannot load stadium');
      return null;
    }

    try {
      const stadiumRef = doc(this.firestore, 'users', user.uid, 'stadiums', 'main');
      const stadiumDoc = await getDoc(stadiumRef);
      
      if (stadiumDoc.exists()) {
        console.log('✅ Main stadium loaded successfully');
        return stadiumDoc.data();
      } else {
        console.log('📭 No main stadium found');
        return null;
      }
      
    } catch (error) {
      console.error('❌ Failed to load main stadium:', error);
      throw error;
    }
  }

  // Leaderboard funkce
  async getTopPlayers(limit = 10, orderByField = 'level') {
    try {
      console.log(`🏆 Loading top ${limit} players by ${orderByField}`);
      
      const playersRef = collection(this.firestore, 'players');
      const q = query(
        playersRef,
        orderBy(orderByField, 'desc'),
        limit(limit)
      );
      
      const querySnapshot = await getDocs(q);
      
      const topPlayers = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        topPlayers.push({
          id: doc.id,
          name: data.playerProfile?.displayName || 'Unknown',
          avatar: data.playerProfile?.avatarUrl,
          level: data.level || 1,
          coins: data.virtualCoins || 0,
          wins: data.stats?.matchesWon || 0,
          ...data
        });
      });
      
      console.log(`✅ Loaded ${topPlayers.length} top players`);
      return topPlayers;
    } catch (error) {
      console.error("❌ Get top players error:", error);
      return [];
    }
  }

  // Real-time listener pro player data
  listenToPlayerData(userId, callback) {
    if (!userId) return null;

    console.log("👂 Listening to player data changes for:", userId);
    
    const playerRef = doc(this.firestore, 'players', userId);
    
    const unsubscribe = onSnapshot(playerRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        callback(data);
        console.log("🔄 Player data updated");
      }
    }, (error) => {
      console.error("❌ Listen to player data error:", error);
    });
    
    return unsubscribe;
  }

  // 💾 SHARED STADIUM MANAGEMENT (pro sdílené stadiony)
  async saveStadium(stadiumName, stadiumElements) {
    if (!this.currentUser) {
      throw new Error("Musíš být přihlášen pro uložení stadionu");
    }

    try {
      console.log("💾 Saving stadium:", stadiumName, "with", stadiumElements.length, "elements");
      
      const stadiumData = {
        name: stadiumName.trim(),
        elements: stadiumElements,
        authorId: this.currentUser.uid,
        authorName: this.currentUser.displayName,
        authorEmail: this.currentUser.email,
        authorPhoto: this.currentUser.photoURL,
        createdAt: new Date(),
        updatedAt: new Date(),
        isPublic: true,
        likes: 0,
        downloads: 0,
        elementCount: stadiumElements.length,
        version: "1.0"
      };

      // Use timestamp for unique ID
      const stadiumId = `${this.currentUser.uid}_${Date.now()}`;
      const stadiumRef = doc(this.firestore, 'stadiums', stadiumId);
      
      await setDoc(stadiumRef, stadiumData);
      
      console.log("✅ Stadium saved successfully with ID:", stadiumId);
      return stadiumId;
    } catch (error) {
      console.error("❌ Save stadium error:", error);
      throw new Error("Chyba při ukládání stadionu: " + error.message);
    }
  }

  async loadStadium(stadiumId) {
    try {
      console.log("📥 Loading stadium:", stadiumId);
      
      const stadiumRef = doc(this.firestore, 'stadiums', stadiumId);
      const stadiumSnap = await getDoc(stadiumRef);
      
      if (stadiumSnap.exists()) {
        const stadiumData = stadiumSnap.data();
        
        // Increment download counter
        if (this.currentUser && stadiumData.authorId !== this.currentUser.uid) {
          try {
            await setDoc(stadiumRef, {
              ...stadiumData,
              downloads: (stadiumData.downloads || 0) + 1
            });
          } catch (updateError) {
            console.warn("Failed to update download counter:", updateError);
          }
        }
        
        console.log("✅ Stadium loaded:", stadiumData.name);
        console.log("📊 Elements:", stadiumData.elements?.length || 0);
        
        return stadiumData;
      } else {
        throw new Error("Stadion nenalezen");
      }
    } catch (error) {
      console.error("❌ Load stadium error:", error);
      throw new Error("Chyba při načítání stadionu: " + error.message);
    }
  }

  async getPublicStadiums(limitCount = 20) {
    try {
      console.log("🏟️ Loading public stadiums...");
      
      const stadiumsRef = collection(this.firestore, 'stadiums');
      const q = query(
        stadiumsRef,
        where('isPublic', '==', true),
        orderBy('likes', 'desc'),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      
      const stadiums = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        stadiums.push({
          id: doc.id,
          ...data,
          // Convert Firestore timestamps to regular dates
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt
        });
      });
      
      console.log("✅ Loaded", stadiums.length, "public stadiums");
      return stadiums;
    } catch (error) {
      console.error("❌ Get stadiums error:", error);
      // Return empty array instead of throwing - better UX
      return [];
    }
  }

  async getMyStadiums() {
    if (!this.currentUser) return [];

    try {
      console.log("👤 Loading my stadiums...");
      
      const stadiumsRef = collection(this.firestore, 'stadiums');
      const q = query(
        stadiumsRef,
        where('authorId', '==', this.currentUser.uid),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      
      const stadiums = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        stadiums.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt
        });
      });
      
      console.log("✅ Loaded", stadiums.length, "of my stadiums");
      return stadiums;
    } catch (error) {
      console.error("❌ Get my stadiums error:", error);
      return [];
    }
  }

  async deleteStadium(stadiumId) {
    if (!this.currentUser) {
      throw new Error("Musíš být přihlášen");
    }

    try {
      // Check if user owns this stadium
      const stadiumRef = doc(this.firestore, 'stadiums', stadiumId);
      const stadiumSnap = await getDoc(stadiumRef);
      
      if (!stadiumSnap.exists()) {
        throw new Error("Stadion neexistuje");
      }
      
      const stadiumData = stadiumSnap.data();
      if (stadiumData.authorId !== this.currentUser.uid) {
        throw new Error("Můžeš mazat pouze vlastní stadiony");
      }
      
      await deleteDoc(stadiumRef);
      console.log("🗑️ Stadium deleted:", stadiumId);
      
    } catch (error) {
      console.error("❌ Delete stadium error:", error);
      throw new Error("Chyba při mazání stadionu: " + error.message);
    }
  }

  // ⚽ REAL-TIME MULTIPLAYER (Realtime Database)
  async createGameRoom(stadiumId = null, maxPlayers = 2) {
    if (!this.currentUser) {
      throw new Error("Musíš být přihlášen pro vytvoření hry");
    }

    try {
      console.log("🎮 Creating game room...");
      
      const gameRoomRef = push(ref(this.realtimeDB, 'gameRooms'));
      const gameRoomData = {
        hostId: this.currentUser.uid,
        hostName: this.currentUser.displayName,
        stadiumId: stadiumId,
        maxPlayers: maxPlayers,
        currentPlayers: 1,
        gameState: 'waiting', // waiting, playing, finished
        createdAt: serverTimestamp(),
        players: {
          [this.currentUser.uid]: {
            id: this.currentUser.uid,
            name: this.currentUser.displayName,
            photo: this.currentUser.photoURL,
            position: { x: 0, y: 0, z: 8 },
            rotation: 0,
            isReady: false,
            score: 0,
            isHost: true
          }
        },
        ball: {
          position: { x: 0, y: 1, z: 0 },
          velocity: { x: 0, y: 0, z: 0 }
        },
        gameSettings: {
          matchDuration: 300, // 5 minutes
          maxScore: 5
        }
      };

      await set(gameRoomRef, gameRoomData);
      this.currentGameRoom = gameRoomRef.key;
      
      console.log("✅ Game room created:", this.currentGameRoom);
      return this.currentGameRoom;
    } catch (error) {
      console.error("❌ Create game room error:", error);
      throw new Error("Chyba při vytváření hry: " + error.message);
    }
  }

  async joinGameRoom(gameRoomId) {
    if (!this.currentUser) {
      throw new Error("Musíš být přihlášen pro připojení ke hře");
    }

    try {
      console.log("🤝 Joining game room:", gameRoomId);
      
      const gameRoomRef = ref(this.realtimeDB, `gameRooms/${gameRoomId}`);
      const snapshot = await get(gameRoomRef);
      
      if (!snapshot.exists()) {
        throw new Error("Hra nenalezena");
      }

      const gameData = snapshot.val();
      
      if (gameData.currentPlayers >= gameData.maxPlayers) {
        throw new Error("Hra je plná");
      }
      
      if (gameData.gameState !== 'waiting') {
        throw new Error("Hra už začala");
      }

      // Add player to room
      const playerData = {
        id: this.currentUser.uid,
        name: this.currentUser.displayName,
        photo: this.currentUser.photoURL,
        position: { x: 0, y: 0, z: -8 }, // Opposite side
        rotation: Math.PI,
        isReady: false,
        score: 0,
        isHost: false
      };

      await set(ref(this.realtimeDB, `gameRooms/${gameRoomId}/players/${this.currentUser.uid}`), playerData);
      await set(ref(this.realtimeDB, `gameRooms/${gameRoomId}/currentPlayers`), gameData.currentPlayers + 1);
      
      this.currentGameRoom = gameRoomId;
      
      console.log("✅ Successfully joined game room:", gameRoomId);
      return gameRoomId;
    } catch (error) {
      console.error("❌ Join game room error:", error);
      throw new Error("Chyba při připojování ke hře: " + error.message);
    }
  }

  // Real-time position updates (call this every frame during multiplayer)
  updatePlayerPosition(position, rotation) {
    if (!this.currentUser || !this.currentGameRoom) return;

    try {
      const playerUpdateRef = ref(this.realtimeDB, `gameRooms/${this.currentGameRoom}/players/${this.currentUser.uid}/position`);
      set(playerUpdateRef, position);
      
      const rotationRef = ref(this.realtimeDB, `gameRooms/${this.currentGameRoom}/players/${this.currentUser.uid}/rotation`);
      set(rotationRef, rotation);
    } catch (error) {
      console.warn("Failed to update player position:", error);
    }
  }

  updateBallPosition(position, velocity) {
    if (!this.currentGameRoom) return;

    try {
      const ballRef = ref(this.realtimeDB, `gameRooms/${this.currentGameRoom}/ball`);
      set(ballRef, {
        position: position,
        velocity: velocity,
        lastUpdate: serverTimestamp()
      });
    } catch (error) {
      console.warn("Failed to update ball position:", error);
    }
  }

  // Listen to real-time updates
  listenToGameRoom(gameRoomId) {
    if (!gameRoomId) return;

    console.log("👂 Listening to game room:", gameRoomId);
    
    const gameRoomRef = ref(this.realtimeDB, `gameRooms/${gameRoomId}`);
    
    const unsubscribe = onValue(gameRoomRef, (snapshot) => {
      if (snapshot.exists()) {
        const gameData = snapshot.val();
        
        // Update other players positions
        if (this.onPlayerPositionUpdate) {
          Object.values(gameData.players || {}).forEach(player => {
            if (player.id !== this.currentUser?.uid) {
              this.onPlayerPositionUpdate(player);
            }
          });
        }
        
        // Update game state
        if (this.onGameStateUpdate) {
          this.onGameStateUpdate(gameData);
        }
        
        console.log("🔄 Game room updated - state:", gameData.gameState, "players:", gameData.currentPlayers);
      } else {
        console.warn("⚠️ Game room no longer exists");
        this.currentGameRoom = null;
      }
    }, (error) => {
      console.error("❌ Listen to game room error:", error);
    });
    
    return unsubscribe;
  }

  // 👥 MATCHMAKING
  async findAvailableGameRooms() {
    try {
      console.log("🔍 Finding available game rooms...");
      
      const gameRoomsRef = ref(this.realtimeDB, 'gameRooms');
      const snapshot = await get(gameRoomsRef);
      
      if (!snapshot.exists()) {
        console.log("No game rooms found");
        return [];
      }
      
      const rooms = [];
      const gameRooms = snapshot.val();
      
      Object.entries(gameRooms).forEach(([roomId, roomData]) => {
        if (roomData.gameState === 'waiting' && 
            roomData.currentPlayers < roomData.maxPlayers &&
            roomData.hostId !== this.currentUser?.uid) { // Don't show own rooms
          rooms.push({
            id: roomId,
            ...roomData
          });
        }
      });
      
      console.log("✅ Found", rooms.length, "available rooms");
      return rooms.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)); // Newest first
    } catch (error) {
      console.error("❌ Find rooms error:", error);
      return [];
    }
  }

  // Set player ready state
  async setPlayerReady(isReady = true) {
    if (!this.currentUser || !this.currentGameRoom) return;

    try {
      const readyRef = ref(this.realtimeDB, `gameRooms/${this.currentGameRoom}/players/${this.currentUser.uid}/isReady`);
      await set(readyRef, isReady);
      console.log("🎯 Player ready state:", isReady);
    } catch (error) {
      console.error("❌ Set ready error:", error);
    }
  }

  // Update player score
  async updateScore(newScore) {
    if (!this.currentUser || !this.currentGameRoom) return;

    try {
      const scoreRef = ref(this.realtimeDB, `gameRooms/${this.currentGameRoom}/players/${this.currentUser.uid}/score`);
      await set(scoreRef, newScore);
      console.log("⚽ Score updated:", newScore);
    } catch (error) {
      console.error("❌ Update score error:", error);
    }
  }

  // 🧹 CLEANUP
  async leaveGameRoom() {
    if (!this.currentUser || !this.currentGameRoom) return;

    try {
      console.log("👋 Leaving game room:", this.currentGameRoom);
      
      // Remove player from room
      await remove(ref(this.realtimeDB, `gameRooms/${this.currentGameRoom}/players/${this.currentUser.uid}`));
      
      // Update player count
      const gameRoomRef = ref(this.realtimeDB, `gameRooms/${this.currentGameRoom}`);
      const snapshot = await get(gameRoomRef);
      
      if (snapshot.exists()) {
        const gameData = snapshot.val();
        const newPlayerCount = Math.max(0, gameData.currentPlayers - 1);
        
        if (newPlayerCount === 0) {
          // Delete empty room
          await remove(gameRoomRef);
          console.log("🗑️ Empty game room deleted");
        } else {
          await set(ref(this.realtimeDB, `gameRooms/${this.currentGameRoom}/currentPlayers`), newPlayerCount);
          console.log("📊 Updated player count:", newPlayerCount);
        }
      }
      
      this.currentGameRoom = null;
      console.log("✅ Successfully left game room");
      
    } catch (error) {
      console.error("❌ Leave room error:", error);
    }
  }

  // Getters
  getCurrentUser() {
    return this.currentUser;
  }

  getCurrentGameRoom() {
    return this.currentGameRoom;
  }

  isLoggedIn() {
    return !!this.currentUser;
  }

  // Event listeners setup - UPRAVENO pro zpětnou kompatibilitu
  setOnUserChanged(callback) {
    // Pro zpětnou kompatibilitu - použij nový systém
    if (callback) {
      return this.onAuthStateChanged(callback);
    }
  }

  setOnPlayerPositionUpdate(callback) {
    this.onPlayerPositionUpdate = callback;
  }

  setOnGameStateUpdate(callback) {
    this.onGameStateUpdate = callback;
  }

  // Utility method for debugging
  getConnectionInfo() {
    return {
      isLoggedIn: this.isLoggedIn(),
      currentUser: this.currentUser?.displayName || null,
      currentGameRoom: this.currentGameRoom,
      projectId: firebaseConfig.projectId
    };
  }

  // Cleanup
  dispose() {
    console.log("🧹 Disposing Firebase Manager...");
    
    // Leave game room
    if (this.currentGameRoom) {
      this.leaveGameRoom();
    }
    
    // Clear auth listeners
    this.authListeners.clear();
    
    // Clear references
    this.currentGameRoom = null;
    this.currentUser = null;
    this.onPlayerPositionUpdate = null;
    this.onGameStateUpdate = null;
    
    console.log("✅ Firebase Manager disposed");
  }
}

// Singleton instance
export const firebaseManager = new FirebaseManager();

// Global helper pro rychlý přístup (DŮLEŽITÉ pro PlayerDataManager!)
if (typeof window !== 'undefined') {
  window.firebaseManager = firebaseManager;
}

// Global error handler for unhandled Firebase errors (only in browser)
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason?.code?.startsWith('auth/') || event.reason?.code?.startsWith('firestore/')) {
      console.error('🔥 Firebase error:', event.reason);
      // Prevent the error from appearing in console as unhandled
      event.preventDefault();
    }
  });
}

console.log("🔥 Firebase Manager loaded successfully!");
console.log("🎯 Ready for football3d-game project");