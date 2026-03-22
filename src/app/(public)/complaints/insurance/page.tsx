import type { Metadata } from "next";

import { SectorComplaintsIndex } from "@/components/seo/SectorComplaintsIndex";
import { getAppUrl } from "@/lib/utils/app-url";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Insurance complaints — organisation guides",
  description: "Insurance complaint guides — we are expanding coverage for major UK insurers.",
  alternates: { canonical: `${getAppUrl()}/complaints/insurance` },
};

export default function InsuranceComplaintsIndexPage() {
  return <SectorComplaintsIndex sector="insurance" />;
}
