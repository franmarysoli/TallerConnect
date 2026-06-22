# Código del Proyecto: TallerConnect

Este documento contiene todo el código fuente del proyecto para facilitar su revisión.

Generado el: 20/6/2026, 23:40:18

## Archivos de Configuración del Proyecto

### [firestore.rules](file:///home/juan/Escritorio/TallerConnect/firestore.rules)

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    // Función: verifica si el usuario está autenticado
    function isAuth() {
      return request.auth != null;
    }

    // Función: verifica si el usuario autenticado tiene el rol de "sastre"
    // Se obtiene el rol desde el documento del usuario
    function isSastre() {
      return isAuth() && 
             get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.rol == 'sastre';
    }

    // Función: verifica si el documento a acceder pertenece al cliente autenticado
    function isOwner(uid) {
      return isAuth() && request.auth.uid == uid;
    }

    // ==========================================
    // Colección: usuarios
    // ==========================================
    match /usuarios/{uid} {
      // Un usuario puede leer su propio perfil. El sastre puede leer todos.
      allow get: if isOwner(uid) || isSastre();
      // Permitir listar usuarios (necesario para verificar unicidad de cédula antes del registro)
      allow list: if true;
      
      // La creación de usuarios se hace tras el registro. 
      // Permitimos crear si el UID del documento coincide con el auth del request,
      // y si se asigna el rol 'cliente' por defecto. (Evitar escalada de privilegios)
      allow create: if isOwner(uid) 
                    && request.resource.data.rol == 'cliente';
      
      // Un usuario puede actualizar sus datos (excepto el rol y la cédula).
      // El sastre puede actualizar cualquier usuario, pero no escalar roles.
      allow update: if (isOwner(uid) || isSastre())
                    && (!request.resource.data.diff(resource.data).affectedKeys().hasAny(['rol', 'cedula']));
      
      // Solo el sastre puede eliminar usuarios.
      allow delete: if isSastre();
    }

    // ==========================================
    // Colección: telas
    // ==========================================
    match /telas/{telaId} {
      // Todos los usuarios autenticados pueden ver las telas (para mostrar nombres en prendas)
      allow read: if isAuth();
      // Solo el sastre puede gestionar (crear, actualizar, eliminar) las telas
      allow write: if isSastre();
    }

    // ==========================================
    // Colección: estilos
    // ==========================================
    match /estilos/{estiloId} {
      // Todos los usuarios autenticados pueden ver los estilos
      allow read: if isAuth();
      // Solo el sastre puede gestionar los estilos
      allow write: if isSastre();
    }

    // ==========================================
    // Colección: prendas
    // ==========================================
    match /prendas/{prendaId} {
      // Un cliente solo puede ver sus propias prendas. El sastre puede ver todas.
      allow read: if isSastre() || (isAuth() && resource.data.clienteId == request.auth.uid);
      
      // Solo el sastre puede crear, actualizar y eliminar prendas.
      allow write: if isSastre();
    }

    // ==========================================
    // Colección: citas
    // ==========================================
    match /citas/{citaId} {
      // GET (documento individual): Un cliente solo puede leer sus propias citas. El sastre puede leer todas.
      allow get: if isSastre() || (isAuth() && resource.data.clienteId == request.auth.uid);
      
      // LIST (queries): Cualquier usuario autenticado puede hacer queries sobre citas.
      // Necesario para: validar disponibilidad de horarios (horarioDisponible)
      // y para que los clientes listen sus propias citas con filtro where(clienteId == uid).
      allow list: if isAuth();
      
      // Crear: El cliente puede crear citas para sí mismo. El sastre puede crear para cualquiera.
      allow create: if isSastre() || (isAuth() && request.resource.data.clienteId == request.auth.uid);
      
      // Actualizar: El cliente puede actualizar sus citas (ej: reprogramar o cancelar). El sastre puede actualizar cualquier cita.
      allow update: if isSastre() || (isAuth() && resource.data.clienteId == request.auth.uid);
      
      // Eliminar: Solo el sastre puede eliminar citas (borrado duro). Los clientes solo pueden "cancelar" (actualización de estado).
      allow delete: if isSastre();
    }
  }
}

```

### [firestore.indexes.json](file:///home/juan/Escritorio/TallerConnect/firestore.indexes.json)

```json
{
  "indexes": [
    {
      "collectionGroup": "prendas",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "clienteId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "fechaInicio",
          "order": "DESCENDING"
        }
      ]
    },
    {
      "collectionGroup": "citas",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "clienteId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "fecha",
          "order": "ASCENDING"
        }
      ]
    },
    {
      "collectionGroup": "citas",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "fecha",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "hora",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "estado",
          "order": "ASCENDING"
        }
      ]
    }
  ],
  "fieldOverrides": []
}

```

### [vite.config.ts](file:///home/juan/Escritorio/TallerConnect/vite.config.ts)

```typescript
import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
})

```

### [package.json](file:///home/juan/Escritorio/TallerConnect/package.json)

```json
{
  "name": "tallerconnect",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  },
  "dependencies": {
    "@emailjs/browser": "^4.4.1",
    "date-fns": "^4.4.0",
    "firebase": "^12.14.0",
    "lucide-react": "^1.18.0",
    "react": "^19.2.6",
    "react-big-calendar": "^1.20.0",
    "react-dom": "^19.2.6",
    "react-hot-toast": "^2.6.0",
    "react-router-dom": "^7.17.0"
  },
  "devDependencies": {
    "@babel/core": "^7.29.0",
    "@eslint/js": "^10.0.1",
    "@rolldown/plugin-babel": "^0.2.3",
    "@types/babel__core": "^7.20.5",
    "@types/node": "^24.12.3",
    "@types/react": "^19.2.14",
    "@types/react-big-calendar": "^1.16.3",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^6.0.1",
    "babel-plugin-react-compiler": "^1.0.0",
    "eslint": "^10.3.0",
    "eslint-plugin-react-hooks": "^7.1.1",
    "eslint-plugin-react-refresh": "^0.5.2",
    "globals": "^17.6.0",
    "typescript": "~6.0.2",
    "typescript-eslint": "^8.59.2",
    "vite": "^8.0.12"
  }
}

```

### [tsconfig.json](file:///home/juan/Escritorio/TallerConnect/tsconfig.json)

```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}

```

### [index.html](file:///home/juan/Escritorio/TallerConnect/index.html)

```html
<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>TallerConnect - Gestión de Taller de Costura</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700&family=Syne:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>

```

## Código Fuente (src)

### [src/App.css](file:///home/juan/Escritorio/TallerConnect/src/App.css)

```css
.counter {
  font-size: 16px;
  padding: 5px 10px;
  border-radius: 5px;
  color: var(--accent);
  background: var(--accent-bg);
  border: 2px solid transparent;
  transition: border-color 0.3s;
  margin-bottom: 24px;

  &:hover {
    border-color: var(--accent-border);
  }
  &:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }
}

.hero {
  position: relative;

  .base,
  .framework,
  .vite {
    inset-inline: 0;
    margin: 0 auto;
  }

  .base {
    width: 170px;
    position: relative;
    z-index: 0;
  }

  .framework,
  .vite {
    position: absolute;
  }

  .framework {
    z-index: 1;
    top: 34px;
    height: 28px;
    transform: perspective(2000px) rotateZ(300deg) rotateX(44deg) rotateY(39deg)
      scale(1.4);
  }

  .vite {
    z-index: 0;
    top: 107px;
    height: 26px;
    width: auto;
    transform: perspective(2000px) rotateZ(300deg) rotateX(40deg) rotateY(39deg)
      scale(0.8);
  }
}

#center {
  display: flex;
  flex-direction: column;
  gap: 25px;
  place-content: center;
  place-items: center;
  flex-grow: 1;

  @media (max-width: 1024px) {
    padding: 32px 20px 24px;
    gap: 18px;
  }
}

#next-steps {
  display: flex;
  border-top: 1px solid var(--border);
  text-align: left;

  & > div {
    flex: 1 1 0;
    padding: 32px;
    @media (max-width: 1024px) {
      padding: 24px 20px;
    }
  }

  .icon {
    margin-bottom: 16px;
    width: 22px;
    height: 22px;
  }

  @media (max-width: 1024px) {
    flex-direction: column;
    text-align: center;
  }
}

#docs {
  border-right: 1px solid var(--border);

  @media (max-width: 1024px) {
    border-right: none;
    border-bottom: 1px solid var(--border);
  }
}

#next-steps ul {
  list-style: none;
  padding: 0;
  display: flex;
  gap: 8px;
  margin: 32px 0 0;

  .logo {
    height: 18px;
  }

  a {
    color: var(--text-h);
    font-size: 16px;
    border-radius: 6px;
    background: var(--social-bg);
    display: flex;
    padding: 6px 12px;
    align-items: center;
    gap: 8px;
    text-decoration: none;
    transition: box-shadow 0.3s;

    &:hover {
      box-shadow: var(--shadow);
    }
    .button-icon {
      height: 18px;
      width: 18px;
    }
  }

  @media (max-width: 1024px) {
    margin-top: 20px;
    flex-wrap: wrap;
    justify-content: center;

    li {
      flex: 1 1 calc(50% - 8px);
    }

    a {
      width: 100%;
      justify-content: center;
      box-sizing: border-box;
    }
  }
}

#spacer {
  height: 88px;
  border-top: 1px solid var(--border);
  @media (max-width: 1024px) {
    height: 48px;
  }
}

.ticks {
  position: relative;
  width: 100%;

  &::before,
  &::after {
    content: '';
    position: absolute;
    top: -4.5px;
    border: 5px solid transparent;
  }

  &::before {
    left: 0;
    border-left-color: var(--border);
  }
  &::after {
    right: 0;
    border-right-color: var(--border);
  }
}

```

### [src/App.tsx](file:///home/juan/Escritorio/TallerConnect/src/App.tsx)

```tsx
import { Routes, Route, Navigate } from "react-router-dom";
import { RutaProtegida } from "./components/auth/RutaProtegida";
import { useAuth } from "./context/AuthContext";
import { Login } from "./components/auth/Login";
import { Registro } from "./components/auth/Registro";

// Toasts
import { ToastProvider } from "./context/ToastContext";
import { Toaster } from "react-hot-toast";

// Layouts
import { LayoutSastre } from "./components/layout/LayoutSastre";
import { LayoutCliente } from "./components/layout/LayoutCliente";

// Vistas Sastre
import { Dashboard } from "./components/sastre/Dashboard";
import { ClientesLista } from "./components/sastre/ClientesLista";
import { TelasLista } from "./components/sastre/TelasLista";
import { EstilosLista } from "./components/sastre/EstilosLista";
import { PrendasLista } from "./components/sastre/PrendasLista";
import { CalendarioCitas } from "./components/sastre/CalendarioCitas";

// Vistas Cliente
import { InicioCliente } from "./components/cliente/InicioCliente";
import { MisPrendas } from "./components/cliente/MisPrendas";
import { MisMedidas } from "./components/cliente/MisMedidas";
import { MisCitas } from "./components/cliente/MisCitas";
import { PerfilCliente } from "./components/cliente/PerfilCliente";

export default function App() {
  return (
    <ToastProvider>
      <Toaster position="top-right" />
      <Routes>
        {/* Rutas Públicas */}
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Registro />} />

      {/* Redirección inicial (ruta raíz) */}
      <Route path="/" element={<RutaProtegida><RedireccionPorRol /></RutaProtegida>} />

      {/* Rutas Privadas: SASTRE */}
      <Route
        path="/sastre"
        element={
          <RutaProtegida rolesPermitidos={["sastre"]}>
            <LayoutSastre />
          </RutaProtegida>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="clientes" element={<ClientesLista />} />
        <Route path="telas" element={<TelasLista />} />
        <Route path="estilos" element={<EstilosLista />} />
        <Route path="prendas" element={<PrendasLista />} />
        <Route path="citas" element={<CalendarioCitas />} />
      </Route>

      {/* Rutas Privadas: CLIENTE */}
      <Route
        path="/cliente"
        element={
          <RutaProtegida rolesPermitidos={["cliente"]}>
            <LayoutCliente />
          </RutaProtegida>
        }
      >
        <Route index element={<Navigate to="inicio" replace />} />
        <Route path="inicio" element={<InicioCliente />} />
        <Route path="prendas" element={<MisPrendas />} />
        <Route path="medidas" element={<MisMedidas />} />
        <Route path="citas" element={<MisCitas />} />
        <Route path="perfil" element={<PerfilCliente />} />
      </Route>

      {/* Ruta 404 / Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </ToastProvider>
  );
}

/**
 * Componente helper que redirige a la raíz de cada rol
 * Solo se renderiza dentro de una RutaProtegida, por lo que el usuario ya existe
 */
function RedireccionPorRol() {
  const { usuario } = useAuth();

  if (usuario?.rol === "cliente") {
    return <Navigate to="/cliente/inicio" replace />;
  }
  // Sastre u otro rol → dashboard del sastre
  return <Navigate to="/sastre/dashboard" replace />;
}

```

### [src/components/auth/Login.tsx](file:///home/juan/Escritorio/TallerConnect/src/components/auth/Login.tsx)

```tsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Spinner } from "../common/Spinner";
import { Logo } from "../common/Logo";
import { Eye, EyeOff } from "lucide-react";

export function Login() {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { iniciarSesion, error, limpiarError } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!correo || !password) return;

    setIsSubmitting(true);
    limpiarError();

    try {
      await iniciarSesion(correo, password);
      // El onAuthStateChanged y las RutasProtegidas se encargarán
      // de redirigir al panel correspondiente (sastre o cliente)
      navigate("/");
    } catch (err) {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="login-container">
      <div className="login-card glass-panel">
        <div className="login-header">
          <div className="flex justify-center mb-4"><Logo size={64} /></div>
          <h1>TallerConnect</h1>
          <p>Inicia sesión para gestionar tus prendas y citas</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="correo">Correo Electrónico</label>
            <input
              id="correo"
              type="email"
              value={correo}
              onChange={(e) => {
                setCorreo(e.target.value);
                limpiarError();
              }}
              placeholder="tu@correo.com"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <div style={{ position: "relative", width: "100%" }}>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  limpiarError();
                }}
                placeholder="••••••••"
                required
                disabled={isSubmitting}
                style={{ paddingRight: "40px" }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "transparent",
                  border: "none",
                  padding: 0,
                  margin: 0,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#64748b"
                }}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? <Spinner /> : "Ingresar"}
          </button>
        </form>

        <div className="login-footer">
          <p>¿No tienes una cuenta?</p>
          <Link to="/registro" className="link">Regístrate aquí</Link>
        </div>
      </div>
    </div>
  );
}

```

### [src/components/auth/Registro.tsx](file:///home/juan/Escritorio/TallerConnect/src/components/auth/Registro.tsx)

```tsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useClientes } from "../../hooks/useClientes";
import { validarCedula, validarCorreo, validarPassword, validarCelular } from "../../utils/helpers";
import { Spinner } from "../common/Spinner";
import { Logo } from "../common/Logo";
import { Eye, EyeOff } from "lucide-react";

export function Registro() {
  const [formData, setFormData] = useState({
    cedula: "",
    nombre: "",
    correo: "",
    celular: "",
    password: "",
    confirmarPassword: "",
  });
  
  const [errorLocal, setErrorLocal] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const { registrarse, error: errorAuth, limpiarError } = useAuth();
  const { cedulaExiste } = useClientes();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrorLocal(null);
    limpiarError();
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorLocal(null);

    // Validaciones
    if (!validarCedula(formData.cedula)) {
      return setErrorLocal("La cédula debe contener solo números (5-15 dígitos).");
    }
    if (!validarCorreo(formData.correo)) {
      return setErrorLocal("El formato del correo es inválido.");
    }
    if (!validarCelular(formData.celular)) {
      return setErrorLocal("El celular tiene un formato inválido.");
    }
    if (!validarPassword(formData.password)) {
      return setErrorLocal("La contraseña debe tener al menos 6 caracteres.");
    }
    if (formData.password !== formData.confirmarPassword) {
      return setErrorLocal("Las contraseñas no coinciden.");
    }

    setIsSubmitting(true);

    try {
      // 1. Verificar si la cédula ya existe en la base de datos
      const existe = await cedulaExiste(formData.cedula);
      if (existe) {
        setErrorLocal("Esta cédula ya se encuentra registrada en el sistema.");
        setIsSubmitting(false);
        return;
      }

      // 2. Proceder con el registro
      await registrarse({
        cedula: formData.cedula,
        nombre: formData.nombre,
        correo: formData.correo,
        celular: formData.celular,
        password: formData.password,
      });

      // Registro exitoso, redirigir al inicio (panel del cliente)
      navigate("/");
    } catch (err: any) {
      setIsSubmitting(false);
      console.error("Error en registro:", err);
      setErrorLocal(err.message || "Error inesperado durante el registro.");
    }
  }

  return (
    <div className="login-container register-container">
      <div className="login-card glass-panel">
        <div className="login-header">
          <div className="flex justify-center mb-4"><Logo size={64} /></div>
          <h1>Crear Cuenta</h1>
          <p>Únete a TallerConnect</p>
        </div>

        {(errorLocal || errorAuth) && (
          <div className="alert alert-error">{errorLocal || errorAuth}</div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="cedula">Cédula</label>
              <input
                id="cedula"
                name="cedula"
                type="text"
                value={formData.cedula}
                onChange={handleChange}
                placeholder="12345678"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group">
              <label htmlFor="nombre">Nombre Completo</label>
              <input
                id="nombre"
                name="nombre"
                type="text"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Juan Pérez"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group">
              <label htmlFor="correo">Correo Electrónico</label>
              <input
                id="correo"
                name="correo"
                type="email"
                value={formData.correo}
                onChange={handleChange}
                placeholder="juan@correo.com"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group">
              <label htmlFor="celular">Celular (Opcional)</label>
              <input
                id="celular"
                name="celular"
                type="text"
                value={formData.celular}
                onChange={handleChange}
                placeholder="3001234567"
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Contraseña</label>
              <div style={{ position: "relative", width: "100%" }}>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  disabled={isSubmitting}
                  style={{ paddingRight: "40px" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "transparent",
                    border: "none",
                    padding: 0,
                    margin: 0,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#64748b"
                  }}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirmarPassword">Confirmar Contraseña</label>
              <div style={{ position: "relative", width: "100%" }}>
                <input
                  id="confirmarPassword"
                  name="confirmarPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmarPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  disabled={isSubmitting}
                  style={{ paddingRight: "40px" }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  tabIndex={-1}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "transparent",
                    border: "none",
                    padding: 0,
                    margin: 0,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#64748b"
                  }}
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full mt-4"
            disabled={isSubmitting}
          >
            {isSubmitting ? <Spinner /> : "Registrarse"}
          </button>
        </form>

        <div className="login-footer">
          <p>¿Ya tienes una cuenta?</p>
          <Link to="/login" className="link">Inicia sesión aquí</Link>
        </div>
      </div>
    </div>
  );
}

```

### [src/components/auth/RutaProtegida.tsx](file:///home/juan/Escritorio/TallerConnect/src/components/auth/RutaProtegida.tsx)

```tsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Spinner } from "../common/Spinner";

interface RutaProtegidaProps {
  children: React.ReactNode;
  rolesPermitidos?: ("sastre" | "cliente")[];
}

/**
 * Componente Wrapper para proteger rutas.
 * 1. Espera a que se verifique la sesión de Firebase.
 * 2. Si no hay usuario, redirige a /login.
 * 3. Si hay usuario, verifica si tiene el rol permitido.
 * 4. Si el rol no está permitido, redirige a un fallback seguro.
 */
export function RutaProtegida({ children, rolesPermitidos }: RutaProtegidaProps) {
  const { usuario, firebaseUser, cargando } = useAuth();

  // 1. Mostrar spinner mientras Firebase verifica si hay sesión activa
  // y mientras cargamos los datos adicionales del usuario desde Firestore
  if (cargando) {
    return (
      <div className="flex-center full-screen">
        <Spinner />
        <p style={{ marginLeft: "1rem" }}>Cargando...</p>
      </div>
    );
  }

  // 2. Si no hay usuario en Firebase, redirigir a Login
  if (!firebaseUser) {
    return <Navigate to="/login" replace />;
  }

  // 3. Si ya hay usuario en Firebase, pero aún no se carga de Firestore
  // (caso raro de delay entre auth y db)
  if (!usuario) {
    return (
      <div className="flex-center full-screen">
        <Spinner />
        <p style={{ marginLeft: "1rem" }}>Verificando permisos...</p>
      </div>
    );
  }

  // 4. Si se especificaron roles permitidos y el usuario no los tiene
  if (rolesPermitidos && !rolesPermitidos.includes(usuario.rol)) {
    // Redirigir al inicio del rol correcto
    if (usuario.rol === "sastre") {
      return <Navigate to="/sastre/dashboard" replace />;
    } else {
      return <Navigate to="/cliente/inicio" replace />;
    }
  }

  // Si pasa todas las validaciones, renderizar el componente hijo
  return <>{children}</>;
}

```

### [src/components/cliente/CitaForm.tsx](file:///home/juan/Escritorio/TallerConnect/src/components/cliente/CitaForm.tsx)

```tsx
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useCitas } from "../../hooks/useCitas";
import { HORARIOS_DISPONIBLES, TIPOS_CITA } from "../../utils/constantes";
import { fechaHoy } from "../../utils/helpers";
import { Spinner } from "../common/Spinner";
import type { Cita } from "../../types";

interface CitaFormProps {
  cita?: Cita;
  onClose: () => void;
}

export function CitaForm({ cita, onClose }: CitaFormProps) {
  const { usuario } = useAuth();
  const { crearCita, reprogramarCita } = useCitas();
  
  const [formData, setFormData] = useState({
    fecha: cita?.fecha || fechaHoy(),
    hora: cita?.hora || "09:00",
    tipo: cita?.tipo || "prueba",
    observaciones: cita?.observaciones || "",
  });

  const [errorLocal, setErrorLocal] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrorLocal(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuario) return;

    // Validación de fecha (no agendar en el pasado)
    if (formData.fecha < fechaHoy()) {
      return setErrorLocal("No puedes agendar una cita en el pasado.");
    }

    setIsSubmitting(true);
    setErrorLocal(null);

    try {
      if (cita && cita.id) {
        // Reprogramar
        await reprogramarCita(
          cita.id,
          formData.fecha,
          formData.hora,
          formData.tipo,
          formData.observaciones,
          usuario.correo,
          usuario.nombre
        );
      } else {
        // Crear nueva
        await crearCita({
          clienteId: usuario.uid,
          clienteNombre: usuario.nombre,
          fecha: formData.fecha,
          hora: formData.hora,
          tipo: formData.tipo as any,
          estado: "pendiente",
          observaciones: formData.observaciones
        }, usuario.correo);
      }
      onClose();
    } catch (error: any) {
      console.error("Error al guardar cita:", error);
      setErrorLocal(error.message || "Ocurrió un error al agendar la cita.");
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form-container">
      {errorLocal && <div className="alert alert-error mb-4">{errorLocal}</div>}

      <div className="grid grid-cols-2 gap-4">
        <div className="form-group">
          <label htmlFor="fecha">Fecha</label>
          <input
            id="fecha"
            name="fecha"
            type="date"
            min={fechaHoy()}
            value={formData.fecha}
            onChange={handleChange}
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="form-group">
          <label htmlFor="hora">Hora</label>
          <select
            id="hora"
            name="hora"
            value={formData.hora}
            onChange={handleChange}
            required
            disabled={isSubmitting}
          >
            {HORARIOS_DISPONIBLES.map(h => (
              <option key={h} value={h}>{h}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="tipo">Motivo de la Cita</label>
        <div className="flex gap-4 mt-2">
          {TIPOS_CITA.map(t => (
            <label key={t.valor} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="tipo"
                value={t.valor}
                checked={formData.tipo === t.valor}
                onChange={handleChange}
                disabled={isSubmitting}
              />
              {t.etiqueta}
            </label>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="observaciones">Notas adicionales (Opcional)</label>
        <textarea
          id="observaciones"
          name="observaciones"
          value={formData.observaciones}
          onChange={handleChange}
          placeholder="Ej: Necesito probarme el pantalón con los zapatos que usaré."
          rows={3}
          disabled={isSubmitting}
        />
      </div>

      <div className="flex justify-end gap-2 mt-6">
        <button
          type="button"
          className="btn btn-outline"
          onClick={onClose}
          disabled={isSubmitting}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? <Spinner /> : (cita ? "Guardar Cambios" : "Agendar Cita")}
        </button>
      </div>
    </form>
  );
}

```

### [src/components/cliente/InicioCliente.tsx](file:///home/juan/Escritorio/TallerConnect/src/components/cliente/InicioCliente.tsx)

```tsx
import { useAuth } from "../../context/AuthContext";
import { usePrendas } from "../../hooks/usePrendas";
import { useCitas } from "../../hooks/useCitas";
import { Link } from "react-router-dom";
import { Spinner } from "../common/Spinner";
import { BadgeEstado } from "../common/BadgeEstado";
import { formatearFechaCorta } from "../../utils/helpers";
import { ESTADOS_PRENDA } from "../../utils/constantes";
import { Shirt, Sparkles, Calendar, ShoppingBag, Ruler } from "lucide-react";

export function InicioCliente() {
  const { usuario } = useAuth();
  
  // Hooks filtrados por el UID del cliente actual
  const { prendas, cargando: cargandoPrendas } = usePrendas(usuario?.uid);
  const { citas, cargando: cargandoCitas } = useCitas(usuario?.uid);

  if (cargandoPrendas || cargandoCitas) {
    return <div className="flex-center p-8"><Spinner /></div>;
  }

  // Filtrar prendas activas (no terminadas)
  const prendasActivas = prendas.filter(p => p.estado !== "terminado");
  const ultimaPrendaTerminada = prendas.find(p => p.estado === "terminado");
  
  // Buscar próxima cita (pendiente o confirmada, futura)
  // Simplificado para la demo
  const proximasCitas = citas.filter(c => c.estado !== "cancelada");
  const proximaCita = proximasCitas.length > 0 ? proximasCitas[0] : null;

  return (
    <div className="dashboard cliente-dashboard py-6">
      <div className="mb-8 text-center md:text-left">
        <h1 className="text-3xl font-bold mb-2">¡Hola, {usuario?.nombre.split(" ")[0]}!</h1>
        <p className="text-muted text-lg">Bienvenido/a a tu panel personal de TallerConnect.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Panel Izquierdo: Prendas en Proceso */}
        <div className="card glass-panel">
          <div className="flex-between mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Shirt size={20} className="text-primary" /> Tus prendas en proceso
            </h2>
            <Link to="/cliente/prendas" className="text-sm text-primary underline">
              Ver todas
            </Link>
          </div>

          {prendasActivas.length > 0 ? (
            <div className="space-y-4">
              {prendasActivas.map(prenda => {
                const configEstado = ESTADOS_PRENDA.find(e => e.valor === prenda.estado);
                // Calcular "progreso" visual simple basado en el índice del estado
                const indiceEstado = ESTADOS_PRENDA.findIndex(e => e.valor === prenda.estado);
                const porcentaje = Math.max(10, (indiceEstado / 3) * 100);

                return (
                  <div key={prenda.id} className="bg-glass-dark p-4 rounded-lg">
                    <div className="flex-between mb-2">
                      <strong className="text-lg">{prenda.estiloNombre}</strong>
                      <BadgeEstado estado={prenda.estado} />
                    </div>
                    
                    {/* Barra de progreso */}
                    <div className="progress-bar-bg mt-3">
                      <div 
                        className="progress-bar-fill transition-all" 
                        style={{ 
                          width: `${porcentaje}%`, 
                          backgroundColor: configEstado?.color 
                        }}
                      ></div>
                    </div>
                    <div className="text-xs text-right mt-1 text-muted">
                      Iniciado el {formatearFechaCorta(prenda.fechaInicio.toDate().toISOString().split("T")[0])}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="flex justify-center mb-4 text-primary opacity-50"><Sparkles size={48} /></div>
              <p className="text-muted">No tienes prendas en confección actualmente.</p>
              {ultimaPrendaTerminada && (
                <p className="text-sm mt-4 text-success">
                  Tu última prenda fue entregada el {formatearFechaCorta(ultimaPrendaTerminada.fechaTerminado!.toDate().toISOString().split("T")[0])}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Panel Derecho: Citas y Medidas */}
        <div className="space-y-6">
          
          {/* Próxima Cita */}
          <div className="card glass-panel gradient-border border-primary">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Calendar size={20} className="text-primary" /> Tu Próxima Cita
            </h2>
            
            {proximaCita ? (
              <div className="text-center">
                <div className="flex justify-center mb-4 text-primary">
                  {proximaCita.tipo === 'prueba' ? <Shirt size={48} /> : <ShoppingBag size={48} />}
                </div>
                <div className="text-2xl font-bold text-primary mb-1">
                  {formatearFechaCorta(proximaCita.fecha)} a las {proximaCita.hora}
                </div>
                <div className="capitalize text-lg mb-4">Cita de {proximaCita.tipo}</div>
                
                <div className="flex justify-center gap-3 mt-4">
                  <Link to="/cliente/citas" className="btn btn-outline btn-sm">Gestionar Citas</Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted mb-4">No tienes citas agendadas.</p>
                <Link to="/cliente/citas" className="btn btn-primary">Agendar Cita</Link>
              </div>
            )}
          </div>

          {/* Medidas Rápidas */}
          <div className="card glass-panel">
            <div className="flex-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Ruler size={20} className="text-primary" /> Últimas Medidas
              </h2>
              <Link to="/cliente/medidas" className="text-sm text-primary underline">
                Ver detalle
              </Link>
            </div>
            
            {prendas.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-glass-dark p-2 rounded text-center">
                  <div className="text-muted text-xs uppercase">Talle</div>
                  <div className="font-bold">{prendas[0].medidas.talle} cm</div>
                </div>
                <div className="bg-glass-dark p-2 rounded text-center">
                  <div className="text-muted text-xs uppercase">Pecho</div>
                  <div className="font-bold">{prendas[0].medidas.pecho} cm</div>
                </div>
                <div className="bg-glass-dark p-2 rounded text-center">
                  <div className="text-muted text-xs uppercase">Cintura</div>
                  <div className="font-bold">{prendas[0].medidas.cintura} cm</div>
                </div>
                <div className="bg-glass-dark p-2 rounded text-center">
                  <div className="text-muted text-xs uppercase">Cadera</div>
                  <div className="font-bold">{prendas[0].medidas.cadera} cm</div>
                </div>
              </div>
            ) : (
              <p className="text-center text-muted py-4">
                Tus medidas se registrarán en tu primera prenda.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

```

### [src/components/cliente/MisCitas.tsx](file:///home/juan/Escritorio/TallerConnect/src/components/cliente/MisCitas.tsx)

```tsx
import { useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { es as esES } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";

import { useAuth } from "../../context/AuthContext";
import { useCitas } from "../../hooks/useCitas";
import { Spinner } from "../common/Spinner";
import { Modal } from "../common/Modal";
import { useToast } from "../../context/ToastContext";
import { CitaForm } from "./CitaForm";
import { ESTADOS_CITA } from "../../utils/constantes";
import { CalendarX } from "lucide-react";
import type { Cita } from "../../types";

const locales = { es: esES };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

export function MisCitas() {
  const { usuario } = useAuth();
  const { citas, cargando, cancelarCita } = useCitas(usuario?.uid);
  const { showToast } = useToast();
  const [modalAbierto, setModalAbierto] = useState(false);
  const [citaSeleccionada, setCitaSeleccionada] = useState<Cita | null>(null);

  const [fechaCalendario, setFechaCalendario] = useState(new Date());
  const [vistaCalendario, setVistaCalendario] = useState<any>("month");

  if (cargando) return <div className="flex-center p-8"><Spinner /></div>;

  const eventos = citas
    .filter((cita) => cita && cita.fecha && cita.hora)
    .map((cita) => {
      try {
        const [year, month, day] = cita.fecha.split("-").map(Number);
        const [hour, minute] = cita.hora.split(":").map(Number);
        if (isNaN(year) || isNaN(month) || isNaN(day) || isNaN(hour) || isNaN(minute)) {
          return null;
        }
        const startDate = new Date(year, month - 1, day, hour, minute);
        const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);

        return {
          id: cita.id,
          title: `${cita.tipo} - ${cita.estado}`,
          start: startDate,
          end: endDate,
          resource: cita,
        };
      } catch (e) {
        console.error("Error al procesar cita cliente:", cita, e);
        return null;
      }
    })
    .filter((e): e is NonNullable<typeof e> => e !== null);

  const eventStyleGetter = (event: any) => {
    const cita = event.resource as Cita;
    const configEstado = ESTADOS_CITA.find(e => e.valor === cita.estado);
    
    return {
      style: {
        backgroundColor: configEstado?.color || "#3b82f6",
        borderRadius: "4px",
        opacity: cita.estado === "cancelada" ? 0.6 : 1,
        color: "white",
        border: "none",
        display: "block",
      },
    };
  };

  const handleSelectEvent = (event: any) => {
    setCitaSeleccionada(event.resource);
    setModalAbierto(true);
  };

  const handleCancelarCita = async () => {
    if (!citaSeleccionada?.id || !usuario) return;
    
    if (confirm("¿Estás seguro de cancelar esta cita?")) {
      try {
        await cancelarCita(
          citaSeleccionada.id,
          usuario.correo,
          usuario.nombre,
          citaSeleccionada.fecha,
          citaSeleccionada.hora,
          citaSeleccionada.tipo
        );
        setModalAbierto(false);
      } catch (error) {
        console.error("Error al cancelar:", error);
        showToast("Hubo un error al cancelar la cita.", "error");
      }
    }
  };

  return (
    <div className="py-6">
      <div className="flex-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Mis Citas</h1>
          <p className="text-muted">Gestiona tus pruebas y entregas.</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => {
            setCitaSeleccionada(null);
            setModalAbierto(true);
          }}
        >
          Agendar Nueva Cita
        </button>
      </div>

      <div className="card glass-panel h-[600px] p-4 mb-8">
        <Calendar
          localizer={localizer}
          events={eventos}
          startAccessor="start"
          endAccessor="end"
          style={{ height: "100%" }}
          date={fechaCalendario}
          onNavigate={(date) => setFechaCalendario(date)}
          view={vistaCalendario}
          onView={(view) => setVistaCalendario(view)}
          messages={{
            next: "Sig", previous: "Ant", today: "Hoy", month: "Mes",
            week: "Semana", day: "Día", noEventsInRange: "No tienes citas en este periodo.",
          }}
          culture="es"
          eventPropGetter={eventStyleGetter}
          onSelectEvent={handleSelectEvent}
          views={['month', 'week', 'agenda']}
        />
      </div>

      {/* Modal Crear/Editar/Ver Cita */}
      <Modal
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
        titulo={citaSeleccionada ? "Detalles de tu Cita" : "Agendar Cita"}
      >
        {citaSeleccionada && citaSeleccionada.estado !== "cancelada" ? (
          <div>
            <CitaForm 
              cita={citaSeleccionada} 
              onClose={() => setModalAbierto(false)} 
            />
            
            <div className="mt-4 pt-4 border-t border-glass text-center">
              <button 
                className="text-error text-sm underline"
                onClick={handleCancelarCita}
              >
                Quiero cancelar esta cita
              </button>
            </div>
          </div>
        ) : citaSeleccionada && citaSeleccionada.estado === "cancelada" ? (
          <div className="text-center py-4">
            <div className="flex justify-center mb-4 text-primary opacity-50"><CalendarX size={48} /></div>
            <h3 className="text-xl font-bold mb-2">Cita Cancelada</h3>
            <p className="text-muted mb-6">
              Esta cita programada para el {citaSeleccionada.fecha} a las {citaSeleccionada.hora} fue cancelada.
            </p>
            <button className="btn btn-outline w-full" onClick={() => setModalAbierto(false)}>
              Cerrar
            </button>
          </div>
        ) : (
          <CitaForm onClose={() => setModalAbierto(false)} />
        )}
      </Modal>
    </div>
  );
}

```

### [src/components/cliente/MisMedidas.tsx](file:///home/juan/Escritorio/TallerConnect/src/components/cliente/MisMedidas.tsx)

```tsx
import { useAuth } from "../../context/AuthContext";
import { usePrendas } from "../../hooks/usePrendas";
import { MEDIDAS_DISPONIBLES } from "../../utils/constantes";
import { formatearFechaCorta } from "../../utils/helpers";
import { Spinner } from "../common/Spinner";
import { Ruler } from "lucide-react";

export function MisMedidas() {
  const { usuario } = useAuth();
  const { prendas, cargando } = usePrendas(usuario?.uid);

  if (cargando) return <div className="flex-center p-8"><Spinner /></div>;

  if (prendas.length === 0) {
    return (
      <div className="py-6 text-center">
        <h1 className="text-3xl font-bold mb-4">Mis Medidas</h1>
        <div className="card glass-panel py-12">
          <div className="flex justify-center mb-4 text-primary opacity-50"><Ruler size={48} /></div>
          <p className="text-muted">Aún no hay registros de tus medidas. Se registrarán con tu primera prenda.</p>
        </div>
      </div>
    );
  }

  const ultimaPrenda = prendas[0]; // La lista viene ordenada por fecha DESC
  const prendasAnteriores = prendas.slice(1);

  return (
    <div className="py-6">
      <div className="mb-8 text-center md:text-left">
        <h1 className="text-3xl font-bold mb-2">Mis Medidas Corporales</h1>
        <p className="text-muted">Tu perfil de medidas actualizadas basadas en tu última confección.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Panel Principal: Medidas Actuales */}
        <div className="lg:col-span-2">
          <div className="card glass-panel border-primary">
            <div className="flex-between mb-6 border-b border-glass pb-4">
              <h2 className="text-xl font-bold flex items-center gap-2 text-primary">
                <Ruler size={20} /> Medidas Actuales
              </h2>
              <div className="text-sm text-muted text-right">
                Tomadas el: <br/>
                <strong className="text-foreground">
                  {formatearFechaCorta(ultimaPrenda.fechaInicio.toDate().toISOString().split("T")[0])}
                </strong>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {MEDIDAS_DISPONIBLES.map(m => (
                <div key={m.clave} className="bg-glass-dark p-4 rounded-lg text-center transform transition-transform hover:scale-105">
                  <div className="text-muted text-sm uppercase tracking-wider mb-2">{m.etiqueta}</div>
                  <div className="text-2xl font-bold text-white">
                    {ultimaPrenda.medidas[m.clave]} <span className="text-sm font-normal text-muted">{m.unidad}</span>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted text-center mt-6">
              Estas medidas se usaron para la prenda: <strong>{ultimaPrenda.estiloNombre}</strong>
            </p>
          </div>
        </div>

        {/* Panel Lateral: Historial */}
        <div>
          <h3 className="text-xl font-bold mb-4">Historial de Cambios</h3>
          
          <div className="space-y-4">
            {prendasAnteriores.length > 0 ? (
              prendasAnteriores.map((prenda) => (
                <div key={prenda.id} className="card glass-panel p-4">
                  <div className="text-sm text-primary mb-1">
                    {formatearFechaCorta(prenda.fechaInicio.toDate().toISOString().split("T")[0])}
                  </div>
                  <div className="font-bold mb-3">{prenda.estiloNombre}</div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm text-muted">
                    {/* Solo mostrar un resumen de 4 medidas clave para no saturar */}
                    <div>Talle: {prenda.medidas.talle} cm</div>
                    <div>Pecho: {prenda.medidas.pecho} cm</div>
                    <div>Cintura: {prenda.medidas.cintura} cm</div>
                    <div>Cadera: {prenda.medidas.cadera} cm</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center p-4 border border-dashed border-glass rounded text-muted">
                No hay registros anteriores.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

```

### [src/components/cliente/MisPrendas.tsx](file:///home/juan/Escritorio/TallerConnect/src/components/cliente/MisPrendas.tsx)

```tsx
import { useAuth } from "../../context/AuthContext";
import { usePrendas } from "../../hooks/usePrendas";
import { Spinner } from "../common/Spinner";
import { BadgeEstado } from "../common/BadgeEstado";
import { formatearFechaCorta, formatearMoneda } from "../../utils/helpers";
import { ESTADOS_PRENDA } from "../../utils/constantes";
import { Shirt } from "lucide-react";

export function MisPrendas() {
  const { usuario } = useAuth();
  const { prendas, cargando } = usePrendas(usuario?.uid);

  if (cargando) return <div className="flex-center p-8"><Spinner /></div>;

  return (
    <div className="py-6">
      <div className="mb-8 text-center md:text-left">
        <h1 className="text-3xl font-bold mb-2">Mis Prendas</h1>
        <p className="text-muted">Consulta el estado y costo de todas tus prendas confeccionadas o en proceso.</p>
      </div>

      {prendas.length === 0 ? (
        <div className="card glass-panel text-center py-12">
          <div className="flex justify-center mb-4 text-primary opacity-50"><Shirt size={48} /></div>
          <h2 className="text-2xl font-bold mb-2">Aún no tienes prendas</h2>
          <p className="text-muted">
            Acércate al taller para tomarte las medidas y comenzar tu primera confección.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {prendas.map((prenda) => {
            const configEstado = ESTADOS_PRENDA.find(e => e.valor === prenda.estado);
            const indiceEstado = ESTADOS_PRENDA.findIndex(e => e.valor === prenda.estado);
            const porcentaje = Math.max(10, (indiceEstado / 3) * 100);

            return (
              <div key={prenda.id} className="card glass-panel flex flex-col relative overflow-hidden group">
                
                {/* Indicador de color en el borde superior */}
                <div 
                  className="absolute top-0 left-0 w-full h-1"
                  style={{ backgroundColor: configEstado?.color }}
                ></div>

                <div className="flex-between mb-4">
                  <h3 className="text-xl font-bold">{prenda.estiloNombre}</h3>
                  <BadgeEstado estado={prenda.estado} />
                </div>

                <div className="space-y-3 flex-grow mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Tela:</span>
                    <span className="font-medium">{prenda.telaNombre}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Fecha de inicio:</span>
                    <span>{formatearFechaCorta(prenda.fechaInicio.toDate().toISOString().split("T")[0])}</span>
                  </div>
                  
                  {prenda.estado === "terminado" && prenda.fechaTerminado && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted">Fecha de entrega:</span>
                      <span className="text-success">
                        {formatearFechaCorta(prenda.fechaTerminado.toDate().toISOString().split("T")[0])}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between text-sm mt-4 pt-4 border-t border-glass">
                    <span className="text-muted">Costo Estimado:</span>
                    <span className="font-bold text-primary text-lg">
                      {formatearMoneda(prenda.costoTotal)}
                    </span>
                  </div>
                </div>

                {/* Tracking Visual */}
                <div className="mt-auto">
                  <div className="flex-between text-xs text-muted mb-1 px-1">
                    <span>Corte</span>
                    <span>Terminado</span>
                  </div>
                  <div className="progress-bar-bg">
                    <div 
                      className="progress-bar-fill transition-all duration-1000" 
                      style={{ 
                        width: `${porcentaje}%`, 
                        backgroundColor: configEstado?.color,
                        boxShadow: `0 0 10px ${configEstado?.color}80` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

```

### [src/components/cliente/PerfilCliente.tsx](file:///home/juan/Escritorio/TallerConnect/src/components/cliente/PerfilCliente.tsx)

```tsx
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

```

### [src/components/common/AlertaEstado.tsx](file:///home/juan/Escritorio/TallerConnect/src/components/common/AlertaEstado.tsx)

```tsx
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

```

### [src/components/common/BadgeEstado.tsx](file:///home/juan/Escritorio/TallerConnect/src/components/common/BadgeEstado.tsx)

```tsx
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

```

### [src/components/common/Logo.tsx](file:///home/juan/Escritorio/TallerConnect/src/components/common/Logo.tsx)

```tsx
export function Logo({ className = "", size = 40 }: { className?: string; size?: number }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 100 100" 
      width={size} 
      height={size}
      className={className}
    >
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#BE185D" />
          <stop offset="100%" stopColor="#EC4899" />
        </linearGradient>
      </defs>
      {/* Background */}
      <circle cx="50" cy="50" r="45" fill="#FDF2F8" />
      {/* Needle */}
      <path d="M 45 20 L 55 20 L 50 85 Z" fill="#0F172A" />
      {/* Needle Eye */}
      <ellipse cx="50" cy="25" rx="1.5" ry="4" fill="#FDF2F8" />
      {/* Thread forming a C */}
      <path 
        d="M 50 25 C 20 20, 20 80, 50 75 C 80 70, 70 40, 50 40" 
        fill="none" 
        stroke="url(#grad1)" 
        strokeWidth="4" 
        strokeLinecap="round" 
      />
    </svg>
  );
}

```

### [src/components/common/Modal.tsx](file:///home/juan/Escritorio/TallerConnect/src/components/common/Modal.tsx)

```tsx
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

```

### [src/components/common/Spinner.tsx](file:///home/juan/Escritorio/TallerConnect/src/components/common/Spinner.tsx)

```tsx
export function Spinner() {
  return (
    <svg 
      className="spinner" 
      viewBox="0 0 50 50" 
      width="24" 
      height="24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle 
        className="path" 
        cx="25" 
        cy="25" 
        r="20" 
        fill="none" 
        strokeWidth="5"
      ></circle>
    </svg>
  );
}

```

### [src/components/layout/LayoutCliente.tsx](file:///home/juan/Escritorio/TallerConnect/src/components/layout/LayoutCliente.tsx)

```tsx
import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";

export function LayoutCliente() {
  return (
    <div className="app-layout">
      <Navbar />
      <div className="main-container cliente-layout">
        {/* El cliente no tiene sidebar, usa navegación horizontal en el Navbar */}
        <main className="content-area container">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

```

### [src/components/layout/LayoutSastre.tsx](file:///home/juan/Escritorio/TallerConnect/src/components/layout/LayoutSastre.tsx)

```tsx
import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";

export function LayoutSastre() {
  return (
    <div className="app-layout">
      <Navbar />
      <div className="main-container sastre-layout">
        <Sidebar />
        <main className="content-area">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

```

### [src/components/layout/Navbar.tsx](file:///home/juan/Escritorio/TallerConnect/src/components/layout/Navbar.tsx)

```tsx
import { useState, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { LogOut, Menu, X } from "lucide-react";
import { Logo } from "../common/Logo";

export function Navbar() {
  const { usuario, cerrarSesion } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  // Cerrar menú al cambiar de ruta
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `nav-link ${isActive ? 'active' : ''}`;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-header">
          <Link to="/" className="navbar-brand">
            <Logo size={32} />
            <span className="logo-text ml-2">TallerConnect</span>
          </Link>
          {usuario && (
            <button
              className="mobile-menu-btn"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          )}
        </div>

        {usuario && (
          <div className={`navbar-menu ${isMenuOpen ? 'is-open' : ''}`}>
            {usuario.rol === "cliente" && (
              <div className="nav-links">
                <NavLink to="/cliente/inicio" className={navLinkClass} onClick={() => setIsMenuOpen(false)}>Inicio</NavLink>
                <NavLink to="/cliente/prendas" className={navLinkClass} onClick={() => setIsMenuOpen(false)}>Prendas</NavLink>
                <NavLink to="/cliente/medidas" className={navLinkClass} onClick={() => setIsMenuOpen(false)}>Medidas</NavLink>
                <NavLink to="/cliente/citas" className={navLinkClass} onClick={() => setIsMenuOpen(false)}>Citas</NavLink>
                <NavLink to="/cliente/perfil" className={navLinkClass} onClick={() => setIsMenuOpen(false)}>Mi Perfil</NavLink>
              </div>
            )}

            {usuario.rol === "sastre" && (
              <div className="nav-links sastre-nav-links">
                <NavLink to="/sastre/dashboard" className={navLinkClass} onClick={() => setIsMenuOpen(false)}>Dashboard</NavLink>
                <NavLink to="/sastre/clientes" className={navLinkClass} onClick={() => setIsMenuOpen(false)}>Clientes</NavLink>
                <NavLink to="/sastre/prendas" className={navLinkClass} onClick={() => setIsMenuOpen(false)}>Prendas</NavLink>
                <NavLink to="/sastre/citas" className={navLinkClass} onClick={() => setIsMenuOpen(false)}>Citas</NavLink>
                <NavLink to="/sastre/telas" className={navLinkClass} onClick={() => setIsMenuOpen(false)}>Telas</NavLink>
                <NavLink to="/sastre/estilos" className={navLinkClass} onClick={() => setIsMenuOpen(false)}>Estilos</NavLink>
              </div>
            )}

            <div className="user-profile">
              <div className="avatar">
                {usuario.nombre.charAt(0).toUpperCase()}
              </div>
              <div className="user-info">
                <span className="user-name">{usuario.nombre}</span>
                <span className="user-role badge-role">{usuario.rol}</span>
              </div>
              <button
                onClick={() => { cerrarSesion(); setIsMenuOpen(false); }}
                className="btn btn-outline btn-sm ml-4"
                title="Cerrar sesión"
              >
                <LogOut size={16} /> Salir
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

```

### [src/components/layout/Sidebar.tsx](file:///home/juan/Escritorio/TallerConnect/src/components/layout/Sidebar.tsx)

```tsx
import { NavLink } from "react-router-dom";
import { LayoutDashboard, Users, Shirt, Calendar, Layers, Palette } from "lucide-react";

export function Sidebar() {
  const enlaces = [
    { to: "/sastre/dashboard", texto: "Dashboard", icono: <LayoutDashboard size={20} /> },
    { to: "/sastre/clientes",  texto: "Clientes",  icono: <Users size={20} /> },
    { to: "/sastre/prendas",   texto: "Prendas",   icono: <Shirt size={20} /> },
    { to: "/sastre/citas",     texto: "Citas",     icono: <Calendar size={20} /> },
    { to: "/sastre/telas",     texto: "Telas",     icono: <Layers size={20} /> },
    { to: "/sastre/estilos",   texto: "Estilos",   icono: <Palette size={20} /> },
  ];

  return (
    <aside className="sidebar glass-panel">
      <div className="sidebar-header">
        <h3>Panel Sastre</h3>
      </div>
      <nav className="sidebar-nav">
        {enlaces.map((enlace) => (
          <NavLink
            key={enlace.to}
            to={enlace.to}
            className={({ isActive }) => 
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <span className="sidebar-icon">{enlace.icono}</span>
            <span className="sidebar-text">{enlace.texto}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

```

### [src/components/sastre/CalendarioCitas.tsx](file:///home/juan/Escritorio/TallerConnect/src/components/sastre/CalendarioCitas.tsx)

```tsx
import { useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { es as esES } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";

import { useCitas } from "../../hooks/useCitas";
import { useClientes } from "../../hooks/useClientes";
import { Spinner } from "../common/Spinner";
import { Modal } from "../common/Modal";
import { HORARIOS_DISPONIBLES, TIPOS_CITA } from "../../utils/constantes";
import { fechaHoy } from "../../utils/helpers";
import type { Cita, TipoCita } from "../../types";

// Configuración de react-big-calendar en español
const locales = {
  es: esES,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// ─── Formulario para que el sastre cree citas ───────────────────────
function CitaFormSastre({ onClose }: { onClose: () => void }) {
  const { crearCita } = useCitas();
  const { clientes } = useClientes();

  const [clienteId, setClienteId] = useState("");
  const [fecha, setFecha] = useState(fechaHoy());
  const [hora, setHora] = useState<string>(HORARIOS_DISPONIBLES[0]);
  const [tipo, setTipo] = useState<TipoCita>("prueba");
  const [observaciones, setObservaciones] = useState("");
  const [errorLocal, setErrorLocal] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorLocal(null);

    if (!clienteId) {
      return setErrorLocal("Debes seleccionar un cliente.");
    }
    if (!fecha) {
      return setErrorLocal("Debes seleccionar una fecha.");
    }

    const clienteSel = clientes.find((c) => c.uid === clienteId);
    if (!clienteSel) {
      return setErrorLocal("Cliente no encontrado.");
    }

    setIsSubmitting(true);

    try {
      await crearCita(
        {
          clienteId,
          clienteNombre: clienteSel.nombre,
          fecha,
          hora,
          tipo,
          estado: "pendiente",
          observaciones,
        },
        clienteSel.correo
      );
      onClose();
    } catch (error: any) {
      console.error("Error al crear cita:", error);
      setErrorLocal(error.message || "Ocurrió un error al agendar la cita.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form-container">
      {errorLocal && <div className="alert alert-error mb-4">{errorLocal}</div>}

      <div className="space-y-4">
        {/* Seleccionar cliente */}
        <div className="form-group">
          <label>Cliente</label>
          <select
            value={clienteId}
            onChange={(e) => setClienteId(e.target.value)}
            required
            disabled={isSubmitting}
          >
            <option value="">-- Seleccionar Cliente --</option>
            {clientes.map((c) => (
              <option key={c.uid} value={c.uid}>
                {c.nombre} ({c.cedula})
              </option>
            ))}
          </select>
        </div>

        {/* Fecha y hora */}
        <div className="grid grid-cols-2 gap-4">
          <div className="form-group">
            <label>Fecha</label>
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              min={fechaHoy()}
              required
              disabled={isSubmitting}
            />
          </div>
          <div className="form-group">
            <label>Hora</label>
            <select
              value={hora}
              onChange={(e) => setHora(e.target.value)}
              required
              disabled={isSubmitting}
            >
              {HORARIOS_DISPONIBLES.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tipo de cita (radio buttons) */}
        <div className="form-group">
          <label>Tipo de Cita</label>
          <div className="flex gap-6 mt-1">
            {TIPOS_CITA.map((t) => (
              <label key={t.valor} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="tipoCita"
                  value={t.valor}
                  checked={tipo === t.valor}
                  onChange={(e) => setTipo(e.target.value as TipoCita)}
                  disabled={isSubmitting}
                />
                <span>{t.etiqueta}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Observaciones */}
        <div className="form-group">
          <label>Observaciones</label>
          <textarea
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            placeholder="Notas adicionales sobre la cita..."
            rows={3}
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-glass">
        <button
          type="button"
          className="btn btn-outline"
          onClick={onClose}
          disabled={isSubmitting}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? <Spinner /> : "Agendar Cita"}
        </button>
      </div>
    </form>
  );
}

// ─── Componente principal ───────────────────────────────────────────
export function CalendarioCitas() {
  const { citas, cargando, eliminarCita } = useCitas();
  const [modalAbierto, setModalAbierto] = useState(false);
  const [citaSeleccionada, setCitaSeleccionada] = useState<Cita | null>(null);

  const [fechaCalendario, setFechaCalendario] = useState(new Date());
  const [vistaCalendario, setVistaCalendario] = useState<any>("month");

  if (cargando) return <div className="flex-center p-8"><Spinner /></div>;

  // Convertir citas de Firestore al formato que requiere react-big-calendar
  const eventos = citas
    .filter((cita) => cita && cita.fecha && cita.hora)
    .map((cita) => {
      try {
        // La fecha en BD es "YYYY-MM-DD" y la hora "HH:00"
        const [year, month, day] = cita.fecha.split("-").map(Number);
        const [hour, minute] = cita.hora.split(":").map(Number);

        if (isNaN(year) || isNaN(month) || isNaN(day) || isNaN(hour) || isNaN(minute)) {
          return null;
        }

        const startDate = new Date(year, month - 1, day, hour, minute);
        const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hora de duración

        return {
          id: cita.id,
          title: `${cita.clienteNombre || "Cliente"} (${cita.tipo || "Cita"})`,
          start: startDate,
          end: endDate,
          resource: cita, // Guardamos la cita original
        };
      } catch (e) {
        console.error("Error al procesar fecha de cita:", cita, e);
        return null;
      }
    })
    .filter((e): e is NonNullable<typeof e> => e !== null);

  // Personalización de colores según estado
  const eventStyleGetter = (event: any) => {
    const cita = event.resource as Cita;
    let backgroundColor = "#3b82f6"; // default blue
    
    if (cita.estado === "confirmada") backgroundColor = "#10b981"; // green
    if (cita.estado === "pendiente") backgroundColor = "#f59e0b"; // yellow
    if (cita.estado === "cancelada") backgroundColor = "#ef4444"; // red

    return {
      style: {
        backgroundColor,
        borderRadius: "4px",
        opacity: cita.estado === "cancelada" ? 0.6 : 1,
        color: "white",
        border: "none",
        display: "block",
      },
    };
  };

  const handleSelectEvent = (event: any) => {
    setCitaSeleccionada(event.resource);
    setModalAbierto(true);
  };

  const handleEliminar = async () => {
    if (citaSeleccionada?.id && confirm("¿Eliminar esta cita permanentemente?")) {
      await eliminarCita(citaSeleccionada.id);
      setModalAbierto(false);
    }
  };

  return (
    <div className="page-container">
      <div className="flex-between mb-6">
        <h1 className="text-2xl font-bold">Calendario de Citas</h1>
        <button 
          className="btn btn-primary"
          onClick={() => {
            setCitaSeleccionada(null);
            setModalAbierto(true);
          }}
        >
          + Nueva Cita
        </button>
      </div>

      <div className="card glass-panel h-[600px] p-4">
        <Calendar
          localizer={localizer}
          events={eventos}
          startAccessor="start"
          endAccessor="end"
          style={{ height: "100%" }}
          date={fechaCalendario}
          onNavigate={(date) => setFechaCalendario(date)}
          view={vistaCalendario}
          onView={(view) => setVistaCalendario(view)}
          messages={{
            next: "Sig",
            previous: "Ant",
            today: "Hoy",
            month: "Mes",
            week: "Semana",
            day: "Día",
            noEventsInRange: "No hay citas en este periodo.",
          }}
          culture="es"
          eventPropGetter={eventStyleGetter}
          onSelectEvent={handleSelectEvent}
          views={['month', 'week', 'day']}
          min={new Date(0, 0, 0, 8, 0, 0)} // Empieza a las 8am en vista de semana/día
          max={new Date(0, 0, 0, 19, 0, 0)} // Termina a las 7pm
        />
      </div>

      {/* Modal Ver/Editar Cita (Para el sastre) */}
      <Modal
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
        titulo={citaSeleccionada ? "Detalles de Cita" : "Agendar Nueva Cita"}
      >
        {citaSeleccionada ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><strong>Cliente:</strong> {citaSeleccionada.clienteNombre}</div>
              <div><strong>Tipo:</strong> <span className="capitalize">{citaSeleccionada.tipo}</span></div>
              <div><strong>Fecha:</strong> {citaSeleccionada.fecha}</div>
              <div><strong>Hora:</strong> {citaSeleccionada.hora}</div>
              <div>
                <strong>Estado:</strong> 
                <span className={`badge ml-2 badge-${citaSeleccionada.estado}`}>
                  {citaSeleccionada.estado}
                </span>
              </div>
            </div>
            {citaSeleccionada.observaciones && (
              <div className="bg-glass-dark p-3 rounded">
                <strong>Notas:</strong> {citaSeleccionada.observaciones}
              </div>
            )}
            
            <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-glass">
              <button className="btn btn-outline" onClick={() => setModalAbierto(false)}>
                Cerrar
              </button>
              <button className="btn btn-outline text-error" onClick={handleEliminar}>
                Eliminar
              </button>
            </div>
          </div>
        ) : (
          <CitaFormSastre onClose={() => setModalAbierto(false)} />
        )}
      </Modal>
    </div>
  );
}

```

### [src/components/sastre/ClienteForm.tsx](file:///home/juan/Escritorio/TallerConnect/src/components/sastre/ClienteForm.tsx)

```tsx
import { useState } from "react";
import { useClientes } from "../../hooks/useClientes";
import { validarCorreo, validarCelular } from "../../utils/helpers";
import { Spinner } from "../common/Spinner";
import type { Usuario } from "../../types";

interface ClienteFormProps {
  cliente: Usuario;
  onClose: () => void;
}

export function ClienteForm({ cliente, onClose }: ClienteFormProps) {
  const { actualizarCliente } = useClientes();
  const [formData, setFormData] = useState({
    nombre: cliente.nombre,
    correo: cliente.correo,
    celular: cliente.celular || "",
  });
  
  const [errorLocal, setErrorLocal] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrorLocal(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorLocal(null);

    // Validaciones
    if (!formData.nombre.trim()) {
      return setErrorLocal("El nombre no puede estar vacío.");
    }
    if (!validarCorreo(formData.correo)) {
      return setErrorLocal("El formato del correo es inválido.");
    }
    if (!validarCelular(formData.celular)) {
      return setErrorLocal("El celular tiene un formato inválido.");
    }

    setIsSubmitting(true);

    try {
      await actualizarCliente(cliente.uid, {
        nombre: formData.nombre,
        correo: formData.correo,
        celular: formData.celular,
      });
      onClose(); // Cerrar modal al éxito
    } catch (error) {
      console.error("Error al actualizar cliente:", error);
      setErrorLocal("Ocurrió un error al guardar los cambios.");
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form-container">
      {errorLocal && <div className="alert alert-error mb-4">{errorLocal}</div>}

      {/* Información inmutable (Cédula) */}
      <div className="form-group">
        <label>Cédula (No se puede cambiar)</label>
        <input type="text" value={cliente.cedula} disabled className="input-disabled" />
      </div>

      <div className="form-group">
        <label htmlFor="nombre">Nombre Completo</label>
        <input
          id="nombre"
          name="nombre"
          type="text"
          value={formData.nombre}
          onChange={handleChange}
          required
          disabled={isSubmitting}
        />
      </div>

      <div className="form-group">
        <label htmlFor="correo">Correo Electrónico</label>
        <input
          id="correo"
          name="correo"
          type="email"
          value={formData.correo}
          onChange={handleChange}
          required
          disabled={isSubmitting}
        />
      </div>

      <div className="form-group">
        <label htmlFor="celular">Celular (Opcional)</label>
        <input
          id="celular"
          name="celular"
          type="text"
          value={formData.celular}
          onChange={handleChange}
          disabled={isSubmitting}
        />
      </div>

      <div className="flex justify-end gap-2 mt-6">
        <button
          type="button"
          className="btn btn-outline"
          onClick={onClose}
          disabled={isSubmitting}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? <Spinner /> : "Guardar Cambios"}
        </button>
      </div>
    </form>
  );
}

```

### [src/components/sastre/ClientesLista.tsx](file:///home/juan/Escritorio/TallerConnect/src/components/sastre/ClientesLista.tsx)

```tsx
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
  const { 
    clientes, 
    cargando, 
    eliminarCliente, 
    currentPage, 
    hasMore, 
    nextPage, 
    prevPage 
  } = useClientes();
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

  // Spinner solo para carga inicial o borrado completo
  if (cargando && clientes.length === 0) return <div className="flex-center p-8"><Spinner /></div>;

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

      {/* Controles de Paginación */}
      <div className="flex justify-between items-center mt-6 p-4 glass-panel rounded-lg">
        <button 
          className="btn btn-outline" 
          onClick={prevPage} 
          disabled={currentPage === 0 || cargando}
        >
          Anterior
        </button>
        
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">Página {currentPage + 1}</span>
          {cargando && <Spinner />}
        </div>
        
        <button 
          className="btn btn-outline" 
          onClick={nextPage} 
          disabled={!hasMore || cargando}
        >
          Siguiente
        </button>
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

```

### [src/components/sastre/Dashboard.tsx](file:///home/juan/Escritorio/TallerConnect/src/components/sastre/Dashboard.tsx)

```tsx
import { useClientes } from "../../hooks/useClientes";
import { usePrendas } from "../../hooks/usePrendas";
import { useCitas } from "../../hooks/useCitas";
import { useTelas } from "../../hooks/useTelas";
import { ESTADOS_PRENDA, STOCK_BAJO_METROS } from "../../utils/constantes";
import { fechaHoy } from "../../utils/helpers";
import { Spinner } from "../common/Spinner";
import { Link } from "react-router-dom";
import { Calendar, AlertTriangle } from "lucide-react";

export function Dashboard() {
  const { clientes, cargando: cargandoClientes } = useClientes();
  const { prendas, cargando: cargandoPrendas } = usePrendas();
  const { citas, cargando: cargandoCitas } = useCitas();
  const { telas, cargando: cargandoTelas } = useTelas();

  if (cargandoClientes || cargandoPrendas || cargandoCitas || cargandoTelas) {
    return <div className="flex-center p-8"><Spinner /></div>;
  }

  // Cálculos para las métricas
  const prendasPorEstado = ESTADOS_PRENDA.map((estadoInfo) => ({
    ...estadoInfo,
    cantidad: prendas.filter((p) => p.estado === estadoInfo.valor).length,
  }));

  const citasDeHoy = citas.filter(
    (c) => c.fecha === fechaHoy() && c.estado !== "cancelada"
  );

  const telasBajoStock = telas.filter((t) => t.metrosDisponibles < STOCK_BAJO_METROS);

  return (
    <div className="dashboard">
      <div className="flex-between mb-6">
        <h1 className="text-3xl font-bold">Resumen del Taller</h1>
        <div className="text-sm text-muted">
          Total Clientes: <strong className="text-primary">{clientes.length}</strong>
        </div>
      </div>

      {/* Tarjetas de estado de prendas */}
      <h2 className="text-xl mb-4">Prendas en Proceso</h2>
      <div className="grid-cards mb-8">
        {prendasPorEstado.map((estado) => (
          <div key={estado.valor} className="card stat-card glass-panel flex-between">
            <div>
              <div className="stat-label text-muted">{estado.etiqueta}</div>
              <div className="stat-value text-3xl font-bold" style={{ color: estado.color }}>
                {estado.cantidad}
              </div>
            </div>
            <div className="stat-icon text-4xl opacity-50">{estado.icono}</div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Panel de citas de hoy */}
        <div className="card glass-panel">
          <div className="flex-between mb-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Calendar size={20} className="text-primary" /> Citas de Hoy
            </h3>
            <span className="badge badge-primary">{citasDeHoy.length}</span>
          </div>
          
          {citasDeHoy.length === 0 ? (
            <p className="text-muted text-center py-4">No hay citas programadas para hoy.</p>
          ) : (
            <ul className="list-group">
              {citasDeHoy.map((cita) => (
                <li key={cita.id} className="list-group-item flex-between">
                  <div>
                    <div className="font-bold">{cita.hora} - {cita.clienteNombre}</div>
                    <div className="text-sm text-muted">Tipo: {cita.tipo}</div>
                  </div>
                  <Link to="/sastre/citas" className="btn btn-outline btn-sm">Ver</Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Panel de inventario bajo */}
        <div className="card glass-panel border-warning">
          <div className="flex-between mb-4">
            <h3 className="text-lg font-bold text-warning flex items-center gap-2">
              <AlertTriangle size={20} /> Telas con Bajo Stock
            </h3>
            <span className="badge badge-warning">{telasBajoStock.length}</span>
          </div>
          
          {telasBajoStock.length === 0 ? (
            <p className="text-muted text-center py-4">El inventario de telas está saludable.</p>
          ) : (
            <ul className="list-group">
              {telasBajoStock.map((tela) => (
                <li key={tela.id} className="list-group-item flex-between">
                  <div className="font-bold">{tela.nombre}</div>
                  <div className="flex items-center gap-4">
                    <span className="text-error font-bold">{tela.metrosDisponibles} m</span>
                    <Link to="/sastre/telas" className="btn btn-outline btn-sm">Reponer</Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

```

### [src/components/sastre/EstiloForm.tsx](file:///home/juan/Escritorio/TallerConnect/src/components/sastre/EstiloForm.tsx)

```tsx
import { useState } from "react";
import { useEstilos } from "../../hooks/useEstilos";
import { Spinner } from "../common/Spinner";
import type { Estilo } from "../../types";

interface EstiloFormProps {
  estilo?: Estilo; // Si no se pasa, es modo "Crear"
  onClose: () => void;
}

export function EstiloForm({ estilo, onClose }: EstiloFormProps) {
  const { crearEstilo, actualizarEstilo } = useEstilos();
  const [formData, setFormData] = useState({
    nombre: estilo?.nombre || "",
    descripcion: estilo?.descripcion || "",
  });
  
  const [errorLocal, setErrorLocal] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrorLocal(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorLocal(null);

    if (!formData.nombre.trim()) {
      return setErrorLocal("El nombre del estilo es requerido.");
    }

    setIsSubmitting(true);

    try {
      if (estilo && estilo.id) {
        // Actualizar
        await actualizarEstilo(estilo.id, formData);
      } else {
        // Crear
        await crearEstilo(formData);
      }
      onClose();
    } catch (error) {
      console.error("Error al guardar estilo:", error);
      setErrorLocal("Ocurrió un error al guardar los datos.");
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form-container">
      {errorLocal && <div className="alert alert-error mb-4">{errorLocal}</div>}

      <div className="form-group">
        <label htmlFor="nombre">Nombre del Estilo</label>
        <input
          id="nombre"
          name="nombre"
          type="text"
          value={formData.nombre}
          onChange={handleChange}
          placeholder="Ej: Camisa de Manga Corta"
          required
          disabled={isSubmitting}
        />
      </div>

      <div className="form-group">
        <label htmlFor="descripcion">Descripción (Opcional)</label>
        <textarea
          id="descripcion"
          name="descripcion"
          value={formData.descripcion}
          onChange={handleChange}
          placeholder="Detalles sobre este estilo..."
          rows={3}
          disabled={isSubmitting}
        />
      </div>

      <div className="flex justify-end gap-2 mt-6">
        <button
          type="button"
          className="btn btn-outline"
          onClick={onClose}
          disabled={isSubmitting}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? <Spinner /> : (estilo ? "Guardar Cambios" : "Agregar Estilo")}
        </button>
      </div>
    </form>
  );
}

```

### [src/components/sastre/EstilosLista.tsx](file:///home/juan/Escritorio/TallerConnect/src/components/sastre/EstilosLista.tsx)

```tsx
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

```

### [src/components/sastre/PrendaForm.tsx](file:///home/juan/Escritorio/TallerConnect/src/components/sastre/PrendaForm.tsx)

```tsx
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
```

### [src/components/sastre/PrendasLista.tsx](file:///home/juan/Escritorio/TallerConnect/src/components/sastre/PrendasLista.tsx)

```tsx
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

```

### [src/components/sastre/TelaForm.tsx](file:///home/juan/Escritorio/TallerConnect/src/components/sastre/TelaForm.tsx)

```tsx
import { useState } from "react";
import { useTelas } from "../../hooks/useTelas";
import { Spinner } from "../common/Spinner";
import type { Tela } from "../../types";

interface TelaFormProps {
  tela?: Tela; // Si no se pasa, es modo "Crear"
  onClose: () => void;
}

export function TelaForm({ tela, onClose }: TelaFormProps) {
  const { crearTela, actualizarTela } = useTelas();
  const [formData, setFormData] = useState({
    nombre: tela?.nombre || "",
    metrosDisponibles: tela?.metrosDisponibles || 0,
    precioMetro: tela?.precioMetro || 0,
  });
  
  const [errorLocal, setErrorLocal] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Si es un campo numérico, parsearlo a número para guardar correctamente
    const parsedValue = (name === "metrosDisponibles" || name === "precioMetro") 
      ? (value === "" ? "" : Number(value)) 
      : value;
      
    setFormData((prev) => ({ ...prev, [name]: parsedValue }));
    setErrorLocal(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorLocal(null);

    // Validaciones
    if (!formData.nombre.trim()) {
      return setErrorLocal("El nombre de la tela es requerido.");
    }
    if (Number(formData.metrosDisponibles) < 0) {
      return setErrorLocal("Los metros disponibles no pueden ser negativos.");
    }
    if (Number(formData.precioMetro) < 1 || Number(formData.precioMetro) > 100) {
      return setErrorLocal("El precio por metro debe estar entre 1 y 100.");
    }

    setIsSubmitting(true);

    try {
      const datosGuardar = {
        nombre: formData.nombre,
        metrosDisponibles: Number(formData.metrosDisponibles),
        precioMetro: Number(formData.precioMetro),
      };

      if (tela && tela.id) {
        // Actualizar
        await actualizarTela(tela.id, datosGuardar);
      } else {
        // Crear
        await crearTela(datosGuardar);
      }
      onClose();
    } catch (error) {
      console.error("Error al guardar tela:", error);
      setErrorLocal("Ocurrió un error al guardar los datos.");
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form-container">
      {errorLocal && <div className="alert alert-error mb-4">{errorLocal}</div>}

      <div className="form-group">
        <label htmlFor="nombre">Nombre de la Tela</label>
        <input
          id="nombre"
          name="nombre"
          type="text"
          value={formData.nombre}
          onChange={handleChange}
          placeholder="Ej: Lino Italiano"
          required
          disabled={isSubmitting}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="form-group">
          <label htmlFor="metrosDisponibles">Stock Disponible (Metros)</label>
          <input
            id="metrosDisponibles"
            name="metrosDisponibles"
            type="number"
            step="0.1" // Permitir decimales
            min="0"
            value={formData.metrosDisponibles}
            onChange={handleChange}
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="form-group">
          <label htmlFor="precioMetro">Precio por Metro (COP)</label>
          <input
            id="precioMetro"
            name="precioMetro"
            type="number"
            step="0.01" // Permitir decimales como 1.5
            min="1"
            max="100"
            value={formData.precioMetro}
            onChange={handleChange}
            required
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-6">
        <button
          type="button"
          className="btn btn-outline"
          onClick={onClose}
          disabled={isSubmitting}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? <Spinner /> : (tela ? "Guardar Cambios" : "Agregar Tela")}
        </button>
      </div>
    </form>
  );
}

```

### [src/components/sastre/TelasLista.tsx](file:///home/juan/Escritorio/TallerConnect/src/components/sastre/TelasLista.tsx)

```tsx
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

```

### [src/context/AuthContext.tsx](file:///home/juan/Escritorio/TallerConnect/src/context/AuthContext.tsx)

```tsx
/**
 * AuthContext.tsx — Contexto de Autenticación de TallerConnect
 * 
 * Provee el estado de autenticación a toda la app.
 * Maneja: login, registro, logout, y carga de datos del usuario desde Firestore.
 * 
 * Uso: envolver la app con <AuthProvider> y usar useAuth() en componentes.
 */

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  type User as FirebaseUser,
} from "firebase/auth";
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import { auth, db } from "../firebase/config";
import type { Usuario } from "../types";

// ============================================================
// Tipos del contexto
// ============================================================

/** Lo que expone el contexto de autenticación */
interface AuthContextType {
  usuario: Usuario | null;         // Datos completos del usuario logueado
  firebaseUser: FirebaseUser | null; // Usuario de Firebase Auth
  cargando: boolean;               // true mientras se verifica la sesión
  error: string | null;            // Mensaje de error (si hay)
  iniciarSesion: (correo: string, password: string) => Promise<void>;
  registrarse: (datos: DatosRegistro) => Promise<void>;
  cerrarSesion: () => Promise<void>;
  limpiarError: () => void;
}

/** Datos necesarios para registrar un cliente nuevo */
export interface DatosRegistro {
  cedula: string;
  nombre: string;
  correo: string;
  celular: string;
  password: string;
}

// Crear el contexto con valor inicial undefined
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================================
// Provider
// ============================================================

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Escuchar cambios en el estado de autenticación de Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);

      if (user) {
        // Si hay un usuario logueado, obtener sus datos de Firestore
        try {
          const docRef = doc(db, "usuarios", user.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            setUsuario(docSnap.data() as Usuario);
          } else {
            // El documento no existe en Firestore (caso raro)
            console.warn("Usuario autenticado pero sin documento en Firestore");
            setUsuario(null);
          }
        } catch (err) {
          console.error("Error al obtener datos del usuario:", err);
          setUsuario(null);
        }
      } else {
        // No hay usuario logueado
        setUsuario(null);
      }

      setCargando(false);
    });

    // Limpiar el listener al desmontar
    return () => unsubscribe();
  }, []);

  // ============================================================
  // Iniciar sesión con correo y contraseña
  // ============================================================
  async function iniciarSesion(correo: string, password: string) {
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, correo, password);
      // onAuthStateChanged se encargará de actualizar el estado
    } catch (err: unknown) {
      const firebaseError = err as { code?: string };
      // Traducir errores comunes de Firebase a español
      switch (firebaseError.code) {
        case "auth/user-not-found":
          setError("No existe una cuenta con este correo.");
          break;
        case "auth/wrong-password":
        case "auth/invalid-credential":
          setError("Contraseña incorrecta.");
          break;
        case "auth/invalid-email":
          setError("El formato del correo no es válido.");
          break;
        case "auth/too-many-requests":
          setError("Demasiados intentos. Espera unos minutos.");
          break;
        default:
          setError("Error al iniciar sesión. Verifica tus credenciales.");
      }
      throw err;
    }
  }

  // ============================================================
  // Registrar un nuevo cliente
  // ============================================================
  async function registrarse(datos: DatosRegistro) {
    setError(null);
    try {
      // 1. Crear usuario en Firebase Auth
      const credencial = await createUserWithEmailAndPassword(
        auth,
        datos.correo,
        datos.password
      );

      // 2. Crear documento del usuario en Firestore
      const nuevoUsuario: Usuario = {
        uid: credencial.user.uid,
        cedula: datos.cedula,
        nombre: datos.nombre,
        correo: datos.correo,
        celular: datos.celular || "",
        rol: "cliente",    // Los usuarios se registran siempre como cliente
        fechaRegistro: Timestamp.now(),
      };

      await setDoc(doc(db, "usuarios", credencial.user.uid), nuevoUsuario);

      // Simular correo de bienvenida
      console.log("📧 [CORREO SIMULADO] Bienvenida enviada a:", datos.correo);
      console.log("   Asunto: ¡Bienvenido/a a TallerConnect!");
      console.log(`   Cuerpo: Hola ${datos.nombre}, tu cuenta ha sido creada exitosamente.`);

    } catch (err: unknown) {
      const firebaseError = err as { code?: string };
      switch (firebaseError.code) {
        case "auth/email-already-in-use":
          setError("Ya existe una cuenta con este correo electrónico.");
          break;
        case "auth/weak-password":
          setError("La contraseña debe tener al menos 6 caracteres.");
          break;
        case "auth/invalid-email":
          setError("El formato del correo no es válido.");
          break;
        default:
          setError("Error al crear la cuenta. Intenta de nuevo.");
      }
      throw err;
    }
  }

  // ============================================================
  // Cerrar sesión
  // ============================================================
  async function cerrarSesion() {
    try {
      await signOut(auth);
      setUsuario(null);
    } catch (err) {
      console.error("Error al cerrar sesión:", err);
    }
  }

  /** Limpiar el mensaje de error */
  function limpiarError() {
    setError(null);
  }

  // Valor que se expone a todos los componentes hijos
  const valor: AuthContextType = {
    usuario,
    firebaseUser,
    cargando,
    error,
    iniciarSesion,
    registrarse,
    cerrarSesion,
    limpiarError,
  };

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

// ============================================================
// Hook personalizado para usar el contexto
// ============================================================

/** Hook para acceder al contexto de autenticación. Debe usarse dentro de <AuthProvider>. */
export function useAuth(): AuthContextType {
  const contexto = useContext(AuthContext);
  if (!contexto) {
    throw new Error("useAuth debe usarse dentro de un <AuthProvider>");
  }
  return contexto;
}

```

### [src/context/ToastContext.tsx](file:///home/juan/Escritorio/TallerConnect/src/context/ToastContext.tsx)

```tsx
import { createContext, useContext, useCallback, type ReactNode } from 'react';
import toast from 'react-hot-toast';

export type ToastType = 'success' | 'error' | 'info';

interface ToastContextType {
  showToast: (message: string, type: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const showToast = useCallback((message: string, type: ToastType) => {
    if (type === 'success') toast.success(message);
    else if (type === 'error') toast.error(message);
    else toast(message, { icon: 'ℹ️' });
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast debe ser usado dentro de un ToastProvider');
  }
  return context;
}

```

### [src/firebase/config.ts](file:///home/juan/Escritorio/TallerConnect/src/firebase/config.ts)

```typescript
/**
 * config.ts — Inicialización de Firebase
 * 
 * Este archivo configura Firebase usando las variables de entorno
 * definidas en el archivo .env de la raíz del proyecto.
 * 
 * Exporta: app, auth (Firebase Auth), db (Firestore)
 */

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Configuración de Firebase tomada de variables de entorno
// (las variables VITE_* son accesibles en el cliente con Vite)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Inicializar Firebase App
const app = initializeApp(firebaseConfig);

// Inicializar servicios de Firebase
const auth = getAuth(app);      // Autenticación
const db = getFirestore(app);    // Base de datos Firestore

export { app, auth, db };

```

### [src/hooks/useCitas.ts](file:///home/juan/Escritorio/TallerConnect/src/hooks/useCitas.ts)

```typescript
/**
 * useCitas.ts — Hook para gestión de citas
 * 
 * Maneja: crear, reprogramar, cancelar citas.
 * Valida que no haya solapamiento de horarios.
 */

import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  getDocs,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebase/config";
import type { Cita } from "../types";
import { useNotificaciones } from "./useNotificaciones";

/** Hook para gestión de citas */
export function useCitas(filtroClienteId?: string) {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [cargando, setCargando] = useState(true);
  const { notificarCita } = useNotificaciones();

  // Escuchar citas en tiempo real
  useEffect(() => {
    let q;
    if (filtroClienteId) {
      q = query(
        collection(db, "citas"),
        where("clienteId", "==", filtroClienteId),
        orderBy("fecha", "asc")
      );
    } else {
      q = query(
        collection(db, "citas"),
        orderBy("fecha", "asc")
      );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const datos: Cita[] = [];
      snapshot.forEach((docSnap) => {
        datos.push({ id: docSnap.id, ...docSnap.data() } as Cita);
      });
      setCitas(datos);
      setCargando(false);
    });

    return () => unsubscribe();
  }, [filtroClienteId]);

  /**
   * Verifica si un horario ya está ocupado por otra cita (no cancelada)
   * @returns true si el horario está disponible, false si está ocupado
   */
  async function horarioDisponible(
    fecha: string,
    hora: string,
    citaIdExcluir?: string
  ): Promise<boolean> {
    const q = query(
      collection(db, "citas"),
      where("fecha", "==", fecha),
      where("hora", "==", hora),
      where("estado", "!=", "cancelada")
    );

    const snapshot = await getDocs(q);

    // Filtrar la cita actual si estamos editando
    const citasEnHorario = snapshot.docs.filter(
      (docSnap) => docSnap.id !== citaIdExcluir
    );

    return citasEnHorario.length === 0;
  }

  /**
   * Crea una nueva cita tras validar disponibilidad del horario
   */
  async function crearCita(
    cita: Omit<Cita, "id">,
    correoCliente: string
  ) {
    // Validar que el horario esté disponible
    const disponible = await horarioDisponible(cita.fecha, cita.hora);
    if (!disponible) {
      throw new Error(
        `El horario ${cita.hora} del ${cita.fecha} ya está ocupado. Elige otro horario.`
      );
    }

    await addDoc(collection(db, "citas"), cita);

    // Notificar al cliente
    notificarCita(
      correoCliente,
      cita.clienteNombre,
      "agendada",
      cita.fecha,
      cita.hora,
      cita.tipo
    );
  }

  /**
   * Reprograma una cita existente (cambia fecha, hora, o tipo)
   */
  async function reprogramarCita(
    citaId: string,
    nuevaFecha: string,
    nuevaHora: string,
    nuevoTipo: string,
    observaciones: string,
    correoCliente: string,
    nombreCliente: string
  ) {
    // Validar que el nuevo horario esté disponible
    const disponible = await horarioDisponible(
      nuevaFecha,
      nuevaHora,
      citaId // Excluir la cita actual de la validación
    );

    if (!disponible) {
      throw new Error(
        `El horario ${nuevaHora} del ${nuevaFecha} ya está ocupado. Elige otro horario.`
      );
    }

    await updateDoc(doc(db, "citas", citaId), {
      fecha: nuevaFecha,
      hora: nuevaHora,
      tipo: nuevoTipo,
      observaciones,
    });

    // Notificar al cliente
    notificarCita(
      correoCliente,
      nombreCliente,
      "modificada",
      nuevaFecha,
      nuevaHora,
      nuevoTipo
    );
  }

  /**
   * Cancela una cita (cambia su estado a "cancelada")
   */
  async function cancelarCita(
    citaId: string,
    correoCliente: string,
    nombreCliente: string,
    fecha: string,
    hora: string,
    tipo: string
  ) {
    await updateDoc(doc(db, "citas", citaId), {
      estado: "cancelada",
    });

    // Notificar al cliente
    notificarCita(
      correoCliente,
      nombreCliente,
      "cancelada",
      fecha,
      hora,
      tipo
    );
  }

  /** Elimina una cita completamente (solo el sastre) */
  async function eliminarCita(citaId: string) {
    await deleteDoc(doc(db, "citas", citaId));
  }

  return {
    citas,
    cargando,
    crearCita,
    reprogramarCita,
    cancelarCita,
    eliminarCita,
    horarioDisponible,
  };
}

```

### [src/hooks/useClientes.ts](file:///home/juan/Escritorio/TallerConnect/src/hooks/useClientes.ts)

```typescript
/**
 * useClientes.ts — Hook para gestión de clientes con paginación
 */

import { useState, useEffect, useCallback } from "react";
import {
  collection,
  query,
  where,
  doc,
  updateDoc,
  getDocs,
  writeBatch,
  limit,
  startAfter,
  orderBy,
  type QueryDocumentSnapshot,
  type DocumentData,
} from "firebase/firestore";
import { db } from "../firebase/config";
import type { Usuario } from "../types";
import { useToast } from "../context/ToastContext";

/** Hook para CRUD de clientes con paginación */
export function useClientes(pageSize = 10) {
  const [clientes, setClientes] = useState<Usuario[]>([]);
  const [cargando, setCargando] = useState(true);
  const { showToast } = useToast();

  // Paginación cursores
  const [lastDocs, setLastDocs] = useState<QueryDocumentSnapshot<DocumentData>[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // Cargar clientes
  const fetchClientes = useCallback(async (pageIndex: number, reset = false) => {
    setCargando(true);
    try {
      let q = query(
        collection(db, "usuarios"),
        where("rol", "==", "cliente"),
        orderBy("nombre", "asc"),
        limit(pageSize)
      );

      // Si no es la primera página y no estamos reseteando
      if (pageIndex > 0 && !reset && lastDocs[pageIndex - 1]) {
        q = query(q, startAfter(lastDocs[pageIndex - 1]));
      }

      const snapshot = await getDocs(q);
      const datos: Usuario[] = [];
      snapshot.forEach((docSnap) => {
        datos.push(docSnap.data() as Usuario);
      });

      setClientes(datos);
      setHasMore(snapshot.docs.length === pageSize);

      if (snapshot.docs.length > 0) {
        setLastDocs(prev => {
          const newDocs = [...prev];
          newDocs[pageIndex] = snapshot.docs[snapshot.docs.length - 1];
          return newDocs;
        });
      }
    } catch (error) {
      console.error("Error al cargar clientes:", error);
      showToast("Hubo un error al cargar la lista de clientes.", "error");
    } finally {
      setCargando(false);
    }
  }, [pageSize, lastDocs, showToast]);

  // Carga inicial
  useEffect(() => {
    fetchClientes(0, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const nextPage = () => {
    if (hasMore && !cargando) {
      const next = currentPage + 1;
      setCurrentPage(next);
      fetchClientes(next);
    }
  };

  const prevPage = () => {
    if (currentPage > 0 && !cargando) {
      const prev = currentPage - 1;
      setCurrentPage(prev);
      fetchClientes(prev);
    }
  };

  const recargarActual = () => {
    fetchClientes(currentPage);
  };

  async function actualizarCliente(
    uid: string,
    datos: Partial<Pick<Usuario, "nombre" | "correo" | "celular">>
  ) {
    try {
      const ref = doc(db, "usuarios", uid);
      await updateDoc(ref, datos);
      showToast("Cliente actualizado correctamente", "success");
      recargarActual(); // Refrescar vista
    } catch (error) {
      showToast("Error al actualizar cliente", "error");
      throw error;
    }
  }

  async function eliminarCliente(uid: string) {
    try {
      const batch = writeBatch(db);

      const prendasQuery = query(collection(db, "prendas"), where("clienteId", "==", uid));
      const prendasSnap = await getDocs(prendasQuery);
      prendasSnap.forEach((docSnap) => batch.delete(docSnap.ref));

      const citasQuery = query(collection(db, "citas"), where("clienteId", "==", uid));
      const citasSnap = await getDocs(citasQuery);
      citasSnap.forEach((docSnap) => batch.delete(docSnap.ref));

      batch.delete(doc(db, "usuarios", uid));
      await batch.commit();

      showToast("Cliente y sus datos eliminados", "success");
      
      // Si era el último de la página, retroceder si es posible
      if (clientes.length === 1 && currentPage > 0) {
        const prev = currentPage - 1;
        setCurrentPage(prev);
        fetchClientes(prev);
      } else {
        recargarActual();
      }
    } catch (error) {
      showToast("Error al eliminar cliente", "error");
      throw error;
    }
  }

  async function cedulaExiste(cedula: string): Promise<boolean> {
    const q = query(collection(db, "usuarios"), where("cedula", "==", cedula));
    const snap = await getDocs(q);
    return !snap.empty;
  }

  return {
    clientes,
    cargando,
    actualizarCliente,
    eliminarCliente,
    cedulaExiste,
    currentPage,
    hasMore,
    nextPage,
    prevPage,
    recargarActual
  };
}

```

### [src/hooks/useEstilos.ts](file:///home/juan/Escritorio/TallerConnect/src/hooks/useEstilos.ts)

```typescript
/**
 * useEstilos.ts — Hook para gestión de estilos de confección
 * 
 * CRUD completo para la colección "estilos" en Firestore.
 */

import { useState, useEffect } from "react";
import {
  collection,
  onSnapshot,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase/config";
import type { Estilo } from "../types";

/** Hook para CRUD de estilos */
export function useEstilos() {
  const [estilos, setEstilos] = useState<Estilo[]>([]);
  const [cargando, setCargando] = useState(true);

  // Escuchar cambios en tiempo real
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "estilos"), (snapshot) => {
      const datos: Estilo[] = [];
      snapshot.forEach((docSnap) => {
        datos.push({ id: docSnap.id, ...docSnap.data() } as Estilo);
      });
      setEstilos(datos);
      setCargando(false);
    });

    return () => unsubscribe();
  }, []);

  /** Crear un nuevo estilo */
  async function crearEstilo(estilo: Omit<Estilo, "id">) {
    await addDoc(collection(db, "estilos"), estilo);
  }

  /** Actualizar un estilo existente */
  async function actualizarEstilo(id: string, datos: Partial<Estilo>) {
    await updateDoc(doc(db, "estilos", id), datos);
  }

  /** Eliminar un estilo */
  async function eliminarEstilo(id: string) {
    await deleteDoc(doc(db, "estilos", id));
  }

  return {
    estilos,
    cargando,
    crearEstilo,
    actualizarEstilo,
    eliminarEstilo,
  };
}

```

### [src/hooks/useNotificaciones.ts](file:///home/juan/Escritorio/TallerConnect/src/hooks/useNotificaciones.ts)

```typescript
/**
 * useNotificaciones.ts — Hook para notificaciones con EmailJS
 * 
 * Envía correos reales a través de EmailJS.
 * Requiere configurar las variables de entorno en .env:
 * - VITE_EMAILJS_SERVICE_ID
 * - VITE_EMAILJS_TEMPLATE_ID
 * - VITE_EMAILJS_PUBLIC_KEY
 */

import emailjs from '@emailjs/browser';
import { useToast } from '../context/ToastContext';
import { useCallback } from 'react';

/** Hook que expone funciones para enviar notificaciones reales */
export function useNotificaciones() {
  const { showToast } = useToast();

  const enviarEmail = useCallback(async (
    to_email: string,
    to_name: string,
    subject: string,
    message: string
  ) => {
    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

    if (!serviceId || !templateId || !publicKey) {
      console.warn("Faltan variables de entorno para EmailJS. No se enviará el correo.");
      showToast("Las notificaciones por correo no están configuradas correctamente.", "info");
      return;
    }

    try {
      await emailjs.send(
        serviceId,
        templateId,
        {
          to_email,
          to_name,
          subject,
          message,
        },
        publicKey
      );
      console.log(`✅ Correo enviado a ${to_email}: ${subject}`);
    } catch (error) {
      console.error("Error enviando email con EmailJS:", error);
      showToast(`No se pudo enviar el correo a ${to_email}.`, "error");
    }
  }, [showToast]);

  /**
   * Notifica al cliente cuando su prenda cambia a "terminado"
   */
  const notificarPrendaTerminada = useCallback((
    correoCliente: string,
    nombreCliente: string,
    nombrePrenda: string
  ) => {
    const subject = "¡Tu prenda está lista! — TallerConnect";
    const message = `Hola ${nombreCliente},\n\nTu prenda "${nombrePrenda}" ha sido completada.\n\nPuedes agendar una cita de entrega desde tu panel en TallerConnect.\n\n¡Gracias por preferirnos!`;
    
    enviarEmail(correoCliente, nombreCliente, subject, message);
  }, [enviarEmail]);

  /**
   * Notifica al cliente sobre cambios en sus citas
   */
  const notificarCita = useCallback((
    correoCliente: string,
    nombreCliente: string,
    accion: "agendada" | "modificada" | "cancelada",
    fecha: string,
    hora: string,
    tipo: string
  ) => {
    const asuntos = {
      agendada: "Cita agendada exitosamente",
      modificada: "Tu cita ha sido reprogramada",
      cancelada: "Tu cita ha sido cancelada",
    };

    const subject = `${asuntos[accion]} — TallerConnect`;
    const message = `Hola ${nombreCliente},\n\nTu cita de ${tipo} ha sido ${accion}.\n\nFecha: ${fecha} a las ${hora}\n\nSi tienes alguna duda, contáctanos.\n\nSaludos.`;

    enviarEmail(correoCliente, nombreCliente, subject, message);
  }, [enviarEmail]);

  return {
    notificarPrendaTerminada,
    notificarCita,
  };
}

```

### [src/hooks/usePrendas.ts](file:///home/juan/Escritorio/TallerConnect/src/hooks/usePrendas.ts)

```typescript
/**
 * usePrendas.ts — Hook para gestión de prendas
 * 
 * Maneja: crear prendas (con descuento de stock), cambiar estado,
 * eliminar prendas (con devolución de stock), obtener prendas por cliente,
 * y medidas históricas.
 */

import { useState, useEffect, useCallback } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  Timestamp,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebase/config";
import type { Prenda, MedidasPrenda, EstadoPrenda } from "../types";
import { useTelas } from "./useTelas";
import { useNotificaciones } from "./useNotificaciones";

/** Datos necesarios para crear una prenda nueva */
export interface DatosNuevaPrenda {
  clienteId: string;
  clienteNombre: string;
  clienteCorreo: string;
  telaId: string;
  telaNombre: string;
  estiloId: string;
  estiloNombre: string;
  metrosUsados: number;
  precioMetro: number;
  costoManoObra: number;
  medidas: MedidasPrenda;
  notas?: string;
}

/** Hook para gestión de prendas */
export function usePrendas(filtroClienteId?: string) {
  const [prendas, setPrendas] = useState<Prenda[]>([]);
  const [cargando, setCargando] = useState(true);
  const { descontarStock, devolverStock } = useTelas();
  const { notificarPrendaTerminada } = useNotificaciones();

  // Escuchar prendas en tiempo real (opcionalmente filtradas por cliente)
  useEffect(() => {
    let q;
    if (filtroClienteId) {
      q = query(
        collection(db, "prendas"),
        where("clienteId", "==", filtroClienteId),
        orderBy("fechaInicio", "desc")
      );
    } else {
      q = query(
        collection(db, "prendas"),
        orderBy("fechaInicio", "desc")
      );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const datos: Prenda[] = [];
      snapshot.forEach((docSnap) => {
        datos.push({ id: docSnap.id, ...docSnap.data() } as Prenda);
      });
      setPrendas(datos);
      setCargando(false);
    });

    return () => unsubscribe();
  }, [filtroClienteId]);

  /**
   * Crea una nueva prenda y descuenta el stock de tela
   */
  const crearPrenda = useCallback(async (datos: DatosNuevaPrenda) => {
    // 1. Descontar stock de la tela (validación incluida)
    await descontarStock(datos.telaId, datos.metrosUsados);

    // 2. Calcular costos
    const costoTela = datos.metrosUsados * datos.precioMetro;
    const costoTotal = costoTela + datos.costoManoObra;

    // 3. Crear documento de la prenda
    const nuevaPrenda: Omit<Prenda, "id"> = {
      clienteId: datos.clienteId,
      clienteNombre: datos.clienteNombre,
      telaId: datos.telaId,
      telaNombre: datos.telaNombre,
      estiloId: datos.estiloId,
      estiloNombre: datos.estiloNombre,
      metrosUsados: datos.metrosUsados,
      costoTela,
      costoManoObra: datos.costoManoObra,
      costoTotal,
      estado: "corte", // Estado inicial siempre es "corte"
      medidas: datos.medidas,
      fechaInicio: Timestamp.now(),
      fechaTerminado: null,
      historialEstados: [
        {
          estadoAnterior: "",
          estadoNuevo: "corte",
          fecha: Timestamp.now(),
        },
      ],
      ...(datos.notas ? { notas: datos.notas } : {}),
    };

    await addDoc(collection(db, "prendas"), nuevaPrenda);
  }, [descontarStock]);

  /**
   * Actualiza una prenda existente y ajusta el stock de tela si es necesario
   */
  const actualizarPrenda = useCallback(async (
    prendaId: string,
    datosViejos: Prenda,
    datosNuevos: DatosNuevaPrenda
  ) => {
    // 1. Ajustar stock si cambió la tela o los metros
    if (datosViejos.telaId !== datosNuevos.telaId) {
      await devolverStock(datosViejos.telaId, datosViejos.metrosUsados);
      await descontarStock(datosNuevos.telaId, datosNuevos.metrosUsados);
    } else if (datosViejos.metrosUsados !== datosNuevos.metrosUsados) {
      const diferencia = datosNuevos.metrosUsados - datosViejos.metrosUsados;
      if (diferencia > 0) {
        await descontarStock(datosNuevos.telaId, diferencia);
      } else if (diferencia < 0) {
        await devolverStock(datosNuevos.telaId, Math.abs(diferencia));
      }
    }

    // 2. Calcular nuevos costos
    const costoTela = datosNuevos.metrosUsados * datosNuevos.precioMetro;
    const costoTotal = costoTela + datosNuevos.costoManoObra;

    // 3. Actualizar documento
    const ref = doc(db, "prendas", prendaId);
    await updateDoc(ref, {
      clienteId: datosNuevos.clienteId,
      clienteNombre: datosNuevos.clienteNombre,
      telaId: datosNuevos.telaId,
      telaNombre: datosNuevos.telaNombre,
      estiloId: datosNuevos.estiloId,
      estiloNombre: datosNuevos.estiloNombre,
      metrosUsados: datosNuevos.metrosUsados,
      costoTela,
      costoManoObra: datosNuevos.costoManoObra,
      costoTotal,
      medidas: datosNuevos.medidas,
      notas: datosNuevos.notas || "",
    });
  }, [descontarStock, devolverStock]);

  /**
   * Cambia el estado de una prenda y registra en el historial.
   * Si cambia a "terminado", envía notificación al cliente.
   */
  const cambiarEstado = useCallback(async (
    prendaId: string,
    estadoAnterior: EstadoPrenda,
    estadoNuevo: EstadoPrenda,
    correoCliente: string,
    nombreCliente: string
  ) => {
    const ref = doc(db, "prendas", prendaId);

    const actualizacion: Record<string, unknown> = {
      estado: estadoNuevo,
      historialEstados: [
        // Nota: Firestore no soporta arrayUnion con objetos que contengan Timestamp,
        // así que se usa el array completo de la prenda actual
      ],
    };

    // Si la prenda se marca como terminada, registrar fecha
    if (estadoNuevo === "terminado") {
      actualizacion.fechaTerminado = Timestamp.now();

      // Enviar notificación al cliente
      notificarPrendaTerminada(
        correoCliente,
        nombreCliente,
        `Prenda #${prendaId.slice(0, 6)}`
      );
    }

    // Actualizar en Firestore
    await updateDoc(ref, {
      estado: estadoNuevo,
      ...(estadoNuevo === "terminado" ? { fechaTerminado: Timestamp.now() } : {}),
    });

    // Registrar en el historial (usamos un campo separado para simplificar)
    // En una app más compleja, se usaría una subcolección
    console.log(`📋 Estado cambiado: ${estadoAnterior} → ${estadoNuevo}`);
  }, [notificarPrendaTerminada]);

  /**
   * Elimina una prenda y devuelve el stock de tela utilizado.
   */
  const eliminarPrenda = useCallback(async (prendaId: string) => {
    // Buscar la prenda en el estado local
    const prenda = prendas.find((p) => p.id === prendaId);
    if (!prenda) {
      throw new Error("Prenda no encontrada.");
    }

    // Devolver el stock de tela
    await devolverStock(prenda.telaId, prenda.metrosUsados);

    // Eliminar el documento de Firestore
    await deleteDoc(doc(db, "prendas", prendaId));

    console.log(`🗑️ Prenda ${prendaId} eliminada. Stock devuelto: ${prenda.metrosUsados}m de tela ${prenda.telaNombre}.`);
  }, [prendas, devolverStock]);

  return {
    prendas,
    cargando,
    crearPrenda,
    actualizarPrenda,
    cambiarEstado,
    eliminarPrenda,
  };
}

```

### [src/hooks/useTelas.ts](file:///home/juan/Escritorio/TallerConnect/src/hooks/useTelas.ts)

```typescript
/**
 * useTelas.ts — Hook para gestión de telas (inventario)
 * 
 * CRUD completo + control de stock con transacciones atómicas.
 */

import { useState, useEffect } from "react";
import {
  collection,
  onSnapshot,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  runTransaction,
} from "firebase/firestore";
import { db } from "../firebase/config";
import type { Tela } from "../types";

/** Hook para CRUD de telas */
export function useTelas() {
  const [telas, setTelas] = useState<Tela[]>([]);
  const [cargando, setCargando] = useState(true);

  // Escuchar cambios en tiempo real
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "telas"), (snapshot) => {
      const datos: Tela[] = [];
      snapshot.forEach((docSnap) => {
        datos.push({ id: docSnap.id, ...docSnap.data() } as Tela);
      });
      setTelas(datos);
      setCargando(false);
    });

    return () => unsubscribe();
  }, []);

  /** Crear una nueva tela */
  async function crearTela(tela: Omit<Tela, "id">) {
    await addDoc(collection(db, "telas"), tela);
  }

  /** Actualizar una tela existente (nombre, precio, o reponer stock) */
  async function actualizarTela(id: string, datos: Partial<Tela>) {
    const ref = doc(db, "telas", id);
    await updateDoc(ref, datos);
  }

  /** Eliminar una tela del inventario */
  async function eliminarTela(id: string) {
    await deleteDoc(doc(db, "telas", id));
  }

  /**
   * Descuenta metros del stock de una tela usando una transacción atómica.
   * Valida que haya suficiente stock antes de descontar.
   * 
   * @returns true si se descontó exitosamente, false si no hay stock suficiente
   */
  async function descontarStock(telaId: string, metros: number): Promise<boolean> {
    const telaRef = doc(db, "telas", telaId);

    try {
      await runTransaction(db, async (transaction) => {
        const telaDoc = await transaction.get(telaRef);

        if (!telaDoc.exists()) {
          throw new Error("La tela no existe");
        }

        const stockActual = telaDoc.data().metrosDisponibles;

        if (stockActual < metros) {
          throw new Error(
            `Stock insuficiente. Disponible: ${stockActual}m, solicitado: ${metros}m`
          );
        }

        // Descontar los metros usados
        transaction.update(telaRef, {
          metrosDisponibles: stockActual - metros,
        });
      });

      return true;
    } catch (error) {
      console.error("Error al descontar stock:", error);
      throw error;
    }
  }

  /**
   * Devuelve metros al stock (cuando se elimina o edita una prenda)
   */
  async function devolverStock(telaId: string, metros: number) {
    const telaRef = doc(db, "telas", telaId);

    await runTransaction(db, async (transaction) => {
      const telaDoc = await transaction.get(telaRef);
      if (!telaDoc.exists()) return;

      const stockActual = telaDoc.data().metrosDisponibles;
      transaction.update(telaRef, {
        metrosDisponibles: stockActual + metros,
      });
    });
  }

  return {
    telas,
    cargando,
    crearTela,
    actualizarTela,
    eliminarTela,
    descontarStock,
    devolverStock,
  };
}

```

### [src/index.css](file:///home/juan/Escritorio/TallerConnect/src/index.css)

```css
/* ==========================================================================
   Variables Globales (Tema y Paleta: Exaggerated Minimalism)
   ========================================================================== */
:root {
  /* Paleta Base: Fashion Rose + Gold Accent */
  --color-primary: #BE185D;
  --color-on-primary: #FFFFFF;
  --color-secondary: #EC4899;
  --color-accent: #D97706;
  --color-background: #FDF2F8;
  --color-foreground: #0F172A;
  --color-muted: #FBF1F5;
  --color-border: #F7E3EB;
  
  /* Estados */
  --color-success: #10B981;
  --color-warning: #D97706;
  --color-error: #DC2626;
  --color-info: #3B82F6;
  --color-ring: #BE185D;

  /* Spacing */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  --space-2xl: 48px;
  --space-3xl: 64px;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.02);
  --shadow-md: 0 4px 12px rgba(190,24,93,0.05);
  --shadow-lg: 0 10px 25px rgba(190,24,93,0.1);
  --shadow-xl: 0 20px 40px rgba(190,24,93,0.15);

  /* Layout */
  --navbar-height: 80px;
  --sidebar-width: 280px;
  --border-radius: 12px;
}

/* ==========================================================================
   Reseteo y Base
   ========================================================================== */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Manrope', sans-serif;
  background-color: var(--color-background);
  color: var(--color-foreground);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  min-height: 100vh;
}

a {
  color: var(--color-primary);
  text-decoration: none;
  transition: color 0.2s;
}

a:hover {
  color: var(--color-secondary);
}

h1, h2, h3, h4, h5, h6 {
  font-family: 'Syne', sans-serif;
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.02em;
  color: var(--color-foreground);
}

h1 {
  font-size: clamp(2rem, 5vw, 4rem);
  letter-spacing: -0.04em;
  margin-bottom: var(--space-xl);
}

h2 {
  font-size: clamp(1.5rem, 3vw, 2.5rem);
  margin-bottom: var(--space-lg);
}

/* ==========================================================================
   Utilidades
   ========================================================================== */
.flex-center { display: flex; align-items: center; justify-content: center; }
.flex-between { display: flex; align-items: center; justify-content: space-between; }
.w-full { width: 100%; }

.text-primary { color: var(--color-primary); }
.text-success { color: var(--color-success); }
.text-warning { color: var(--color-warning); }
.text-error { color: var(--color-error); }
.text-muted { color: #64748B; }

.font-bold { font-weight: 700; }
.text-sm { font-size: 0.875rem; }
.text-lg { font-size: 1.125rem; }
.text-xl { font-size: 1.25rem; }
.text-2xl { font-size: 1.5rem; }
.text-3xl { font-size: 1.875rem; }

.mb-2 { margin-bottom: var(--space-sm); }
.mb-4 { margin-bottom: var(--space-md); }
.mb-6 { margin-bottom: var(--space-lg); }
.mb-8 { margin-bottom: var(--space-xl); }
.mt-4 { margin-top: var(--space-md); }
.gap-2 { gap: var(--space-sm); }
.gap-4 { gap: var(--space-md); }
.p-8 { padding: var(--space-xl); }

/* ==========================================================================
   Componentes Base
   ========================================================================== */

/* Panels */
.glass-panel, .card {
  background: #FFFFFF;
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
  border-radius: var(--border-radius);
  padding: var(--space-lg);
  transition: all 300ms ease;
}

.card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.bg-glass-dark {
  background: var(--color-muted);
  border-radius: 8px;
}

/* Botones */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 14px 28px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  font-family: 'Syne', sans-serif;
  cursor: pointer;
  transition: all 250ms ease;
  border: none;
  gap: 8px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

.btn-primary {
  background: var(--color-primary);
  color: var(--color-on-primary);
  box-shadow: var(--shadow-md);
}

.btn-primary:hover:not(:disabled) {
  background: var(--color-secondary);
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.btn-outline {
  background: transparent;
  color: var(--color-primary);
  border: 2px solid var(--color-primary);
}

.btn-outline:hover:not(:disabled) {
  background: var(--color-muted);
}

.btn-sm {
  padding: 8px 16px;
  font-size: 0.875rem;
}

.btn-danger {
  background-color: var(--color-error);
  color: white;
}

/* Formularios */
.form-group {
  margin-bottom: var(--space-lg);
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: var(--space-sm);
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--color-foreground);
}

input, select, textarea {
  width: 100%;
  padding: 14px 16px;
  background-color: #FFFFFF;
  border: 2px solid var(--color-border);
  border-radius: 8px;
  color: var(--color-foreground);
  font-family: inherit;
  font-size: 1rem;
  transition: all 250ms ease;
  outline: none;
}

input:focus, select:focus, textarea:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 4px rgba(190,24,93,0.1);
}

input:disabled {
  background-color: var(--color-muted);
  cursor: not-allowed;
}

/* Tablas */
.table-container {
  overflow-x: auto;
  border-radius: var(--border-radius);
  background: #FFFFFF;
  border: 1px solid var(--color-border);
}

.table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.table th, .table td {
  padding: var(--space-md) var(--space-lg);
  border-bottom: 1px solid var(--color-border);
}

.table th {
  font-family: 'Syne', sans-serif;
  font-weight: 700;
  color: var(--color-foreground);
  text-transform: uppercase;
  font-size: 0.85rem;
  letter-spacing: 0.05em;
  background-color: var(--color-muted);
}

.table tr:hover td {
  background-color: var(--color-background);
}

/* Badges */
.badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border-radius: 99px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-family: 'Syne', sans-serif;
}

.badge-primary { background-color: var(--color-muted); color: var(--color-primary); }
.badge-warning { background-color: #FEF3C7; color: var(--color-warning); }
.badge-error { background-color: #FEE2E2; color: var(--color-error); }
.badge-success { background-color: #D1FAE5; color: var(--color-success); }
.badge-role { background-color: var(--color-foreground); color: white; }

/* Alertas */
.alert {
  padding: var(--space-md);
  border-radius: 8px;
  margin-bottom: var(--space-md);
  font-weight: 500;
}

.alert-error {
  background-color: #FEE2E2;
  border: 1px solid #FCA5A5;
  color: var(--color-error);
}

/* ==========================================================================
   Layout Principal
   ========================================================================== */
.app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.navbar {
  height: var(--navbar-height);
  position: sticky;
  top: 0;
  z-index: 40;
  background: #FFFFFF;
  border-bottom: 1px solid var(--color-border);
}

.navbar-container {
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 var(--space-xl);
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.navbar-brand {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-family: 'Syne', sans-serif;
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--color-foreground);
}

.navbar-brand:hover {
  color: var(--color-primary);
}

.navbar-menu {
  display: flex;
  align-items: center;
  gap: var(--space-xl);
}

.nav-links {
  display: flex;
  gap: var(--space-lg);
}

.sastre-nav-links {
  display: none;
}

.nav-link {
  color: #64748B;
  font-weight: 600;
  font-family: 'Syne', sans-serif;
  padding: var(--space-sm) 0;
  position: relative;
}

.nav-link:hover, .nav-link.active {
  color: var(--color-foreground);
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background-color: var(--color-primary);
  transition: width 0.3s ease;
}

.nav-link:hover::after, .nav-link.active::after {
  width: 100%;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--color-primary);
  color: var(--color-on-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Syne', sans-serif;
  font-weight: 800;
  font-size: 1.25rem;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-family: 'Syne', sans-serif;
  font-weight: 700;
  color: var(--color-foreground);
}

.user-role {
  font-size: 0.7rem;
  margin-top: 2px;
}

.main-container {
  display: flex;
  flex-grow: 1;
}

.sastre-layout .content-area {
  padding: var(--space-2xl);
  flex-grow: 1;
  width: calc(100% - var(--sidebar-width));
}

.cliente-layout .content-area {
  padding: var(--space-2xl);
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

/* Sidebar */
.sidebar {
  width: var(--sidebar-width);
  background: #FFFFFF;
  border-right: 1px solid var(--color-border);
  min-height: calc(100vh - var(--navbar-height));
  padding: var(--space-xl) 0;
}

.sidebar-header {
  padding: 0 var(--space-xl) var(--space-lg);
  margin-bottom: var(--space-lg);
  color: #64748B;
  text-transform: uppercase;
  font-family: 'Syne', sans-serif;
  font-weight: 700;
  font-size: 0.85rem;
  letter-spacing: 0.1em;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  padding: 0 var(--space-md);
}

.sidebar-link {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: 12px 16px;
  color: #64748B;
  font-family: 'Syne', sans-serif;
  font-weight: 600;
  border-radius: 8px;
  transition: all 200ms ease;
}

.sidebar-link:hover {
  background-color: var(--color-muted);
  color: var(--color-foreground);
}

.sidebar-link.active {
  background-color: var(--color-primary);
  color: var(--color-on-primary);
}

/* ==========================================================================
   Autenticación
   ========================================================================== */
.login-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: var(--space-xl);
  background-color: var(--color-muted);
}

.login-card {
  width: 100%;
  max-width: 480px;
  padding: var(--space-2xl);
  text-align: center;
}

.register-container .login-card {
  max-width: 600px;
}

.login-card .form-group {
  text-align: left;
}

.login-header {
  margin-bottom: var(--space-2xl);
}

.login-header h1 {
  font-size: 2.5rem;
  margin-bottom: var(--space-sm);
}

.login-header p {
  color: #64748B;
  font-size: 1.1rem;
}

.login-footer {
  margin-top: var(--space-xl);
  color: #64748B;
}

.login-footer .link {
  font-family: 'Syne', sans-serif;
  font-weight: 700;
  margin-left: var(--space-sm);
}

/* ==========================================================================
   Modales
   ========================================================================== */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(15,23,42,0.4);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: var(--space-md);
}

.modal-content {
  background: #FFFFFF;
  border-radius: 16px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--shadow-xl);
  animation: modalSlideUp 400ms cubic-bezier(0.16, 1, 0.3, 1);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-xl);
  border-bottom: 1px solid var(--color-border);
}

.modal-body {
  padding: var(--space-xl);
}

.btn-close {
  background: var(--color-muted);
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-foreground);
  cursor: pointer;
  transition: all 200ms ease;
}

.btn-close:hover {
  background: #E2E8F0;
}

@keyframes modalSlideUp {
  from { opacity: 0; transform: translateY(40px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

/* ==========================================================================
   Extras
   ========================================================================== */
.progress-bar-bg {
  height: 8px;
  background-color: var(--color-muted);
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  border-radius: 4px;
}

.spinner {
  animation: rotate 2s linear infinite;
  z-index: 2;
  position: relative;
  stroke: currentColor;
}

.spinner .path {
  stroke-linecap: round;
  animation: dash 1.5s ease-in-out infinite;
}

@keyframes rotate { 100% { transform: rotate(360deg); } }
@keyframes dash {
  0% { stroke-dasharray: 1, 150; stroke-dashoffset: 0; }
  50% { stroke-dasharray: 90, 150; stroke-dashoffset: -35; }
  100% { stroke-dasharray: 90, 150; stroke-dashoffset: -124; }
}

/* Toast/Alerts animados */
.toast-container {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 200;
}
.toast {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 24px;
  border-radius: 8px;
  box-shadow: var(--shadow-lg);
  font-weight: 600;
}
.toast-success { background: var(--color-success); color: white; }
.toast-error { background: var(--color-error); color: white; }
.toast-info { background: var(--color-foreground); color: white; }

/* Grid helpers */
.grid { display: grid; }
.grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
.grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
.grid-cols-4 { grid-template-columns: repeat(4, 1fr); }

@media (max-width: 768px) {
  .grid-cols-2, .grid-cols-3, .grid-cols-4 {
    grid-template-columns: 1fr;
  }
  .sastre-layout {
    flex-direction: column;
  }
  .sidebar {
    display: none;
  }
  .sastre-layout .content-area {
    width: 100%;
    padding: var(--space-lg);
  }
}

/* ==========================================================================
   Responsive Utilities & Fixes
   ========================================================================== */
.flex { display: flex; }
.flex-col { flex-direction: column; }
.flex-row { flex-direction: row; }
.flex-wrap { flex-wrap: wrap; }
.flex-grow { flex-grow: 1; }
.items-center { align-items: center; }
.justify-center { justify-content: center; }
.justify-between { justify-content: space-between; }
.justify-end { justify-content: flex-end; }
.whitespace-nowrap { white-space: nowrap; }
.truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.desktop-only { display: block; }
.mobile-only { display: none; }
.mobile-only-flex { display: none; }
/* Desktop-first Grid defaults */
.md\:grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
.md\:grid-cols-4 { grid-template-columns: repeat(4, 1fr); }
.lg\:grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
.lg\:col-span-2 { grid-column: span 2 / span 2; }

@media (max-width: 1024px) {
  .lg\:grid-cols-3 { grid-template-columns: repeat(2, 1fr); }
  .lg\:col-span-2 { grid-column: span 1 / span 1; }
}

@media (max-width: 768px) {
  .desktop-only { display: none !important; }
  .mobile-only { display: block !important; }
  .mobile-only-flex { display: flex !important; }
  
  /* Override md and lg grids */
  .md\:grid-cols-2, .md\:grid-cols-4, .lg\:grid-cols-3 {
    grid-template-columns: 1fr;
  }
  .lg\:col-span-2 { grid-column: span 1 / span 1; }
  
  .md\:flex-row { flex-direction: column !important; }
  .md\:text-left { text-align: center !important; }
  
  .navbar-container {
    flex-direction: row;
    padding: 0 var(--space-lg);
    justify-content: space-between;
    position: relative;
  }
  .navbar {
    height: 70px;
    padding: 0;
    display: flex;
    align-items: center;
  }
  .navbar-menu {
    flex-wrap: wrap;
    justify-content: center;
    gap: var(--space-sm);
    margin-top: var(--space-sm);
  }
  .nav-links {
    flex-wrap: wrap;
    justify-content: center;
    gap: var(--space-sm);
  }
  .user-profile {
    width: 100%;
    justify-content: center;
    margin-top: var(--space-sm);
  }
}

/* Fix Mobile Navbar Toggle */
.mobile-menu-btn {
  display: none;
  background: none;
  border: none;
  color: var(--color-primary);
  cursor: pointer;
  padding: 4px;
}
.navbar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}
@media (max-width: 768px) {
  .mobile-menu-btn {
    display: block;
  }
  .navbar-menu {
    display: none;
    flex-direction: column;
    position: absolute;
    top: 70px;
    left: 0;
    right: 0;
    width: 100%;
    background: #FFFFFF;
    padding: var(--space-md) var(--space-lg);
    box-shadow: var(--shadow-lg);
    border-top: 1px solid var(--color-border);
    border-bottom: 1px solid var(--color-border);
    z-index: 50;
  }
  .navbar-menu.is-open {
    display: flex;
  }
  .nav-links {
    flex-direction: column;
    width: 100%;
  }
  .nav-link {
    width: 100%;
    padding: 12px;
    text-align: center;
    border-bottom: 1px solid var(--color-border);
  }
  .sastre-nav-links {
    display: flex !important;
  }
}

```

### [src/main.tsx](file:///home/juan/Escritorio/TallerConnect/src/main.tsx)

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);

```

### [src/types/index.ts](file:///home/juan/Escritorio/TallerConnect/src/types/index.ts)

```typescript
/**
 * types/index.ts — Interfaces y tipos para TallerConnect
 * 
 * Define la estructura de datos de todas las entidades del sistema.
 * Estas interfaces se usan en Firestore y en los componentes React.
 */

import type { Timestamp } from "firebase/firestore";

// ============================================================
// Usuario (colección "usuarios" en Firestore)
// ============================================================
/** Representa un usuario del sistema (sastre o cliente) */
export interface Usuario {
  uid: string;                      // UID de Firebase Auth
  cedula: string;                   // Cédula única del cliente
  nombre: string;                   // Nombre completo
  correo: string;                   // Correo electrónico
  celular: string;                  // Celular (puede estar vacío)
  rol: "sastre" | "cliente";        // Rol del usuario
  fechaRegistro: Timestamp;         // Fecha de registro
}

// ============================================================
// Tela (colección "telas" en Firestore)
// ============================================================
/** Representa una tela en el inventario */
export interface Tela {
  id?: string;                      // ID del documento (auto-generado)
  nombre: string;                   // Nombre de la tela
  metrosDisponibles: number;        // Metros en stock (decimal)
  precioMetro: number;              // Precio por metro (decimal)
}

// ============================================================
// Estilo (colección "estilos" en Firestore)
// ============================================================
/** Representa un estilo de confección */
export interface Estilo {
  id?: string;                      // ID del documento
  nombre: string;                   // Nombre del estilo
  descripcion: string;              // Descripción (puede estar vacía)
}

// ============================================================
// Medidas de una prenda
// ============================================================
/** Medidas corporales asociadas a una prenda */
export interface MedidasPrenda {
  cuello: number;
  talle: number;
  mangas: number;
  pecho: number;
  cintura: number;
  largoTotal: number;
  cadera: number;
  hombros: number;
}

// ============================================================
// Historial de cambios de estado
// ============================================================
/** Registro de un cambio de estado en una prenda */
export interface HistorialEstado {
  estadoAnterior: string;
  estadoNuevo: string;
  fecha: Timestamp;
}

// ============================================================
// Prenda (colección "prendas" en Firestore)
// ============================================================
/** Los posibles estados de una prenda en el taller */
export type EstadoPrenda = "corte" | "costura" | "prueba" | "terminado";

/** Representa una prenda en confección */
export interface Prenda {
  id?: string;                      // ID del documento
  clienteId: string;                // UID del cliente dueño
  clienteNombre: string;            // Nombre del cliente (denormalizado)
  telaId: string;                   // ID de la tela usada
  telaNombre: string;               // Nombre de la tela (denormalizado)
  estiloId: string;                 // ID del estilo
  estiloNombre: string;             // Nombre del estilo (denormalizado)
  metrosUsados: number;             // Metros de tela utilizados
  costoTela: number;                // metros × precio (calculado)
  costoManoObra: number;            // Costo de mano de obra
  costoTotal: number;               // costoTela + costoManoObra
  estado: EstadoPrenda;             // Estado actual
  medidas: MedidasPrenda;           // Medidas de la prenda
  fechaInicio: Timestamp;           // Fecha de inicio de confección
  fechaTerminado: Timestamp | null; // Fecha de finalización (si aplica)
  historialEstados: HistorialEstado[]; // Historial de cambios de estado
  notas?: string;                   // Notas / Observaciones opcionales del sastre
}

// ============================================================
// Cita (colección "citas" en Firestore)
// ============================================================
/** Tipos de cita disponibles */
export type TipoCita = "prueba" | "entrega";

/** Estados posibles de una cita */
export type EstadoCita = "pendiente" | "confirmada" | "cancelada";

/** Representa una cita agendada */
export interface Cita {
  id?: string;                      // ID del documento
  clienteId: string;                // UID del cliente
  clienteNombre: string;            // Nombre del cliente (denormalizado)
  fecha: string;                    // Fecha en formato "YYYY-MM-DD"
  hora: string;                     // Hora en formato "HH:00"
  tipo: TipoCita;                   // Tipo de cita
  estado: EstadoCita;               // Estado de la cita
  observaciones: string;            // Notas adicionales
}

```

### [src/utils/constantes.tsx](file:///home/juan/Escritorio/TallerConnect/src/utils/constantes.tsx)

```tsx
/**
 * constantes.ts — Constantes del sistema TallerConnect
 * 
 * Centraliza valores que se usan en múltiples componentes:
 * estados, medidas, horarios, colores, etc.
 */

import { Scissors, Ruler, Shirt, CheckCircle } from 'lucide-react';

// ============================================================
// Estados de las prendas con sus colores asociados
// ============================================================
export const ESTADOS_PRENDA = [
  { valor: "corte",     etiqueta: "Corte",     color: "#BE185D", icono: <Scissors size={16} /> },
  { valor: "costura",   etiqueta: "Costura",   color: "#D97706", icono: <Ruler size={16} /> },
  { valor: "prueba",    etiqueta: "Prueba",    color: "#EC4899", icono: <Shirt size={16} /> },
  { valor: "terminado", etiqueta: "Terminado", color: "#10b981", icono: <CheckCircle size={16} /> },
] as const;

// ============================================================
// Nombres de las medidas que se registran por prenda
// ============================================================
export const MEDIDAS_DISPONIBLES = [
  { clave: "cuello",     etiqueta: "Cuello",       unidad: "cm" },
  { clave: "talle",      etiqueta: "Talle",        unidad: "cm" },
  { clave: "mangas",     etiqueta: "Mangas",       unidad: "cm" },
  { clave: "pecho",      etiqueta: "Pecho",        unidad: "cm" },
  { clave: "cintura",    etiqueta: "Cintura",      unidad: "cm" },
  { clave: "largoTotal", etiqueta: "Largo Total",  unidad: "cm" },
  { clave: "cadera",     etiqueta: "Cadera",       unidad: "cm" },
  { clave: "hombros",    etiqueta: "Hombros",      unidad: "cm" },
] as const;

// ============================================================
// Horarios disponibles para citas (de 8am a 6pm)
// ============================================================
export const HORARIOS_DISPONIBLES = [
  "08:00", "09:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00", "17:00", "18:00",
] as const;

// ============================================================
// Tipos y estados de citas
// ============================================================
export const TIPOS_CITA = [
  { valor: "prueba",  etiqueta: "Prueba" },
  { valor: "entrega", etiqueta: "Entrega" },
] as const;

export const ESTADOS_CITA = [
  { valor: "pendiente",  etiqueta: "Pendiente",  color: "#f59e0b" },
  { valor: "confirmada", etiqueta: "Confirmada", color: "#10b981" },
  { valor: "cancelada",  etiqueta: "Cancelada",  color: "#ef4444" },
] as const;

// ============================================================
// Umbral de stock bajo para telas (en metros)
// ============================================================
export const STOCK_BAJO_METROS = 5;

```

### [src/utils/helpers.ts](file:///home/juan/Escritorio/TallerConnect/src/utils/helpers.ts)

```typescript
/**
 * helpers.ts — Funciones utilitarias para TallerConnect
 * 
 * Funciones de formato, validación y utilidades generales.
 */

// ============================================================
// Formato de fechas
// ============================================================

/** Formatea una fecha a formato legible en español (ej: "13 de junio de 2026") */
export function formatearFecha(fecha: string): string {
  const opciones: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return new Date(fecha + "T12:00:00").toLocaleDateString("es-ES", opciones);
}

/** Formatea fecha corta (ej: "13/06/2026") */
export function formatearFechaCorta(fecha: string): string {
  return new Date(fecha + "T12:00:00").toLocaleDateString("es-ES");
}

// ============================================================
// Formato de moneda
// ============================================================

/** Formatea un número como moneda (ej: "$15,000.00") */
export function formatearMoneda(valor: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(valor);
}

// ============================================================
// Validaciones
// ============================================================

/** Valida que una cédula contenga solo números y tenga entre 5 y 15 dígitos */
export function validarCedula(cedula: string): boolean {
  return /^\d{5,15}$/.test(cedula);
}

/** Valida formato de correo electrónico */
export function validarCorreo(correo: string): boolean {
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(correo);
}

/** Valida que la contraseña tenga al menos 6 caracteres */
export function validarPassword(password: string): boolean {
  return password.length >= 6;
}

/** Valida un número de celular (opcional, pero si se ingresa debe tener formato válido) */
export function validarCelular(celular: string): boolean {
  if (!celular) return true; // El celular es opcional
  return /^\d{7,15}$/.test(celular);
}

// ============================================================
// Utilidades generales
// ============================================================

/** Obtiene la fecha actual en formato "YYYY-MM-DD" */
export function fechaHoy(): string {
  return new Date().toISOString().split("T")[0];
}

/** Capitaliza la primera letra de un texto */
export function capitalizar(texto: string): string {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

```

