export type ThemeMode = "light" | "dark";

export interface Palette {
  mode: ThemeMode;
  surface: string;
  onSurface: string;
  surfaceSecondary: string;
  surfaceTertiary: string;
  onSurfaceTertiary: string;
  surfaceInverse: string;
  onSurfaceInverse: string;
  brand: string;
  onBrand: string;
  brandTertiary: string;
  onBrandTertiary: string;
  success: string;
  warning: string;
  error: string;
  onError: string;
  border: string;
  borderStrong: string;
  divider: string;
  muted: string;
  overlay: string;
}

export const lightPalette: Palette = {
  mode: "light",
  surface: "#FAF9F7",
  onSurface: "#181715",
  surfaceSecondary: "#FFFFFF",
  surfaceTertiary: "#F0EEEB",
  onSurfaceTertiary: "#454340",
  surfaceInverse: "#181715",
  onSurfaceInverse: "#FAF9F7",
  brand: "#E27429",
  onBrand: "#FFFFFF",
  brandTertiary: "#FBE9DE",
  onBrandTertiary: "#7A350E",
  success: "#225937",
  warning: "#8A6116",
  error: "#962D24",
  onError: "#FFFFFF",
  border: "#E5E3E0",
  borderStrong: "#C2C0BD",
  divider: "#E5E3E0",
  muted: "#8A8781",
  overlay: "rgba(24,23,21,0.45)",
};

export const darkPalette: Palette = {
  mode: "dark",
  surface: "#181715",
  onSurface: "#E5E3E0",
  surfaceSecondary: "#23221F",
  surfaceTertiary: "#2C2A27",
  onSurfaceTertiary: "#B8B5B0",
  surfaceInverse: "#FAF9F7",
  onSurfaceInverse: "#181715",
  brand: "#E27429",
  onBrand: "#FFFFFF",
  brandTertiary: "#3A2417",
  onBrandTertiary: "#F5B98A",
  success: "#4ADE80",
  warning: "#E0B45C",
  error: "#F08A80",
  onError: "#2A0D0A",
  border: "#33312E",
  borderStrong: "#4A4744",
  divider: "#33312E",
  muted: "#8A8781",
  overlay: "rgba(0,0,0,0.6)",
};

export type NoteColorKey =
  | "default"
  | "yellow"
  | "green"
  | "blue"
  | "purple"
  | "pink"
  | "orange"
  | "gray";

export const NOTE_COLOR_KEYS: NoteColorKey[] = [
  "default",
  "yellow",
  "green",
  "blue",
  "purple",
  "pink",
  "orange",
  "gray",
];

// Resolve a note color key to an actual background hex for the current mode.
export function noteColorHex(key: string, palette: Palette): string {
  const k = (key || "default") as NoteColorKey;
  if (k === "default") return palette.surfaceSecondary;
  const light: Record<string, string> = {
    yellow: "#FEF9C3",
    green: "#DCFCE7",
    blue: "#DBEAFE",
    purple: "#F3E8FF",
    pink: "#FCE7F3",
    orange: "#FFEDD5",
    gray: "#F3F4F6",
  };
  const dark: Record<string, string> = {
    yellow: "#423816",
    green: "#143C27",
    blue: "#183354",
    purple: "#36204F",
    pink: "#4F1E37",
    orange: "#4C2915",
    gray: "#383838",
  };
  const map = palette.mode === "dark" ? dark : light;
  return map[k] ?? palette.surfaceSecondary;
}

// A visible swatch color for the color picker dots (always vivid).
export function noteSwatchHex(key: string): string {
  const map: Record<string, string> = {
    default: "#C2C0BD",
    yellow: "#FACC15",
    green: "#22C55E",
    blue: "#3B82F6",
    purple: "#A855F7",
    pink: "#EC4899",
    orange: "#F97316",
    gray: "#6B7280",
  };
  return map[key] ?? "#C2C0BD";
}
