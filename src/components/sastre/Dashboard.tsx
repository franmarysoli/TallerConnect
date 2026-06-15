import { useClientes } from "../../hooks/useClientes";
import { usePrendas } from "../../hooks/usePrendas";
import { useCitas } from "../../hooks/useCitas";
import { useTelas } from "../../hooks/useTelas";
import { ESTADOS_PRENDA, STOCK_BAJO_METROS } from "../../utils/constantes";
import { fechaHoy } from "../../utils/helpers";
import { Spinner } from "../common/Spinner";
import { Link } from "react-router-dom";
import { Calendar, AlertTriangle } from "lucide-react";

export function Dashboard() {
  const { clientes, cargando: cargandoClientes } = useClientes();
  const { prendas, cargando: cargandoPrendas } = usePrendas();
  const { citas, cargando: cargandoCitas } = useCitas();
  const { telas, cargando: cargandoTelas } = useTelas();

  if (cargandoClientes || cargandoPrendas || cargandoCitas || cargandoTelas) {
    return <div className="flex-center p-8"><Spinner /></div>;
  }

  // Cálculos para las métricas
  const prendasPorEstado = ESTADOS_PRENDA.map((estadoInfo) => ({
    ...estadoInfo,
    cantidad: prendas.filter((p) => p.estado === estadoInfo.valor).length,
  }));

  const citasDeHoy = citas.filter(
    (c) => c.fecha === fechaHoy() && c.estado !== "cancelada"
  );

  const telasBajoStock = telas.filter((t) => t.metrosDisponibles < STOCK_BAJO_METROS);

  return (
    <div className="dashboard">
      <div className="flex-between mb-6">
        <h1 className="text-3xl font-bold">Resumen del Taller</h1>
        <div className="text-sm text-muted">
          Total Clientes: <strong className="text-primary">{clientes.length}</strong>
        </div>
      </div>

      {/* Tarjetas de estado de prendas */}
      <h2 className="text-xl mb-4">Prendas en Proceso</h2>
      <div className="grid-cards mb-8">
        {prendasPorEstado.map((estado) => (
          <div key={estado.valor} className="card stat-card glass-panel flex-between">
            <div>
              <div className="stat-label text-muted">{estado.etiqueta}</div>
              <div className="stat-value text-3xl font-bold" style={{ color: estado.color }}>
                {estado.cantidad}
              </div>
            </div>
            <div className="stat-icon text-4xl opacity-50">{estado.icono}</div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Panel de citas de hoy */}
        <div className="card glass-panel">
          <div className="flex-between mb-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Calendar size={20} className="text-primary" /> Citas de Hoy
            </h3>
            <span className="badge badge-primary">{citasDeHoy.length}</span>
          </div>
          
          {citasDeHoy.length === 0 ? (
            <p className="text-muted text-center py-4">No hay citas programadas para hoy.</p>
          ) : (
            <ul className="list-group">
              {citasDeHoy.map((cita) => (
                <li key={cita.id} className="list-group-item flex-between">
                  <div>
                    <div className="font-bold">{cita.hora} - {cita.clienteNombre}</div>
                    <div className="text-sm text-muted">Tipo: {cita.tipo}</div>
                  </div>
                  <Link to="/sastre/citas" className="btn btn-outline btn-sm">Ver</Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Panel de inventario bajo */}
        <div className="card glass-panel border-warning">
          <div className="flex-between mb-4">
            <h3 className="text-lg font-bold text-warning flex items-center gap-2">
              <AlertTriangle size={20} /> Telas con Bajo Stock
            </h3>
            <span className="badge badge-warning">{telasBajoStock.length}</span>
          </div>
          
          {telasBajoStock.length === 0 ? (
            <p className="text-muted text-center py-4">El inventario de telas está saludable.</p>
          ) : (
            <ul className="list-group">
              {telasBajoStock.map((tela) => (
                <li key={tela.id} className="list-group-item flex-between">
                  <div className="font-bold">{tela.nombre}</div>
                  <div className="flex items-center gap-4">
                    <span className="text-error font-bold">{tela.metrosDisponibles} m</span>
                    <Link to="/sastre/telas" className="btn btn-outline btn-sm">Reponer</Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
