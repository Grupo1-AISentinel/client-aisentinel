# AISentinel — Client (Frontend)

SPA en React 19 + Vite + Tailwind CSS v4. Se comunica con los microservicios `server-auth-aisentinel` y `server-admin-aisentinel`.

## Stack

- **React 19** + **React Router 7**
- **Vite 8** con HMR
- **Tailwind CSS v4** (sin Tailwind v3 ni @material-tailwind)
- **Zustand** para estado
- **Axios** para HTTP
- **Socket.io Client** para tiempo real
- **React Hook Form** para formularios
- **Recharts** para gráficos
- **Lucide React** para iconos
- **React Hot Toast** para notificaciones

## Comandos

```bash
pnpm install
pnpm run dev          # dev server en http://localhost:5173
pnpm run build        # build de producción
pnpm run preview      # previsualizar build
pnpm run lint         # eslint
pnpm run lint:fix     # eslint con autofix
pnpm run format       # prettier --write
pnpm run format:check # prettier --check
```

## Variables de entorno

Copia `.env.example` a `.env` y completa los valores:

```
VITE_AUTH_URL=http://localhost:3069/api/v1
VITE_ADMIN_URL=http://localhost:3067/AISentinelAdmin/v1
VITE_ADMIN_SOCKET_URL=http://localhost:3067
```

## Estructura

```
src/
├── app/                # Router, layouts, providers, guards
├── features/           # Auth, students, coordinators, uniforms, alerts, attendance, statistics, inspections, audits, monitoring, profile, dashboard
├── shared/             # api, socket, components/ui, components/feedback, components/layout, hooks, stores, utils, validators, styles
├── styles/             # index.css (Tailwind v4 + @theme) y theme.js (tokens JS)
├── app/App.jsx
└── main.jsx
```

Cada feature sigue el patrón:

```
features/<name>/
├── services/      # Llamadas HTTP hacia la API
├── stores/        # Zustand
├── hooks/         # Hooks específicos
├── components/    # Componentes UI de la feature
└── pages/         # Páginas montadas en el router
```

## Roles

- `ADMIN_ROLE` — Acceso completo: gestión de coordinadores, bitácora, todas las inspecciones.
- `COORDINATOR_ROLE` — Acceso restringido: solo estudiantes, alertas y estadísticas de su grado.

El sidebar, las rutas, los formularios y las acciones se ajustan automáticamente al rol del usuario autenticado.

## Tiempo real

La página `/monitoring` se conecta vía Socket.io al Admin Server. Se suscribe a los eventos `camera:status` y `detection:alert` para reflejar en vivo el estado de las cámaras y el feed de detecciones.
