/**
 * helpers.ts — Funciones utilitarias para TallerConnect
 * 
 * Funciones de formato, validación y utilidades generales.
 */

// ============================================================
// Formato de fechas
// ============================================================

/** Formatea una fecha a formato legible en español (ej: "13 de junio de 2026") */
export function formatearFecha(fecha: string): string {
  const opciones: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return new Date(fecha + "T12:00:00").toLocaleDateString("es-ES", opciones);
}

/** Formatea fecha corta (ej: "13/06/2026") */
export function formatearFechaCorta(fecha: string): string {
  return new Date(fecha + "T12:00:00").toLocaleDateString("es-ES");
}

// ============================================================
// Formato de moneda
// ============================================================

/** Formatea un número como moneda (ej: "$15,000.00") */
export function formatearMoneda(valor: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(valor);
}

// ============================================================
// Validaciones
// ============================================================

/** Valida que una cédula contenga solo números y tenga entre 5 y 15 dígitos */
export function validarCedula(cedula: string): boolean {
  return /^\d{5,15}$/.test(cedula);
}

/** Valida formato de correo electrónico */
export function validarCorreo(correo: string): boolean {
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(correo);
}

/** Valida que la contraseña tenga al menos 6 caracteres */
export function validarPassword(password: string): boolean {
  return password.length >= 6;
}

/** Valida un número de celular (opcional, pero si se ingresa debe tener formato válido) */
export function validarCelular(celular: string): boolean {
  if (!celular) return true; // El celular es opcional
  return /^\d{7,15}$/.test(celular);
}

// ============================================================
// Utilidades generales
// ============================================================

/** Obtiene la fecha actual en formato "YYYY-MM-DD" */
export function fechaHoy(): string {
  return new Date().toISOString().split("T")[0];
}

/** Capitaliza la primera letra de un texto */
export function capitalizar(texto: string): string {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}
