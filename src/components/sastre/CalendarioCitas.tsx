import { useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { es as esES } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";

import { useCitas } from "../../hooks/useCitas";
import { Spinner } from "../common/Spinner";
import { Modal } from "../common/Modal";
// En una implementación real, este form es compartido o ligeramente diferente para sastre
// Por simplicidad usaremos un placeholder y luego lo implementaremos en la fase de cliente
import type { Cita } from "../../types";

// Configuración de react-big-calendar en español
const locales = {
  es: esES,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export function CalendarioCitas() {
  const { citas, cargando, eliminarCita } = useCitas();
  const [modalAbierto, setModalAbierto] = useState(false);
  const [citaSeleccionada, setCitaSeleccionada] = useState<Cita | null>(null);

  if (cargando) return <div className="flex-center p-8"><Spinner /></div>;

  // Convertir citas de Firestore al formato que requiere react-big-calendar
  const eventos = citas.map((cita) => {
    // La fecha en BD es "YYYY-MM-DD" y la hora "HH:00"
    const [year, month, day] = cita.fecha.split("-").map(Number);
    const [hour, minute] = cita.hora.split(":").map(Number);

    const startDate = new Date(year, month - 1, day, hour, minute);
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hora de duración

    return {
      id: cita.id,
      title: `${cita.clienteNombre} (${cita.tipo})`,
      start: startDate,
      end: endDate,
      resource: cita, // Guardamos la cita original
    };
  });

  // Personalización de colores según estado
  const eventStyleGetter = (event: any) => {
    const cita = event.resource as Cita;
    let backgroundColor = "#3b82f6"; // default blue
    
    if (cita.estado === "confirmada") backgroundColor = "#10b981"; // green
    if (cita.estado === "pendiente") backgroundColor = "#f59e0b"; // yellow
    if (cita.estado === "cancelada") backgroundColor = "#ef4444"; // red

    return {
      style: {
        backgroundColor,
        borderRadius: "4px",
        opacity: cita.estado === "cancelada" ? 0.6 : 1,
        color: "white",
        border: "none",
        display: "block",
      },
    };
  };

  const handleSelectEvent = (event: any) => {
    setCitaSeleccionada(event.resource);
    setModalAbierto(true);
  };

  const handleEliminar = async () => {
    if (citaSeleccionada?.id && confirm("¿Eliminar esta cita permanentemente?")) {
      await eliminarCita(citaSeleccionada.id);
      setModalAbierto(false);
    }
  };

  return (
    <div className="page-container">
      <div className="flex-between mb-6">
        <h1 className="text-2xl font-bold">Calendario de Citas</h1>
        <button 
          className="btn btn-primary"
          onClick={() => {
            setCitaSeleccionada(null);
            setModalAbierto(true);
          }}
        >
          + Nueva Cita
        </button>
      </div>

      <div className="card glass-panel h-[600px] p-4">
        <Calendar
          localizer={localizer}
          events={eventos}
          startAccessor="start"
          endAccessor="end"
          style={{ height: "100%" }}
          messages={{
            next: "Sig",
            previous: "Ant",
            today: "Hoy",
            month: "Mes",
            week: "Semana",
            day: "Día",
            noEventsInRange: "No hay citas en este periodo.",
          }}
          culture="es"
          eventPropGetter={eventStyleGetter}
          onSelectEvent={handleSelectEvent}
          views={['month', 'week', 'day']}
          min={new Date(0, 0, 0, 8, 0, 0)} // Empieza a las 8am en vista de semana/día
          max={new Date(0, 0, 0, 19, 0, 0)} // Termina a las 7pm
        />
      </div>

      {/* Modal Ver/Editar Cita (Para el sastre) */}
      <Modal
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
        titulo={citaSeleccionada ? "Detalles de Cita" : "Agendar Nueva Cita"}
      >
        {/* Aquí usaremos el componente de CitaForm que crearemos luego,
            pero como el sastre necesita seleccionar el cliente, renderizamos 
            una versión adaptada o incluimos lógica adicional en CitaForm.
            Por ahora, mostramos un resumen si es editar, o un mensaje. */}
        {citaSeleccionada ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><strong>Cliente:</strong> {citaSeleccionada.clienteNombre}</div>
              <div><strong>Tipo:</strong> <span className="capitalize">{citaSeleccionada.tipo}</span></div>
              <div><strong>Fecha:</strong> {citaSeleccionada.fecha}</div>
              <div><strong>Hora:</strong> {citaSeleccionada.hora}</div>
              <div>
                <strong>Estado:</strong> 
                <span className={`badge ml-2 badge-${citaSeleccionada.estado}`}>
                  {citaSeleccionada.estado}
                </span>
              </div>
            </div>
            {citaSeleccionada.observaciones && (
              <div className="bg-glass-dark p-3 rounded">
                <strong>Notas:</strong> {citaSeleccionada.observaciones}
              </div>
            )}
            
            <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-glass">
              <button className="btn btn-outline" onClick={() => setModalAbierto(false)}>
                Cerrar
              </button>
              <button className="btn btn-outline text-error" onClick={handleEliminar}>
                Eliminar
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 text-center">
            <p className="mb-4">Para agendar una cita como sastre, por favor usa el componente de CitaForm (por implementar en la siguiente fase).</p>
            <button className="btn btn-outline" onClick={() => setModalAbierto(false)}>Cerrar</button>
          </div>
        )}
      </Modal>
    </div>
  );
}
