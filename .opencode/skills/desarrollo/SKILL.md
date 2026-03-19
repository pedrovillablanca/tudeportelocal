---
name: desarrollo
description: Workflow de desarrollo para Next.js 15+ con Supabase - Comandos principales, setup, build y testing
---

# Skill: Desarrollo - Workflow Next.js + Supabase

Este skill proporciona los comandos y procedimientos estándar para el desarrollo del proyecto.

## Comandos Principales

```bash
# Instalación de dependencias
npm install

# Desarrollo (inicia en http://localhost:3000)
npm run dev

# Build de producción
npm run build

# Iniciar servidor de producción
npm start

# Linting
npm run lint
```

## Testing

```bash
# Ejecutar todos los tests
npm test

# Ejecutar un solo test por nombre
npm test -- --testNamePattern="nombre-del-test"

# Ejecutar test con coverage
npm test -- --coverage --testNamePattern="nombre-del-test"
```

## Flujo de Trabajo

1. **Setup inicial**: `npm install`
2. **Desarrollo**: `npm run dev` (trabaja en localhost:3000)
3. **Verificar**: `npm run lint` antes de commits
4. **Build**: `npm run build` para verificar que compila

## Reglas Importantes

- Siempre ejecutar `npm run lint` antes de considerar una tarea completa
- Si hay errors de build, corregir antes de reportar como completo
- Usar `npm test` para verificar que los tests pasan
