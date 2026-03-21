/**
 * Sanitise free-text search for PostgREST `.or()` filters.
 * Commas split OR clauses; % and _ are LIKE wildcards in ilike.
 */
export function sanitizeCaseListSearch(raw: string): string {
  return raw
    .trim()
    .replace(/,/g, " ")
    .replace(/%/g, "")
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
