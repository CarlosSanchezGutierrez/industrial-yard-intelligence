# Supabase Live Map Panel

## Goal

Add a real live map panel powered by Supabase MVP tables.

## Files

- apps/web/src/internal/AplomoSupabaseLiveMapPanel.tsx

## Tables used

- aplomo_devices
- aplomo_latest_device_positions
- aplomo_stockpiles
- aplomo_material_types
- aplomo_gps_captures

## Why it matters

The internal console now has a real visual layer from Supabase data.

This proves the MVP can move from:

- SQL seed
- real auth
- real GPS capture write
- latest position update

to:

- real operational visualization

without depending only on the simulator.
