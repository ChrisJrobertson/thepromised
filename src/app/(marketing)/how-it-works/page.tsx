import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const STEPS = [
  "Create a case and choose the organisation involved.",
  "Log every interaction in under 30 seconds.",
  "Follow guided escalation steps with deadline prompts.",
  "Export a clean professional case file for review.",
];

export default function HowItWorksPage() {
  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-12">
      <h1 className="text-4xl font-bold">How TheyPromised works</h1>
      <p className="text-muted-foreground">
        A practical, step-by-step system for documenting your complaint journey.
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        {STEPS.map((step, index) => (
          <Card key={step}>
            <CardHeader>
              <CardTitle>Step {index + 1}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">{step}</CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
