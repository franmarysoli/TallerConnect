import { Routes, Route, Navigate } from "react-router-dom";
import { RutaProtegida } from "./components/auth/RutaProtegida";
import { Login } from "./components/auth/Login";
import { Registro } from "./components/auth/Registro";

// Layouts
import { LayoutSastre } from "./components/layout/LayoutSastre";
import { LayoutCliente } from "./components/layout/LayoutCliente";

// Vistas Sastre
import { Dashboard } from "./components/sastre/Dashboard";
import { ClientesLista } from "./components/sastre/ClientesLista";
import { TelasLista } from "./components/sastre/TelasLista";
import { EstilosLista } from "./components/sastre/EstilosLista";
import { PrendasLista } from "./components/sastre/PrendasLista";
import { CalendarioCitas } from "./components/sastre/CalendarioCitas";

// Vistas Cliente
import { InicioCliente } from "./components/cliente/InicioCliente";
import { MisPrendas } from "./components/cliente/MisPrendas";
import { MisMedidas } from "./components/cliente/MisMedidas";
import { MisCitas } from "./components/cliente/MisCitas";

export default function App() {
  return (
    <Routes>
      {/* Rutas Públicas */}
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Registro />} />

      {/* Redirección inicial (ruta raíz) */}
      <Route path="/" element={<RutaProtegida><RedireccionPorRol /></RutaProtegida>} />

      {/* Rutas Privadas: SASTRE */}
      <Route
        path="/sastre"
        element={
          <RutaProtegida rolesPermitidos={["sastre"]}>
            <LayoutSastre />
          </RutaProtegida>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="clientes" element={<ClientesLista />} />
        <Route path="telas" element={<TelasLista />} />
        <Route path="estilos" element={<EstilosLista />} />
        <Route path="prendas" element={<PrendasLista />} />
        <Route path="citas" element={<CalendarioCitas />} />
      </Route>

      {/* Rutas Privadas: CLIENTE */}
      <Route
        path="/cliente"
        element={
          <RutaProtegida rolesPermitidos={["cliente"]}>
            <LayoutCliente />
          </RutaProtegida>
        }
      >
        <Route index element={<Navigate to="inicio" replace />} />
        <Route path="inicio" element={<InicioCliente />} />
        <Route path="prendas" element={<MisPrendas />} />
        <Route path="medidas" element={<MisMedidas />} />
        <Route path="citas" element={<MisCitas />} />
      </Route>

      {/* Ruta 404 / Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

/**
 * Componente helper que redirige a la raíz de cada rol
 * Solo se renderiza dentro de una RutaProtegida, por lo que el usuario ya existe
 */
function RedireccionPorRol() {
  // Aquí podríamos usar useAuth(), pero sabemos que RutaProtegida ya validó
  // Por seguridad, si llega aquí es porque tiene sesión.
  return <Navigate to="/sastre/dashboard" replace />; // Fallback a un rol u otro si es necesario, 
  // Nota: RutaProtegida ya maneja la redirección correcta si no tiene el rol
}
