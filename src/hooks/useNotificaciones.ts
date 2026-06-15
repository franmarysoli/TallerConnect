/**
 * useNotificaciones.ts — Hook para notificaciones simuladas
 * 
 * Simula el envío de correos electrónicos mediante console.log.
 * En producción, se puede reemplazar con EmailJS u otro servicio.
 * 
 * ============================================================
 * CÓMO INTEGRAR EMAILJS (envío real de correos):
 * 
 * 1. Crear cuenta en https://www.emailjs.com (plan gratuito: 200 emails/mes)
 * 2. Crear un servicio de email (conectar con Gmail, Outlook, etc.)
 * 3. Crear una plantilla de email
 * 4. Instalar: npm install @emailjs/browser
 * 5. Reemplazar los console.log por:
 * 
 *    import emailjs from '@emailjs/browser';
 *    emailjs.send('SERVICE_ID', 'TEMPLATE_ID', {
 *      to_email: destinatario,
 *      to_name: nombre,
 *      subject: asunto,
 *      message: cuerpo,
 *    }, 'PUBLIC_KEY');
 * 
 * ============================================================
 */

/** Hook que expone funciones para enviar notificaciones simuladas */
export function useNotificaciones() {

  /**
   * Notifica al cliente cuando su prenda cambia a "terminado"
   */
  function notificarPrendaTerminada(
    correoCliente: string,
    nombreCliente: string,
    nombrePrenda: string
  ) {
    console.log("═══════════════════════════════════════════════════");
    console.log("📧 [CORREO SIMULADO] — Prenda Terminada");
    console.log("───────────────────────────────────────────────────");
    console.log(`  Para: ${correoCliente}`);
    console.log(`  Asunto: ¡Tu prenda está lista! — TallerConnect`);
    console.log(`  Cuerpo:`);
    console.log(`  Hola ${nombreCliente},`);
    console.log(`  Tu prenda "${nombrePrenda}" ha sido completada.`);
    console.log(`  Puedes agendar una cita de entrega desde tu panel.`);
    console.log("═══════════════════════════════════════════════════");
  }

  /**
   * Notifica al cliente sobre cambios en sus citas
   */
  function notificarCita(
    correoCliente: string,
    nombreCliente: string,
    accion: "agendada" | "modificada" | "cancelada",
    fecha: string,
    hora: string,
    tipo: string
  ) {
    const asuntos = {
      agendada: "Cita agendada exitosamente",
      modificada: "Tu cita ha sido reprogramada",
      cancelada: "Tu cita ha sido cancelada",
    };

    console.log("═══════════════════════════════════════════════════");
    console.log(`📧 [CORREO SIMULADO] — Cita ${accion}`);
    console.log("───────────────────────────────────────────────────");
    console.log(`  Para: ${correoCliente}`);
    console.log(`  Asunto: ${asuntos[accion]} — TallerConnect`);
    console.log(`  Cuerpo:`);
    console.log(`  Hola ${nombreCliente},`);
    console.log(`  Tu cita de ${tipo} ha sido ${accion}.`);
    console.log(`  Fecha: ${fecha} a las ${hora}`);
    console.log("═══════════════════════════════════════════════════");
  }

  return {
    notificarPrendaTerminada,
    notificarCita,
  };
}
