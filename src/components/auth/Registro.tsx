import { useState } from "react";
import { useNavigate, Link, Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useClientes } from "../../hooks/useClientes";
import { validarCedula, validarCorreo, validarPassword, validarCelular } from "../../utils/helpers";
import { Spinner } from "../common/Spinner";
import { Logo } from "../common/Logo";
import { Eye, EyeOff, Mail } from "lucide-react";

export function Registro() {
  const [step, setStep] = useState(1);
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const { registrarse, error: errorAuth, limpiarError, usuario } = useAuth();
  const { cedulaExiste } = useClientes();
  const navigate = useNavigate();

  if (usuario) {
    return <Navigate to="/" replace />;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrorLocal(null);
    limpiarError();
  };

  const handleNextStep = () => {
    setErrorLocal(null);
    if (!formData.nombre || !formData.correo || !formData.cedula) {
      return setErrorLocal("Completa los campos obligatorios (*).");
    }
    if (!validarCedula(formData.cedula)) {
      return setErrorLocal("La cédula debe contener solo números (5-15 dígitos).");
    }
    if (!validarCorreo(formData.correo)) {
      return setErrorLocal("El formato del correo es inválido.");
    }
    if (formData.celular && !validarCelular(formData.celular)) {
      return setErrorLocal("El celular tiene un formato inválido.");
    }
    setStep(2);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (step === 1) {
      handleNextStep();
      return;
    }

    if (step === 2) {
      setErrorLocal(null);
      if (!validarPassword(formData.password)) {
        return setErrorLocal("La contraseña debe tener al menos 6 caracteres.");
      }
      if (formData.password !== formData.confirmarPassword) {
        return setErrorLocal("Las contraseñas no coinciden.");
      }

      setIsSubmitting(true);

      try {
        const existe = await cedulaExiste(formData.cedula);
        if (existe) {
          setErrorLocal("Esta cédula ya se encuentra registrada en el sistema.");
          setIsSubmitting(false);
          return;
        }

        await registrarse({
          cedula: formData.cedula,
          nombre: formData.nombre,
          correo: formData.correo,
          celular: formData.celular,
          password: formData.password,
        });

        // Exito
        setStep(3);
      } catch (err: any) {
        setIsSubmitting(false);
        console.error("Error en registro:", err);
        setErrorLocal(err.message || "Error inesperado durante el registro.");
      }
    }
  }

  if (step === 3) {
    return (
      <div className="login-container register-container">
        <div className="login-card glass-panel" style={{ padding: "4rem 2rem" }}>
          <div className="flex-center mb-6">
            <Mail size={64} style={{ color: "var(--color-success)" }} />
          </div>
          <h2 style={{ marginBottom: "1rem" }}>¡Verifica tu correo electrónico!</h2>
          <p style={{ marginBottom: "2rem", color: "var(--color-text-light)", fontSize: "1.1rem", lineHeight: "1.6" }}>
            Hemos enviado un enlace de verificación a <br/>
            <strong>{formData.correo}</strong>.<br/>
            Revisa tu bandeja de entrada (y la carpeta de spam) para activar tu cuenta.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="btn btn-primary w-full mt-4"
            style={{ fontSize: "1.1rem", padding: "16px" }}
          >
            Ir a iniciar sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container register-container">
      <div className="login-card glass-panel" style={{ padding: "2.5rem 3rem" }}>
        <div className="login-header" style={{ marginBottom: "1.5rem" }}>
          <div className="flex justify-center mb-4"><Logo size={48} /></div>
          <h1 style={{ fontSize: "2rem" }}>Crear cuenta</h1>
          <p>Únete a la comunidad TallerConnect</p>
        </div>

        {/* Stepper */}
        <div className="stepper-container">
          <div className={`stepper-item ${step >= 1 ? "active" : ""}`}>
            <div className="stepper-circle">1</div>
            <span className="stepper-label">Datos</span>
          </div>
          <div className={`stepper-line ${step >= 2 ? "active" : ""}`}></div>
          <div className={`stepper-item ${step >= 2 ? "active" : ""}`}>
            <div className="stepper-circle">2</div>
            <span className="stepper-label">Seguridad</span>
          </div>
        </div>

        {(errorLocal || errorAuth) && (
          <div className="alert alert-error mb-4">{errorLocal || errorAuth}</div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          {step === 1 && (
            <div className="flex-col">
              <div className="form-group">
                <label htmlFor="nombre">Nombre completo *</label>
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
                <label htmlFor="correo">Correo electrónico *</label>
                <input
                  id="correo"
                  name="correo"
                  type="email"
                  value={formData.correo}
                  onChange={handleChange}
                  placeholder="tu@correo.com"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="form-group">
                <label htmlFor="cedula">Cédula *</label>
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
                <label htmlFor="celular">Teléfono (opcional)</label>
                <input
                  id="celular"
                  name="celular"
                  type="text"
                  value={formData.celular}
                  onChange={handleChange}
                  placeholder="+57 300 1234567"
                  disabled={isSubmitting}
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="flex-col">
              <div className="form-group">
                <label htmlFor="password">Contraseña *</label>
                <div style={{ position: "relative", width: "100%" }}>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Mínimo 6 caracteres"
                    required
                    disabled={isSubmitting}
                    style={{ paddingRight: "40px" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    className="password-toggle-btn"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="confirmarPassword">Confirmar contraseña *</label>
                <div style={{ position: "relative", width: "100%" }}>
                  <input
                    id="confirmarPassword"
                    name="confirmarPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmarPassword}
                    onChange={handleChange}
                    placeholder="Repite tu contraseña"
                    required
                    disabled={isSubmitting}
                    style={{ paddingRight: "40px" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    tabIndex={-1}
                    className="password-toggle-btn"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-4 mt-6">
            {step === 2 && (
              <button
                type="button"
                className="btn btn-outline"
                style={{ flex: 1 }}
                onClick={() => { setStep(1); setErrorLocal(null); }}
                disabled={isSubmitting}
              >
                Atrás
              </button>
            )}
            <button
              type="submit"
              className="btn btn-primary"
              style={{ flex: step === 2 ? 2 : 1 }}
              disabled={isSubmitting}
            >
              {isSubmitting ? <Spinner /> : step === 1 ? "Continuar" : "Crear cuenta"}
            </button>
          </div>
        </form>

        <div className="login-footer" style={{ marginTop: "2rem", textAlign: "center" }}>
          <span style={{ borderTop: "2px solid var(--color-border)", display: "block", width: "30px", margin: "0 auto 1.5rem auto" }}></span>
          <div style={{ color: "var(--color-text-light)", fontSize: "0.95rem" }}>
            ¿Ya tienes cuenta?
            <Link to="/login" className="link" style={{ display: "block", marginTop: "0.5rem", color: "var(--color-primary)", fontWeight: "700" }}>
              Inicia sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
