import { useState } from "react";
import { useEstilos } from "../../hooks/useEstilos";
import { Spinner } from "../common/Spinner";
import type { Estilo } from "../../types";

interface EstiloFormProps {
  estilo?: Estilo; // Si no se pasa, es modo "Crear"
  onClose: () => void;
}

export function EstiloForm({ estilo, onClose }: EstiloFormProps) {
  const { crearEstilo, actualizarEstilo } = useEstilos();
  const [formData, setFormData] = useState({
    nombre: estilo?.nombre || "",
    descripcion: estilo?.descripcion || "",
  });
  
  const [errorLocal, setErrorLocal] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrorLocal(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorLocal(null);

    if (!formData.nombre.trim()) {
      return setErrorLocal("El nombre del estilo es requerido.");
    }

    setIsSubmitting(true);

    try {
      if (estilo && estilo.id) {
        // Actualizar
        await actualizarEstilo(estilo.id, formData);
      } else {
        // Crear
        await crearEstilo(formData);
      }
      onClose();
    } catch (error) {
      console.error("Error al guardar estilo:", error);
      setErrorLocal("Ocurrió un error al guardar los datos.");
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form-container">
      {errorLocal && <div className="alert alert-error mb-4">{errorLocal}</div>}

      <div className="form-group">
        <label htmlFor="nombre">Nombre del Estilo</label>
        <input
          id="nombre"
          name="nombre"
          type="text"
          value={formData.nombre}
          onChange={handleChange}
          placeholder="Ej: Camisa de Manga Corta"
          required
          disabled={isSubmitting}
        />
      </div>

      <div className="form-group">
        <label htmlFor="descripcion">Descripción (Opcional)</label>
        <textarea
          id="descripcion"
          name="descripcion"
          value={formData.descripcion}
          onChange={handleChange}
          placeholder="Detalles sobre este estilo..."
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
          {isSubmitting ? <Spinner /> : (estilo ? "Guardar Cambios" : "Agregar Estilo")}
        </button>
      </div>
    </form>
  );
}
