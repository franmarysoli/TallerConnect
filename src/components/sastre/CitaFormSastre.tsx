import { useState, useEffect } from "react";
import { useCitas } from "../../hooks/useCitas";
import { useClientes } from "../../hooks/useClientes";
import { useToast } from "../../context/ToastContext";
import { HORARIOS_DISPONIBLES, TIPOS_CITA } from "../../utils/constantes";
import { fechaHoy } from "../../utils/helpers";
import { Spinner } from "../common/Spinner";
import type { TipoCita } from "../../types";

interface CitaFormSastreProps {
  onClose: () => void;
  initialClienteId?: string;
  initialTipo?: TipoCita;
}

export function CitaFormSastre({ onClose, initialClienteId, initialTipo }: CitaFormSastreProps) {
  const { crearCita } = useCitas();
  const { clientes } = useClientes();
  const { showToast } = useToast();

  const [clienteId, setClienteId] = useState(initialClienteId || "");
  const [fecha, setFecha] = useState(fechaHoy());
  const [hora, setHora] = useState<string>(HORARIOS_DISPONIBLES[0]);
  const [tipo, setTipo] = useState<TipoCita>(initialTipo || "consulta");
  const [observaciones, setObservaciones] = useState("");
  const [errorLocal, setErrorLocal] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filtrar horarios disponibles según la fecha seleccionada
  const horariosValidos = (fecha === fechaHoy()
    ? HORARIOS_DISPONIBLES.filter(h => parseInt(h.split(":")[0], 10) > new Date().getHours())
    : [...HORARIOS_DISPONIBLES]) as Array<typeof HORARIOS_DISPONIBLES[number]>;

  // Actualizar la hora seleccionada si ya no es válida
  useEffect(() => {
    if (horariosValidos.length > 0 && !horariosValidos.includes(hora as any)) {
      setHora(horariosValidos[0]);
    }
  }, [fecha, hora, horariosValidos]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorLocal(null);

    if (!clienteId) {
      return setErrorLocal("Debes seleccionar un cliente.");
    }
    if (!fecha) {
      return setErrorLocal("Debes seleccionar una fecha.");
    }

    const hoy = fechaHoy();
    if (fecha < hoy) {
      return setErrorLocal("No puedes agendar una cita en el pasado.");
    }

    if (fecha === hoy) {
      const horaActual = new Date().getHours();
      const horaSeleccionada = parseInt(hora.split(":")[0], 10);
      if (horaSeleccionada <= horaActual) {
        return setErrorLocal("La hora seleccionada ya pasó. Por favor elige un horario futuro.");
      }
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
      showToast("Cita agendada correctamente", "success");
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
        <div className="form-group">
          <label>Cliente</label>
          <select
            value={clienteId}
            onChange={(e) => setClienteId(e.target.value)}
            required
            disabled={isSubmitting || !!initialClienteId}
          >
            <option value="">-- Seleccionar Cliente --</option>
            {clientes.map((c) => (
              <option key={c.uid} value={c.uid}>
                {c.nombre} ({c.cedula})
              </option>
            ))}
          </select>
        </div>

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
              {horariosValidos.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
              {horariosValidos.length === 0 && (
                <option value="" disabled>No hay horarios disponibles hoy</option>
              )}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Tipo de Cita</label>
          <div className="flex gap-6 mt-1 flex-wrap">
            {TIPOS_CITA.map((t) => (
              <label key={t.valor} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="tipoCita"
                  value={t.valor}
                  checked={tipo === t.valor}
                  onChange={(e) => setTipo(e.target.value as TipoCita)}
                  disabled={isSubmitting || !!initialTipo}
                />
                <span>{t.etiqueta}</span>
              </label>
            ))}
          </div>
        </div>

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
