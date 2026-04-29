# Namiki product shell

## Purpose

The product shell exposes the actual operating value of the architecture without showing irrelevant software language to Cooper/T. Smith operators.

## UX direction

- Black/dark interface.
- White text only.
- No white panels.
- Menu-based navigation.
- Functions visible through operational pages.
- Technical/computing concepts hidden in internal mode.

## Pages

- Inicio
- Patio
- Materiales
- Captura
- Equipo
- Historial
- Análisis
- Envíos
- Interno

## Capabilities surfaced

- Yard areas
- Visual operational map
- Rail line / yard routes
- Docks
- Stockpiles and materials
- Material states
- Quantities
- Owners/responsibles
- Priorities
- Operator workflow
- GPS preparation
- Perimeter drawing preparation
- Evidence capture preparation
- Drones
- Topographic poles
- Machinery
- Weighbridges
- Audit/history
- Timeline filters
- Time comparison
- Demand planning
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
- `apps/web/src/styles/zzz-namiki-operational-hub.css`

## Next work

- Real browser geolocation
- Real map component
- Perimeter drawing
- Save yard zones
- Link stockpiles to map zones