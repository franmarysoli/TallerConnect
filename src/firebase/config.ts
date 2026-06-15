/**
 * config.ts — Inicialización de Firebase
 * 
 * Este archivo configura Firebase usando las variables de entorno
 * definidas en el archivo .env de la raíz del proyecto.
 * 
 * Exporta: app, auth (Firebase Auth), db (Firestore)
 */

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Configuración de Firebase tomada de variables de entorno
// (las variables VITE_* son accesibles en el cliente con Vite)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Inicializar Firebase App
const app = initializeApp(firebaseConfig);

// Inicializar servicios de Firebase
const auth = getAuth(app);      // Autenticación
const db = getFirestore(app);    // Base de datos Firestore

export { app, auth, db };
