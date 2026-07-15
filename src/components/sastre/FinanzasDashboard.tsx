import { useState } from "react";
import { usePrendas } from "../../hooks/usePrendas";
import { useToast } from "../../context/ToastContext";
import { formatearMoneda } from "../../utils/helpers";
import { Spinner } from "../common/Spinner";
import { Modal } from "../common/Modal";
import { Wallet, TrendingUp, AlertCircle, Search, Edit2, User } from "lucide-react";
import type { Prenda } from "../../types";

export function FinanzasDashboard() {
  const { prendas, cargando, actualizarAbono } = usePrendas();
  const { showToast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [prendaSeleccionada, setPrendaSeleccionada] = useState<Prenda | null>(null);
  const [nuevoAbono, setNuevoAbono] = useState<number | "">("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (cargando) return <div className="flex-center p-8"><Spinner /></div>;

  // Calcular métricas
  const totalEsperado = prendas.reduce((sum, p) => sum + p.costoTotal, 0);
  // Si ya estaba "terminado" de antes, asumimos que se recaudó el total aunque el abono no se haya guardado
  const totalRecaudado = prendas.reduce((sum, p) => sum + (p.estado === "terminado" ? p.costoTotal : (p.abono || 0)), 0);
  const porCobrar = totalEsperado - totalRecaudado;

  // Prendas con saldo pendiente (eliminamos de aquí las terminadas automáticamente)
  const prendasPendientes = prendas
    .filter(p => p.estado !== "terminado" && (p.costoTotal - (p.abono || 0)) > 0)
    .filter(p => 
      p.clienteNombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.estiloNombre.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const handleAbrirModal = (prenda: Prenda) => {
    setPrendaSeleccionada(prenda);
    setNuevoAbono(prenda.abono || "");
  };

  const handleGuardarAbono = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prendaSeleccionada?.id) return;

    const abonoFinal = Number(nuevoAbono) || 0;

    if (abonoFinal < 0) {
      showToast("El abono no puede ser negativo.", "error");
      return;
    }
    
    if (abonoFinal > prendaSeleccionada.costoTotal) {
      showToast("El abono no puede superar el costo total de la prenda.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      await actualizarAbono(prendaSeleccionada.id, abonoFinal);
      showToast("Abono actualizado correctamente", "success");
      setPrendaSeleccionada(null);
    } catch (error) {
      console.error(error);
      showToast("Error al actualizar el abono", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Finanzas y Cobranza</h1>
        <p className="text-muted">Lleva el control del dinero recaudado y los saldos pendientes.</p>
      </div>

      {/* Tarjetas de Métricas (KPIs) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card glass-panel flex items-center gap-4">
          <div className="p-4 bg-primary/10 rounded-full text-primary">
            <TrendingUp size={32} />
          </div>
          <div>
            <p className="text-muted font-medium text-sm">Total Esperado</p>
            <p className="text-2xl font-bold">{formatearMoneda(totalEsperado)}</p>
          </div>
        </div>
        
        <div className="card glass-panel flex items-center gap-4">
          <div className="p-4 bg-success/10 rounded-full text-success">
            <Wallet size={32} />
          </div>
          <div>
            <p className="text-muted font-medium text-sm">Total Recaudado</p>
            <p className="text-2xl font-bold text-success">{formatearMoneda(totalRecaudado)}</p>
          </div>
        </div>
        
        <div className="card glass-panel flex items-center gap-4">
          <div className="p-4 bg-error/10 rounded-full text-error">
            <AlertCircle size={32} />
          </div>
          <div>
            <p className="text-muted font-medium text-sm">Por Cobrar</p>
            <p className="text-2xl font-bold text-error">{formatearMoneda(porCobrar)}</p>
          </div>
        </div>
      </div>

      {/* Cuentas por Cobrar */}
      <div className="card glass-panel">
        <div className="flex-between mb-6 flex-wrap gap-4">
          <h2 className="text-xl font-bold">Cuentas por Cobrar</h2>
          
          <div className="search-bar w-full md:w-64">
            <Search className="search-icon" size={20} />
            <input 
              type="text" 
              placeholder="Buscar por cliente o prenda..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-glass bg-glass-dark/30 desktop-only">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-glass bg-glass">
                <th className="py-4 px-5 text-xs font-semibold text-muted uppercase tracking-wider">Cliente</th>
                <th className="py-4 px-5 text-xs font-semibold text-muted uppercase tracking-wider">Prenda</th>
                <th className="py-4 px-5 text-xs font-semibold text-muted uppercase tracking-wider">Costo Total</th>
                <th className="py-4 px-5 text-xs font-semibold text-muted uppercase tracking-wider">Abonado</th>
                <th className="py-4 px-5 text-xs font-semibold text-muted uppercase tracking-wider">Falta por Pagar</th>
                <th className="py-4 px-5 text-right text-xs font-semibold text-muted uppercase tracking-wider">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-glass/50">
              {prendasPendientes.length > 0 ? (
                prendasPendientes.map((prenda) => {
                  const abonado = prenda.abono || 0;
                  const saldo = prenda.costoTotal - abonado;
                  const progreso = Math.round((abonado / prenda.costoTotal) * 100);
                  
                  return (
                    <tr key={prenda.id} className="hover:bg-glass/40 transition-all duration-200 group">
                      <td className="py-4 px-5">
                        <div className="font-bold text-foreground">{prenda.clienteNombre}</div>
                        <div className="text-xs text-muted font-medium mt-0.5">ID: {prenda.clienteId.slice(0, 6)}...</div>
                      </td>
                      <td className="py-4 px-5">
                        <div className="font-medium text-foreground">{prenda.estiloNombre}</div>
                        <span className="inline-flex items-center mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary uppercase tracking-wide">
                          {prenda.telaNombre}
                        </span>
                      </td>
                      <td className="py-4 px-5">
                        <div className="font-bold">{formatearMoneda(prenda.costoTotal)}</div>
                      </td>
                      <td className="py-4 px-5">
                        <div className="flex flex-col gap-1.5">
                          <span className="font-semibold text-success">{formatearMoneda(abonado)}</span>
                          <div className="w-full bg-glass h-1.5 rounded-full overflow-hidden">
                            <div 
                              className="bg-success h-full rounded-full transition-all duration-500"
                              style={{ width: `${progreso}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-5">
                        <div className="inline-flex items-center px-3 py-1 rounded-full bg-error/10 text-error font-bold border border-error/20 shadow-sm">
                          {formatearMoneda(saldo)}
                        </div>
                      </td>
                      <td className="py-4 px-5 text-right">
                        <button 
                          onClick={() => handleAbrirModal(prenda)}
                          className="btn btn-outline border-glass hover:border-primary text-foreground hover:text-primary hover:bg-primary/5 flex items-center gap-2 ml-auto text-sm py-2 px-4 rounded-lg transition-all shadow-sm group-hover:shadow-md"
                        >
                          <Edit2 size={16} /> <span>Abonar</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center text-muted">
                      <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mb-4 border border-success/20 shadow-inner">
                        <Wallet className="text-success" size={32} />
                      </div>
                      <p className="text-lg font-bold text-foreground">¡Todo está pagado!</p>
                      <p className="text-sm mt-1 max-w-sm">No tienes cuentas por cobrar pendientes en este momento. Excelente trabajo de cobranza.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Vista Móvil: Tarjetas de Cobranza */}
        <div className="mobile-only-flex flex-col gap-4">
          {prendasPendientes.length > 0 ? (
            prendasPendientes.map((prenda) => {
              const abonado = prenda.abono || 0;
              const saldo = prenda.costoTotal - abonado;
              const progreso = Math.round((abonado / prenda.costoTotal) * 100);

              return (
                <div key={prenda.id} className="card glass-panel flex flex-col gap-3 p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg text-foreground">{prenda.clienteNombre}</h3>
                      <div className="text-sm text-muted font-medium">{prenda.estiloNombre}</div>
                    </div>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary uppercase tracking-wide">
                      {prenda.telaNombre}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-2 bg-glass-dark/30 p-3 rounded-lg border border-glass">
                    <div>
                      <div className="text-xs text-muted uppercase font-bold tracking-wider mb-1">Costo Total</div>
                      <div className="font-bold">{formatearMoneda(prenda.costoTotal)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-muted uppercase font-bold tracking-wider mb-1">Falta Pagar</div>
                      <div className="font-bold text-error">{formatearMoneda(saldo)}</div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 mt-1">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted">Abonado:</span>
                      <span className="font-semibold text-success">{formatearMoneda(abonado)}</span>
                    </div>
                    <div className="w-full bg-glass h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-success h-full rounded-full transition-all duration-500"
                        style={{ width: `${progreso}%` }}
                      />
                    </div>
                  </div>

                  <button 
                    onClick={() => handleAbrirModal(prenda)}
                    className="btn btn-outline border-glass hover:border-primary text-foreground hover:text-primary hover:bg-primary/5 flex items-center justify-center gap-2 mt-3 w-full text-sm py-2 rounded-lg transition-all"
                  >
                    <Edit2 size={16} /> <span>Registrar Abono</span>
                  </button>
                </div>
              );
            })
          ) : (
            <div className="card glass-panel flex flex-col items-center justify-center text-muted py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mb-4 border border-success/20 shadow-inner">
                <Wallet className="text-success" size={32} />
              </div>
              <p className="text-lg font-bold text-foreground">¡Todo está pagado!</p>
              <p className="text-sm mt-1">Sin deudas pendientes.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal para Actualizar Abono */}
      <Modal 
        isOpen={!!prendaSeleccionada} 
        onClose={() => setPrendaSeleccionada(null)}
        titulo="Registrar Abono"
        anchoMaximo="480px"
      >
        {prendaSeleccionada && (
          <form onSubmit={handleGuardarAbono} className="flex flex-col gap-6 p-2">
            
            {/* Tarjeta de Resumen (Tipo Recibo) */}
            <div className="bg-glass-dark/40 border border-glass rounded-2xl p-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
              
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                    <User className="text-primary w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-muted uppercase tracking-wider font-semibold">Cliente</div>
                    <div className="font-bold text-foreground">{prendaSeleccionada.clienteNombre}</div>
                  </div>
                </div>
              </div>

              <div className="flex items-start justify-between pb-4 border-b border-glass">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                    <TrendingUp className="text-primary w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-muted uppercase tracking-wider font-semibold">Prenda</div>
                    <div className="font-bold text-foreground">{prendaSeleccionada.estiloNombre}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted uppercase tracking-wider font-semibold">Costo Total</div>
                  <div className="font-black text-xl text-foreground">{formatearMoneda(prendaSeleccionada.costoTotal)}</div>
                </div>
              </div>

              <div className="flex justify-between items-center mt-4">
                <span className="text-sm text-muted font-medium">Abonado hasta ahora:</span>
                <span className="font-bold text-success">{formatearMoneda(prendaSeleccionada.abono || 0)}</span>
              </div>
            </div>

            {/* Input Principal */}
            <div>
              <label className="block text-sm font-semibold mb-3 text-foreground text-center">
                Total de dinero entregado por el cliente
              </label>
              <div className="relative group max-w-xs mx-auto">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-2xl font-black text-muted group-focus-within:text-primary transition-colors">$</span>
                </div>
                <input 
                  type="number"
                  min="0"
                  max={prendaSeleccionada.costoTotal}
                  step="0.01"
                  value={nuevoAbono}
                  onChange={(e) => setNuevoAbono(e.target.value === "" ? "" : Number(e.target.value))}
                  required
                  disabled={isSubmitting}
                  className="w-full bg-glass-dark border-2 border-glass rounded-2xl py-4 pl-10 pr-4 text-center text-3xl font-black text-foreground shadow-inner focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all no-spinner"
                  placeholder="0.00"
                />
              </div>
              <p className="text-xs text-muted mt-3 text-center px-4">
                No ingreses solo la diferencia, ingresa la <strong className="text-foreground">sumatoria total</strong> de lo que ha pagado hasta el día de hoy.
              </p>
            </div>
            
            {/* Tarjeta de Nuevo Saldo */}
            <div className="bg-error/5 border border-error/20 rounded-2xl p-4 flex justify-between items-center shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-error/10 rounded-lg text-error">
                  <Wallet size={20} />
                </div>
                <span className="text-error font-semibold text-sm">Nuevo saldo<br/>pendiente:</span>
              </div>
              <span className="text-error font-black text-2xl tracking-tight">
                {formatearMoneda(Math.max(0, prendaSeleccionada.costoTotal - (Number(nuevoAbono) || 0)))}
              </span>
            </div>

            {/* Acciones */}
            <div className="flex gap-3 mt-2">
              <button 
                type="button" 
                className="btn btn-outline flex-1 rounded-xl py-3 border-glass hover:bg-glass/50" 
                onClick={() => setPrendaSeleccionada(null)}
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="btn btn-primary flex-1 rounded-xl py-3 shadow-lg shadow-primary/20 text-md font-bold"
                disabled={isSubmitting}
              >
                {isSubmitting ? <Spinner /> : "Guardar Abono"}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
