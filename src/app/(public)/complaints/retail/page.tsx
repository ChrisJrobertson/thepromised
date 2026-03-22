import type { Metadata } from "next";

import { SectorComplaintsIndex } from "@/components/seo/SectorComplaintsIndex";
import { getAppUrl } from "@/lib/utils/app-url";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Retail complaints — organisation guides",
  description: "Retail complaint guides — we are expanding coverage for major UK retailers.",
  alternates: { canonical: `${getAppUrl()}/complaints/retail` },
};

export default function RetailComplaintsIndexPage() {
  return <SectorComplaintsIndex sector="retail" />;
}
