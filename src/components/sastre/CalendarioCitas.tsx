import { useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { es as esES } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";

import { useCitas } from "../../hooks/useCitas";
import { useClientes } from "../../hooks/useClientes";
import { Spinner } from "../common/Spinner";
import { Modal } from "../common/Modal";
import { HORARIOS_DISPONIBLES, TIPOS_CITA } from "../../utils/constantes";
import { fechaHoy } from "../../utils/helpers";
import type { Cita, TipoCita } from "../../types";

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

// ─── Formulario para que el sastre cree citas ───────────────────────
function CitaFormSastre({ onClose }: { onClose: () => void }) {
  const { crearCita } = useCitas();
  const { clientes } = useClientes();

  const [clienteId, setClienteId] = useState("");
  const [fecha, setFecha] = useState(fechaHoy());
  const [hora, setHora] = useState<string>(HORARIOS_DISPONIBLES[0]);
  const [tipo, setTipo] = useState<TipoCita>("prueba");
  const [observaciones, setObservaciones] = useState("");
  const [errorLocal, setErrorLocal] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorLocal(null);

    if (!clienteId) {
      return setErrorLocal("Debes seleccionar un cliente.");
    }
    if (!fecha) {
      return setErrorLocal("Debes seleccionar una fecha.");
    }

    const clienteSel = clientes.find((c) => c.uid === clienteId);
    if (!clienteSel) {
      return setErrorLocal("Cliente no encontrado.");
    }

    setIsSubmitting(true);

    try {
      await crearCita(
        {
          clienteId,
          clienteNombre: clienteSel.nombre,
          fecha,
          hora,
          tipo,
          estado: "pendiente",
          observaciones,
        },
        clienteSel.correo
      );
      onClose();
    } catch (error: any) {
      console.error("Error al crear cita:", error);
      setErrorLocal(error.message || "Ocurrió un error al agendar la cita.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form-container">
      {errorLocal && <div className="alert alert-error mb-4">{errorLocal}</div>}

      <div className="space-y-4">
        {/* Seleccionar cliente */}
        <div className="form-group">
          <label>Cliente</label>
          <select
            value={clienteId}
            onChange={(e) => setClienteId(e.target.value)}
            required
            disabled={isSubmitting}
          >
            <option value="">-- Seleccionar Cliente --</option>
            {clientes.map((c) => (
              <option key={c.uid} value={c.uid}>
                {c.nombre} ({c.cedula})
              </option>
            ))}
          </select>
        </div>

        {/* Fecha y hora */}
        <div className="grid grid-cols-2 gap-4">
          <div className="form-group">
            <label>Fecha</label>
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              min={fechaHoy()}
              required
              disabled={isSubmitting}
            />
          </div>
          <div className="form-group">
            <label>Hora</label>
            <select
              value={hora}
              onChange={(e) => setHora(e.target.value)}
              required
              disabled={isSubmitting}
            >
              {HORARIOS_DISPONIBLES.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tipo de cita (radio buttons) */}
        <div className="form-group">
          <label>Tipo de Cita</label>
          <div className="flex gap-6 mt-1">
            {TIPOS_CITA.map((t) => (
              <label key={t.valor} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="tipoCita"
                  value={t.valor}
                  checked={tipo === t.valor}
                  onChange={(e) => setTipo(e.target.value as TipoCita)}
                  disabled={isSubmitting}
                />
                <span>{t.etiqueta}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Observaciones */}
        <div className="form-group">
          <label>Observaciones</label>
          <textarea
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            placeholder="Notas adicionales sobre la cita..."
            rows={3}
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-glass">
        <button
          type="button"
          className="btn btn-outline"
          onClick={onClose}
          disabled={isSubmitting}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? <Spinner /> : "Agendar Cita"}
        </button>
      </div>
    </form>
  );
}

// ─── Componente principal ───────────────────────────────────────────
export function CalendarioCitas() {
  const { citas, cargando, eliminarCita } = useCitas();
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
              <button className="btn btn-outline" onClick={() => setModalAbierto(false)}>
                Cerrar
              </button>
              <button className="btn btn-outline text-error" onClick={handleEliminar}>
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
