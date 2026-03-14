export function getAuthCallbackUrl(nextPath = "/dashboard") {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `${appUrl}/callback?next=${encodeURIComponent(nextPath)}`;
}
