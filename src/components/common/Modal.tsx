import { useEffect } from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  titulo: string;
  children: React.ReactNode;
  anchoMaximo?: string;
}

export function Modal({ isOpen, onClose, titulo, children, anchoMaximo = "500px" }: ModalProps) {
  
  // Cerrar modal con la tecla Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Evitar scroll en el body cuando el modal está abierto
      document.body.style.overflow = "hidden";
    }
    
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "auto";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content glass-panel" 
        style={{ maxWidth: anchoMaximo }}
        onClick={(e) => e.stopPropagation()} // Evitar cerrar al hacer click dentro del modal
      >
        <div className="modal-header">
          <h2>{titulo}</h2>
          <button className="btn-close" onClick={onClose} aria-label="Cerrar">
            <X size={20} />
          </button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
}
