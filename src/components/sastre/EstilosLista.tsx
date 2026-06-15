import { useState } from "react";
import { useEstilos } from "../../hooks/useEstilos";
import { Spinner } from "../common/Spinner";
import { Modal } from "../common/Modal";
import { EstiloForm } from "./EstiloForm";
import type { Estilo } from "../../types";
import { Trash2 } from "lucide-react";

export function EstilosLista() {
  const { estilos, cargando, eliminarEstilo } = useEstilos();
  const [busqueda, setBusqueda] = useState("");
  const [estiloEditar, setEstiloEditar] = useState<Estilo | null>(null);
  const [creandoNuevo, setCreandoNuevo] = useState(false);

  // Filtrar estilos por búsqueda
  const estilosFiltrados = estilos.filter((e) =>
    e.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    e.descripcion.toLowerCase().includes(busqueda.toLowerCase())
  );

  const handleEliminar = async (id: string) => {
    if (confirm("¿Estás seguro de eliminar este estilo?")) {
      await eliminarEstilo(id);
    }
  };

  if (cargando) return <div className="flex-center p-8"><Spinner /></div>;

  return (
    <div className="page-container">
      <div className="flex-between mb-6">
        <h1 className="text-2xl font-bold">Catálogo de Estilos</h1>
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="Buscar estilo..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="input-search"
          />
          <button 
            className="btn btn-primary whitespace-nowrap"
            onClick={() => setCreandoNuevo(true)}
          >
            + Nuevo Estilo
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {estilosFiltrados.length > 0 ? (
          estilosFiltrados.map((estilo) => (
            <div key={estilo.id} className="card glass-panel flex flex-col">
              <h3 className="text-lg font-bold mb-2">{estilo.nombre}</h3>
              <p className="text-muted text-sm flex-grow mb-4">
                {estilo.descripcion || "Sin descripción"}
              </p>

              <div className="flex justify-end gap-2 pt-4 border-t border-glass">
                <button
                  onClick={() => setEstiloEditar(estilo)}
                  className="btn btn-outline btn-sm text-primary w-full"
                >
                  Editar
                </button>
                <button
                  onClick={() => estilo.id && handleEliminar(estilo.id)}
                  className="btn btn-outline btn-sm text-error"
                  title="Eliminar estilo"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-8 text-muted glass-panel rounded">
            No se encontraron estilos.
          </div>
        )}
      </div>

      {/* Modal Crear/Editar Estilo */}
      <Modal
        isOpen={creandoNuevo || !!estiloEditar}
        onClose={() => {
          setCreandoNuevo(false);
          setEstiloEditar(null);
        }}
        titulo={creandoNuevo ? "Agregar Nuevo Estilo" : "Editar Estilo"}
      >
        <EstiloForm
          estilo={estiloEditar || undefined}
          onClose={() => {
            setCreandoNuevo(false);
            setEstiloEditar(null);
          }}
        />
      </Modal>
    </div>
  );
}
