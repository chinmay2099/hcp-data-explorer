// Utility: Multi-tenant theme configuration
// Defines default theme and tenant-specific overrides
// Includes intentional invalid values for testing validation logic

export interface TenantTheme {
  appName: string;
  primary: string; // Primary brand color (hex)
  onPrimary: string; // Text color on primary background
  background: string; // Page background color
  surface: string; // Card/surface background color
  text: string; // Primary text color
  radius: number; // Border radius in pixels
}

// Default/fallback theme used when tenant config is missing or invalid
export const DEFAULT_THEME: TenantTheme = {
  appName: "HCP Data Explorer",
  primary: "#0B5FA5",
  onPrimary: "#FFFFFF",
  background: "#FFFFFF",
  surface: "#F2F5F8",
  text: "#16202E",
  radius: 8,
};

// Tenant-specific theme configurations (partial overrides)
// Can override any subset of theme properties
// Note: "meridian" has intentional invalid values for testing validation
export const TENANT_THEMES: Record<string, Partial<TenantTheme>> = {
  aurelia: {
    appName: "Aurelia Field IQ",
    primary: "#0B5FA5",
    onPrimary: "#FFFFFF",
    background: "#FFFFFF",
    surface: "#EFF5FA",
    text: "#152A3E",
    radius: 8,
  },
  meridian: {
    appName: "Meridian 360",
    primary: "#ZZ8800", // Invalid hex color (Z is not valid)
    background: "#FFFFFF",
    surface: "#F4F4F4",
    radius: "huge" as unknown as number, // Invalid radius type (string instead of number)
  },
};
