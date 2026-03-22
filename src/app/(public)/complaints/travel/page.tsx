import type { Metadata } from "next";

import { SectorComplaintsIndex } from "@/components/seo/SectorComplaintsIndex";
import { getAppUrl } from "@/lib/utils/app-url";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Travel complaints — airline guides",
  description:
    "Airline complaints: UK261 flight disruption rights, refunds, and escalation routes.",
  alternates: { canonical: `${getAppUrl()}/complaints/travel` },
};

export default function TravelComplaintsIndexPage() {
  return <SectorComplaintsIndex sector="travel" />;
}
