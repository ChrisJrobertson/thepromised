import type { Metadata } from "next";

import { SectorComplaintsIndex } from "@/components/seo/SectorComplaintsIndex";
import { getAppUrl } from "@/lib/utils/app-url";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Telecoms complaints — organisation guides",
  description:
    "Broadband and mobile complaints: Ofcom rules, ADR schemes, and provider-specific escalation guides.",
  alternates: { canonical: `${getAppUrl()}/complaints/telecoms` },
};

export default function TelecomsComplaintsIndexPage() {
  return <SectorComplaintsIndex sector="telecoms" />;
}
