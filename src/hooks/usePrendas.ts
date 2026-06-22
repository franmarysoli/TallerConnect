/**
 * usePrendas.ts — Hook para gestión de prendas
 * 
 * Maneja: crear prendas (con descuento de stock), cambiar estado,
 * eliminar prendas (con devolución de stock), obtener prendas por cliente,
 * y medidas históricas.
 */

import { useState, useEffect, useCallback } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
  orderBy,
  arrayUnion,
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
  notas?: string;
}

/** Hook para gestión de prendas */
export function usePrendas(filtroClienteId?: string) {
  const [prendas, setPrendas] = useState<Prenda[]>([]);
  const [cargando, setCargando] = useState(true);
  const { descontarStock, devolverStock } = useTelas();
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
      ...(datos.notas ? { notas: datos.notas } : {}),
    };

    await addDoc(collection(db, "prendas"), nuevaPrenda);
  }, [descontarStock]);

  /**
   * Actualiza una prenda existente y ajusta el stock de tela si es necesario
   */
  const actualizarPrenda = useCallback(async (
    prendaId: string,
    datosViejos: Prenda,
    datosNuevos: DatosNuevaPrenda
  ) => {
    // 1. Ajustar stock si cambió la tela o los metros
    if (datosViejos.telaId !== datosNuevos.telaId) {
      await devolverStock(datosViejos.telaId, datosViejos.metrosUsados);
      await descontarStock(datosNuevos.telaId, datosNuevos.metrosUsados);
    } else if (datosViejos.metrosUsados !== datosNuevos.metrosUsados) {
      const diferencia = datosNuevos.metrosUsados - datosViejos.metrosUsados;
      if (diferencia > 0) {
        await descontarStock(datosNuevos.telaId, diferencia);
      } else if (diferencia < 0) {
        await devolverStock(datosNuevos.telaId, Math.abs(diferencia));
      }
    }

    // 2. Calcular nuevos costos
    const costoTela = datosNuevos.metrosUsados * datosNuevos.precioMetro;
    const costoTotal = costoTela + datosNuevos.costoManoObra;

    // 3. Actualizar documento
    const ref = doc(db, "prendas", prendaId);
    await updateDoc(ref, {
      clienteId: datosNuevos.clienteId,
      clienteNombre: datosNuevos.clienteNombre,
      telaId: datosNuevos.telaId,
      telaNombre: datosNuevos.telaNombre,
      estiloId: datosNuevos.estiloId,
      estiloNombre: datosNuevos.estiloNombre,
      metrosUsados: datosNuevos.metrosUsados,
      costoTela,
      costoManoObra: datosNuevos.costoManoObra,
      costoTotal,
      medidas: datosNuevos.medidas,
      notas: datosNuevos.notas || "",
    });
  }, [descontarStock, devolverStock]);

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

    // Construir el nuevo registro de historial
    const nuevoRegistro = {
      estadoAnterior,
      estadoNuevo,
      fecha: Timestamp.now(),
    };

    // Si la prenda se marca como terminada, registrar fecha y notificar
    if (estadoNuevo === "terminado") {
      notificarPrendaTerminada(
        correoCliente,
        nombreCliente,
        `Prenda #${prendaId.slice(0, 6)}`
      );
    }

    // Actualizar estado e historial en Firestore usando arrayUnion
    await updateDoc(ref, {
      estado: estadoNuevo,
      historialEstados: arrayUnion(nuevoRegistro),
      ...(estadoNuevo === "terminado" ? { fechaTerminado: Timestamp.now() } : {}),
    });

    console.log(`📋 Estado cambiado: ${estadoAnterior} → ${estadoNuevo}`);
  }, [notificarPrendaTerminada]);

  /**
   * Elimina una prenda y devuelve el stock de tela utilizado.
   */
  const eliminarPrenda = useCallback(async (prendaId: string) => {
    // Buscar la prenda en el estado local
    let prenda = prendas.find((p) => p.id === prendaId);

    // Si no está en el estado local, obtenerla directamente de Firestore
    if (!prenda) {
      const docSnap = await getDoc(doc(db, "prendas", prendaId));
      if (!docSnap.exists()) {
        throw new Error("Prenda no encontrada.");
      }
      prenda = { id: docSnap.id, ...docSnap.data() } as Prenda;
    }

    // Devolver el stock de tela
    await devolverStock(prenda.telaId, prenda.metrosUsados);

    // Eliminar el documento de Firestore
    await deleteDoc(doc(db, "prendas", prendaId));

    console.log(`🗑️ Prenda ${prendaId} eliminada. Stock devuelto: ${prenda.metrosUsados}m de tela ${prenda.telaNombre}.`);
  }, [prendas, devolverStock]);

  return {
    prendas,
    cargando,
    crearPrenda,
    actualizarPrenda,
    cambiarEstado,
    eliminarPrenda,
  };
}
