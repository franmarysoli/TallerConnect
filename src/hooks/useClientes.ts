/**
 * useClientes.ts — Hook para gestión de clientes con paginación
 */

import { useState, useEffect, useCallback } from "react";
import {
  collection,
  query,
  where,
  doc,
  updateDoc,
  getDocs,
  writeBatch,
  limit,
  startAfter,
  orderBy,
  type QueryDocumentSnapshot,
  type DocumentData,
} from "firebase/firestore";
import { db } from "../firebase/config";
import type { Usuario } from "../types";
import { useToast } from "../context/ToastContext";

/** Hook para CRUD de clientes con paginación */
export function useClientes(pageSize = 10) {
  const [clientes, setClientes] = useState<Usuario[]>([]);
  const [cargando, setCargando] = useState(true);
  const { showToast } = useToast();

  // Paginación cursores
  const [lastDocs, setLastDocs] = useState<QueryDocumentSnapshot<DocumentData>[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // Cargar clientes
  const fetchClientes = useCallback(async (pageIndex: number, reset = false) => {
    setCargando(true);
    try {
      let q = query(
        collection(db, "usuarios"),
        where("rol", "==", "cliente"),
        orderBy("nombre", "asc"),
        limit(pageSize)
      );

      // Si no es la primera página y no estamos reseteando
      if (pageIndex > 0 && !reset && lastDocs[pageIndex - 1]) {
        q = query(q, startAfter(lastDocs[pageIndex - 1]));
      }

      const snapshot = await getDocs(q);
      const datos: Usuario[] = [];
      snapshot.forEach((docSnap) => {
        datos.push(docSnap.data() as Usuario);
      });

      setClientes(datos);
      setHasMore(snapshot.docs.length === pageSize);

      if (snapshot.docs.length > 0) {
        setLastDocs(prev => {
          const newDocs = [...prev];
          newDocs[pageIndex] = snapshot.docs[snapshot.docs.length - 1];
          return newDocs;
        });
      }
    } catch (error) {
      console.error("Error al cargar clientes:", error);
      showToast("Hubo un error al cargar la lista de clientes.", "error");
    } finally {
      setCargando(false);
    }
  }, [pageSize, lastDocs, showToast]);

  // Carga inicial
  useEffect(() => {
    fetchClientes(0, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const nextPage = () => {
    if (hasMore && !cargando) {
      const next = currentPage + 1;
      setCurrentPage(next);
      fetchClientes(next);
    }
  };

  const prevPage = () => {
    if (currentPage > 0 && !cargando) {
      const prev = currentPage - 1;
      setCurrentPage(prev);
      fetchClientes(prev);
    }
  };

  const recargarActual = () => {
    fetchClientes(currentPage);
  };

  async function actualizarCliente(
    uid: string,
    datos: Partial<Pick<Usuario, "nombre" | "correo" | "celular">>
  ) {
    try {
      const ref = doc(db, "usuarios", uid);
      await updateDoc(ref, datos);
      showToast("Cliente actualizado correctamente", "success");
      recargarActual(); // Refrescar vista
    } catch (error) {
      showToast("Error al actualizar cliente", "error");
      throw error;
    }
  }

  async function eliminarCliente(uid: string) {
    try {
      const batch = writeBatch(db);

      const prendasQuery = query(collection(db, "prendas"), where("clienteId", "==", uid));
      const prendasSnap = await getDocs(prendasQuery);
      prendasSnap.forEach((docSnap) => batch.delete(docSnap.ref));

      const citasQuery = query(collection(db, "citas"), where("clienteId", "==", uid));
      const citasSnap = await getDocs(citasQuery);
      citasSnap.forEach((docSnap) => batch.delete(docSnap.ref));

      batch.delete(doc(db, "usuarios", uid));
      await batch.commit();

      showToast("Cliente y sus datos eliminados", "success");
      
      // Si era el último de la página, retroceder si es posible
      if (clientes.length === 1 && currentPage > 0) {
        const prev = currentPage - 1;
        setCurrentPage(prev);
        fetchClientes(prev);
      } else {
        recargarActual();
      }
    } catch (error) {
      showToast("Error al eliminar cliente", "error");
      throw error;
    }
  }

  async function cedulaExiste(cedula: string): Promise<boolean> {
    const q = query(collection(db, "usuarios"), where("cedula", "==", cedula));
    const snap = await getDocs(q);
    return !snap.empty;
  }

  return {
    clientes,
    cargando,
    actualizarCliente,
    eliminarCliente,
    cedulaExiste,
    currentPage,
    hasMore,
    nextPage,
    prevPage,
    recargarActual
  };
}
