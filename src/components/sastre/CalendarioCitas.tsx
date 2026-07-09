import { useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { es as esES } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";

import { useCitas } from "../../hooks/useCitas";
import { useClientes } from "../../hooks/useClientes";
import { Spinner } from "../common/Spinner";
import { Modal } from "../common/Modal";
import type { Cita } from "../../types";
import { useToast } from "../../context/ToastContext";

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

import { CitaFormSastre } from "./CitaFormSastre";

// ─── Componente principal ───────────────────────────────────────────
export function CalendarioCitas() {
  const { citas, cargando, eliminarCita, cambiarEstadoCita } = useCitas();
  const { clientes } = useClientes();
  const { showToast } = useToast();
  const [modalAbierto, setModalAbierto] = useState(false);
  const [citaSeleccionada, setCitaSeleccionada] = useState<Cita | null>(null);

  const [fechaCalendario, setFechaCalendario] = useState(new Date());
  const [vistaCalendario, setVistaCalendario] = useState<any>("month");

  if (cargando) return <div className="flex-center p-8"><Spinner /></div>;

  // Convertir citas de Firestore al formato que requiere react-big-calendar
  const eventos = citas
    .filter((cita) => cita && cita.fecha && cita.hora)
    .map((cita) => {
      try {
        // La fecha en BD es "YYYY-MM-DD" y la hora "HH:00"
        const [year, month, day] = cita.fecha.split("-").map(Number);
        const [hour, minute] = cita.hora.split(":").map(Number);

        if (isNaN(year) || isNaN(month) || isNaN(day) || isNaN(hour) || isNaN(minute)) {
          return null;
        }

        const startDate = new Date(year, month - 1, day, hour, minute);
        const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hora de duración

        return {
          id: cita.id,
          title: `${cita.clienteNombre || "Cliente"} (${cita.tipo || "Cita"})`,
          start: startDate,
          end: endDate,
          resource: cita, // Guardamos la cita original
        };
      } catch (e) {
        console.error("Error al procesar fecha de cita:", cita, e);
        return null;
      }
    })
    .filter((e): e is NonNullable<typeof e> => e !== null);

  // Personalización de colores según estado
  const eventStyleGetter = (event: any) => {
    const cita = event.resource as Cita;
    let backgroundColor = "#3b82f6"; // default blue (completada)
    
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
      showToast("Cita eliminada", "success");
      setModalAbierto(false);
    }
  };

  const handleCambiarEstado = async (nuevoEstado: "confirmada" | "completada" | "cancelada") => {
    if (!citaSeleccionada?.id) return;
    
    // Buscar el correo del cliente
    const cliente = clientes.find(c => c.uid === citaSeleccionada.clienteId);
    const correoCliente = cliente?.correo || "";

    try {
      await cambiarEstadoCita(
        citaSeleccionada.id, 
        nuevoEstado,
        {
          correoCliente,
          nombreCliente: citaSeleccionada.clienteNombre,
          fecha: citaSeleccionada.fecha,
          hora: citaSeleccionada.hora,
          tipo: citaSeleccionada.tipo
        }
      );
      
      showToast(`Cita marcada como ${nuevoEstado}`, "success");
      setModalAbierto(false);
    } catch (error) {
      console.error("Error al cambiar estado:", error);
      showToast("No se pudo cambiar el estado", "error");
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
          date={fechaCalendario}
          onNavigate={(date) => setFechaCalendario(date)}
          view={vistaCalendario}
          onView={(view) => setVistaCalendario(view)}
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
              {citaSeleccionada.estado === "pendiente" && (
                <>
                  <button className="btn btn-primary" onClick={() => handleCambiarEstado("confirmada")}>
                    Confirmar
                  </button>
                  <button className="btn btn-outline text-error" onClick={() => handleCambiarEstado("cancelada")}>
                    Cancelar
                  </button>
                </>
              )}
              {citaSeleccionada.estado === "confirmada" && (
                <>
                  <button className="btn btn-primary bg-blue-600 hover:bg-blue-700" onClick={() => handleCambiarEstado("completada")}>
                    Completar
                  </button>
                  <button className="btn btn-outline text-error" onClick={() => handleCambiarEstado("cancelada")}>
                    Cancelar
                  </button>
                </>
              )}
              <button className="btn btn-outline text-error" onClick={handleEliminar} title="Eliminar permanentemente">
                Eliminar
              </button>
            </div>
          </div>
        ) : (
          <CitaFormSastre onClose={() => setModalAbierto(false)} />
        )}
      </Modal>
    </div>
  );
}
