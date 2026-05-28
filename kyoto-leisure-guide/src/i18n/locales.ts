export const LOCALES = ["ko", "en", "ja"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "ko";

export function isLocale(value: string | undefined | null): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}
