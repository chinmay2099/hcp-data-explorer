import { useState, useMemo, useCallback } from "react";
import { DEFAULT_THEME, TENANT_THEMES } from "../lib/theme-config";

export function useTenantTheme() {
  const [currentTenant, setCurrentTenant] = useState<string>("default");

  const theme = useMemo(() => {
    if (currentTenant === "default") {
      return DEFAULT_THEME;
    }

    const tenantConfig = TENANT_THEMES[currentTenant];
    if (!tenantConfig) {
      return DEFAULT_THEME;
    }

    const validatedTheme = {
      appName: tenantConfig.appName ?? DEFAULT_THEME.appName,
      primary: isValidColor(tenantConfig.primary)
        ? tenantConfig.primary
        : DEFAULT_THEME.primary,
      onPrimary: isValidColor(tenantConfig.onPrimary)
        ? tenantConfig.onPrimary
        : DEFAULT_THEME.onPrimary,
      background: isValidColor(tenantConfig.background)
        ? tenantConfig.background
        : DEFAULT_THEME.background,
      surface: isValidColor(tenantConfig.surface)
        ? tenantConfig.surface
        : DEFAULT_THEME.surface,
      text: isValidColor(tenantConfig.text)
        ? tenantConfig.text
        : DEFAULT_THEME.text,
      radius: isValidRadius(tenantConfig.radius)
        ? tenantConfig.radius
        : DEFAULT_THEME.radius,
    };

    const testColors = {
      default: { primary: "#0B5FA5", surface: "#F2F5F8" },
      aurelia: { primary: "#2E7D32", surface: "#E8F5E9" },
      meridian: { primary: "#C62828", surface: "#FFEBEE" },
    };

    const testTheme = {
      ...validatedTheme,
      primary:
        testColors[currentTenant as keyof typeof testColors]?.primary ||
        validatedTheme.primary,
      surface:
        testColors[currentTenant as keyof typeof testColors]?.surface ||
        validatedTheme.surface,
    };

    return testTheme;
  }, [currentTenant]);

  const setTenant = useCallback((tenant: string) => {
    setCurrentTenant(tenant);
  }, []);

  return {
    theme,
    currentTenant,
    setTenant,
    availableTenants: ["default", ...Object.keys(TENANT_THEMES)],
  };
}

function isValidColor(value: string | undefined): value is string {
  if (!value) return false;
  const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  return hexColorRegex.test(value);
}

function isValidRadius(value: number | undefined): value is number {
  if (value === undefined || value === null) return false;
  const num = Number(value);
  return !isNaN(num) && num >= 0 && num <= 24;
}
