/**
 * constantes.ts — Constantes del sistema TallerConnect
 * 
 * Centraliza valores que se usan en múltiples componentes:
 * estados, medidas, horarios, colores, etc.
 */

import { Scissors, Ruler, Shirt, CheckCircle } from 'lucide-react';

// ============================================================
// Estados de las prendas con sus colores asociados
// ============================================================
export const ESTADOS_PRENDA = [
  { valor: "corte",     etiqueta: "Corte",     color: "#FF385C", icono: <Scissors size={16} /> },
  { valor: "costura",   etiqueta: "Costura",   color: "#D97706", icono: <Ruler size={16} /> },
  { valor: "prueba",    etiqueta: "Prueba",    color: "#FF8E8E", icono: <Shirt size={16} /> },
  { valor: "terminado", etiqueta: "Terminado", color: "#10b981", icono: <CheckCircle size={16} /> },
] as const;

// ============================================================
// Nombres de las medidas que se registran por prenda
// ============================================================
export const MEDIDAS_DISPONIBLES = [
  { clave: "cuello",     etiqueta: "Cuello",       unidad: "cm" },
  { clave: "talle",      etiqueta: "Talle",        unidad: "cm" },
  { clave: "mangas",     etiqueta: "Mangas",       unidad: "cm" },
  { clave: "pecho",      etiqueta: "Pecho",        unidad: "cm" },
  { clave: "cintura",    etiqueta: "Cintura",      unidad: "cm" },
  { clave: "largoTotal", etiqueta: "Largo Total",  unidad: "cm" },
  { clave: "cadera",     etiqueta: "Cadera",       unidad: "cm" },
  { clave: "hombros",    etiqueta: "Hombros",      unidad: "cm" },
] as const;

// ============================================================
// Horarios disponibles para citas (de 8am a 6pm)
// ============================================================
export const HORARIOS_DISPONIBLES = [
  "08:00", "09:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00", "17:00", "18:00",
] as const;

// ============================================================
// Tipos y estados de citas
// ============================================================
export const TIPOS_CITA_CLIENTE = [
  { valor: "consulta", etiqueta: "Consulta Inicial" },
  { valor: "toma_medidas", etiqueta: "Toma de Medidas" },
] as const;

export const TIPOS_CITA_SASTRE = [
  { valor: "consulta", etiqueta: "Consulta Inicial" },
  { valor: "toma_medidas", etiqueta: "Toma de Medidas" },
  { valor: "prueba",  etiqueta: "Prueba de Prenda" },
  { valor: "entrega", etiqueta: "Entrega Final" },
] as const;

export const TIPOS_CITA = TIPOS_CITA_SASTRE;

export const ESTADOS_CITA = [
  { valor: "pendiente",  etiqueta: "Pendiente",  color: "#f59e0b" },
  { valor: "confirmada", etiqueta: "Confirmada", color: "#10b981" },
  { valor: "completada", etiqueta: "Completada", color: "#3b82f6" },
  { valor: "cancelada",  etiqueta: "Cancelada",  color: "#ef4444" },
] as const;

// ============================================================
// Umbral de stock bajo para telas (en metros)
// ============================================================
export const STOCK_BAJO_METROS = 5;
