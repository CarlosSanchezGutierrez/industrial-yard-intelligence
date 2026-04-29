# Phase 2.5 premium UI shell

## Purpose

Phase 2.5 improves the perceived product quality of the cockpit without depending on runtime endpoints.

## Added files

- `apps/web/src/components/PremiumCockpitHero.tsx`
- `apps/web/src/styles/premium-cockpit.css`

## What changed

The cockpit now has:

- premium SaaS hero
- executive signals
- stronger visual hierarchy
- global section polish
- better background, cards, shadows and interaction feel
- anchor actions for runtime, operation and yard map

## Why this came before GPS

The runtime audit endpoint can be repaired later as backend hardening.

The strategic priority now is making the app look like a real product before adding map/GPS features.

## Next strategic steps

1. Add section grouping/tabs to reduce scroll.
2. Add map/GPS module with browser geolocation.
3. Add zone/perimeter drawing.
4. Persist yard zones.
5. Associate stockpiles with zones.