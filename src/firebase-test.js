// src/firebase-test.js
import { firebaseManager } from './FirebaseManager.js';

console.log("🔥 Testing Firebase connection...");
console.log("Connection info:", firebaseManager.getConnectionInfo());
console.log("✅ Firebase loaded successfully!");