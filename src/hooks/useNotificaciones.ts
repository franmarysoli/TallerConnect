/**
 * useNotificaciones.ts — Hook para notificaciones con EmailJS
 * 
 * Envía correos reales a través de EmailJS.
 * Requiere configurar las variables de entorno en .env:
 * - VITE_EMAILJS_SERVICE_ID
 * - VITE_EMAILJS_TEMPLATE_ID
 * - VITE_EMAILJS_PUBLIC_KEY
 */

import emailjs from '@emailjs/browser';
import { useToast } from '../context/ToastContext';
import { useCallback } from 'react';

/** Hook que expone funciones para enviar notificaciones reales */
export function useNotificaciones() {
  const { showToast } = useToast();

  const enviarEmail = useCallback(async (
    to_email: string,
    to_name: string,
    subject: string,
    message: string
  ) => {
    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

    if (!serviceId || !templateId || !publicKey) {
      console.warn("Faltan variables de entorno para EmailJS. No se enviará el correo.");
      showToast("Las notificaciones por correo no están configuradas correctamente.", "info");
      return;
    }

    try {
      await emailjs.send(
        serviceId,
        templateId,
        {
          to_email,
          to_name,
          subject,
          message,
        },
        publicKey
      );
      console.log(`✅ Correo enviado a ${to_email}: ${subject}`);
    } catch (error) {
      console.error("Error enviando email con EmailJS:", error);
      showToast(`No se pudo enviar el correo a ${to_email}.`, "error");
    }
  }, [showToast]);

  /**
   * Notifica al cliente cuando su prenda cambia a "terminado"
   */
  const notificarPrendaTerminada = useCallback((
    correoCliente: string,
    nombreCliente: string,
    nombrePrenda: string
  ) => {
    const subject = "¡Tu prenda está lista! — TallerConnect";
    const message = `Hola ${nombreCliente},\n\nTu prenda "${nombrePrenda}" ha sido completada.\n\nPuedes agendar una cita de entrega desde tu panel en TallerConnect.\n\n¡Gracias por preferirnos!`;
    
    enviarEmail(correoCliente, nombreCliente, subject, message);
  }, [enviarEmail]);

  /**
   * Notifica al cliente sobre cambios en sus citas
   */
  const notificarCita = useCallback((
    correoCliente: string,
    nombreCliente: string,
    accion: "agendada" | "modificada" | "cancelada",
    fecha: string,
    hora: string,
    tipo: string
  ) => {
    const asuntos = {
      agendada: "Cita agendada exitosamente",
      modificada: "Tu cita ha sido reprogramada",
      cancelada: "Tu cita ha sido cancelada",
    };

    const subject = `${asuntos[accion]} — TallerConnect`;
    const message = `Hola ${nombreCliente},\n\nTu cita de ${tipo} ha sido ${accion}.\n\nFecha: ${fecha} a las ${hora}\n\nSi tienes alguna duda, contáctanos.\n\nSaludos.`;

    enviarEmail(correoCliente, nombreCliente, subject, message);
  }, [enviarEmail]);

  return {
    notificarPrendaTerminada,
    notificarCita,
  };
}
