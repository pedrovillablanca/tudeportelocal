---
name: supabase
description: Operaciones con Supabase - Cliente, Server Actions, tipos y estructura de tablas
---

# Skill: Supabase - Base de Datos y Auth

## Estructura de Archivos

```
lib/
├── supabase/
│   ├── client.ts      # Cliente para navegador
│   └── server.ts      # Cliente para servidor (seguro)
```

## Tipos

- Tipos generados: `/types/database.ts`
- Interfaces personalizadas: `/types/club.ts`, `/types/update.ts`

## Tablas Principales

1. **regions** - Regiones de Chile
2. **communes** - Comunas (relación con region_id)
3. **sports** - Deportes (slug, is_active)
4. **clubs** - Clubes (status: pending/active/inactive, is_featured)
5. **club_sports** - Relación muchos-a-muchos Club-Deporte
6. **update_requests** - Solicitudes de cambio (tipo: info_change, social_update, etc.)

## Reglas

- **Soft delete obligatorio**: nunca eliminar físicamente de la DB
- Usar `is_deleted` o similar campo para borrado lógico
- Moderación 100% manual por admin
- `contact_email` del solicitante NUNCA debe exponerse al cliente público

## Cliente Supabase

```typescript
// Navegador (cliente)
import { createClient } from '@/lib/supabase/client'

// Servidor (Server Actions)
import { createClient } from '@/lib/supabase/server'
```

## Consultas Comunes

- Filtrar clubes por status: `eq('status', 'active')`
- Filtrar por región/comuna: `eq('region_id', id)`
- Soft delete: `eq('is_deleted', false)`
- Ordenar por featured: `.order('is_featured', { ascending: false })`
