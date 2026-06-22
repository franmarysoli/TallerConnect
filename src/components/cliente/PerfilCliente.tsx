import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase/config";
import { Spinner } from "../common/Spinner";
import { useToast } from "../../context/ToastContext";
import { User, Phone, Mail, Hash } from "lucide-react";

export function PerfilCliente() {
  const { usuario } = useAuth();
  const { showToast } = useToast();
  
  const [nombre, setNombre] = useState("");
  const [celular, setCelular] = useState("");
  const [guardando, setGuardando] = useState(false);

  // Inicializar estado con los datos del usuario logueado
  useEffect(() => {
    if (usuario) {
      setNombre(usuario.nombre || "");
      setCelular(usuario.celular || "");
    }
  }, [usuario]);

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuario?.uid) return;
    
    if (!nombre.trim()) {
      showToast("El nombre no puede estar vacío.", "error");
      return;
    }

    setGuardando(true);

    try {
      const ref = doc(db, "usuarios", usuario.uid);
      await updateDoc(ref, {
        nombre: nombre.trim(),
        celular: celular.trim()
      });
      showToast("Perfil actualizado correctamente.", "success");
    } catch (error) {
      console.error("Error al actualizar perfil:", error);
      showToast("Hubo un error al guardar los cambios.", "error");
    } finally {
      setGuardando(false);
    }
  };

  if (!usuario) return <div className="flex-center p-8"><Spinner /></div>;

  return (
    <div className="page-container max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Mi Perfil</h1>

      <div className="card glass-panel p-6">
        <form onSubmit={handleGuardar} className="space-y-6">
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Campos editables */}
            <div className="space-y-4">
              <div className="form-group">
                <label className="flex items-center gap-2">
                  <User size={16} className="text-primary" /> Nombre Completo
                </label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                  disabled={guardando}
                />
              </div>

              <div className="form-group">
                <label className="flex items-center gap-2">
                  <Phone size={16} className="text-primary" /> Celular (Opcional)
                </label>
                <input
                  type="tel"
                  value={celular}
                  onChange={(e) => setCelular(e.target.value)}
                  disabled={guardando}
                  placeholder="Ej: 3001234567"
                />
              </div>
            </div>

            {/* Campos de solo lectura */}
            <div className="space-y-4">
              <div className="form-group">
                <label className="flex items-center gap-2 text-muted">
                  <Mail size={16} /> Correo Electrónico
                </label>
                <input
                  type="email"
                  value={usuario.correo}
                  disabled
                  className="bg-gray-100 cursor-not-allowed opacity-70"
                />
                <span className="text-xs text-muted mt-1 inline-block">El correo no se puede cambiar.</span>
              </div>

              <div className="form-group">
                <label className="flex items-center gap-2 text-muted">
                  <Hash size={16} /> Cédula
                </label>
                <input
                  type="text"
                  value={usuario.cedula}
                  disabled
                  className="bg-gray-100 cursor-not-allowed opacity-70"
                />
                <span className="text-xs text-muted mt-1 inline-block">La cédula es inmutable.</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-glass">
            <button
              type="submit"
              className="btn btn-primary px-8"
              disabled={guardando}
            >
              {guardando ? <Spinner /> : "Guardar Cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
