import { Link, useNavigate } from "react-router-dom";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Logo } from "./Logo";

export function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
      <div className="card glass-panel flex flex-col items-center text-center p-8 max-w-md w-full relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-error/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
        
        <Logo size={64} className="mb-6 opacity-80" />
        
        <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center border border-error/20 mb-4 shadow-inner">
          <AlertCircle className="text-error w-8 h-8" />
        </div>
        
        <h1 className="text-6xl font-black text-foreground tracking-tighter mb-2">404</h1>
        <h2 className="text-2xl font-bold mb-4">Página no encontrada</h2>
        <p className="text-muted mb-8">
          Oops... parece que el hilo se rompió por aquí. La página que buscas no existe o ha sido movida.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <button 
            onClick={() => navigate(-1)} 
            className="btn btn-outline flex-1 border-glass flex items-center justify-center gap-2"
          >
            <ArrowLeft size={18} /> Volver
          </button>
          <Link 
            to="/" 
            className="btn btn-primary flex-1 flex items-center justify-center"
          >
            Ir al Inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
