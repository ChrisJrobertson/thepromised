export const SEO_SECTOR_SLUGS = [
  "energy",
  "telecoms",
  "financial",
  "retail",
  "travel",
  "insurance",
] as const;

export type SeoSectorSlug = (typeof SEO_SECTOR_SLUGS)[number];

export function isSeoSectorSlug(s: string): s is SeoSectorSlug {
  return (SEO_SECTOR_SLUGS as readonly string[]).includes(s);
}

export function seoSectorLabel(sector: string): string {
  const labels: Record<string, string> = {
    energy: "Energy",
    telecoms: "Telecoms",
    financial: "Financial services",
    retail: "Retail",
    travel: "Travel",
    insurance: "Insurance",
  };
  return labels[sector] ?? sector;
}
