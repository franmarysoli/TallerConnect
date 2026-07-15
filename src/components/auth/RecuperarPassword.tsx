import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Spinner } from "../common/Spinner";
import { Logo } from "../common/Logo";
import { useToast } from "../../context/ToastContext";
import { CheckCircle2 } from "lucide-react";

export function RecuperarPassword() {
  const [correo, setCorreo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { recuperarPassword } = useAuth();
  const { showToast } = useToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!correo) return;

    setIsSubmitting(true);

    try {
      await recuperarPassword(correo);
      setIsSuccess(true);
    } catch (err: any) {
      setIsSubmitting(false);
      showToast(err.message || "Error al intentar recuperar la contraseña.", "error");
    }
  }

  return (
    <div className="login-container">
      <div className="login-card glass-panel" style={{ padding: "3rem" }}>
        <div className="login-header" style={{ marginBottom: "2rem" }}>
          <div className="flex justify-center mb-4"><Logo size={64} /></div>
          <h1 style={{ fontSize: "1.75rem", marginBottom: "0.5rem" }}>Recuperar contraseña</h1>
          <p style={{ color: "var(--color-text-light)", fontSize: "0.95rem" }}>
            Te enviaremos un enlace para restablecer tu contraseña
          </p>
        </div>

        {isSuccess ? (
          <div style={{ textAlign: "center", marginTop: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "1rem", color: "var(--color-success)" }}>
              <CheckCircle2 size={64} strokeWidth={1.5} />
            </div>
            <h2 style={{ fontSize: "1.5rem", marginBottom: "0.75rem" }}>¡Correo enviado!</h2>
            <p style={{ color: "var(--color-text-light)", fontSize: "0.95rem", marginBottom: "2rem", lineHeight: "1.5" }}>
              Revisa tu bandeja de entrada en <strong>{correo}</strong> y sigue las instrucciones para restablecer tu contraseña.
            </p>
            <Link 
              to="/login"
              className="btn btn-primary w-full"
              style={{ padding: "14px", fontSize: "1rem", borderRadius: "8px", display: "inline-block" }}
            >
              Volver al inicio de sesión
            </Link>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group" style={{ textAlign: "left", marginBottom: "1.5rem" }}>
                <label htmlFor="correo" style={{ display: "block", marginBottom: "8px", fontWeight: 600, fontSize: "0.9rem" }}>
                  Correo electrónico
                </label>
                <input
                  id="correo"
                  type="email"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  placeholder="tu@correo.com"
                  required
                  disabled={isSubmitting}
                  style={{ width: "100%", padding: "12px 16px", borderRadius: "8px", border: "1.5px solid var(--color-border)" }}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={isSubmitting}
                style={{ padding: "14px", fontSize: "1rem", borderRadius: "8px" }}
              >
                {isSubmitting ? <Spinner /> : "Enviar enlace de recuperación"}
              </button>
            </form>

            <div className="login-footer" style={{ marginTop: "1.5rem" }}>
              <Link 
                to="/login" 
                style={{ 
                  color: "var(--color-primary)", 
                  fontWeight: 500, 
                  fontSize: "0.9rem",
                  textDecoration: "underline"
                }}
              >
                ← Volver al inicio de sesión
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
