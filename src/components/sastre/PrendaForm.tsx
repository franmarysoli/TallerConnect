import { useState, useMemo } from "react";
import { usePrendas } from "../../hooks/usePrendas";
import { useClientes } from "../../hooks/useClientes";
import { useTelas } from "../../hooks/useTelas";
import { useEstilos } from "../../hooks/useEstilos";
import { useToast } from "../../context/ToastContext";
import { MEDIDAS_DISPONIBLES } from "../../utils/constantes";
import { formatearMoneda } from "../../utils/helpers";
import { Spinner } from "../common/Spinner";
import type { MedidasPrenda, Prenda } from "../../types";

interface PrendaFormProps {
  onClose: () => void;
  prenda?: Prenda; // Si se proporciona, el formulario está en modo edición
}

export function PrendaForm({ onClose, prenda }: PrendaFormProps) {
  const { crearPrenda, actualizarPrenda, prendas } = usePrendas();
  const { clientes } = useClientes();
  const { telas } = useTelas();
  const { estilos } = useEstilos();
  const { showToast } = useToast();

  const [errorLocal, setErrorLocal] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const modoEdicion = !!prenda;

  // Estado del formulario
  const [clienteId, setClienteId] = useState(prenda?.clienteId || "");
  const [telaId, setTelaId] = useState(prenda?.telaId || "");
  const [estiloId, setEstiloId] = useState(prenda?.estiloId || "");
  const [metrosUsados, setMetrosUsados] = useState<number | "">(prenda?.metrosUsados || "");
  const [costoManoObra, setCostoManoObra] = useState<number | "">(prenda?.costoManoObra || "");
  const [notas, setNotas] = useState(prenda?.notas || "");

  // Estado para las medidas
  type MedidasState = Record<keyof MedidasPrenda, number | "">;
  const [medidas, setMedidas] = useState<MedidasState>({
    cuello: prenda?.medidas?.cuello || "",
    talle: prenda?.medidas?.talle || "",
    mangas: prenda?.medidas?.mangas || "",
    pecho: prenda?.medidas?.pecho || "",
    cintura: prenda?.medidas?.cintura || "",
    largoTotal: prenda?.medidas?.largoTotal || "",
    cadera: prenda?.medidas?.cadera || "",
    hombros: prenda?.medidas?.hombros || ""
  });

  // Tela seleccionada para calcular costos y validar stock
  const telaSeleccionada = useMemo(() =>
    telas.find(t => t.id === telaId),
    [telaId, telas]);

  // Cálculos en tiempo real
  const costoTelaCalculado = (telaSeleccionada?.precioMetro || 0) * (Number(metrosUsados) || 0);
  const costoTotalCalculado = costoTelaCalculado + (Number(costoManoObra) || 0);

  // Medidas de última prenda
  const prendasDelCliente = useMemo(() =>
    prendas.filter(p => p.clienteId === clienteId && p.id !== prenda?.id),
    [prendas, clienteId, prenda?.id]);

  const tienePrendasAnteriores = prendasDelCliente.length > 0;

  const handleCargarUltimasMedidas = () => {
    if (!tienePrendasAnteriores) return;

    // Buscar la más reciente por fechaInicio
    const ultima = [...prendasDelCliente].sort((a, b) => {
      const dateA = a.fechaInicio?.toDate?.()?.getTime() || 0;
      const dateB = b.fechaInicio?.toDate?.()?.getTime() || 0;
      return dateB - dateA;
    })[0];

    if (ultima && ultima.medidas) {
      setMedidas(ultima.medidas);
      showToast("Medidas cargadas de la última prenda", "success");
    } else {
      showToast("La prenda anterior no tiene medidas guardadas", "info");
    }
  };

  const handleMedidaChange = (clave: keyof MedidasPrenda, valor: string) => {
    setMedidas(prev => ({
      ...prev,
      [clave]: valor === "" ? "" : Number(valor)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorLocal(null);

    const metrosFinales = Number(metrosUsados) || 0;
    const manoObraFinal = Number(costoManoObra) || 0;

    // Validaciones
    if (!clienteId || !telaId || !estiloId) {
      return setErrorLocal("Debes seleccionar cliente, tela y estilo.");
    }
    if (metrosFinales <= 0) {
      return setErrorLocal("Los metros usados deben ser mayores a 0.");
    }
    if (manoObraFinal < 0) {
      return setErrorLocal("El costo de mano de obra no puede ser negativo.");
    }

    // Convertir medidas a numéricas para guardar
    const medidasFinales: MedidasPrenda = {
      cuello: Number(medidas.cuello) || 0,
      talle: Number(medidas.talle) || 0,
      mangas: Number(medidas.mangas) || 0,
      pecho: Number(medidas.pecho) || 0,
      cintura: Number(medidas.cintura) || 0,
      largoTotal: Number(medidas.largoTotal) || 0,
      cadera: Number(medidas.cadera) || 0,
      hombros: Number(medidas.hombros) || 0,
    };

    // Validar medidas >= 0
    const medidasInvalidas = Object.values(medidasFinales).some(m => m < 0);
    if (medidasInvalidas) {
      return setErrorLocal("Todas las medidas deben ser mayores o iguales a 0.");
    }

    // Si estamos editando y cambiaron los metros/tela, validar contra el stock disponible + el devuelto
    if (telaSeleccionada) {
      const metrosRequeridosNuevos = telaId === prenda?.telaId
        ? metrosFinales - (prenda?.metrosUsados || 0) // Diferencia (positiva si necesita más)
        : metrosFinales; // Tela nueva, requiere todo

      if (metrosRequeridosNuevos > telaSeleccionada.metrosDisponibles) {
        return setErrorLocal(`La tela seleccionada no tiene suficiente stock. Disp: ${telaSeleccionada.metrosDisponibles}m.`);
      }
    }

    const clienteSel = clientes.find(c => c.uid === clienteId);
    const estiloSel = estilos.find(e => e.id === estiloId);

    if (!clienteSel || !estiloSel || !telaSeleccionada) return;

    setIsSubmitting(true);

    const datosForm = {
      clienteId,
      clienteNombre: clienteSel.nombre,
      clienteCorreo: clienteSel.correo,
      telaId,
      telaNombre: telaSeleccionada.nombre,
      estiloId,
      estiloNombre: estiloSel.nombre,
      metrosUsados: metrosFinales,
      precioMetro: telaSeleccionada.precioMetro,
      costoManoObra: manoObraFinal,
      medidas: medidasFinales,
      ...(notas.trim() ? { notas: notas.trim() } : {}),
    };

    try {
      if (modoEdicion && prenda.id) {
        await actualizarPrenda(prenda.id, prenda, datosForm);
        showToast("Prenda actualizada correctamente", "success");
      } else {
        await crearPrenda(datosForm);
        showToast("Prenda creada correctamente", "success");
      }
      onClose();
    } catch (error: any) {
      console.error("Error al guardar prenda:", error);
      setErrorLocal(error.message || "Ocurrió un error al guardar la prenda.");
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col space-y-6">
      {errorLocal && <div className="alert alert-error">{errorLocal}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Columna Izquierda: Detalles Generales */}
        <div className="card glass-panel p-5 space-y-4 h-fit">
          <h3 className="font-bold border-b border-glass pb-2 text-lg">Detalles Generales</h3>

          <div className="form-group mb-0">
            <label className="text-sm font-semibold mb-1 block">Cliente</label>
            <select
              value={clienteId}
              onChange={e => setClienteId(e.target.value)}
              required
              // Deshabilitar cambio de cliente si estamos editando y ya no está en "corte"
              disabled={isSubmitting || (modoEdicion && prenda?.estado !== "corte")}
            >
              <option value="">-- Seleccionar Cliente --</option>
              {clientes.map(c => <option key={c.uid} value={c.uid}>{c.nombre} ({c.cedula})</option>)}
            </select>
          </div>

          <div className="form-group mb-0">
            <label className="text-sm font-semibold mb-1 block">Estilo de Prenda</label>
            <select value={estiloId} onChange={e => setEstiloId(e.target.value)} required disabled={isSubmitting}>
              <option value="">-- Seleccionar Estilo --</option>
              {estilos.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
            </select>
          </div>

          <div className="form-group mb-0">
            <label className="text-sm font-semibold mb-1 block">Tela a Utilizar</label>
            <select value={telaId} onChange={e => setTelaId(e.target.value)} required disabled={isSubmitting}>
              <option value="">-- Seleccionar Tela --</option>
              {telas.map(t => (
                <option key={t.id} value={t.id}>
                  {t.nombre} - Disp: {t.metrosDisponibles}m ({formatearMoneda(t.precioMetro)}/m)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="form-group mb-0">
              <label className="text-sm font-semibold mb-1 block">Metros a usar</label>
              <input
                type="number"
                min="0.1" step="any"
                placeholder="1.5"
                value={metrosUsados}
                onChange={e => setMetrosUsados(e.target.value === "" ? "" : Number(e.target.value))}
                required disabled={isSubmitting || !telaId}
                className="no-spinner"
              />
            </div>
            <div className="form-group mb-0">
              <label className="text-sm font-semibold mb-1 block">Mano Obra</label>
              <input
                type="number" min="0" step="any"
                placeholder="0"
                value={costoManoObra}
                onChange={e => setCostoManoObra(e.target.value === "" ? "" : Number(e.target.value))}
                required disabled={isSubmitting}
                className="no-spinner"
              />
            </div>
          </div>

          {/* Campo de Notas / Observaciones */}
          <div className="form-group mb-0">
            <label className="text-sm font-semibold mb-1 block">Notas / Observaciones</label>
            <textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Instrucciones especiales, detalles..."
              rows={2}
              disabled={isSubmitting}
              className="resize-none"
            />
          </div>
        </div>

        {/* Columna Derecha: Medidas */}
        <div className="card glass-panel p-5 space-y-4 h-fit">
          <div className="flex justify-between items-center border-b border-glass pb-2">
            <h3 className="font-bold text-lg">Medidas (cm)</h3>
            {tienePrendasAnteriores && (
              <button
                type="button"
                className="btn btn-outline text-xs py-1 px-2 text-primary border-primary hover:bg-primary hover:text-white transition-colors"
                onClick={handleCargarUltimasMedidas}
                disabled={isSubmitting}
              >
                Cargar últimas medidas
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            {MEDIDAS_DISPONIBLES.map(m => (
              <div key={m.clave} className="form-group mb-0">
                <label className="text-xs font-semibold text-muted mb-1 block">{m.etiqueta}</label>
                <input
                  type="number"
                  min="0" max="100" step="any"
                  placeholder="0"
                  value={medidas[m.clave]}
                  onChange={(e) => handleMedidaChange(m.clave, e.target.value)}
                  disabled={isSubmitting}
                  className="py-1 px-2 text-sm no-spinner"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Resumen de Costos y Acciones - Al Final */}
      <div className="card glass-panel p-5 mt-2 bg-glass-dark">
        <h4 className="font-bold mb-4 text-lg border-b border-glass pb-2">Resumen de Costos</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center mb-6">
          <div className="flex justify-between sm:flex-col sm:items-start p-3 bg-glass rounded-lg border border-glass">
            <span className="text-xs text-muted uppercase font-bold">Costo Tela</span>
            <span className="text-lg font-bold">{formatearMoneda(costoTelaCalculado)}</span>
          </div>
          <div className="flex justify-between sm:flex-col sm:items-start p-3 bg-glass rounded-lg border border-glass">
            <span className="text-xs text-muted uppercase font-bold">Mano de Obra</span>
            <span className="text-lg font-bold">{formatearMoneda(Number(costoManoObra) || 0)}</span>
          </div>
          <div className="flex justify-between sm:flex-col sm:items-start p-3 bg-primary/20 rounded-lg border border-primary/30">
            <span className="text-xs text-primary uppercase font-bold">Total Estimado</span>
            <span className="text-xl font-black text-primary">{formatearMoneda(costoTotalCalculado)}</span>
          </div>
        </div>

        <div className="flex justify-center gap-3 pt-4 border-t border-glass">
          <button type="button" className="btn btn-outline px-6" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary px-6" disabled={isSubmitting}>
            {isSubmitting ? <Spinner /> : (modoEdicion ? "Actualizar Prenda" : "Guardar Prenda")}
          </button>
        </div>
      </div>
    </form>
  );
}