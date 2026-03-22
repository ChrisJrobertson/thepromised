/** Derive marketing name from SEO page title (avoids querying organisations under RLS for anon). */
export function organisationNameFromPageTitle(pageTitle: string): string {
  const m = pageTitle.match(/^How to Complain to\s+(.+)$/i);
  return m ? m[1].trim() : pageTitle;
}
