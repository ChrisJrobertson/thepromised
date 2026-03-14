import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PricingPage() {
  return (
    <main className="mx-auto max-w-6xl space-y-8 px-4 py-12">
      <div className="space-y-2 text-center">
        <h1 className="text-4xl font-bold">Simple pricing for stronger complaints</h1>
        <p className="text-muted-foreground">Choose monthly or annual billing any time.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Free <Badge variant="secondary">£0</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>1 active case</p>
            <p>Basic interaction logging</p>
            <p>No PDF export</p>
            <Link className="block rounded-md bg-primary px-3 py-2 text-center text-white" href="/register">
              Start Free
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Basic <Badge>£4.99/mo</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>Unlimited cases</p>
            <p>Timeline PDF export</p>
            <p>Email reminders</p>
            <Link className="block rounded-md bg-primary px-3 py-2 text-center text-white" href="/register">
              Upgrade
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Pro <Badge className="bg-accent text-accent-foreground">£9.99/mo</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>Everything in Basic</p>
            <p>AI complaint guidance</p>
            <p>Full ombudsman-ready export</p>
            <Link className="block rounded-md bg-primary px-3 py-2 text-center text-white" href="/register">
              Go Pro
            </Link>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
