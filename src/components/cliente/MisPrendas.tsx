import { useAuth } from "../../context/AuthContext";
import { usePrendas } from "../../hooks/usePrendas";
import { Spinner } from "../common/Spinner";
import { BadgeEstado } from "../common/BadgeEstado";
import { formatearFechaCorta, formatearMoneda } from "../../utils/helpers";
import { ESTADOS_PRENDA } from "../../utils/constantes";
import { Shirt } from "lucide-react";

export function MisPrendas() {
  const { usuario } = useAuth();
  const { prendas, cargando } = usePrendas(usuario?.uid);

  if (cargando) return <div className="flex-center p-8"><Spinner /></div>;

  return (
    <div className="py-6">
      <div className="mb-8 text-center md:text-left">
        <h1 className="text-3xl font-bold mb-2">Mis Prendas</h1>
        <p className="text-muted">Consulta el estado y costo de todas tus prendas confeccionadas o en proceso.</p>
      </div>

      {prendas.length === 0 ? (
        <div className="card glass-panel text-center py-12">
          <div className="flex justify-center mb-4 text-primary opacity-50"><Shirt size={48} /></div>
          <h2 className="text-2xl font-bold mb-2">Aún no tienes prendas</h2>
          <p className="text-muted">
            Acércate al taller para tomarte las medidas y comenzar tu primera confección.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {prendas.map((prenda) => {
            const configEstado = ESTADOS_PRENDA.find(e => e.valor === prenda.estado);
            const indiceEstado = ESTADOS_PRENDA.findIndex(e => e.valor === prenda.estado);
            const porcentaje = Math.max(10, (indiceEstado / 3) * 100);

            return (
              <div key={prenda.id} className="card glass-panel flex flex-col relative overflow-hidden group">
                
                {/* Indicador de color en el borde superior */}
                <div 
                  className="absolute top-0 left-0 w-full h-1"
                  style={{ backgroundColor: configEstado?.color }}
                ></div>

                <div className="flex-between mb-4">
                  <h3 className="text-xl font-bold">{prenda.estiloNombre}</h3>
                  <BadgeEstado estado={prenda.estado} />
                </div>

                <div className="space-y-3 flex-grow mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Tela:</span>
                    <span className="font-medium">{prenda.telaNombre}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Fecha de inicio:</span>
                    <span>{formatearFechaCorta(prenda.fechaInicio.toDate().toISOString().split("T")[0])}</span>
                  </div>
                  
                  {prenda.estado === "terminado" && prenda.fechaTerminado && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted">Fecha de entrega:</span>
                      <span className="text-success">
                        {formatearFechaCorta(prenda.fechaTerminado.toDate().toISOString().split("T")[0])}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between text-sm mt-4 pt-4 border-t border-glass">
                    <span className="text-muted">Costo Estimado:</span>
                    <span className="font-bold text-primary text-lg">
                      {formatearMoneda(prenda.costoTotal)}
                    </span>
                  </div>
                </div>

                {/* Tracking Visual */}
                <div className="mt-auto">
                  <div className="flex-between text-xs text-muted mb-1 px-1">
                    <span>Corte</span>
                    <span>Terminado</span>
                  </div>
                  <div className="progress-bar-bg">
                    <div 
                      className="progress-bar-fill transition-all duration-1000" 
                      style={{ 
                        width: `${porcentaje}%`, 
                        backgroundColor: configEstado?.color,
                        boxShadow: `0 0 10px ${configEstado?.color}80` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
