import { useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { es as esES } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";

import { useAuth } from "../../context/AuthContext";
import { useCitas } from "../../hooks/useCitas";
import { Spinner } from "../common/Spinner";
import { Modal } from "../common/Modal";
import { CitaForm } from "./CitaForm";
import { ESTADOS_CITA } from "../../utils/constantes";
import { CalendarX } from "lucide-react";
import type { Cita } from "../../types";

const locales = { es: esES };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

export function MisCitas() {
  const { usuario } = useAuth();
  const { citas, cargando, cancelarCita } = useCitas(usuario?.uid);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [citaSeleccionada, setCitaSeleccionada] = useState<Cita | null>(null);

  if (cargando) return <div className="flex-center p-8"><Spinner /></div>;

  const eventos = citas.map((cita) => {
    const [year, month, day] = cita.fecha.split("-").map(Number);
    const [hour, minute] = cita.hora.split(":").map(Number);
    const startDate = new Date(year, month - 1, day, hour, minute);
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);

    return {
      id: cita.id,
      title: `${cita.tipo} - ${cita.estado}`,
      start: startDate,
      end: endDate,
      resource: cita,
    };
  });

  const eventStyleGetter = (event: any) => {
    const cita = event.resource as Cita;
    const configEstado = ESTADOS_CITA.find(e => e.valor === cita.estado);
    
    return {
      style: {
        backgroundColor: configEstado?.color || "#3b82f6",
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

  const handleCancelarCita = async () => {
    if (!citaSeleccionada?.id || !usuario) return;
    
    if (confirm("¿Estás seguro de cancelar esta cita?")) {
      try {
        await cancelarCita(
          citaSeleccionada.id,
          usuario.correo,
          usuario.nombre,
          citaSeleccionada.fecha,
          citaSeleccionada.hora,
          citaSeleccionada.tipo
        );
        setModalAbierto(false);
      } catch (error) {
        console.error("Error al cancelar:", error);
        alert("Hubo un error al cancelar la cita.");
      }
    }
  };

  return (
    <div className="py-6">
      <div className="flex-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Mis Citas</h1>
          <p className="text-muted">Gestiona tus pruebas y entregas.</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => {
            setCitaSeleccionada(null);
            setModalAbierto(true);
          }}
        >
          Agendar Nueva Cita
        </button>
      </div>

      <div className="card glass-panel h-[600px] p-4 mb-8">
        <Calendar
          localizer={localizer}
          events={eventos}
          startAccessor="start"
          endAccessor="end"
          style={{ height: "100%" }}
          messages={{
            next: "Sig", previous: "Ant", today: "Hoy", month: "Mes",
            week: "Semana", day: "Día", noEventsInRange: "No tienes citas en este periodo.",
          }}
          culture="es"
          eventPropGetter={eventStyleGetter}
          onSelectEvent={handleSelectEvent}
          views={['month', 'week', 'agenda']}
        />
      </div>

      {/* Modal Crear/Editar/Ver Cita */}
      <Modal
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
        titulo={citaSeleccionada ? "Detalles de tu Cita" : "Agendar Cita"}
      >
        {citaSeleccionada && citaSeleccionada.estado !== "cancelada" ? (
          <div>
            <CitaForm 
              cita={citaSeleccionada} 
              onClose={() => setModalAbierto(false)} 
            />
            
            <div className="mt-4 pt-4 border-t border-glass text-center">
              <button 
                className="text-error text-sm underline"
                onClick={handleCancelarCita}
              >
                Quiero cancelar esta cita
              </button>
            </div>
          </div>
        ) : citaSeleccionada && citaSeleccionada.estado === "cancelada" ? (
          <div className="text-center py-4">
            <div className="flex justify-center mb-4 text-primary opacity-50"><CalendarX size={48} /></div>
            <h3 className="text-xl font-bold mb-2">Cita Cancelada</h3>
            <p className="text-muted mb-6">
              Esta cita programada para el {citaSeleccionada.fecha} a las {citaSeleccionada.hora} fue cancelada.
            </p>
            <button className="btn btn-outline w-full" onClick={() => setModalAbierto(false)}>
              Cerrar
            </button>
          </div>
        ) : (
          <CitaForm onClose={() => setModalAbierto(false)} />
        )}
      </Modal>
    </div>
  );
}
