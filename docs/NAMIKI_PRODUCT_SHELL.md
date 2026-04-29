# Namiki product shell

## Purpose

This shell organizes the existing project into an operational product interface.

## UX direction

- Black/dark interface.
- White text only.
- No white panels.
- Menu instead of endless scroll.
- Functions visible through operational pages.
- Technical/computing concepts hidden in internal mode.

## Pages

- Inicio
- Patio
- Materiales
- Captura
- Equipo
- Historial
- Envíos
- Modo interno

## Capabilities surfaced

- Yard areas
- Stockpiles and materials
- Material states
- Operator workflow
- GPS preparation
- Perimeter drawing preparation
- Evidence capture preparation
- Drones
- Topographic poles
- Machinery
- Weighbridges
- Audit/history
- Offline/local capture concept
- Sync/export concept
- Internal runtime checks

## Existing components preserved

- Stockpile demo summary
- Operator workflow progress
- Yard operations map
- GPS preview
- Audit timeline
- Sync story
- Runtime connection status
- Demo reset

## Main files

- `apps/web/src/components/NamikiProductShell.tsx`
- `apps/web/src/styles/zz-namiki-black-operations.css`

## Next work

- Real browser geolocation
- Real map component
- Perimeter drawing
- Save yard zones
- Link stockpiles to map zones