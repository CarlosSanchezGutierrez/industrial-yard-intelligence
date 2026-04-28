import type { ThemeTokens } from "./types.js";

export function themeToCssVariables(theme: ThemeTokens): Record<string, string> {
  return {
    "--iyi-color-background": theme.colors.background,
    "--iyi-color-surface": theme.colors.surface,
    "--iyi-color-surface-elevated": theme.colors.surfaceElevated,
    "--iyi-color-border": theme.colors.border,
    "--iyi-color-text": theme.colors.text,
    "--iyi-color-text-muted": theme.colors.textMuted,
    "--iyi-color-primary": theme.colors.primary,
    "--iyi-color-success": theme.colors.success,
    "--iyi-color-warning": theme.colors.warning,
    "--iyi-color-danger": theme.colors.danger,
    "--iyi-color-info": theme.colors.info,
    "--iyi-map-water": theme.colors.mapWater,
    "--iyi-map-land": theme.colors.mapLand,
    "--iyi-map-yard": theme.colors.mapYard,
    "--iyi-map-restricted": theme.colors.mapRestricted,
    "--iyi-font-sans": theme.typography.fontFamilySans,
    "--iyi-font-mono": theme.typography.fontFamilyMono,
    "--iyi-shadow-card": theme.shadow.card,
    "--iyi-shadow-panel": theme.shadow.panel,
    "--iyi-shadow-floating": theme.shadow.floating
  };
}

export function themeToCssText(theme: ThemeTokens): string {
  return Object.entries(themeToCssVariables(theme))
    .map(([key, value]) => `${key}: ${value};`)
    .join("\n");
}