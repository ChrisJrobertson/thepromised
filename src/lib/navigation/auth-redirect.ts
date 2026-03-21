/**
 * Validate `next` after login / OAuth — blocks open redirects.
 * Allows paths like `/cases/new?template=energy-wrong-tariff`.
 */
export function sanitizeAuthRedirectNext(raw: string | null): string {
  if (!raw) return "/dashboard";
  const trimmed = raw.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) {
    return "/dashboard";
  }
  if (trimmed.includes("://")) {
    return "/dashboard";
  }
  return trimmed;
}
