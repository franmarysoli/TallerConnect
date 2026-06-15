/**
 * AuthContext.tsx — Contexto de Autenticación de TallerConnect
 * 
 * Provee el estado de autenticación a toda la app.
 * Maneja: login, registro, logout, y carga de datos del usuario desde Firestore.
 * 
 * Uso: envolver la app con <AuthProvider> y usar useAuth() en componentes.
 */

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  type User as FirebaseUser,
} from "firebase/auth";
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import { auth, db } from "../firebase/config";
import type { Usuario } from "../types";

// ============================================================
// Tipos del contexto
// ============================================================

/** Lo que expone el contexto de autenticación */
interface AuthContextType {
  usuario: Usuario | null;         // Datos completos del usuario logueado
  firebaseUser: FirebaseUser | null; // Usuario de Firebase Auth
  cargando: boolean;               // true mientras se verifica la sesión
  error: string | null;            // Mensaje de error (si hay)
  iniciarSesion: (correo: string, password: string) => Promise<void>;
  registrarse: (datos: DatosRegistro) => Promise<void>;
  cerrarSesion: () => Promise<void>;
  limpiarError: () => void;
}

/** Datos necesarios para registrar un cliente nuevo */
export interface DatosRegistro {
  cedula: string;
  nombre: string;
  correo: string;
  celular: string;
  password: string;
}

// Crear el contexto con valor inicial undefined
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================================
// Provider
// ============================================================

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Escuchar cambios en el estado de autenticación de Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);

      if (user) {
        // Si hay un usuario logueado, obtener sus datos de Firestore
        try {
          const docRef = doc(db, "usuarios", user.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            setUsuario(docSnap.data() as Usuario);
          } else {
            // El documento no existe en Firestore (caso raro)
            console.warn("Usuario autenticado pero sin documento en Firestore");
            setUsuario(null);
          }
        } catch (err) {
          console.error("Error al obtener datos del usuario:", err);
          setUsuario(null);
        }
      } else {
        // No hay usuario logueado
        setUsuario(null);
      }

      setCargando(false);
    });

    // Limpiar el listener al desmontar
    return () => unsubscribe();
  }, []);

  // ============================================================
  // Iniciar sesión con correo y contraseña
  // ============================================================
  async function iniciarSesion(correo: string, password: string) {
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, correo, password);
      // onAuthStateChanged se encargará de actualizar el estado
    } catch (err: unknown) {
      const firebaseError = err as { code?: string };
      // Traducir errores comunes de Firebase a español
      switch (firebaseError.code) {
        case "auth/user-not-found":
          setError("No existe una cuenta con este correo.");
          break;
        case "auth/wrong-password":
        case "auth/invalid-credential":
          setError("Contraseña incorrecta.");
          break;
        case "auth/invalid-email":
          setError("El formato del correo no es válido.");
          break;
        case "auth/too-many-requests":
          setError("Demasiados intentos. Espera unos minutos.");
          break;
        default:
          setError("Error al iniciar sesión. Verifica tus credenciales.");
      }
      throw err;
    }
  }

  // ============================================================
  // Registrar un nuevo cliente
  // ============================================================
  async function registrarse(datos: DatosRegistro) {
    setError(null);
    try {
      // 1. Crear usuario en Firebase Auth
      const credencial = await createUserWithEmailAndPassword(
        auth,
        datos.correo,
        datos.password
      );

      // 2. Crear documento del usuario en Firestore
      const nuevoUsuario: Usuario = {
        uid: credencial.user.uid,
        cedula: datos.cedula,
        nombre: datos.nombre,
        correo: datos.correo,
        celular: datos.celular || "",
        rol: "cliente",    // Los usuarios se registran siempre como cliente
        fechaRegistro: Timestamp.now(),
      };

      await setDoc(doc(db, "usuarios", credencial.user.uid), nuevoUsuario);

      // Simular correo de bienvenida
      console.log("📧 [CORREO SIMULADO] Bienvenida enviada a:", datos.correo);
      console.log("   Asunto: ¡Bienvenido/a a TallerConnect!");
      console.log(`   Cuerpo: Hola ${datos.nombre}, tu cuenta ha sido creada exitosamente.`);

    } catch (err: unknown) {
      const firebaseError = err as { code?: string };
      switch (firebaseError.code) {
        case "auth/email-already-in-use":
          setError("Ya existe una cuenta con este correo electrónico.");
          break;
        case "auth/weak-password":
          setError("La contraseña debe tener al menos 6 caracteres.");
          break;
        case "auth/invalid-email":
          setError("El formato del correo no es válido.");
          break;
        default:
          setError("Error al crear la cuenta. Intenta de nuevo.");
      }
      throw err;
    }
  }

  // ============================================================
  // Cerrar sesión
  // ============================================================
  async function cerrarSesion() {
    try {
      await signOut(auth);
      setUsuario(null);
    } catch (err) {
      console.error("Error al cerrar sesión:", err);
    }
  }

  /** Limpiar el mensaje de error */
  function limpiarError() {
    setError(null);
  }

  // Valor que se expone a todos los componentes hijos
  const valor: AuthContextType = {
    usuario,
    firebaseUser,
    cargando,
    error,
    iniciarSesion,
    registrarse,
    cerrarSesion,
    limpiarError,
  };

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

// ============================================================
// Hook personalizado para usar el contexto
// ============================================================

/** Hook para acceder al contexto de autenticación. Debe usarse dentro de <AuthProvider>. */
export function useAuth(): AuthContextType {
  const contexto = useContext(AuthContext);
  if (!contexto) {
    throw new Error("useAuth debe usarse dentro de un <AuthProvider>");
  }
  return contexto;
}
