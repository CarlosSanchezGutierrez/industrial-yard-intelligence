# Panel interno cloud sync — Aplomo Systems

## Objetivo

Este avance crea un componente visual interno para probar sincronización cloud con Supabase.

## Archivo creado

apps/web/src/internal/AplomoCloudSyncDevPanel.tsx

## Estado

El panel existe, compila y está listo.

Todavía no está montado en la UI principal.

## Por qué no se monta todavía

Para no arriesgar la demo actual.

Primero se deja listo el componente.

Después se elige con cuidado dónde ponerlo:

- Herramientas internas.
- Panel backend GPS.
- Vista de diagnóstico.
- Modo desarrollo.

## Qué permite probar después

- Leer modo backend.
- Escribir companyId.
- Enviar una captura GPS demo.
- Ver resultado de Supabase.
- Confirmar si no hay variables configuradas.

## Siguiente paso

Montarlo dentro de una sección interna, no en el flujo principal de operadores.

El texto visible debe dejar claro que es herramienta interna.
