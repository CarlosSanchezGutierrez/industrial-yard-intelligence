import { describe, expect, it } from "vitest";
import {
  createTenantBranding,
  getThemeTokens,
  industrialDarkTheme,
  technicalLightTheme,
  themeToCssText,
  themeToCssVariables
} from "./index.js";

describe("@iyi/design-tokens", () => {
  it("exposes industrial dark theme", () => {
    expect(industrialDarkTheme.mode).toBe("industrial_dark");
    expect(industrialDarkTheme.colors.primary).toBeTruthy();
  });

  it("exposes technical light theme", () => {
    expect(technicalLightTheme.mode).toBe("technical_light");
    expect(technicalLightTheme.colors.background).toBe("#f8fafc");
  });

  it("resolves themes by mode", () => {
    expect(getThemeTokens("industrial_dark").mode).toBe("industrial_dark");
    expect(getThemeTokens("technical_light").mode).toBe("technical_light");
  });

  it("converts themes to css variables", () => {
    const variables = themeToCssVariables(industrialDarkTheme);

    expect(variables["--iyi-color-background"]).toBe(industrialDarkTheme.colors.background);
    expect(variables["--iyi-color-primary"]).toBe(industrialDarkTheme.colors.primary);
  });

  it("converts themes to css text", () => {
    const cssText = themeToCssText(technicalLightTheme);

    expect(cssText).toContain("--iyi-color-background");
    expect(cssText).toContain("--iyi-color-primary");
  });

  it("creates tenant branding with theme fallback", () => {
    const branding = createTenantBranding(
      {
        displayName: "Cooper/T. Smith"
      },
      industrialDarkTheme
    );

    expect(branding.displayName).toBe("Cooper/T. Smith");
    expect(branding.primaryColor).toBe(industrialDarkTheme.colors.primary);
  });

  it("rejects empty tenant branding names", () => {
    expect(() =>
      createTenantBranding(
        {
          displayName: "   "
        },
        industrialDarkTheme
      )
    ).toThrow("Tenant branding display name must not be empty.");
  });
});