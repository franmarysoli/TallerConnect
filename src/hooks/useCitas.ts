/**
 * useCitas.ts — Hook para gestión de citas
 * 
 * Maneja: crear, reprogramar, cancelar citas.
 * Valida que no haya solapamiento de horarios.
 */

import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  getDocs,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebase/config";
import type { Cita } from "../types";
import { useNotificaciones } from "./useNotificaciones";

/** Hook para gestión de citas */
export function useCitas(filtroClienteId?: string) {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [cargando, setCargando] = useState(true);
  const { notificarCita } = useNotificaciones();

  // Escuchar citas en tiempo real
  useEffect(() => {
    let q;
    if (filtroClienteId) {
      q = query(
        collection(db, "citas"),
        where("clienteId", "==", filtroClienteId),
        orderBy("fecha", "asc")
      );
    } else {
      q = query(
        collection(db, "citas"),
        orderBy("fecha", "asc")
      );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const datos: Cita[] = [];
      snapshot.forEach((docSnap) => {
        datos.push({ id: docSnap.id, ...docSnap.data() } as Cita);
      });
      setCitas(datos);
      setCargando(false);
    });

    return () => unsubscribe();
  }, [filtroClienteId]);

  /**
   * Verifica si un horario ya está ocupado por otra cita (no cancelada)
   * @returns true si el horario está disponible, false si está ocupado
   */
  async function horarioDisponible(
    fecha: string,
    hora: string,
    citaIdExcluir?: string
  ): Promise<boolean> {
    const q = query(
      collection(db, "citas"),
      where("fecha", "==", fecha),
      where("hora", "==", hora),
      where("estado", "!=", "cancelada")
    );

    const snapshot = await getDocs(q);

    // Filtrar la cita actual si estamos editando
    const citasEnHorario = snapshot.docs.filter(
      (docSnap) => docSnap.id !== citaIdExcluir
    );

    return citasEnHorario.length === 0;
  }

  /**
   * Crea una nueva cita tras validar disponibilidad del horario
   */
  async function crearCita(
    cita: Omit<Cita, "id">,
    correoCliente: string
  ) {
    // Validar que el horario esté disponible
    const disponible = await horarioDisponible(cita.fecha, cita.hora);
    if (!disponible) {
      throw new Error(
        `El horario ${cita.hora} del ${cita.fecha} ya está ocupado. Elige otro horario.`
      );
    }

    await addDoc(collection(db, "citas"), cita);

    // Notificar al cliente
    notificarCita(
      correoCliente,
      cita.clienteNombre,
      "agendada",
      cita.fecha,
      cita.hora,
      cita.tipo
    );
  }

  /**
   * Reprograma una cita existente (cambia fecha, hora, o tipo)
   */
  async function reprogramarCita(
    citaId: string,
    nuevaFecha: string,
    nuevaHora: string,
    nuevoTipo: string,
    observaciones: string,
    correoCliente: string,
    nombreCliente: string
  ) {
    // Validar que el nuevo horario esté disponible
    const disponible = await horarioDisponible(
      nuevaFecha,
      nuevaHora,
      citaId // Excluir la cita actual de la validación
    );

    if (!disponible) {
      throw new Error(
        `El horario ${nuevaHora} del ${nuevaFecha} ya está ocupado. Elige otro horario.`
      );
    }

    await updateDoc(doc(db, "citas", citaId), {
      fecha: nuevaFecha,
      hora: nuevaHora,
      tipo: nuevoTipo,
      observaciones,
    });

    // Notificar al cliente
    notificarCita(
      correoCliente,
      nombreCliente,
      "modificada",
      nuevaFecha,
      nuevaHora,
      nuevoTipo
    );
  }

  /**
   * Cancela una cita (cambia su estado a "cancelada")
   */
  async function cancelarCita(
    citaId: string,
    correoCliente: string,
    nombreCliente: string,
    fecha: string,
    hora: string,
    tipo: string
  ) {
    await updateDoc(doc(db, "citas", citaId), {
      estado: "cancelada",
    });

    // Notificar al cliente
    notificarCita(
      correoCliente,
      nombreCliente,
      "cancelada",
      fecha,
      hora,
      tipo
    );
  }

  /** Elimina una cita completamente (solo el sastre) */
  async function eliminarCita(citaId: string) {
    await deleteDoc(doc(db, "citas", citaId));
  }

  return {
    citas,
    cargando,
    crearCita,
    reprogramarCita,
    cancelarCita,
    eliminarCita,
    horarioDisponible,
  };
}
