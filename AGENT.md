Este documento contiene la definición técnica y funcional final para el desarrollo del Producto Mínimo Viable (MVP) de la base de datos deportiva más grande de Chile.

Actúa como un Desarrollador Senior. Siempre que generes código para este proyecto, consulta prioritariamente este documento para mantener la coherencia técnica y visual.
---

## 1. ALCANCE GENERAL DEL MVP

- **Tipo de Producto:** Directorio deportivo local con buscador y filtros.
- **Enfoque inicial:** Todas las regiones.
- **Moderación:** 100% manual por administrador.
- **Objetivo Principal:** Validar interés real mediante clics en RRSS de clubes.
- **Gestión de Datos:** Borrado lógico (Soft delete) - nunca se elimina físicamente de la DB.

---

### SECCIÓN: LINEAMIENTOS GENERALES DE DESARROLLO

### 1. Arquitectura y Diseño Visual

- **Mobile First:** Diseño optimizado para móviles (375px+) y escalado con prefijos de Tailwind (`md:`, `lg:`).
- **Tipografía:** Fuente **Manrope**. Pesos: `400` (cuerpo), `600` (semi-bold), `800` (títulos).
- **Paleta de Colores (Tailwind Config):**
    - **Primario:** `Blue-700` (#1d4ed8) - Transmite confianza y profesionalismo deportivo.
    - **Accento/Energía:** `Red-600` (#dc2626) - Para CTAs y elementos críticos (guiño a los colores de Chile).
    - **Fondo/Neutros:** `Slate-50` para fondos, `Slate-900` para textos principales.
- **Estética:** Minimalista, bordes redondeados (`rounded-xl`), sombras suaves (`shadow-sm`) y mucho espacio en blanco.

### 2. Estándares de Código (Clean Code)

- **Principios SOLID:** Responsabilidad única por componente y extensibilidad vía `props`.
- **Componentes Funcionales:** Priorizar React Server Components (RSC). Solo usar `'use client'` en elementos interactivos (Modales, Selectores de Filtros).
- **Tipado Estricto:** **TypeScript obligatorio**. Prohibido el uso de `any`. Interfaces definidas en `/types`.

### 3. Rendimiento y SEO

- **Imágenes:** Uso exclusivo de `<Image />` de Next.js para optimización automática.
- **Accesibilidad (a11y):** Semántica HTML5 correcta y atributos `aria-label`.
- **SEO Local:** Renderizado en el servidor (SSR) para indexación inmediata de combinaciones Deporte + Comuna.

### 4. Seguridad y Datos

- **Validación Doble:** Validación en cliente y re-validación en servidor (Server Actions).
- **Anti-Spam:** Implementación mandatoria de Honeypot y Turnstile en formularios públicos.
- **Privacidad:** El `contact_email` del solicitante nunca debe llegar al cliente público.

---

## 2. STACK TECNOLÓGICO (LEAN STACK)

- **Frontend:** Next.js 15+ (App Router) - Optimizado para SEO y rutas dinámicas.
- **Estilos:** Tailwind CSS - Diseño responsivo y ligero.
- **Backend & DB:** Supabase (PostgreSQL) - Gestión de datos, Auth y almacenamiento.
- **Seguridad:** Cloudflare Turnstile (Captcha invisible) + Honeypot (campo oculto).
- **Hosting:** Vercel - Despliegue continuo y escalabilidad.
- **Emails:** Resend - Notificaciones automáticas al administrador.

---

## 3. ESTRUCTURA DE LA BASE DE DATOS (RELACIONAL)

### Tablas Principales:

1. **regions:** `id`, `name`.
2. **communes:** `id`, `name`, `region_id` (Relación para filtros anidados).
3. **sports:** `id`, `name`, `slug`, `is_active` (Maestro de deportes controlado por admin).
4. **clubs:** * `id`, `name`, `description`, `region_id`, `commune_id`.
    - `instagram_url`, `facebook_url`, `contact_email` (privado).
    - `status` (pending / active / inactive), `is_featured` (para orden prioritario).
5. **club_sports:** Relación Muchos-a-Muchos entre clubes y deportes.
    - `club_id`, `sport_id`, `is_primary` (Booleano para el deporte principal SEO).
6. **update_requests:** `id`, `club_id`, `type` (enum), `description`, `status` (pending/applied/rejected).

---

## 4. FUNCIONALIDADES DETALLADAS

### A. Landing Page & Directorio

- **Cards de Clubes:** Solo texto (Nombre, Región, Comuna, Deportes).
- **Buscador:** Por coincidencia en nombre, descripción y deportes.
- **Filtros Anidados:** Región → Comuna → Deporte (el selector de comuna se actualiza según la región).
- **Orden:** Primero clubes destacados (`is_featured`), luego alfabético.

### B. Captura de Datos (Registro)

- **Formulario sin Login:** Fricción mínima para el usuario.
- **Reglas de Deporte:** Máximo 3 deportes por club; 1 debe ser marcado como principal.
- **Validación:** Mínimo una red social obligatoria (IG o FB). Descripción entre 300 y 500 caracteres.
- **Seguridad:** Validación en Frontend + Backend. Turnstile para detectar bots.

### C. Panel de Administración (Mantenedor)

- **Gestión de Clubes:** Listado de ingresos `pending` para Aprobar / Editar / Rechazar.
- **Gestión de Solicitudes:** Ver sugerencias de cambio y aplicarlas manualmente a la ficha del club.
- **Maestro de Deportes:** CRUD simple para activar o desactivar categorías deportivas.

### D. Sistema de Solicitud de Actualización

- **Ubicación:** Botón dinámico dentro de cada perfil de club.
- **Tipos de Solicitud (Enum):**
    - `info_change`: Datos generales (horarios, descripción).
    - `social_update`: Links de Instagram/Facebook.
    - `sports_change`: Agregar o quitar deportes.
    - `club_closed`: El club ya no existe.
    - `remove_profile`: Solicitud de borrado (por el dueño).
    - `other`: Otros motivos.
- **Gestión:** Las solicitudes no modifican el club automáticamente. El administrador debe validar y aplicar el cambio manualmente en el panel.
- **Seguridad:** Limitado por IP (Rate limiting) para evitar spam de sugerencias.

---

## 5. ESTRATEGIA SEO Y MÉTRICAS

- **URLs Dinámicas:** `tudeportelocal.cl/club/[slug-del-club]`.
- **SEO de Categoría Local:** Generación de páginas estáticas por combinación de Deporte + Comuna para capturar búsquedas de intención local.
- **Metadata:** Generación automática de títulos: "[Nombre] - [Deporte Principal] en [Comuna]".
- **KPIs (Métricas):**
    1. Clicks en botones de Instagram/Facebook (Intención real de contacto).
    2. Tasa de nuevos registros orgánicos.
    3. Tiempo de permanencia en fichas de clubes.

---

## 6. ESTRUCTURA DE CARPETAS (NEXT.JS)

Este proyecto utiliza el App Router de Next.js 15. La lógica está dividida en grupos de rutas: (public) para usuarios visitantes y (admin) para gestión interna. Se utiliza una carpeta /lib para servicios externos como Supabase.

```text
tudeportelocal/
├── app/                               # EL CORAZÓN (Rutas y Páginas)
│   ├── (public)/                      # GRUPO RUTA PÚBLICA (Sin login)
│   │   ├── layout.tsx                 # Navbar pública + Footer
│   │   ├── page.tsx                   # LANDING: Buscador + Filtros + Lista Cards
│   │   ├── registrar/                 # tudeportelocal.cl/registrar
│   │   │   └── page.tsx               # Formulario de registro de club
│   │   ├── club/                      # tudeportelocal.cl/club/[slug]
│   │   │   └── [slug]/                # Carpeta dinámica para SEO del club
│   │   │       └── page.tsx           # Ficha del club + Botón Sugerir Cambio
│   │   └── deporte/                   # SEO LOCAL: tudeportelocal.cl/deporte/basket/san-fernando
│   │       └── [sportSlug]/           # Nivel 1: Deporte
│   │           └── [communeSlug]/     # Nivel 2: Comuna
│   │               └── page.tsx       # Landing optimizada para Google
│   │
│   ├── (admin)/                       # GRUPO RUTA PRIVADA (Con login)
│   │   ├── layout.tsx                 # Sidebar de admin + Protección de ruta
│   │   ├── login/                     # Acceso exclusivo para ti (Admin)
│   │   │   └── page.tsx
│   │   └── admin/                     # EL MANTENEDOR
│   │       ├── dashboard/             # Métricas (Clicks, Registros hoy)
│   │       ├── clubes/                # Gestión de registros "Pending"
│   │       ├── solicitudes/           # Gestión de Sugerencias de cambio
│   │       └── deportes/              # Maestro de Deportes (CRUD)
│   │
│   ├── api/                           # ENDPOINTS INTERNOS (Serverless)
│   │   ├── send-email/                # Lógica de Resend (Notificaciones)
│   │   └── turnstile/                 # Validación de Captcha de Cloudflare
│   └── globals.css                    # Tailwind CSS puro
│
├── components/                        # PIEZAS DE LEGO (Reutilizables)
│   ├── ui/                            # Botones, Inputs, Modales (Shadcn/AntD style)
│   ├── forms/                         # Lógica pesada de formularios
│   │   ├── RegisterClubForm.tsx       # El formulario con validaciones
│   │   └── UpdateRequestModal.tsx     # EL MODAL de sugerencia de cambios
│   ├── layout/                        # Navbar.tsx, Footer.tsx, AdminSidebar.tsx
│   └── shared/                        # ClubCard.tsx, SearchBar.tsx, FilterGroup.tsx
│
├── lib/                               # HERRAMIENTAS Y SERVICIOS
│   ├── supabase/                      # Configuración de Supabase
│   │   ├── client.ts                  # Cliente para el navegador
│   │   └── server.ts                  # Cliente para el servidor (seguro)
│   ├── utils/                         # Funciones de ayuda (formatear fechas, slugs)
│   └── validations/                   # Esquemas de validación (Zod)
│
├── types/                             # DEFINICIÓN DE DATOS (TypeScript)
│   ├── database.ts                    # Tipos generados de Supabase
│   ├── club.ts                        # Interfaz de Club + Relaciones
│   └── update.ts                      # Interfaz de Solicitudes
│
├── public/                            # ARCHIVOS ESTÁTICOS
│   ├── icons/                         # Iconos de deportes (.svg)
│   └── images/                        # Logos y placeholders
│
├── .env.local                         # LLAVES SECRETAS (Supabase URL, Anon Key, etc.)
└── tailwind.config.ts                 # Configuración de colores y fuentes
```