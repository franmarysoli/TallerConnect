import { useEffect, useState } from "react";
import { CheckCircle, XCircle, Info, X } from "lucide-react";

export type TipoAlerta = "success" | "error" | "info";

interface AlertaEstadoProps {
  mensaje: string;
  tipo: TipoAlerta;
  onClose: () => void;
  duracionMs?: number;
}

export function AlertaEstado({ mensaje, tipo, onClose, duracionMs = 4000 }: AlertaEstadoProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Iniciar animación de salida poco antes de desmontar
    const hideTimer = setTimeout(() => {
      setVisible(false);
    }, duracionMs - 300);

    // Desmontar componente
    const unmountTimer = setTimeout(() => {
      onClose();
    }, duracionMs);

    return () => {
      clearTimeout(hideTimer);
      clearTimeout(unmountTimer);
    };
  }, [duracionMs, onClose]);

  const iconos = {
    success: <CheckCircle size={20} />,
    error: <XCircle size={20} />,
    info: <Info size={20} />,
  };

  return (
    <div className={`toast-container ${visible ? 'toast-enter' : 'toast-exit'}`}>
      <div className={`toast toast-${tipo} glass-panel`}>
        <span className="toast-icon">{iconos[tipo]}</span>
        <span className="toast-message">{mensaje}</span>
        <button className="toast-close" onClick={() => setVisible(false)}>
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
