# TallerConnect

Sistema web para la gestión integral de un taller de costura, diseñado para sastres y sus clientes.

## Stack Tecnológico
- Frontend: React + Vite + TypeScript
- Estilos: CSS Vanilla (Glassmorphism UI)
- Backend: Firebase (Auth, Firestore)
- Routing: React Router DOM v6
- UI/Componentes: react-big-calendar, date-fns

## Características Principales

### Para el Sastre (Administrador)
- **Dashboard:** Resumen en tiempo real del estado del taller (prendas, citas, inventario).
- **Gestión de Clientes:** CRUD completo de clientes con validación de cédulas.
- **Inventario:** Gestión de Telas y Estilos con alertas de stock bajo.
- **Gestión de Prendas:** Control del ciclo de vida de cada prenda (corte, costura, prueba, terminado), cálculos de costos automáticos, registro de medidas y descuento de inventario automatizado.
- **Citas:** Calendario interactivo para gestionar citas de clientes.

### Para el Cliente
- **Panel Personal:** Visión rápida de sus prendas en proceso y próximas citas.
- **Historial de Prendas:** Seguimiento visual del progreso de cada prenda encargada.
- **Medidas:** Visualización de sus medidas corporales basadas en su última prenda.
- **Gestión de Citas:** Capacidad de agendar, reprogramar o cancelar citas de prueba o entrega con validación de disponibilidad.

## Configuración y Despliegue

1. Clona el repositorio e instala dependencias:
   ```bash
   npm install
   ```

2. Configura Firebase:
   - Renombra `.env.template` a `.env.local` o `.env` y coloca las credenciales de tu proyecto de Firebase.
   - Aplica las reglas de seguridad de Firestore que se encuentran en `firestore.rules`.
   - Activa el proveedor de Autenticación "Correo y Contraseña" en tu consola de Firebase.

3. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

## Reglas de Firestore
Las reglas de seguridad incluyen protección contra escalamiento de privilegios, validación de dueños de documentos (`isOwner`), y validación de roles cruzada (`isSastre`). El archivo se encuentra en la raíz del proyecto.
