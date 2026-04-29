# Phase 2.5 dark no-scroll UX

## Purpose

This pass corrects the cockpit visual direction.

## Fixed

- Removed white-looking panels through final dark override CSS.
- Replaced serif/heavy typography with normal application typography.
- Made all text readable on dark backgrounds.
- Replaced scroll-jump navigation with internal section navigation.
- Simplified visible copy for operators and supervisors.
- Moved technical/demo language into internal tabs.
- Prevented buttons from sending users to random positions in the same page.

## Main files

- `apps/web/src/components/PremiumCockpitTabs.tsx`
- `apps/web/src/components/PremiumCockpitHero.tsx`
- `apps/web/src/components/PremiumCockpitCommandDeck.tsx`
- `apps/web/src/components/PremiumUxFrame.tsx`
- `apps/web/src/styles/dark-product-final.css`

## Next pass

Replace remaining old panels with compact operational cards.