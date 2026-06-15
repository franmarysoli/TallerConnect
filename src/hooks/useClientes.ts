/**
 * useClientes.ts — Hook para gestión de clientes
 * 
 * Provee funciones CRUD para la colección "usuarios" (rol = "cliente").
 * Usa onSnapshot para datos en tiempo real.
 */

import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  getDocs,
  writeBatch,
} from "firebase/firestore";
import { db } from "../firebase/config";
import type { Usuario } from "../types";

/** Hook para CRUD de clientes (solo el sastre lo usa) */
export function useClientes() {
  const [clientes, setClientes] = useState<Usuario[]>([]);
  const [cargando, setCargando] = useState(true);

  // Escuchar en tiempo real los cambios en la colección de clientes
  useEffect(() => {
    const q = query(
      collection(db, "usuarios"),
      where("rol", "==", "cliente")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const datos: Usuario[] = [];
      snapshot.forEach((docSnap) => {
        datos.push(docSnap.data() as Usuario);
      });
      setClientes(datos);
      setCargando(false);
    });

    return () => unsubscribe();
  }, []);

  /**
   * Actualiza los datos de un cliente en Firestore
   * (no se puede cambiar cédula ni contraseña desde aquí)
   */
  async function actualizarCliente(
    uid: string,
    datos: Partial<Pick<Usuario, "nombre" | "correo" | "celular">>
  ) {
    const ref = doc(db, "usuarios", uid);
    await updateDoc(ref, datos);
  }

  /**
   * Elimina un cliente y todos sus datos relacionados (prendas y citas)
   * Usa batch para eliminar todo atómicamente
   */
  async function eliminarCliente(uid: string) {
    const batch = writeBatch(db);

    // 1. Eliminar todas las prendas del cliente
    const prendasQuery = query(
      collection(db, "prendas"),
      where("clienteId", "==", uid)
    );
    const prendasSnap = await getDocs(prendasQuery);
    prendasSnap.forEach((docSnap) => {
      batch.delete(docSnap.ref);
    });

    // 2. Eliminar todas las citas del cliente
    const citasQuery = query(
      collection(db, "citas"),
      where("clienteId", "==", uid)
    );
    const citasSnap = await getDocs(citasQuery);
    citasSnap.forEach((docSnap) => {
      batch.delete(docSnap.ref);
    });

    // 3. Eliminar el documento del usuario
    batch.delete(doc(db, "usuarios", uid));

    // Ejecutar todas las eliminaciones
    await batch.commit();
  }

  /**
   * Verifica si una cédula ya existe en Firestore
   * (útil para validar unicidad al registrar)
   */
  async function cedulaExiste(cedula: string): Promise<boolean> {
    const q = query(
      collection(db, "usuarios"),
      where("cedula", "==", cedula)
    );
    const snap = await getDocs(q);
    return !snap.empty;
  }

  return {
    clientes,
    cargando,
    actualizarCliente,
    eliminarCliente,
    cedulaExiste,
  };
}
