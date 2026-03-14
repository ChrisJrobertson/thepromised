import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const categories = [
  "Energy",
  "Broadband & Phone",
  "Financial Services",
  "Insurance",
  "Government (HMRC, DWP, councils)",
  "NHS",
  "Housing",
  "Retail & Services",
  "Employment",
];

export default function EscalationGuidesPage() {
  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-12">
      <h1 className="text-4xl font-bold">UK Escalation Guides</h1>
      <p className="text-muted-foreground">
        Browse complaint escalation paths by category. Always verify procedures with official
        regulatory websites.
      </p>
      <div className="grid gap-4 md:grid-cols-3">
        {categories.map((category) => (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="text-lg">{category}</CardTitle>
            </CardHeader>
            <CardContent>
              <Link className="text-sm text-primary underline" href="/register">
                Track your complaint journey with TheyPromised
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
