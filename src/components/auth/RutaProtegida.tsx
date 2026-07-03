import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Spinner } from "../common/Spinner";

interface RutaProtegidaProps {
  children: React.ReactNode;
  rolesPermitidos?: ("sastre" | "cliente")[];
}

/**
 * Componente Wrapper para proteger rutas.
 * 1. Espera a que se verifique la sesión de Firebase.
 * 2. Si no hay usuario, redirige a /login.
 * 3. Si hay usuario, verifica si tiene el rol permitido.
 * 4. Si el rol no está permitido, redirige a un fallback seguro.
 */
export function RutaProtegida({ children, rolesPermitidos }: RutaProtegidaProps) {
  const { usuario, firebaseUser, cargando } = useAuth();

  // 1. Mostrar spinner mientras Firebase verifica si hay sesión activa
  // y mientras cargamos los datos adicionales del usuario desde Firestore
  if (cargando) {
    return (
      <div className="flex-center full-screen">
        <Spinner />
        <p style={{ marginLeft: "1rem" }}>Cargando...</p>
      </div>
    );
  }

  // 2. Si no hay usuario en Firebase, redirigir a Login
  if (!firebaseUser) {
    return <Navigate to="/login" replace />;
  }

  // 3. Si ya hay usuario en Firebase, pero aún no se carga de Firestore
  if (!usuario) {
    if (!cargando) {
      return (
        <div className="flex-center full-screen" style={{ flexDirection: "column", textAlign: "center", padding: "2rem" }}>
          <h2 style={{ marginBottom: "1rem", color: "var(--color-error)" }}>Error de Perfil</h2>
          <p style={{ marginBottom: "2rem" }}>
            Tu cuenta está autenticada, pero no encontramos tus datos en la base de datos.<br/>
            Esto suele ocurrir si creaste la cuenta manualmente fuera de la aplicación.
          </p>
          <button className="btn btn-primary" onClick={() => window.location.href = '/login'}>
            Volver al Inicio
          </button>
        </div>
      );
    }
    
    return (
      <div className="flex-center full-screen">
        <Spinner />
        <p style={{ marginLeft: "1rem" }}>Verificando permisos...</p>
      </div>
    );
  }

  // 4. Verificar si el correo está confirmado (Excepto para el admin de pruebas)
  if (!firebaseUser.emailVerified && firebaseUser.email !== "admin@taller.com") {
    return (
      <div className="flex-center full-screen" style={{ flexDirection: "column", textAlign: "center", padding: "2rem" }}>
        <h2 style={{ marginBottom: "1rem", color: "var(--color-primary)" }}>Verifica tu correo</h2>
        <p style={{ marginBottom: "2rem" }}>
          Hemos enviado un enlace de verificación a <strong>{firebaseUser.email}</strong>.
          <br />
          Por favor, revisa tu bandeja de entrada y verifica tu cuenta para poder continuar.
        </p>
        <div style={{ display: "flex", gap: "1rem" }}>
          <button className="btn btn-primary" onClick={() => window.location.reload()}>
            Ya lo verifiqué
          </button>
          <button 
            className="btn btn-secondary" 
            onClick={() => {
              import("firebase/auth").then(({ signOut }) => {
                import("../../firebase/config").then(({ auth }) => signOut(auth));
              });
            }}
          >
            Cerrar Sesión
          </button>
        </div>
        <p style={{ marginTop: "1rem", fontSize: "0.9rem", color: "var(--color-text-light)" }}>
          Si no ves el correo, revisa tu carpeta de spam.
        </p>
      </div>
    );
  }

  // 4. Si se especificaron roles permitidos y el usuario no los tiene
  if (rolesPermitidos && !rolesPermitidos.includes(usuario.rol)) {
    // Redirigir al inicio del rol correcto
    if (usuario.rol === "sastre") {
      return <Navigate to="/sastre/dashboard" replace />;
    } else {
      return <Navigate to="/cliente/inicio" replace />;
    }
  }

  // Si pasa todas las validaciones, renderizar el componente hijo
  return <>{children}</>;
}
