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
  // (caso raro de delay entre auth y db)
  if (!usuario) {
    return (
      <div className="flex-center full-screen">
        <Spinner />
        <p style={{ marginLeft: "1rem" }}>Verificando permisos...</p>
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
