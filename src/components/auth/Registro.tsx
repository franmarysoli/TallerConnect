import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useClientes } from "../../hooks/useClientes";
import { validarCedula, validarCorreo, validarPassword, validarCelular } from "../../utils/helpers";
import { Spinner } from "../common/Spinner";
import { Logo } from "../common/Logo";

export function Registro() {
  const [formData, setFormData] = useState({
    cedula: "",
    nombre: "",
    correo: "",
    celular: "",
    password: "",
    confirmarPassword: "",
  });
  
  const [errorLocal, setErrorLocal] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { registrarse, error: errorAuth, limpiarError } = useAuth();
  const { cedulaExiste } = useClientes();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrorLocal(null);
    limpiarError();
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorLocal(null);

    // Validaciones
    if (!validarCedula(formData.cedula)) {
      return setErrorLocal("La cédula debe contener solo números (5-15 dígitos).");
    }
    if (!validarCorreo(formData.correo)) {
      return setErrorLocal("El formato del correo es inválido.");
    }
    if (!validarCelular(formData.celular)) {
      return setErrorLocal("El celular tiene un formato inválido.");
    }
    if (!validarPassword(formData.password)) {
      return setErrorLocal("La contraseña debe tener al menos 6 caracteres.");
    }
    if (formData.password !== formData.confirmarPassword) {
      return setErrorLocal("Las contraseñas no coinciden.");
    }

    setIsSubmitting(true);

    try {
      // 1. Verificar si la cédula ya existe en la base de datos
      const existe = await cedulaExiste(formData.cedula);
      if (existe) {
        setErrorLocal("Esta cédula ya se encuentra registrada en el sistema.");
        setIsSubmitting(false);
        return;
      }

      // 2. Proceder con el registro
      await registrarse({
        cedula: formData.cedula,
        nombre: formData.nombre,
        correo: formData.correo,
        celular: formData.celular,
        password: formData.password,
      });

      // Registro exitoso, redirigir al inicio (panel del cliente)
      navigate("/");
    } catch (err: any) {
      setIsSubmitting(false);
      console.error("Error en registro:", err);
      setErrorLocal(err.message || "Error inesperado durante el registro.");
    }
  }

  return (
    <div className="login-container register-container">
      <div className="login-card glass-panel">
        <div className="login-header">
          <div className="flex justify-center mb-4"><Logo size={64} /></div>
          <h1>Crear Cuenta</h1>
          <p>Únete a TallerConnect</p>
        </div>

        {(errorLocal || errorAuth) && (
          <div className="alert alert-error">{errorLocal || errorAuth}</div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="cedula">Cédula</label>
              <input
                id="cedula"
                name="cedula"
                type="text"
                value={formData.cedula}
                onChange={handleChange}
                placeholder="12345678"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group">
              <label htmlFor="nombre">Nombre Completo</label>
              <input
                id="nombre"
                name="nombre"
                type="text"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Juan Pérez"
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
                placeholder="juan@correo.com"
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
                placeholder="3001234567"
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Contraseña</label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmarPassword">Confirmar Contraseña</label>
              <input
                id="confirmarPassword"
                name="confirmarPassword"
                type="password"
                value={formData.confirmarPassword}
                onChange={handleChange}
                placeholder="••••••••"
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full mt-4"
            disabled={isSubmitting}
          >
            {isSubmitting ? <Spinner /> : "Registrarse"}
          </button>
        </form>

        <div className="login-footer">
          <p>¿Ya tienes una cuenta?</p>
          <Link to="/login" className="link">Inicia sesión aquí</Link>
        </div>
      </div>
    </div>
  );
}
