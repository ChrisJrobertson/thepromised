export const metadata = { title: "My Cases | TheyPromised" };

import { CasesPageClient } from "./CasesPageClient";

// The cases list is fully client-side — it fetches data via the browser
// Supabase client after the user is authenticated, eliminating all SSR
// complications (dynamic searchParams, hydration mismatches, etc.)
export default function CasesPage() {
  return <CasesPageClient />;
}
