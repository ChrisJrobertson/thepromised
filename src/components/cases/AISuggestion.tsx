"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type AISuggestionProps = {
  caseId: string;
};

export function AISuggestion({ caseId }: AISuggestionProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const fetchSuggestion = async () => {
    setLoading(true);
    const response = await fetch("/api/ai/suggest", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ caseId }),
    });
    const json = await response.json();
    setResult(json.message ?? "Suggestion received.");
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Suggestion</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button onClick={fetchSuggestion} variant="outline">
          {loading ? "Loading..." : "Get AI Suggestion"}
        </Button>
        {result ? <p className="text-sm text-muted-foreground">{result}</p> : null}
        <p className="text-xs text-muted-foreground">
          AI suggestions are for guidance only. Always verify with official sources.
        </p>
      </CardContent>
    </Card>
  );
}
