/**
 * types/index.ts — Interfaces y tipos para TallerConnect
 * 
 * Define la estructura de datos de todas las entidades del sistema.
 * Estas interfaces se usan en Firestore y en los componentes React.
 */

import type { Timestamp } from "firebase/firestore";

// ============================================================
// Usuario (colección "usuarios" en Firestore)
// ============================================================
/** Representa un usuario del sistema (sastre o cliente) */
export interface Usuario {
  uid: string;                      // UID de Firebase Auth
  cedula: string;                   // Cédula única del cliente
  nombre: string;                   // Nombre completo
  correo: string;                   // Correo electrónico
  celular: string;                  // Celular (puede estar vacío)
  rol: "sastre" | "cliente";        // Rol del usuario
  fechaRegistro: Timestamp;         // Fecha de registro
}

// ============================================================
// Tela (colección "telas" en Firestore)
// ============================================================
/** Representa una tela en el inventario */
export interface Tela {
  id?: string;                      // ID del documento (auto-generado)
  nombre: string;                   // Nombre de la tela
  metrosDisponibles: number;        // Metros en stock (decimal)
  precioMetro: number;              // Precio por metro (decimal)
}

// ============================================================
// Estilo (colección "estilos" en Firestore)
// ============================================================
/** Representa un estilo de confección */
export interface Estilo {
  id?: string;                      // ID del documento
  nombre: string;                   // Nombre del estilo
  descripcion: string;              // Descripción (puede estar vacía)
}

// ============================================================
// Medidas de una prenda
// ============================================================
/** Medidas corporales asociadas a una prenda */
export interface MedidasPrenda {
  cuello: number;
  talle: number;
  mangas: number;
  pecho: number;
  cintura: number;
  largoTotal: number;
  cadera: number;
  hombros: number;
}

// ============================================================
// Historial de cambios de estado
// ============================================================
/** Registro de un cambio de estado en una prenda */
export interface HistorialEstado {
  estadoAnterior: string;
  estadoNuevo: string;
  fecha: Timestamp;
}

// ============================================================
// Prenda (colección "prendas" en Firestore)
// ============================================================
/** Los posibles estados de una prenda en el taller */
export type EstadoPrenda = "corte" | "costura" | "prueba" | "terminado";

/** Representa una prenda en confección */
export interface Prenda {
  id?: string;                      // ID del documento
  clienteId: string;                // UID del cliente dueño
  clienteNombre: string;            // Nombre del cliente (denormalizado)
  telaId: string;                   // ID de la tela usada
  telaNombre: string;               // Nombre de la tela (denormalizado)
  estiloId: string;                 // ID del estilo
  estiloNombre: string;             // Nombre del estilo (denormalizado)
  metrosUsados: number;             // Metros de tela utilizados
  costoTela: number;                // metros × precio (calculado)
  costoManoObra: number;            // Costo de mano de obra
  costoTotal: number;               // costoTela + costoManoObra
  estado: EstadoPrenda;             // Estado actual
  medidas: MedidasPrenda;           // Medidas de la prenda
  fechaInicio: Timestamp;           // Fecha de inicio de confección
  fechaTerminado: Timestamp | null; // Fecha de finalización (si aplica)
  historialEstados: HistorialEstado[]; // Historial de cambios de estado
  notas?: string;                   // Notas / Observaciones opcionales del sastre
}

// ============================================================
// Cita (colección "citas" en Firestore)
// ============================================================
/** Tipos de cita disponibles */
export type TipoCita = "prueba" | "entrega";

/** Estados posibles de una cita */
export type EstadoCita = "pendiente" | "confirmada" | "cancelada";

/** Representa una cita agendada */
export interface Cita {
  id?: string;                      // ID del documento
  clienteId: string;                // UID del cliente
  clienteNombre: string;            // Nombre del cliente (denormalizado)
  fecha: string;                    // Fecha en formato "YYYY-MM-DD"
  hora: string;                     // Hora en formato "HH:00"
  tipo: TipoCita;                   // Tipo de cita
  estado: EstadoCita;               // Estado de la cita
  observaciones: string;            // Notas adicionales
}
