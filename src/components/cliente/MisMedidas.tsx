import { useAuth } from "../../context/AuthContext";
import { usePrendas } from "../../hooks/usePrendas";
import { MEDIDAS_DISPONIBLES } from "../../utils/constantes";
import { formatearFechaCorta } from "../../utils/helpers";
import { Spinner } from "../common/Spinner";
import { Ruler } from "lucide-react";

export function MisMedidas() {
  const { usuario } = useAuth();
  const { prendas, cargando } = usePrendas(usuario?.uid);

  if (cargando) return <div className="flex-center p-8"><Spinner /></div>;

  if (prendas.length === 0) {
    return (
      <div className="py-6 text-center">
        <h1 className="text-3xl font-bold mb-4">Mis Medidas</h1>
        <div className="card glass-panel py-12">
          <div className="flex justify-center mb-4 text-primary opacity-50"><Ruler size={48} /></div>
          <p className="text-muted">Aún no hay registros de tus medidas. Se registrarán con tu primera prenda.</p>
        </div>
      </div>
    );
  }

  const ultimaPrenda = prendas[0]; // La lista viene ordenada por fecha DESC
  const prendasAnteriores = prendas.slice(1);

  return (
    <div className="py-6">
      <div className="mb-8 text-center md:text-left">
        <h1 className="text-3xl font-bold mb-2">Mis Medidas Corporales</h1>
        <p className="text-muted">Tu perfil de medidas actualizadas basadas en tu última confección.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Panel Principal: Medidas Actuales */}
        <div className="lg:col-span-2">
          <div className="card glass-panel border-primary">
            <div className="flex-between mb-6 border-b border-glass pb-4">
              <h2 className="text-xl font-bold flex items-center gap-2 text-primary">
                <Ruler size={20} /> Medidas Actuales
              </h2>
              <div className="text-sm text-muted text-right">
                Tomadas el: <br/>
                <strong className="text-foreground">
                  {formatearFechaCorta(ultimaPrenda.fechaInicio.toDate().toISOString().split("T")[0])}
                </strong>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {MEDIDAS_DISPONIBLES.map(m => (
                <div key={m.clave} className="bg-glass-dark p-4 rounded-lg text-center transform transition-transform hover:scale-105">
                  <div className="text-muted text-sm uppercase tracking-wider mb-2">{m.etiqueta}</div>
                  <div className="text-2xl font-bold text-white">
                    {ultimaPrenda.medidas[m.clave]} <span className="text-sm font-normal text-muted">{m.unidad}</span>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted text-center mt-6">
              Estas medidas se usaron para la prenda: <strong>{ultimaPrenda.estiloNombre}</strong>
            </p>
          </div>
        </div>

        {/* Panel Lateral: Historial */}
        <div>
          <h3 className="text-xl font-bold mb-4">Historial de Cambios</h3>
          
          <div className="space-y-4">
            {prendasAnteriores.length > 0 ? (
              prendasAnteriores.map((prenda) => (
                <div key={prenda.id} className="card glass-panel p-4">
                  <div className="text-sm text-primary mb-1">
                    {formatearFechaCorta(prenda.fechaInicio.toDate().toISOString().split("T")[0])}
                  </div>
                  <div className="font-bold mb-3">{prenda.estiloNombre}</div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm text-muted">
                    {/* Solo mostrar un resumen de 4 medidas clave para no saturar */}
                    <div>Talle: {prenda.medidas.talle} cm</div>
                    <div>Pecho: {prenda.medidas.pecho} cm</div>
                    <div>Cintura: {prenda.medidas.cintura} cm</div>
                    <div>Cadera: {prenda.medidas.cadera} cm</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center p-4 border border-dashed border-glass rounded text-muted">
                No hay registros anteriores.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
