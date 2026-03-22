import type { Metadata } from "next";

import { SectorComplaintsIndex } from "@/components/seo/SectorComplaintsIndex";
import { getAppUrl } from "@/lib/utils/app-url";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Energy complaints — organisation guides",
  description:
    "How to complain to major UK energy suppliers: rights, deadlines, and escalation to the Energy Ombudsman.",
  alternates: { canonical: `${getAppUrl()}/complaints/energy` },
};

export default function EnergyComplaintsIndexPage() {
  return <SectorComplaintsIndex sector="energy" />;
}
