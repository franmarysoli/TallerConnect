import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { usePrendas } from "../../hooks/usePrendas";
import { useClientes } from "../../hooks/useClientes";
import { BadgeEstado } from "../common/BadgeEstado";
import { Spinner } from "../common/Spinner";
import { Modal } from "../common/Modal";
import { PrendaForm } from "./PrendaForm";
import { ESTADOS_PRENDA } from "../../utils/constantes";
import { formatearFechaCorta, formatearMoneda } from "../../utils/helpers";
import type { Prenda, EstadoPrenda } from "../../types";
import { useToast } from "../../context/ToastContext";
import { Eye, Trash2, Edit } from "lucide-react";


export function PrendasLista() {
  const [searchParams] = useSearchParams();
  const urlClienteId = searchParams.get("cliente");

  const { prendas, cargando, cambiarEstado, eliminarPrenda } = usePrendas();
  const { clientes, cargando: cargandoClientes } = useClientes();
  const { showToast } = useToast();

  const [filtroCliente, setFiltroCliente] = useState(urlClienteId || "");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [creandoNueva, setCreandoNueva] = useState(false);
  const [prendaEditar, setPrendaEditar] = useState<Prenda | null>(null);
  const [isUpdatingState, setIsUpdatingState] = useState<string | null>(null);
  const [prendaVerDetalles, setPrendaVerDetalles] = useState<Prenda | null>(null);
  const [prendaAEliminar, setPrendaAEliminar] = useState<Prenda | null>(null);
  const [eliminando, setEliminando] = useState(false);

  // Filtrado de prendas
  const prendasFiltradas = prendas.filter((prenda) => {
    const matchCliente = filtroCliente ? prenda.clienteId === filtroCliente : true;
    const matchEstado = filtroEstado ? prenda.estado === filtroEstado : true;
    return matchCliente && matchEstado;
  });

  const handleCambioEstado = async (prenda: Prenda, nuevoEstado: string) => {
    if (prenda.estado === nuevoEstado || !prenda.id) return;

    // Obtener correo del cliente para notificar si es necesario
    const cliente = clientes.find(c => c.uid === prenda.clienteId);
    if (!cliente) return;

    setIsUpdatingState(prenda.id);
    try {
      await cambiarEstado(
        prenda.id,
        prenda.estado,
        nuevoEstado as EstadoPrenda,
        cliente.correo,
        cliente.nombre
      );
    } catch (error) {
      console.error("Error al cambiar estado:", error);
      showToast("Hubo un error al cambiar el estado.", "error");
    } finally {
      setIsUpdatingState(null);
    }
  };

  const handleEliminarPrenda = async () => {
    if (!prendaAEliminar?.id) return;

    setEliminando(true);
    try {
      await eliminarPrenda(prendaAEliminar.id);
      setPrendaAEliminar(null);
    } catch (error: any) {
      console.error("Error al eliminar prenda:", error);
      showToast(error.message || "Hubo un error al eliminar la prenda.", "error");
    } finally {
      setEliminando(false);
    }
  };

  if (cargando || cargandoClientes) {
    return <div className="flex-center p-8"><Spinner /></div>;
  }

  return (
    <div className="page-container">
      <div className="flex-between mb-6">
        <h1 className="text-2xl font-bold">Gestión de Prendas</h1>
        <button
          className="btn btn-primary"
          onClick={() => setCreandoNueva(true)}
        >
          + Nueva Prenda
        </button>
      </div>

      {/* Filtros */}
      <div className="card glass-panel mb-6 flex flex-col sm:flex-row gap-4 sm:items-end">
        <div className="form-group mb-0 flex-grow">
          <label>Filtrar por Cliente</label>
          <select
            value={filtroCliente}
            onChange={(e) => setFiltroCliente(e.target.value)}
          >
            <option value="">Todos los clientes</option>
            {clientes.map(c => (
              <option key={c.uid} value={c.uid}>{c.nombre} ({c.cedula})</option>
            ))}
          </select>
        </div>

        <div className="form-group mb-0 sm:w-1/4">
          <label>Filtrar por Estado</label>
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
          >
            <option value="">Todos los estados</option>
            {ESTADOS_PRENDA.map(e => (
              <option key={e.valor} value={e.valor}>{e.etiqueta}</option>
            ))}
          </select>
        </div>

        {(filtroCliente || filtroEstado) && (
          <button
            className="btn btn-outline"
            onClick={() => { setFiltroCliente(""); setFiltroEstado(""); }}
            style={{ marginBottom: "2px" }}
          >
            Limpiar
          </button>
        )}
      </div>

      {/* Tabla de prendas */}
      <div className="table-container glass-panel desktop-only">
        <table className="table w-full">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Prenda</th>
              <th>Fechas</th>
              <th>Costo Total</th>
              <th>Estado Actual</th>
              <th className="text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {prendasFiltradas.length > 0 ? (
              prendasFiltradas.map((prenda) => (
                <tr key={prenda.id} className={prenda.estado === 'terminado' ? 'opacity-80' : ''}>
                  <td>
                    <div className="font-bold">{prenda.clienteNombre}</div>
                  </td>
                  <td>
                    <div className="font-medium">{prenda.estiloNombre}</div>
                    <div className="text-sm text-muted">{prenda.telaNombre}</div>
                  </td>
                  <td>
                    <div>Inicio: {formatearFechaCorta(prenda.fechaInicio.toDate().toISOString().split("T")[0])}</div>
                    {prenda.fechaTerminado && (
                      <div className="text-sm text-success">
                        Fin: {formatearFechaCorta(prenda.fechaTerminado.toDate().toISOString().split("T")[0])}
                      </div>
                    )}
                  </td>
                  <td className="font-bold">
                    {formatearMoneda(prenda.costoTotal)}
                  </td>
                  <td>
                    <BadgeEstado estado={prenda.estado} />
                  </td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {isUpdatingState === prenda.id ? (
                        <Spinner />
                      ) : (
                        <select
                          value={prenda.estado}
                          onChange={(e) => handleCambioEstado(prenda, e.target.value)}
                          className="select-estado"
                          style={{ padding: "0.25rem", borderRadius: "4px" }}
                          disabled={prenda.estado === "terminado"}
                        >
                          {ESTADOS_PRENDA.map((estado) => (
                            <option key={estado.valor} value={estado.valor}>
                              {estado.etiqueta}
                            </option>
                          ))}
                        </select>
                      )}
                      <button
                        className="btn btn-outline btn-sm text-primary"
                        title="Editar prenda"
                        onClick={() => setPrendaEditar(prenda)}
                        style={{ padding: "0.25rem 0.5rem" }}
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        className="btn btn-outline text-error btn-sm"
                        title="Eliminar prenda"
                        onClick={() => setPrendaAEliminar(prenda)}
                        style={{ padding: "0.25rem 0.5rem" }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-8 text-muted">
                  No se encontraron prendas con los filtros actuales.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Vista móvil: Tarjetas */}
      <div className="mobile-only-flex flex-col gap-4">
        {prendasFiltradas.length > 0 ? (
          prendasFiltradas.map((prenda) => (
            <div key={prenda.id} className={`card ${prenda.estado === 'terminado' ? 'opacity-80' : ''}`}>
              <div className="flex-between mb-2">
                <h3 className="font-bold text-lg truncate pr-2">{prenda.estiloNombre}</h3>
                <BadgeEstado estado={prenda.estado} />
              </div>
              <div className="text-sm text-muted mb-2">
                <strong>Cliente:</strong> {prenda.clienteNombre}
              </div>
              <div className="text-sm text-muted mb-4">
                <strong>Costo:</strong> {formatearMoneda(prenda.costoTotal)}
              </div>
              <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                {isUpdatingState === prenda.id ? (
                  <Spinner />
                ) : (
                  <select
                    value={prenda.estado}
                    onChange={(e) => handleCambioEstado(prenda, e.target.value)}
                    className="select-estado bg-gray-50 border border-gray-200 text-sm"
                    style={{ padding: "0.25rem 0.5rem", borderRadius: "4px" }}
                    disabled={prenda.estado === "terminado"}
                  >
                    {ESTADOS_PRENDA.map((estado) => (
                      <option key={estado.valor} value={estado.valor}>
                        {estado.etiqueta}
                      </option>
                    ))}
                  </select>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={() => setPrendaEditar(prenda)}
                    className="btn btn-outline btn-sm text-primary"
                    title="Editar prenda"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => setPrendaAEliminar(prenda)}
                    className="btn btn-outline text-error btn-sm"
                    title="Eliminar prenda"
                  >
                    <Trash2 size={16} />
                  </button>
                  <button
                    onClick={() => setPrendaVerDetalles(prenda)}
                    className="btn btn-primary btn-sm"
                  >
                    <Eye size={16} /> Detalles
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-muted glass-panel">
            No se encontraron prendas.
          </div>
        )}
      </div>

      {/* Modal Crear/Editar Prenda */}
      <Modal
        isOpen={creandoNueva || !!prendaEditar}
        onClose={() => {
          setCreandoNueva(false);
          setPrendaEditar(null);
        }}
        titulo={prendaEditar ? "Editar Prenda" : "Nueva Prenda"}
        anchoMaximo="896px" // Formulario más ancho equivalente a max-w-4xl
      >
        <PrendaForm
          onClose={() => {
            setCreandoNueva(false);
            setPrendaEditar(null);
          }}
          prenda={prendaEditar || undefined}
        />
      </Modal>

      {/* Modal Confirmar Eliminación de Prenda */}
      <Modal
        isOpen={!!prendaAEliminar}
        onClose={() => setPrendaAEliminar(null)}
        titulo="Confirmar Eliminación"
      >
        {prendaAEliminar && (
          <div className="space-y-4">
            <p>
              ¿Estás seguro de que deseas eliminar la prenda <strong>{prendaAEliminar.estiloNombre}</strong> del
              cliente <strong>{prendaAEliminar.clienteNombre}</strong>?
            </p>
            <div className="card bg-glass-dark p-3">
              <p className="text-sm">
                Se devolverán <strong>{prendaAEliminar.metrosUsados} metros</strong> de <strong>{prendaAEliminar.telaNombre}</strong> al inventario.
              </p>
            </div>
            <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-glass">
              <button
                className="btn btn-outline"
                onClick={() => setPrendaAEliminar(null)}
                disabled={eliminando}
              >
                Cancelar
              </button>
              <button
                className="btn btn-primary"
                onClick={handleEliminarPrenda}
                disabled={eliminando}
                style={{ backgroundColor: "var(--color-error, #ef4444)" }}
              >
                {eliminando ? <Spinner /> : "Eliminar Prenda"}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Detalles de Prenda (Para Móviles) */}
      <Modal
        isOpen={!!prendaVerDetalles}
        onClose={() => setPrendaVerDetalles(null)}
        titulo="Detalles de la Prenda"
      >
        {prendaVerDetalles && (
          <div className="p-4 flex flex-col gap-4">
            <div>
              <div className="text-sm text-muted">Estilo de Prenda</div>
              <div className="font-bold text-lg">{prendaVerDetalles.estiloNombre}</div>
            </div>
            <div>
              <div className="text-sm text-muted">Cliente</div>
              <div className="font-medium">{prendaVerDetalles.clienteNombre}</div>
            </div>
            <div>
              <div className="text-sm text-muted">Tela</div>
              <div>{prendaVerDetalles.telaNombre}</div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted">Fecha Inicio</div>
                <div>{formatearFechaCorta(prendaVerDetalles.fechaInicio.toDate().toISOString().split("T")[0])}</div>
              </div>
              {prendaVerDetalles.fechaTerminado && (
                <div>
                  <div className="text-sm text-muted">Fecha Fin</div>
                  <div className="text-success">{formatearFechaCorta(prendaVerDetalles.fechaTerminado.toDate().toISOString().split("T")[0])}</div>
                </div>
              )}
            </div>
            <div>
              <div className="text-sm text-muted">Estado Actual</div>
              <div className="mt-1"><BadgeEstado estado={prendaVerDetalles.estado} /></div>
            </div>
            <div>
              <div className="text-sm text-muted">Costo Total Estimado</div>
              <div className="font-bold text-lg text-primary">{formatearMoneda(prendaVerDetalles.costoTotal)}</div>
            </div>

            {prendaVerDetalles.notas && (
              <div>
                <div className="text-sm text-muted">Notas / Observaciones</div>
                <div className="p-3 bg-gray-50 rounded-md text-sm mt-1 border border-gray-100">
                  {prendaVerDetalles.notas}
                </div>
              </div>
            )}

            <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
              <button
                onClick={() => setPrendaVerDetalles(null)}
                className="btn btn-outline flex-grow"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
}
