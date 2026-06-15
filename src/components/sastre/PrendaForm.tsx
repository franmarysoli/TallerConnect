import { useState, useMemo } from "react";
import { usePrendas } from "../../hooks/usePrendas";
import { useClientes } from "../../hooks/useClientes";
import { useTelas } from "../../hooks/useTelas";
import { useEstilos } from "../../hooks/useEstilos";
import { MEDIDAS_DISPONIBLES } from "../../utils/constantes";
import { formatearMoneda } from "../../utils/helpers";
import { Spinner } from "../common/Spinner";
import type { MedidasPrenda } from "../../types";

export function PrendaForm({ onClose }: { onClose: () => void }) {
  const { crearPrenda } = usePrendas();
  const { clientes } = useClientes();
  const { telas } = useTelas();
  const { estilos } = useEstilos();

  const [errorLocal, setErrorLocal] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estado del formulario
  const [clienteId, setClienteId] = useState("");
  const [telaId, setTelaId] = useState("");
  const [estiloId, setEstiloId] = useState("");
  const [metrosUsados, setMetrosUsados] = useState<number>(1);
  const [costoManoObra, setCostoManoObra] = useState<number>(0);
  
  // Estado para las medidas
  const [medidas, setMedidas] = useState<MedidasPrenda>({
    cuello: 0, talle: 0, mangas: 0, pecho: 0, 
    cintura: 0, largoTotal: 0, cadera: 0, hombros: 0
  });

  // Tela seleccionada para calcular costos y validar stock
  const telaSeleccionada = useMemo(() => 
    telas.find(t => t.id === telaId), 
  [telaId, telas]);

  // Cálculos en tiempo real
  const costoTelaCalculado = (telaSeleccionada?.precioMetro || 0) * metrosUsados;
  const costoTotalCalculado = costoTelaCalculado + costoManoObra;

  const handleMedidaChange = (clave: keyof MedidasPrenda, valor: string) => {
    setMedidas(prev => ({
      ...prev,
      [clave]: Number(valor)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorLocal(null);

    // Validaciones
    if (!clienteId || !telaId || !estiloId) {
      return setErrorLocal("Debes seleccionar cliente, tela y estilo.");
    }
    if (metrosUsados <= 0) {
      return setErrorLocal("Los metros usados deben ser mayores a 0.");
    }
    if (telaSeleccionada && metrosUsados > telaSeleccionada.metrosDisponibles) {
      return setErrorLocal(`La tela seleccionada solo tiene ${telaSeleccionada.metrosDisponibles} metros disponibles.`);
    }

    const clienteSel = clientes.find(c => c.uid === clienteId);
    const estiloSel = estilos.find(e => e.id === estiloId);

    if (!clienteSel || !estiloSel || !telaSeleccionada) return;

    setIsSubmitting(true);

    try {
      await crearPrenda({
        clienteId,
        clienteNombre: clienteSel.nombre,
        clienteCorreo: clienteSel.correo,
        telaId,
        telaNombre: telaSeleccionada.nombre,
        estiloId,
        estiloNombre: estiloSel.nombre,
        metrosUsados,
        precioMetro: telaSeleccionada.precioMetro,
        costoManoObra,
        medidas
      });
      onClose();
    } catch (error: any) {
      console.error("Error al crear prenda:", error);
      setErrorLocal(error.message || "Ocurrió un error al crear la prenda.");
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form-container">
      {errorLocal && <div className="alert alert-error mb-4">{errorLocal}</div>}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Columna Izquierda: Detalles */}
        <div className="space-y-4">
          <h3 className="font-bold border-b border-glass pb-2">Detalles Generales</h3>
          
          <div className="form-group">
            <label>Cliente</label>
            <select value={clienteId} onChange={e => setClienteId(e.target.value)} required disabled={isSubmitting}>
              <option value="">-- Seleccionar Cliente --</option>
              {clientes.map(c => <option key={c.uid} value={c.uid}>{c.nombre} ({c.cedula})</option>)}
            </select>
          </div>

          <div className="form-group">
            <label>Estilo de Prenda</label>
            <select value={estiloId} onChange={e => setEstiloId(e.target.value)} required disabled={isSubmitting}>
              <option value="">-- Seleccionar Estilo --</option>
              {estilos.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label>Tela a Utilizar</label>
            <select value={telaId} onChange={e => setTelaId(e.target.value)} required disabled={isSubmitting}>
              <option value="">-- Seleccionar Tela --</option>
              {telas.map(t => (
                <option key={t.id} value={t.id} disabled={t.metrosDisponibles <= 0}>
                  {t.nombre} - Disp: {t.metrosDisponibles}m ({formatearMoneda(t.precioMetro)}/m)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label>Metros a usar</label>
              <input 
                type="number" 
                min="0.1" step="0.1" 
                value={metrosUsados} 
                onChange={e => setMetrosUsados(Number(e.target.value))}
                required disabled={isSubmitting || !telaId}
              />
            </div>
            <div className="form-group">
              <label>Costo Mano Obra</label>
              <input 
                type="number" min="0" step="1000" 
                value={costoManoObra} 
                onChange={e => setCostoManoObra(Number(e.target.value))}
                required disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Resumen de Costos */}
          <div className="card bg-glass-dark mt-4 p-4">
            <h4 className="font-bold mb-2">Resumen de Costos</h4>
            <div className="flex-between text-sm mb-1">
              <span>Costo Tela:</span>
              <span>{formatearMoneda(costoTelaCalculado)}</span>
            </div>
            <div className="flex-between text-sm mb-2">
              <span>Mano de Obra:</span>
              <span>{formatearMoneda(costoManoObra)}</span>
            </div>
            <div className="flex-between font-bold border-t border-glass pt-2 text-primary">
              <span>Total Estimado:</span>
              <span>{formatearMoneda(costoTotalCalculado)}</span>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Medidas */}
        <div>
          <div className="flex-between border-b border-glass pb-2 mb-4">
            <h3 className="font-bold">Medidas (cm)</h3>
            <button 
              type="button" 
              className="text-xs text-primary underline"
              onClick={() => {
                // Autocompletar con medidas anteriores si existe el cliente (Simulación)
                alert("En una versión futura, esto autocompletará las medidas de la última prenda del cliente.");
              }}
            >
              Usar últimas medidas
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {MEDIDAS_DISPONIBLES.map(m => (
              <div key={m.clave} className="form-group mb-0">
                <label className="text-sm">{m.etiqueta}</label>
                <input 
                  type="number" 
                  min="0" step="0.5"
                  value={medidas[m.clave]}
                  onChange={(e) => handleMedidaChange(m.clave, e.target.value)}
                  disabled={isSubmitting}
                  className="py-1"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-8 pt-4 border-t border-glass">
        <button type="button" className="btn btn-outline" onClick={onClose} disabled={isSubmitting}>
          Cancelar
        </button>
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? <Spinner /> : "Crear Prenda"}
        </button>
      </div>
    </form>
  );
}
