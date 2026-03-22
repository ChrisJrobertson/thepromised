/**
 * Canonical app URL for metadata, Open Graph, and JSON-LD.
 * Never throws — invalid env values fall back to production default.
 */
const DEFAULT_APP_URL = "https://www.theypromised.app";

export function getAppUrl(): string {
  const raw = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (!raw) return DEFAULT_APP_URL;
  try {
    const url = new URL(raw.startsWith("http") ? raw : `https://${raw}`);
    return url.origin;
  } catch {
    return DEFAULT_APP_URL;
  }
}

export function getMetadataBaseUrl(): URL {
  return new URL(getAppUrl());
}
