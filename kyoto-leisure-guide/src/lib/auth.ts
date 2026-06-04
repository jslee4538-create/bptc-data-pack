export const GOOGLE_OAUTH_OPTIONS = {
  scopes: "https://www.googleapis.com/auth/calendar.events",
  queryParams: {
    access_type: "offline",
    prompt: "consent",
  },
} as const;

export function callbackUrl(origin: string, nextPath?: string) {
  if (!nextPath || nextPath === "/") return `${origin}/auth/callback`;
  return `${origin}/auth/callback?next=${encodeURIComponent(nextPath)}`;
}
