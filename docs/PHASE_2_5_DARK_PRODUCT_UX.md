# Phase 2.5 dark product UX

## Purpose

This pass corrects the visual direction of the cockpit.

## Problems addressed

- Serif typography looked cheap and inconsistent.
- White background made the cockpit feel unfinished.
- Inactive tabs were hard to read.
- There was too much technical text.
- The page still felt like one long engineering dashboard.
- Operators and supervisors need simple words, not software vocabulary.

## Added

- `apps/web/src/styles/premium-dark-product.css`

## Rewritten copy

Updated product-facing copy in:

- `PremiumCockpitHero`
- `PremiumCockpitTabs`
- `PremiumUxFrame`
- `PremiumCockpitCommandDeck`
- `PremiumGpsPreviewPanel`

## UX direction

The cockpit now uses:

- dark industrial theme
- system sans typography
- high-contrast tabs
- shorter text
- stronger cards
- simpler operational language
- hidden technical overload unless "Todo" is selected

## Next surgical passes

1. Replace remaining old panels with compact operational cards.
2. Build real GPS/map module.
3. Add perimeter drawing.
4. Persist yard zones.
5. Associate stockpiles to zones.