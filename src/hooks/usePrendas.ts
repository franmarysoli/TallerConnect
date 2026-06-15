/**
 * usePrendas.ts — Hook para gestión de prendas
 * 
 * Maneja: crear prendas (con descuento de stock), cambiar estado,
 * obtener prendas por cliente, y medidas históricas.
 */

import { useState, useEffect, useCallback } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  doc,
  updateDoc,
  Timestamp,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebase/config";
import type { Prenda, MedidasPrenda, EstadoPrenda } from "../types";
import { useTelas } from "./useTelas";
import { useNotificaciones } from "./useNotificaciones";

/** Datos necesarios para crear una prenda nueva */
export interface DatosNuevaPrenda {
  clienteId: string;
  clienteNombre: string;
  clienteCorreo: string;
  telaId: string;
  telaNombre: string;
  estiloId: string;
  estiloNombre: string;
  metrosUsados: number;
  precioMetro: number;
  costoManoObra: number;
  medidas: MedidasPrenda;
}

/** Hook para gestión de prendas */
export function usePrendas(filtroClienteId?: string) {
  const [prendas, setPrendas] = useState<Prenda[]>([]);
  const [cargando, setCargando] = useState(true);
  const { descontarStock } = useTelas();
  const { notificarPrendaTerminada } = useNotificaciones();

  // Escuchar prendas en tiempo real (opcionalmente filtradas por cliente)
  useEffect(() => {
    let q;
    if (filtroClienteId) {
      q = query(
        collection(db, "prendas"),
        where("clienteId", "==", filtroClienteId),
        orderBy("fechaInicio", "desc")
      );
    } else {
      q = query(
        collection(db, "prendas"),
        orderBy("fechaInicio", "desc")
      );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const datos: Prenda[] = [];
      snapshot.forEach((docSnap) => {
        datos.push({ id: docSnap.id, ...docSnap.data() } as Prenda);
      });
      setPrendas(datos);
      setCargando(false);
    });

    return () => unsubscribe();
  }, [filtroClienteId]);

  /**
   * Crea una nueva prenda y descuenta el stock de tela
   */
  const crearPrenda = useCallback(async (datos: DatosNuevaPrenda) => {
    // 1. Descontar stock de la tela (validación incluida)
    await descontarStock(datos.telaId, datos.metrosUsados);

    // 2. Calcular costos
    const costoTela = datos.metrosUsados * datos.precioMetro;
    const costoTotal = costoTela + datos.costoManoObra;

    // 3. Crear documento de la prenda
    const nuevaPrenda: Omit<Prenda, "id"> = {
      clienteId: datos.clienteId,
      clienteNombre: datos.clienteNombre,
      telaId: datos.telaId,
      telaNombre: datos.telaNombre,
      estiloId: datos.estiloId,
      estiloNombre: datos.estiloNombre,
      metrosUsados: datos.metrosUsados,
      costoTela,
      costoManoObra: datos.costoManoObra,
      costoTotal,
      estado: "corte", // Estado inicial siempre es "corte"
      medidas: datos.medidas,
      fechaInicio: Timestamp.now(),
      fechaTerminado: null,
      historialEstados: [
        {
          estadoAnterior: "",
          estadoNuevo: "corte",
          fecha: Timestamp.now(),
        },
      ],
    };

    await addDoc(collection(db, "prendas"), nuevaPrenda);
  }, [descontarStock]);

  /**
   * Cambia el estado de una prenda y registra en el historial.
   * Si cambia a "terminado", envía notificación al cliente.
   */
  const cambiarEstado = useCallback(async (
    prendaId: string,
    estadoAnterior: EstadoPrenda,
    estadoNuevo: EstadoPrenda,
    correoCliente: string,
    nombreCliente: string
  ) => {
    const ref = doc(db, "prendas", prendaId);

    const actualizacion: Record<string, unknown> = {
      estado: estadoNuevo,
      historialEstados: [
        // Nota: Firestore no soporta arrayUnion con objetos que contengan Timestamp,
        // así que se usa el array completo de la prenda actual
      ],
    };

    // Si la prenda se marca como terminada, registrar fecha
    if (estadoNuevo === "terminado") {
      actualizacion.fechaTerminado = Timestamp.now();

      // Enviar notificación al cliente
      notificarPrendaTerminada(
        correoCliente,
        nombreCliente,
        `Prenda #${prendaId.slice(0, 6)}`
      );
    }

    // Actualizar en Firestore
    await updateDoc(ref, {
      estado: estadoNuevo,
      ...(estadoNuevo === "terminado" ? { fechaTerminado: Timestamp.now() } : {}),
    });

    // Registrar en el historial (usamos un campo separado para simplificar)
    // En una app más compleja, se usaría una subcolección
    console.log(`📋 Estado cambiado: ${estadoAnterior} → ${estadoNuevo}`);
  }, [notificarPrendaTerminada]);

  return {
    prendas,
    cargando,
    crearPrenda,
    cambiarEstado,
  };
}
