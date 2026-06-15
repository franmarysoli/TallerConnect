import { useState } from "react";
import { useTelas } from "../../hooks/useTelas";
import { Spinner } from "../common/Spinner";
import type { Tela } from "../../types";

interface TelaFormProps {
  tela?: Tela; // Si no se pasa, es modo "Crear"
  onClose: () => void;
}

export function TelaForm({ tela, onClose }: TelaFormProps) {
  const { crearTela, actualizarTela } = useTelas();
  const [formData, setFormData] = useState({
    nombre: tela?.nombre || "",
    metrosDisponibles: tela?.metrosDisponibles || 0,
    precioMetro: tela?.precioMetro || 0,
  });
  
  const [errorLocal, setErrorLocal] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Si es un campo numérico, parsearlo a número para guardar correctamente
    const parsedValue = (name === "metrosDisponibles" || name === "precioMetro") 
      ? (value === "" ? "" : Number(value)) 
      : value;
      
    setFormData((prev) => ({ ...prev, [name]: parsedValue }));
    setErrorLocal(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorLocal(null);

    // Validaciones
    if (!formData.nombre.trim()) {
      return setErrorLocal("El nombre de la tela es requerido.");
    }
    if (Number(formData.metrosDisponibles) < 0) {
      return setErrorLocal("Los metros disponibles no pueden ser negativos.");
    }
    if (Number(formData.precioMetro) <= 0) {
      return setErrorLocal("El precio por metro debe ser mayor a 0.");
    }

    setIsSubmitting(true);

    try {
      const datosGuardar = {
        nombre: formData.nombre,
        metrosDisponibles: Number(formData.metrosDisponibles),
        precioMetro: Number(formData.precioMetro),
      };

      if (tela && tela.id) {
        // Actualizar
        await actualizarTela(tela.id, datosGuardar);
      } else {
        // Crear
        await crearTela(datosGuardar);
      }
      onClose();
    } catch (error) {
      console.error("Error al guardar tela:", error);
      setErrorLocal("Ocurrió un error al guardar los datos.");
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form-container">
      {errorLocal && <div className="alert alert-error mb-4">{errorLocal}</div>}

      <div className="form-group">
        <label htmlFor="nombre">Nombre de la Tela</label>
        <input
          id="nombre"
          name="nombre"
          type="text"
          value={formData.nombre}
          onChange={handleChange}
          placeholder="Ej: Lino Italiano"
          required
          disabled={isSubmitting}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="form-group">
          <label htmlFor="metrosDisponibles">Stock Disponible (Metros)</label>
          <input
            id="metrosDisponibles"
            name="metrosDisponibles"
            type="number"
            step="0.1" // Permitir decimales
            min="0"
            value={formData.metrosDisponibles}
            onChange={handleChange}
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="form-group">
          <label htmlFor="precioMetro">Precio por Metro (COP)</label>
          <input
            id="precioMetro"
            name="precioMetro"
            type="number"
            step="1000" // Incrementos de 1000
            min="0"
            value={formData.precioMetro}
            onChange={handleChange}
            required
            disabled={isSubmitting}
          />
        </div>
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
          {isSubmitting ? <Spinner /> : (tela ? "Guardar Cambios" : "Agregar Tela")}
        </button>
      </div>
    </form>
  );
}
