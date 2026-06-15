import { useState } from "react";
import { useClientes } from "../../hooks/useClientes";
import { validarCorreo, validarCelular } from "../../utils/helpers";
import { Spinner } from "../common/Spinner";
import type { Usuario } from "../../types";

interface ClienteFormProps {
  cliente: Usuario;
  onClose: () => void;
}

export function ClienteForm({ cliente, onClose }: ClienteFormProps) {
  const { actualizarCliente } = useClientes();
  const [formData, setFormData] = useState({
    nombre: cliente.nombre,
    correo: cliente.correo,
    celular: cliente.celular || "",
  });
  
  const [errorLocal, setErrorLocal] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrorLocal(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorLocal(null);

    // Validaciones
    if (!formData.nombre.trim()) {
      return setErrorLocal("El nombre no puede estar vacío.");
    }
    if (!validarCorreo(formData.correo)) {
      return setErrorLocal("El formato del correo es inválido.");
    }
    if (!validarCelular(formData.celular)) {
      return setErrorLocal("El celular tiene un formato inválido.");
    }

    setIsSubmitting(true);

    try {
      await actualizarCliente(cliente.uid, {
        nombre: formData.nombre,
        correo: formData.correo,
        celular: formData.celular,
      });
      onClose(); // Cerrar modal al éxito
    } catch (error) {
      console.error("Error al actualizar cliente:", error);
      setErrorLocal("Ocurrió un error al guardar los cambios.");
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form-container">
      {errorLocal && <div className="alert alert-error mb-4">{errorLocal}</div>}

      {/* Información inmutable (Cédula) */}
      <div className="form-group">
        <label>Cédula (No se puede cambiar)</label>
        <input type="text" value={cliente.cedula} disabled className="input-disabled" />
      </div>

      <div className="form-group">
        <label htmlFor="nombre">Nombre Completo</label>
        <input
          id="nombre"
          name="nombre"
          type="text"
          value={formData.nombre}
          onChange={handleChange}
          required
          disabled={isSubmitting}
        />
      </div>

      <div className="form-group">
        <label htmlFor="correo">Correo Electrónico</label>
        <input
          id="correo"
          name="correo"
          type="email"
          value={formData.correo}
          onChange={handleChange}
          required
          disabled={isSubmitting}
        />
      </div>

      <div className="form-group">
        <label htmlFor="celular">Celular (Opcional)</label>
        <input
          id="celular"
          name="celular"
          type="text"
          value={formData.celular}
          onChange={handleChange}
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
          {isSubmitting ? <Spinner /> : "Guardar Cambios"}
        </button>
      </div>
    </form>
  );
}
