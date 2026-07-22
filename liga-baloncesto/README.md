# Frontend - Liga de Baloncesto Juvenil

Aplicacion web (SPA) construida con **React + Vite** para la gestion de una liga de
baloncesto juvenil. Consume la API REST del backend (`/backend`) e implementa la vista
publica (clasificacion, calendario, resultados, equipos) y el area administrativa
protegida (ABM de equipos, jugadores y partidos).

## Tecnologias

- **React 19** + **Vite 6**
- **react-router-dom 7** para el ruteo (vista publica + rutas privadas)
- **axios** para el consumo de la API (con interceptores de token y de errores)
- **CSS** propio (sin frameworks): sistema de tokens, diseno responsive y tematica deportiva

## Requisitos

- Node.js 20 o superior
- El backend corriendo (por defecto en `http://localhost:4000`)

## Instalacion

```bash
cd frontend
npm install
```

## Configuracion

La URL de la API se toma de la variable de entorno `VITE_API_BASE_URL`.
Crear un archivo `.env` (o copiar `.env.example`):

```env
VITE_API_BASE_URL=http://localhost:4000/api
```

## Ejecucion

```bash
npm run dev      # entorno de desarrollo (http://localhost:3000)
npm run build    # build de produccion en /dist
npm run preview  # sirve el build de produccion
```

> El sitio publico no requiere login. Para el panel de administracion usar las
> credenciales que entrega el grupo. En el entorno de prueba: **admin / Admin1234**.

## Estructura del proyecto

```
src/
├── main.jsx                # Punto de entrada: Router + AuthProvider + estilos
├── App.jsx                 # Definicion de rutas (publicas y privadas)
├── config.js               # Datos de la liga y URL de la API
│
├── services/               # Capa de acceso a la API (un archivo por recurso)
│   ├── api.js              # Instancia axios + interceptores (token / errores)
│   ├── authService.js
│   ├── teamService.js
│   ├── playerService.js
│   ├── matchService.js
│   └── standingService.js
│
├── context/
│   └── AuthContext.jsx     # Estado de sesion (token + admin) y login/logout
│
├── hooks/
│   ├── useAsync.js         # Carga de datos reutilizable (loading/error/reload)
│   └── useMutation.js      # Operaciones de escritura (submitting/error)
│
├── utils/
│   ├── format.js           # Formateo de fechas y horas
│   ├── text.js             # Iniciales para avatares
│   └── validation.js       # Validaciones de formularios (espejo del backend)
│
├── components/
│   ├── ProtectedRoute.jsx  # Guarda de rutas privadas
│   ├── ScrollToTop.jsx
│   ├── MatchCard.jsx       # Tarjeta de partido (reutilizada en varias vistas)
│   ├── StandingsTable.jsx  # Tabla de clasificacion
│   ├── layout/             # Navbar, Footer, PublicLayout, AdminLayout
│   ├── ui/                 # Componentes base (Button, Modal, Field, Alert, ...)
│   └── admin/              # Formularios del ABM (Team/Player/Match/Result)
│
├── pages/                  # Vistas publicas (Home, Standings, Calendar, ...)
│   └── admin/              # Login + Dashboard + ABM de equipos/jugadores/partidos
│
└── styles/                 # tokens.css, layout.css, components.css, pages.css
```

## Decisiones de diseno

- **Capa de servicios**: toda comunicacion con la API pasa por `services/`, que reutiliza
  una unica instancia de axios. El interceptor agrega el token `Authorization: Bearer`
  y normaliza los errores del backend (incluidos los de `express-validator`).
- **Reutilizacion**: hooks (`useAsync`, `useMutation`) y componentes (`MatchCard`,
  `Modal`, `Field`, etc.) evitan duplicacion y mantienen el codigo modular.
- **Seguridad en el frontend**: las rutas privadas se protegen con `ProtectedRoute`;
  ante un token vencido (401), el interceptor cierra la sesion automaticamente.
- **Validaciones**: los formularios validan en el cliente antes de enviar, replicando
  las reglas que el backend valida del lado del servidor.
- **Responsive**: layout fluido con CSS Grid/Flexbox y navbar colapsable en mobile.
