import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";

export function LayoutSastre() {
  return (
    <div className="app-layout">
      <Navbar />
      <div className="main-container sastre-layout">
        <Sidebar />
        <main className="content-area">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
