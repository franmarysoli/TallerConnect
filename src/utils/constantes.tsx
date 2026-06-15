/**
 * constantes.ts — Constantes del sistema TallerConnect
 * 
 * Centraliza valores que se usan en múltiples componentes:
 * estados, medidas, horarios, colores, etc.
 */

import React from 'react';
import { Scissors, Ruler, Shirt, CheckCircle } from 'lucide-react';

// ============================================================
// Estados de las prendas con sus colores asociados
// ============================================================
export const ESTADOS_PRENDA = [
  { valor: "corte",     etiqueta: "Corte",     color: "#BE185D", icono: <Scissors size={16} /> },
  { valor: "costura",   etiqueta: "Costura",   color: "#D97706", icono: <Ruler size={16} /> },
  { valor: "prueba",    etiqueta: "Prueba",    color: "#EC4899", icono: <Shirt size={16} /> },
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
export const TIPOS_CITA = [
  { valor: "prueba",  etiqueta: "Prueba" },
  { valor: "entrega", etiqueta: "Entrega" },
] as const;

export const ESTADOS_CITA = [
  { valor: "pendiente",  etiqueta: "Pendiente",  color: "#f59e0b" },
  { valor: "confirmada", etiqueta: "Confirmada", color: "#10b981" },
  { valor: "cancelada",  etiqueta: "Cancelada",  color: "#ef4444" },
] as const;

// ============================================================
// Umbral de stock bajo para telas (en metros)
// ============================================================
export const STOCK_BAJO_METROS = 5;
