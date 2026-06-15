/**
 * useEstilos.ts — Hook para gestión de estilos de confección
 * 
 * CRUD completo para la colección "estilos" en Firestore.
 */

import { useState, useEffect } from "react";
import {
  collection,
  onSnapshot,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase/config";
import type { Estilo } from "../types";

/** Hook para CRUD de estilos */
export function useEstilos() {
  const [estilos, setEstilos] = useState<Estilo[]>([]);
  const [cargando, setCargando] = useState(true);

  // Escuchar cambios en tiempo real
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "estilos"), (snapshot) => {
      const datos: Estilo[] = [];
      snapshot.forEach((docSnap) => {
        datos.push({ id: docSnap.id, ...docSnap.data() } as Estilo);
      });
      setEstilos(datos);
      setCargando(false);
    });

    return () => unsubscribe();
  }, []);

  /** Crear un nuevo estilo */
  async function crearEstilo(estilo: Omit<Estilo, "id">) {
    await addDoc(collection(db, "estilos"), estilo);
  }

  /** Actualizar un estilo existente */
  async function actualizarEstilo(id: string, datos: Partial<Estilo>) {
    await updateDoc(doc(db, "estilos", id), datos);
  }

  /** Eliminar un estilo */
  async function eliminarEstilo(id: string) {
    await deleteDoc(doc(db, "estilos", id));
  }

  return {
    estilos,
    cargando,
    crearEstilo,
    actualizarEstilo,
    eliminarEstilo,
  };
}
