import {
  alertRed,
  industrialSlate,
  operationalGreen,
  signalAmber,
  technicalBlue
} from "./palette.js";
import type { ThemeMode, ThemeTokens } from "./types.js";

const sharedTypography = {
  fontFamilySans: "Inter, ui-sans-serif, system-ui, sans-serif",
  fontFamilyMono: "JetBrains Mono, ui-monospace, SFMono-Regular, monospace",
  displaySize: "2.25rem",
  headingSize: "1.25rem",
  bodySize: "1rem",
  captionSize: "0.8125rem"
} as const;

const sharedSpacing = {
  xs: "0.25rem",
  sm: "0.5rem",
  md: "1rem",
  lg: "1.5rem",
  xl: "2rem",
  "2xl": "3rem",
  "3xl": "4rem"
} as const;

const sharedRadius = {
  sm: "0.375rem",
  md: "0.5rem",
  lg: "0.75rem",
  xl: "1rem",
  "2xl": "1.5rem"
} as const;

export const industrialDarkTheme: ThemeTokens = {
  mode: "industrial_dark",
  colors: {
    background: industrialSlate[950],
    surface: industrialSlate[900],
    surfaceElevated: industrialSlate[800],
    border: industrialSlate[700],
    text: industrialSlate[50],
    textMuted: industrialSlate[300],
    primary: signalAmber[500],
    success: operationalGreen[500],
    warning: signalAmber[400],
    danger: alertRed[500],
    info: technicalBlue[400],
    mapWater: "#0f3b57",
    mapLand: "#111827",
    mapYard: "#27272a",
    mapRestricted: "#7f1d1d"
  },
  typography: sharedTypography,
  spacing: sharedSpacing,
  radius: sharedRadius,
  shadow: {
    card: "0 12px 30px rgba(0, 0, 0, 0.35)",
    panel: "0 18px 45px rgba(0, 0, 0, 0.45)",
    floating: "0 24px 70px rgba(0, 0, 0, 0.55)"
  }
};

export const technicalLightTheme: ThemeTokens = {
  mode: "technical_light",
  colors: {
    background: industrialSlate[50],
    surface: "#ffffff",
    surfaceElevated: industrialSlate[100],
    border: industrialSlate[200],
    text: industrialSlate[950],
    textMuted: industrialSlate[600],
    primary: technicalBlue[600],
    success: operationalGreen[600],
    warning: signalAmber[600],
    danger: alertRed[600],
    info: technicalBlue[500],
    mapWater: "#c7e7ff",
    mapLand: "#f8fafc",
    mapYard: "#e5e7eb",
    mapRestricted: "#fecaca"
  },
  typography: sharedTypography,
  spacing: sharedSpacing,
  radius: sharedRadius,
  shadow: {
    card: "0 8px 24px rgba(15, 23, 42, 0.08)",
    panel: "0 14px 40px rgba(15, 23, 42, 0.12)",
    floating: "0 20px 55px rgba(15, 23, 42, 0.16)"
  }
};

export const themesByMode: Readonly<Record<ThemeMode, ThemeTokens>> = {
  industrial_dark: industrialDarkTheme,
  technical_light: technicalLightTheme
};

export function getThemeTokens(mode: ThemeMode): ThemeTokens {
  return themesByMode[mode];
}