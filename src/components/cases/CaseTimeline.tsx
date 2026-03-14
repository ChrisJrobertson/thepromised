import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function CaseTimeline() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Case Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Timeline rendering component scaffolded. Chronological interaction cards and filters
          will be implemented in the timeline phase.
        </p>
      </CardContent>
    </Card>
  );
}
