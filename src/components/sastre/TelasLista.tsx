import { useState } from "react";
import { useTelas } from "../../hooks/useTelas";
import { formatearMoneda } from "../../utils/helpers";
import { STOCK_BAJO_METROS } from "../../utils/constantes";
import { Spinner } from "../common/Spinner";
import { Modal } from "../common/Modal";
import { TelaForm } from "./TelaForm";
import type { Tela } from "../../types";
import { AlertTriangle, Trash2 } from "lucide-react";


export function TelasLista() {
  const { telas, cargando, eliminarTela } = useTelas();
  const [busqueda, setBusqueda] = useState("");
  const [telaEditar, setTelaEditar] = useState<Tela | null>(null);
  const [creandoNueva, setCreandoNueva] = useState(false);

  // Filtrar telas por búsqueda
  const telasFiltradas = telas.filter((t) =>
    t.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const handleEliminar = async (id: string) => {
    if (confirm("¿Estás seguro de eliminar esta tela?")) {
      await eliminarTela(id);
    }
  };

  if (cargando) return <div className="flex-center p-8"><Spinner /></div>;

  return (
    <div className="page-container">
      <div className="flex-between mb-6">
        <h1 className="text-2xl font-bold">Catálogo de Telas</h1>
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="Buscar tela..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="input-search"
          />
          <button
            className="btn btn-primary whitespace-nowrap"
            onClick={() => setCreandoNueva(true)}
          >
            + Nueva Tela
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {telasFiltradas.length > 0 ? (
          telasFiltradas.map((tela) => {
            const stockBajo = tela.metrosDisponibles < STOCK_BAJO_METROS;
            return (
              <div
                key={tela.id}
                className={`card glass-panel flex flex-col ${stockBajo ? 'border-warning' : ''}`}
              >
                <div className="flex-between mb-4">
                  <h3 className="text-lg font-bold truncate">{tela.nombre}</h3>
                  {stockBajo && (
                    <span className="badge badge-warning" title="Stock bajo"><AlertTriangle size={16} /></span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6 flex-grow">
                  <div>
                    <div className="text-xs text-muted uppercase">Stock</div>
                    <div className={`text-xl font-bold ${stockBajo ? 'text-error' : ''}`}>
                      {tela.metrosDisponibles} <span className="text-sm font-normal text-muted">m</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted uppercase">Precio/Metro</div>
                    <div className="text-xl font-bold text-primary">
                      {formatearMoneda(tela.precioMetro)}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-glass">
                  <button
                    onClick={() => setTelaEditar(tela)}
                    className="btn btn-outline btn-sm text-primary w-full"
                  >
                    Editar / Reponer
                  </button>
                  <button
                    onClick={() => tela.id && handleEliminar(tela.id)}
                    className="btn btn-outline btn-sm text-error"
                    title="Eliminar tela"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full text-center py-8 text-muted glass-panel rounded">
            No se encontraron telas en el catálogo.
          </div>
        )}
      </div>

      {/* Modal Crear/Editar Tela */}
      <Modal
        isOpen={creandoNueva || !!telaEditar}
        onClose={() => {
          setCreandoNueva(false);
          setTelaEditar(null);
        }}
        titulo={creandoNueva ? "Agregar Nueva Tela" : "Editar Tela"}
      >
        <TelaForm
          tela={telaEditar || undefined}
          onClose={() => {
            setCreandoNueva(false);
            setTelaEditar(null);
          }}
        />
      </Modal>
    </div>
  );
}
