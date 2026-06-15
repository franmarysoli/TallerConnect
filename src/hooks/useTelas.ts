/**
 * useTelas.ts — Hook para gestión de telas (inventario)
 * 
 * CRUD completo + control de stock con transacciones atómicas.
 */

import { useState, useEffect } from "react";
import {
  collection,
  onSnapshot,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  runTransaction,
} from "firebase/firestore";
import { db } from "../firebase/config";
import type { Tela } from "../types";

/** Hook para CRUD de telas */
export function useTelas() {
  const [telas, setTelas] = useState<Tela[]>([]);
  const [cargando, setCargando] = useState(true);

  // Escuchar cambios en tiempo real
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "telas"), (snapshot) => {
      const datos: Tela[] = [];
      snapshot.forEach((docSnap) => {
        datos.push({ id: docSnap.id, ...docSnap.data() } as Tela);
      });
      setTelas(datos);
      setCargando(false);
    });

    return () => unsubscribe();
  }, []);

  /** Crear una nueva tela */
  async function crearTela(tela: Omit<Tela, "id">) {
    await addDoc(collection(db, "telas"), tela);
  }

  /** Actualizar una tela existente (nombre, precio, o reponer stock) */
  async function actualizarTela(id: string, datos: Partial<Tela>) {
    const ref = doc(db, "telas", id);
    await updateDoc(ref, datos);
  }

  /** Eliminar una tela del inventario */
  async function eliminarTela(id: string) {
    await deleteDoc(doc(db, "telas", id));
  }

  /**
   * Descuenta metros del stock de una tela usando una transacción atómica.
   * Valida que haya suficiente stock antes de descontar.
   * 
   * @returns true si se descontó exitosamente, false si no hay stock suficiente
   */
  async function descontarStock(telaId: string, metros: number): Promise<boolean> {
    const telaRef = doc(db, "telas", telaId);

    try {
      await runTransaction(db, async (transaction) => {
        const telaDoc = await transaction.get(telaRef);

        if (!telaDoc.exists()) {
          throw new Error("La tela no existe");
        }

        const stockActual = telaDoc.data().metrosDisponibles;

        if (stockActual < metros) {
          throw new Error(
            `Stock insuficiente. Disponible: ${stockActual}m, solicitado: ${metros}m`
          );
        }

        // Descontar los metros usados
        transaction.update(telaRef, {
          metrosDisponibles: stockActual - metros,
        });
      });

      return true;
    } catch (error) {
      console.error("Error al descontar stock:", error);
      throw error;
    }
  }

  /**
   * Devuelve metros al stock (cuando se elimina o edita una prenda)
   */
  async function devolverStock(telaId: string, metros: number) {
    const telaRef = doc(db, "telas", telaId);

    await runTransaction(db, async (transaction) => {
      const telaDoc = await transaction.get(telaRef);
      if (!telaDoc.exists()) return;

      const stockActual = telaDoc.data().metrosDisponibles;
      transaction.update(telaRef, {
        metrosDisponibles: stockActual + metros,
      });
    });
  }

  return {
    telas,
    cargando,
    crearTela,
    actualizarTela,
    eliminarTela,
    descontarStock,
    devolverStock,
  };
}
