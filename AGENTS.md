# AGENTS.md - Guía para Agentes de Código

Este documento proporciona instrucciones para agentes IA que trabajan en este proyecto.

## Documentos de Contexto
- **AGENTS.md** (este archivo) - Especificación técnica y estándares de código.
- **docs/CASOS_DE_USO.md** - Lógica funcional y casos de uso del sistema.

---

## 1. Build / Lint / Test Commands

El proyecto usa **Next.js 15+** con **App Router** y **yarn**. Los comandos principales son:

```bash
# Instalación de dependencias
yarn install

# Desarrollo (inicia en http://localhost:3000)
yarn dev

# Build de producción
yarn build

# Iniciar servidor de producción
yarn start

# Linting
yarn lint

# Ejecutar un solo test (Jest/Vitest)
npm test -- --testNamePattern="nombre-del-test"
# o con cobertura
npm test -- --coverage --testNamePattern="nombre-del-test"
```

**Nota:** Si los comandos no funcionan, primero ejecuta `npm install` para instalar dependencias.

---

## 2. Código Style Guidelines

### 2.1 TypeScript Estricto

- **TypeScript obligatorio** en todo el código.
- **Prohibido usar `any`**. Usar `unknown` si es necesario y luego tipar.
- Definir interfaces en `/types`.
- Tipos generados de Supabase en `/types/database.ts`.

### 2.2 Componentes React

- **Componentes Funcionales** exclusivamente.
- **React Server Components (RSC)** por defecto.
- Usar `'use client'` solo en componentes interactivos (Modales, Selectores, Forms).
- Principio de Responsabilidad Única (SRP).

### 2.3 Convenciones de Nombres

| Elemento | Convención | Ejemplo |
|----------|------------|---------|
| Componentes | PascalCase | `ClubCard.tsx`, `RegisterForm.tsx` |
| Funciones/Hooks | camelCase | `useAuth()`, `formatDate()` |
| Constantes | UPPER_SNAKE | `MAX_SPORTS_PER_CLUB` |
| Archivos utils | kebab-case | `date-utils.ts`, `slug-utils.ts` |
| Interfaces | PascalCase con prefijo | `IClub`, `IUpdateRequest` |
| Types | PascalCase | `ClubStatus`, `SportCategory` |

### 2.4 Imports

Ordenar imports siguiendo esta prioridad:

```typescript
// 1. React/Next built-ins
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

// 2. Components locales (relative paths primero)
import { ClubCard } from '@/components/shared/ClubCard'
import { Button } from '@/components/ui/Button'

// 3. Libraries externas
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'

// 4. Types/Utils
import type { IClub } from '@/types/club'
import { formatDate } from '@/lib/utils/date-utils'
```

### 2.5 Formateo y Estilos

- **Tailwind CSS** para todos los estilos.
- **Mobile First**: usar prefijos `md:`, `lg:`.
- Bordes redondeados: `rounded-xl`.
- Sombras suaves: `shadow-sm`.
- Espacios en blanco generosos.
- Tipografía: Fuente **Manrope** (400 cuerpo, 600 semi-bold, 800 títulos).
- Colores: Primario `blue-700`, Acento `red-600`, Fondo `slate-50`.

### 2.6 Validación

- **Zod** para esquemas de validación en `/lib/validations/`.
- Validación doble: cliente (UX) + servidor (Server Actions).
- Proteger formularios públicos con **Cloudflare Turnstile** + **Honeypot**.

### 2.7 Manejo de Errores

- Usar `try/catch` con mensajes descriptivos.
- Registrar errores en consola con contexto.
- Mostrar mensajes amigables al usuario.
- Never exponerse `contact_email` del solicitante en el cliente.

### 2.8 Seguridad

- No exponer secrets en el cliente (usar Server Actions).
- Sanitizar inputs.
- Rate limiting en endpoints públicos.
- Soft delete (borrado lógico) - nunca eliminar físicamente de DB.

---

## 3. Estructura del Proyecto

```
tudeportelocal/
├── app/                        # Rutas Next.js (App Router)
│   ├── (public)/               # Grupo de rutas públicas
│   │   ├── page.tsx            # Landing
│   │   ├── registrar/          # Registro de clubes
│   │   ├── club/[slug]/        # Ficha del club
│   │   └── deporte/[sport]/[commune]/  # SEO local
│   ├── (admin)/                # Grupo de rutas admin
│   │   ├── login/              # Login admin
│   │   └── admin/              # Panel de gestión
│   └── api/                    # Endpoints API
├── components/
│   ├── ui/                     # Componentes base (Button, Input)
│   ├── forms/                  # Formularios complejos
│   ├── layout/                 # Navbar, Footer, Sidebar
│   └── shared/                 # Componentes compartidos
├── lib/
│   ├── supabase/               # Cliente/Server client
│   ├── utils/                  # Funciones helper
│   └── validations/            # Esquemas Zod
├── types/                      # Interfaces y tipos
└── public/                     # Assets estáticos
```

---

## 4. Convenciones de Ramas y Commits

- Ramas: `feature/nombre`, `fix/bug-descripcion`, `hotfix/urgente`.
- Commits: Imperativo español/inglés, ej: "Agregar filtro por región".

---

## 5. Reglas del AGENT.md (Prioridad Alta)

El archivo `AGENT.md` contiene la especificación técnica del proyecto. **Consultar siempre antes de generar código.**

- Stack: Next.js 15+, Tailwind CSS, Supabase (PostgreSQL), Resend, Cloudflare Turnstile.
- Mobile First, Tipografía Manrope, Colores blue-700/red-600.
- Soft delete obligatorio.
- Moderación 100% manual por admin.

---

## 6. Base de Datos (Supabase)

Tablas principales:
- `regions`: Regiones de Chile.
- `communes`: Comunas (relación con region_id).
- `sports`: Deportes (slug, is_active).
- `clubs`: Clubes (status: pending/active/inactive, is_featured).
- `club_sports`: Relación muchos-a-muchos.
- `update_requests`: Solicitudes de cambio (tipo: info_change, social_update, etc.).

## Estado del Proyecto

- [x] 1. Setup Next.js + Tailwind + shadcn/ui
- [x] 2. Setup Supabase (tablas, tipos)
- [x] 3. Utils y helpers
- [x] 4. UI Base (Button, Input, Card)
- [x] 5. Layout (Navbar, Footer)
- [x] 6. Landing (Buscador, Filtros, Lista)
- [x] 7. Club/[slug] (Ficha del club)
- [x] 8. Registro (Formulario)
- [x] 9. Admin (Panel de gestión)

---

## 7. SEO

- Rutas dinámicas: `/club/[slug]`, `/deporte/[sportSlug]/[communeSlug]`.
- Usar `<Image />` de Next.js.
- Metadata dinámica por página.
- SSR para indexación inmediata.
