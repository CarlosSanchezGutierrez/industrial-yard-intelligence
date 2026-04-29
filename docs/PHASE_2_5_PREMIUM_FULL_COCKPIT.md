# Phase 2.5 premium full cockpit

## Purpose

This pass applies premium UI/UX treatment beyond the first hero section.

## Added

- Premium command deck
- GPS preview panel
- Global premium cockpit styling
- Better section hierarchy
- Reordered cockpit flow

## Files

- apps/web/src/components/PremiumCockpitCommandDeck.tsx
- apps/web/src/components/PremiumGpsPreviewPanel.tsx
- apps/web/src/styles/premium-experience.css

## New cockpit order

1. Premium hero
2. Command deck
3. Section navigation
4. Runtime status
5. Demo reset
6. Industrial value
7. Yard map
8. Stockpile summary
9. Operator/create/status panels
10. Audit
11. Sync
12. GPS preview
13. Supporting demo panels

## Why

The page was technically complete but visually too text-heavy. This makes the cockpit feel closer to a premium SaaS product while keeping all existing functionality.
## Prop-safe cockpit order

The premium cockpit shell must not auto-render components that require runtime props.

These components stay controlled by their original App-level state flow:

- StockpileCreatePanel
- StockpileStatusPanel
- StockpileLifecyclePanel
- StockpileMutationPanel

Reason:

Rendering them as `<Component />` without props breaks TypeScript and web build.