import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Spinner } from "../common/Spinner";
import { Logo } from "../common/Logo";

export function Login() {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { iniciarSesion, error, limpiarError } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!correo || !password) return;

    setIsSubmitting(true);
    limpiarError();

    try {
      await iniciarSesion(correo, password);
      // El onAuthStateChanged y las RutasProtegidas se encargarán
      // de redirigir al panel correspondiente (sastre o cliente)
      navigate("/");
    } catch (err) {
      setIsSubmitting(false);
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

        {error && <div className="alert alert-error">{error}</div>}

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
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                limpiarError();
              }}
              placeholder="••••••••"
              required
              disabled={isSubmitting}
            />
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
