import { ESTADOS_PRENDA } from "../../utils/constantes";
import type { EstadoPrenda } from "../../types";

interface BadgeEstadoProps {
  estado: EstadoPrenda;
  mostrarIcono?: boolean;
}

export function BadgeEstado({ estado, mostrarIcono = true }: BadgeEstadoProps) {
  // Buscar la configuración del estado
  const configEstado = ESTADOS_PRENDA.find((e) => e.valor === estado);

  if (!configEstado) return null;

  return (
    <span 
      className={`badge badge-${estado}`}
      style={{ backgroundColor: `${configEstado.color}20`, color: configEstado.color }}
    >
      {mostrarIcono && <span className="badge-icon">{configEstado.icono}</span>}
      {configEstado.etiqueta}
    </span>
  );
}
