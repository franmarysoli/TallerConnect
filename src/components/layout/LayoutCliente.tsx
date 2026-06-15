import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";

export function LayoutCliente() {
  return (
    <div className="app-layout">
      <Navbar />
      <div className="main-container cliente-layout">
        {/* El cliente no tiene sidebar, usa navegación horizontal en el Navbar */}
        <main className="content-area container">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
