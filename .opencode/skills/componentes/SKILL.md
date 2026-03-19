---
name: componentes
description: Estándares de código para componentes React, TypeScript y estilos Tailwind CSS
---

# Skill: Componentes - Estándares de Código

## TypeScript

- **TypeScript obligatorio** en todo el código
- **Prohibido usar `any`** - usar `unknown` si es necesario y tipar después
- Definir interfaces en `/types`
- Tipos generados de Supabase en `/types/database.ts`

## Componentes React

- **Componentes Funcionales** exclusivamente
- **React Server Components (RSC)** por defecto
- Usar `'use client'` solo en componentes interactivos (Modales, Selectores, Forms)
- Principio de Responsabilidad Única (SRP)

## Convenciones de Nombres

| Elemento | Convención | Ejemplo |
|----------|------------|---------|
| Componentes | PascalCase | `ClubCard.tsx`, `RegisterForm.tsx` |
| Funciones/Hooks | camelCase | `useAuth()`, `formatDate()` |
| Constantes | UPPER_SNAKE | `MAX_SPORTS_PER_CLUB` |
| Archivos utils | kebab-case | `date-utils.ts`, `slug-utils.ts` |
| Interfaces | PascalCase con prefijo | `IClub`, `IUpdateRequest` |

## Imports

Ordenar imports:
1. React/Next built-ins
2. Components locales (relative paths)
3. Libraries externas (zod, supabase)
4. Types/Utils

## Estilos (Tailwind CSS)

- **Mobile First**: prefijos `md:`, `lg:`
- Bordes redondeados: `rounded-xl`
- Sombras suaves: `shadow-sm`
- Tipografía: **Manrope** (400 cuerpo, 600 semi-bold, 800 títulos)
- Colores: Primario `blue-700`, Acento `red-600`, Fondo `slate-50`

## Validación

- Usar **Zod** para esquemas en `/lib/validations/`
- Validación doble: cliente + servidor (Server Actions)
- Proteger formularios públicos con **Cloudflare Turnstile** + **Honeypot**

## Seguridad

- No exponer secrets en cliente (usar Server Actions)
- Soft delete (borrado lógico) - nunca eliminar físicamente de DB
- Sanitizar inputs
- Rate limiting en endpoints públicos
