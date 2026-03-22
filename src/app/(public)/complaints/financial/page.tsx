import type { Metadata } from "next";

import { SectorComplaintsIndex } from "@/components/seo/SectorComplaintsIndex";
import { getAppUrl } from "@/lib/utils/app-url";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Financial services complaints — organisation guides",
  description:
    "Bank and credit complaints: DISP, eight-week final responses, and the Financial Ombudsman Service.",
  alternates: { canonical: `${getAppUrl()}/complaints/financial` },
};

export default function FinancialComplaintsIndexPage() {
  return <SectorComplaintsIndex sector="financial" />;
}
