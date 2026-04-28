export const themeModes = [
  "industrial_dark",
  "technical_light"
] as const;

export type ThemeMode = (typeof themeModes)[number];

export interface ColorScale {
  readonly 50: string;
  readonly 100: string;
  readonly 200: string;
  readonly 300: string;
  readonly 400: string;
  readonly 500: string;
  readonly 600: string;
  readonly 700: string;
  readonly 800: string;
  readonly 900: string;
  readonly 950: string;
}

export interface SemanticColors {
  readonly background: string;
  readonly surface: string;
  readonly surfaceElevated: string;
  readonly border: string;
  readonly text: string;
  readonly textMuted: string;
  readonly primary: string;
  readonly success: string;
  readonly warning: string;
  readonly danger: string;
  readonly info: string;
  readonly mapWater: string;
  readonly mapLand: string;
  readonly mapYard: string;
  readonly mapRestricted: string;
}

export interface TypographyTokens {
  readonly fontFamilySans: string;
  readonly fontFamilyMono: string;
  readonly displaySize: string;
  readonly headingSize: string;
  readonly bodySize: string;
  readonly captionSize: string;
}

export interface SpacingTokens {
  readonly xs: string;
  readonly sm: string;
  readonly md: string;
  readonly lg: string;
  readonly xl: string;
  readonly "2xl": string;
  readonly "3xl": string;
}

export interface RadiusTokens {
  readonly sm: string;
  readonly md: string;
  readonly lg: string;
  readonly xl: string;
  readonly "2xl": string;
}

export interface ShadowTokens {
  readonly card: string;
  readonly panel: string;
  readonly floating: string;
}

export interface ThemeTokens {
  readonly mode: ThemeMode;
  readonly colors: SemanticColors;
  readonly typography: TypographyTokens;
  readonly spacing: SpacingTokens;
  readonly radius: RadiusTokens;
  readonly shadow: ShadowTokens;
}