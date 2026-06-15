import { useState } from "react";
import { useClientes } from "../../hooks/useClientes";
import { formatearFechaCorta } from "../../utils/helpers";
import { Spinner } from "../common/Spinner";
import { Modal } from "../common/Modal";
import { ClienteForm } from "./ClienteForm";
import type { Usuario } from "../../types";
import { Link } from "react-router-dom";
import { Shirt, Edit, Trash2, Eye } from "lucide-react";

export function ClientesLista() {
  const { clientes, cargando, eliminarCliente } = useClientes();
  const [busqueda, setBusqueda] = useState("");
  const [clienteEditar, setClienteEditar] = useState<Usuario | null>(null);
  const [clienteEliminar, setClienteEliminar] = useState<Usuario | null>(null);
  const [clienteVerDetalles, setClienteVerDetalles] = useState<Usuario | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filtrar clientes por búsqueda
  const clientesFiltrados = clientes.filter((c) =>
    c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.cedula.includes(busqueda)
  );

  const handleEliminar = async () => {
    if (!clienteEliminar?.uid) return;
    setIsDeleting(true);
    try {
      await eliminarCliente(clienteEliminar.uid);
      setClienteEliminar(null);
    } catch (error) {
      console.error("Error al eliminar cliente:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  if (cargando) return <div className="flex-center p-8"><Spinner /></div>;

  return (
    <div className="page-container">
      <div className="flex-between mb-6">
        <h1 className="text-2xl font-bold">Gestión de Clientes</h1>
        <div className="search-box">
          <input
            type="text"
            placeholder="Buscar por nombre o cédula..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="input-search"
          />
        </div>
      </div>

      <div className="table-container glass-panel desktop-only">
        <table className="table w-full">
          <thead>
            <tr>
              <th>Cédula</th>
              <th>Nombre</th>
              <th>Celular</th>
              <th>Registro</th>
              <th className="text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {clientesFiltrados.length > 0 ? (
              clientesFiltrados.map((cliente) => (
                <tr key={cliente.uid}>
                  <td className="font-medium">{cliente.cedula}</td>
                  <td>
                    <div>{cliente.nombre}</div>
                    <div className="text-sm text-muted">{cliente.correo}</div>
                  </td>
                  <td>{cliente.celular || "—"}</td>
                  <td>{formatearFechaCorta(cliente.fechaRegistro.toDate().toISOString().split("T")[0])}</td>
                  <td className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link 
                        to={`/sastre/prendas?cliente=${cliente.uid}`} 
                        className="btn btn-outline btn-sm"
                        title="Ver prendas de este cliente"
                      >
                        <Shirt size={16} />
                      </Link>
                      <button
                        onClick={() => setClienteEditar(cliente)}
                        className="btn btn-outline btn-sm text-primary"
                        title="Editar datos"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => setClienteEliminar(cliente)}
                        className="btn btn-outline btn-sm text-error"
                        title="Eliminar cliente"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center py-8 text-muted">
                  No se encontraron clientes.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Vista móvil: Tarjetas */}
      <div className="mobile-only-flex flex-col gap-4">
        {clientesFiltrados.length > 0 ? (
          clientesFiltrados.map((cliente) => (
            <div key={cliente.uid} className="card">
              <div className="flex-between mb-2">
                <h3 className="font-bold text-lg truncate">{cliente.nombre}</h3>
                <span className="badge badge-primary">{cliente.cedula}</span>
              </div>
              <div className="text-sm text-muted mb-4">{cliente.celular || "Sin teléfono"}</div>
              <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                <Link 
                  to={`/sastre/prendas?cliente=${cliente.uid}`} 
                  className="text-primary text-sm font-bold flex items-center gap-1"
                >
                  <Shirt size={16} /> Prendas
                </Link>
                <button 
                  onClick={() => setClienteVerDetalles(cliente)}
                  className="btn btn-primary btn-sm"
                >
                  <Eye size={16} /> Detalles
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-muted glass-panel">
            No se encontraron clientes.
          </div>
        )}
      </div>

      {/* Modal Editar Cliente */}
      <Modal
        isOpen={!!clienteEditar}
        onClose={() => setClienteEditar(null)}
        titulo="Editar Cliente"
      >
        {clienteEditar && (
          <ClienteForm
            cliente={clienteEditar}
            onClose={() => setClienteEditar(null)}
          />
        )}
      </Modal>

      {/* Modal Confirmar Eliminación */}
      <Modal
        isOpen={!!clienteEliminar}
        onClose={() => !isDeleting && setClienteEliminar(null)}
        titulo="Eliminar Cliente"
      >
        <div className="p-4">
          <p className="mb-4">
            ¿Estás seguro de que deseas eliminar al cliente <strong>{clienteEliminar?.nombre}</strong>?
          </p>
          <div className="alert alert-error mb-4">
            <strong>Advertencia:</strong> Esta acción también eliminará todas las 
            prendas y citas asociadas a este cliente. Esta acción no se puede deshacer.
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <button
              className="btn btn-outline"
              onClick={() => setClienteEliminar(null)}
              disabled={isDeleting}
            >
              Cancelar
            </button>
            <button
              className="btn btn-danger"
              onClick={handleEliminar}
              disabled={isDeleting}
            >
              {isDeleting ? <Spinner /> : "Sí, eliminar cliente y sus datos"}
            </button>
          </div>
        </div>
      </Modal>
      {/* Modal Detalles del Cliente (Para Móviles) */}
      <Modal
        isOpen={!!clienteVerDetalles}
        onClose={() => setClienteVerDetalles(null)}
        titulo="Detalles del Cliente"
      >
        {clienteVerDetalles && (
          <div className="p-4 flex flex-col gap-4">
            <div>
              <div className="text-sm text-muted">Nombre Completo</div>
              <div className="font-bold text-lg">{clienteVerDetalles.nombre}</div>
            </div>
            <div>
              <div className="text-sm text-muted">Cédula</div>
              <div className="font-medium">{clienteVerDetalles.cedula}</div>
            </div>
            <div>
              <div className="text-sm text-muted">Correo Electrónico</div>
              <div>{clienteVerDetalles.correo}</div>
            </div>
            <div>
              <div className="text-sm text-muted">Celular / Teléfono</div>
              <div>{clienteVerDetalles.celular || "No registrado"}</div>
            </div>
            <div>
              <div className="text-sm text-muted">Fecha de Registro</div>
              <div>{formatearFechaCorta(clienteVerDetalles.fechaRegistro.toDate().toISOString().split("T")[0])}</div>
            </div>
            
            <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
              <button
                onClick={() => {
                  setClienteEditar(clienteVerDetalles);
                  setClienteVerDetalles(null);
                }}
                className="btn btn-outline flex-grow"
              >
                <Edit size={16} /> Editar
              </button>
              <button
                onClick={() => {
                  setClienteEliminar(clienteVerDetalles);
                  setClienteVerDetalles(null);
                }}
                className="btn btn-danger"
              >
                <Trash2 size={16} /> Eliminar
              </button>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
}
