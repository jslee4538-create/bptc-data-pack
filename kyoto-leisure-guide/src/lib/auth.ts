// 캘린더 기능 전용 OAuth 옵션 — Google이 '민감한 권한'으로 분류하는 calendar.events scope.
// '행사를 캘린더에 추가' 버튼에서만 사용한다. 일반 로그인(Header/북마크/후기)은 이 옵션을
// 쓰지 않아 email/profile 기본 scope만 요청 → "확인되지 않은 앱이 민감정보 요청" 경고가 뜨지 않음.
export const GOOGLE_CALENDAR_OAUTH_OPTIONS = {
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
