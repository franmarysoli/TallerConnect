import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useCitas } from "../../hooks/useCitas";
import { HORARIOS_DISPONIBLES, TIPOS_CITA } from "../../utils/constantes";
import { fechaHoy } from "../../utils/helpers";
import { Spinner } from "../common/Spinner";
import type { Cita } from "../../types";

interface CitaFormProps {
  cita?: Cita;
  onClose: () => void;
}

export function CitaForm({ cita, onClose }: CitaFormProps) {
  const { usuario } = useAuth();
  const { crearCita, reprogramarCita } = useCitas();
  
  const [formData, setFormData] = useState({
    fecha: cita?.fecha || fechaHoy(),
    hora: cita?.hora || "09:00",
    tipo: cita?.tipo || "prueba",
    observaciones: cita?.observaciones || "",
  });

  const [errorLocal, setErrorLocal] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrorLocal(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuario) return;

    // Validación de fecha (no agendar en el pasado)
    if (formData.fecha < fechaHoy()) {
      return setErrorLocal("No puedes agendar una cita en el pasado.");
    }

    setIsSubmitting(true);
    setErrorLocal(null);

    try {
      if (cita && cita.id) {
        // Reprogramar
        await reprogramarCita(
          cita.id,
          formData.fecha,
          formData.hora,
          formData.tipo,
          formData.observaciones,
          usuario.correo,
          usuario.nombre
        );
      } else {
        // Crear nueva
        await crearCita({
          clienteId: usuario.uid,
          clienteNombre: usuario.nombre,
          fecha: formData.fecha,
          hora: formData.hora,
          tipo: formData.tipo as any,
          estado: "pendiente",
          observaciones: formData.observaciones
        }, usuario.correo);
      }
      onClose();
    } catch (error: any) {
      console.error("Error al guardar cita:", error);
      setErrorLocal(error.message || "Ocurrió un error al agendar la cita.");
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form-container">
      {errorLocal && <div className="alert alert-error mb-4">{errorLocal}</div>}

      <div className="grid grid-cols-2 gap-4">
        <div className="form-group">
          <label htmlFor="fecha">Fecha</label>
          <input
            id="fecha"
            name="fecha"
            type="date"
            min={fechaHoy()}
            value={formData.fecha}
            onChange={handleChange}
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="form-group">
          <label htmlFor="hora">Hora</label>
          <select
            id="hora"
            name="hora"
            value={formData.hora}
            onChange={handleChange}
            required
            disabled={isSubmitting}
          >
            {HORARIOS_DISPONIBLES.map(h => (
              <option key={h} value={h}>{h}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="tipo">Motivo de la Cita</label>
        <div className="flex gap-4 mt-2">
          {TIPOS_CITA.map(t => (
            <label key={t.valor} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="tipo"
                value={t.valor}
                checked={formData.tipo === t.valor}
                onChange={handleChange}
                disabled={isSubmitting}
              />
              {t.etiqueta}
            </label>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="observaciones">Notas adicionales (Opcional)</label>
        <textarea
          id="observaciones"
          name="observaciones"
          value={formData.observaciones}
          onChange={handleChange}
          placeholder="Ej: Necesito probarme el pantalón con los zapatos que usaré."
          rows={3}
          disabled={isSubmitting}
        />
      </div>

      <div className="flex justify-end gap-2 mt-6">
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
          {isSubmitting ? <Spinner /> : (cita ? "Guardar Cambios" : "Agendar Cita")}
        </button>
      </div>
    </form>
  );
}
