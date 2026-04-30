# Herramientas internas ocultas — Aplomo Systems

## Qué se agregó

Se agregó un montaje seguro para herramientas internas.

Archivo:

apps/web/src/internal/mountAplomoInternalTools.tsx

## Cómo abrirlo

En producción o local:

https://aplomosystems.com/?aplomoInternal=1

Después de abrirlo una vez, queda activo en localStorage.

## Cómo cerrarlo

Presionar:

Cerrar herramientas internas

Eso borra el flag local y oculta el panel.

## Qué contiene ahora

- Panel interno cloud sync.
- Estado de backend.
- Prueba manual de sincronización contra Supabase si hay variables configuradas.

## Importante

No aparece en la demo normal.

No cambia el flujo de operadores.

No reemplaza localStorage.

No obliga a tener Supabase configurado.
