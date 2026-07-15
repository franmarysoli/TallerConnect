import { useState } from "react";
import { useNavigate, Link, Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Spinner } from "../common/Spinner";
import { Logo } from "../common/Logo";
import { useToast } from "../../context/ToastContext";
import { Eye, EyeOff } from "lucide-react";

export function Login() {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { iniciarSesion, limpiarError, usuario } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Si ya está logueado, lo mandamos al home
  if (usuario) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!correo || !password) return;

    setIsSubmitting(true);
    limpiarError();

    try {
      await iniciarSesion(correo, password);
      navigate("/");
    } catch (err: any) {
      setIsSubmitting(false);
      showToast(err.message || "Ocurrió un error inesperado.", "error");
    }
  }

  return (
    <div className="login-container">
      <div className="login-card glass-panel">
        <div className="login-header">
          <div className="flex justify-center mb-4"><Logo size={64} /></div>
          <h1>TallerConnect</h1>
          <p>Inicia sesión para gestionar tus prendas y citas</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="correo">Correo Electrónico</label>
            <input
              id="correo"
              type="email"
              value={correo}
              onChange={(e) => {
                setCorreo(e.target.value);
                limpiarError();
              }}
              placeholder="tu@correo.com"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <div style={{ position: "relative", width: "100%" }}>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  limpiarError();
                }}
                placeholder="Tu contraseña"
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
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "8px" }}>
              <Link
                to="/recuperar-password"
                style={{ 
                  color: "var(--color-foreground)", 
                  fontWeight: 600, 
                  textDecoration: "underline",
                  fontSize: "0.875rem"
                }}
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? <Spinner /> : "Ingresar"}
          </button>
        </form>

        <div className="login-footer">
          <p>¿No tienes una cuenta?</p>
          <Link to="/registro" className="link">Regístrate aquí</Link>
        </div>
      </div>
    </div>
  );
}
