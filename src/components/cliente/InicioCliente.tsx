import { useAuth } from "../../context/AuthContext";
import { usePrendas } from "../../hooks/usePrendas";
import { useCitas } from "../../hooks/useCitas";
import { Link } from "react-router-dom";
import { Spinner } from "../common/Spinner";
import { BadgeEstado } from "../common/BadgeEstado";
import { formatearFechaCorta } from "../../utils/helpers";
import { ESTADOS_PRENDA } from "../../utils/constantes";
import { Shirt, Sparkles, Calendar, ShoppingBag, Ruler } from "lucide-react";

export function InicioCliente() {
  const { usuario } = useAuth();
  
  // Hooks filtrados por el UID del cliente actual
  const { prendas, cargando: cargandoPrendas } = usePrendas(usuario?.uid);
  const { citas, cargando: cargandoCitas } = useCitas(usuario?.uid);

  if (cargandoPrendas || cargandoCitas) {
    return <div className="flex-center p-8"><Spinner /></div>;
  }

  // Filtrar prendas activas (no terminadas)
  const prendasActivas = prendas.filter(p => p.estado !== "terminado");
  const ultimaPrendaTerminada = prendas.find(p => p.estado === "terminado");
  
  // Buscar próxima cita (pendiente o confirmada, futura)
  // Simplificado para la demo
  const proximasCitas = citas.filter(c => c.estado !== "cancelada");
  const proximaCita = proximasCitas.length > 0 ? proximasCitas[0] : null;

  return (
    <div className="dashboard cliente-dashboard py-6">
      <div className="mb-8 text-center md:text-left">
        <h1 className="text-3xl font-bold mb-2">¡Hola, {usuario?.nombre.split(" ")[0]}!</h1>
        <p className="text-muted text-lg">Bienvenido/a a tu panel personal de TallerConnect.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Panel Izquierdo: Prendas en Proceso */}
        <div className="card glass-panel">
          <div className="flex-between mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Shirt size={20} className="text-primary" /> Tus prendas en proceso
            </h2>
            <Link to="/cliente/prendas" className="text-sm text-primary underline">
              Ver todas
            </Link>
          </div>

          {prendasActivas.length > 0 ? (
            <div className="space-y-4">
              {prendasActivas.map(prenda => {
                const configEstado = ESTADOS_PRENDA.find(e => e.valor === prenda.estado);
                // Calcular "progreso" visual simple basado en el índice del estado
                const indiceEstado = ESTADOS_PRENDA.findIndex(e => e.valor === prenda.estado);
                const porcentaje = Math.max(10, (indiceEstado / 3) * 100);

                return (
                  <div key={prenda.id} className="bg-glass-dark p-4 rounded-lg">
                    <div className="flex-between mb-2">
                      <strong className="text-lg">{prenda.estiloNombre}</strong>
                      <BadgeEstado estado={prenda.estado} />
                    </div>
                    
                    {/* Barra de progreso */}
                    <div className="progress-bar-bg mt-3">
                      <div 
                        className="progress-bar-fill transition-all" 
                        style={{ 
                          width: `${porcentaje}%`, 
                          backgroundColor: configEstado?.color 
                        }}
                      ></div>
                    </div>
                    <div className="text-xs text-right mt-1 text-muted">
                      Iniciado el {formatearFechaCorta(prenda.fechaInicio.toDate().toISOString().split("T")[0])}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="flex justify-center mb-4 text-primary opacity-50"><Sparkles size={48} /></div>
              <p className="text-muted">No tienes prendas en confección actualmente.</p>
              {ultimaPrendaTerminada && (
                <p className="text-sm mt-4 text-success">
                  Tu última prenda fue entregada el {formatearFechaCorta(ultimaPrendaTerminada.fechaTerminado!.toDate().toISOString().split("T")[0])}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Panel Derecho: Citas y Medidas */}
        <div className="space-y-6">
          
          {/* Próxima Cita */}
          <div className="card glass-panel gradient-border border-primary">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Calendar size={20} className="text-primary" /> Tu Próxima Cita
            </h2>
            
            {proximaCita ? (
              <div className="text-center">
                <div className="flex justify-center mb-4 text-primary">
                  {proximaCita.tipo === 'prueba' ? <Shirt size={48} /> : <ShoppingBag size={48} />}
                </div>
                <div className="text-2xl font-bold text-primary mb-1">
                  {formatearFechaCorta(proximaCita.fecha)} a las {proximaCita.hora}
                </div>
                <div className="capitalize text-lg mb-4">Cita de {proximaCita.tipo}</div>
                
                <div className="flex justify-center gap-3 mt-4">
                  <Link to="/cliente/citas" className="btn btn-outline btn-sm">Gestionar Citas</Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted mb-4">No tienes citas agendadas.</p>
                <Link to="/cliente/citas" className="btn btn-primary">Agendar Cita</Link>
              </div>
            )}
          </div>

          {/* Medidas Rápidas */}
          <div className="card glass-panel">
            <div className="flex-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Ruler size={20} className="text-primary" /> Últimas Medidas
              </h2>
              <Link to="/cliente/medidas" className="text-sm text-primary underline">
                Ver detalle
              </Link>
            </div>
            
            {prendas.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-glass-dark p-2 rounded text-center">
                  <div className="text-muted text-xs uppercase">Talle</div>
                  <div className="font-bold">{prendas[0].medidas.talle} cm</div>
                </div>
                <div className="bg-glass-dark p-2 rounded text-center">
                  <div className="text-muted text-xs uppercase">Pecho</div>
                  <div className="font-bold">{prendas[0].medidas.pecho} cm</div>
                </div>
                <div className="bg-glass-dark p-2 rounded text-center">
                  <div className="text-muted text-xs uppercase">Cintura</div>
                  <div className="font-bold">{prendas[0].medidas.cintura} cm</div>
                </div>
                <div className="bg-glass-dark p-2 rounded text-center">
                  <div className="text-muted text-xs uppercase">Cadera</div>
                  <div className="font-bold">{prendas[0].medidas.cadera} cm</div>
                </div>
              </div>
            ) : (
              <p className="text-center text-muted py-4">
                Tus medidas se registrarán en tu primera prenda.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
