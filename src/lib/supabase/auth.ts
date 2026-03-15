export function getAuthCallbackUrl(nextPath = "/dashboard") {
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? "https://www.theypromised.app";
  return `${appUrl}/callback?next=${encodeURIComponent(nextPath)}`;
}
