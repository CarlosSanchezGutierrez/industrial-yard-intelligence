# Namiki product shell

## Purpose

This shell organizes the existing architecture into a clean, dark product interface.

## UX direction

- Everything dark by default.
- White/light text only.
- No white panels.
- Dropdown menu instead of sticky oversized tabs.
- Internal pages instead of long scroll navigation.
- Existing technical work remains accessible inside expandable panels.
- Language is operational, not software-heavy.

## Pages

- Inicio
- Materiales
- Mapa y GPS
- Historial
- Envíos
- Sistema

## Existing features preserved

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
- `apps/web/src/styles/namiki-product-shell.css`

## Next work

- Add real browser geolocation
- Add real map component
- Add perimeter drawing
- Save yard zones
- Link stockpiles to map zones