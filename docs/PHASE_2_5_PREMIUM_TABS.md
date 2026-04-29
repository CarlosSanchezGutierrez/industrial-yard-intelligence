# Phase 2.5 premium tabs

## Purpose

The cockpit was visually improved, but it still showed too much content at once.

This pass adds real experience tabs so the demo behaves more like a SaaS app and less like a long technical page.

## Added files

- `apps/web/src/components/PremiumCockpitTabs.tsx`
- `apps/web/src/styles/premium-tabs.css`

## Modes

- Overview
- Operación
- Mapa / GPS
- Runtime
- Auditoría
- Sync
- Todo

## How it works

Each major panel gets a `data-iyi-section` attribute.

`PremiumCockpitTabs` writes the active section to:

`document.body.dataset.iyiActiveSection`

CSS then hides panels outside the active section.

## Why this matters

This reduces visual clutter and lets the presenter show one product area at a time.