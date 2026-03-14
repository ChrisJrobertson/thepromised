import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type PagePlaceholderProps = {
  title: string;
  description: string;
  ctaHref?: string;
  ctaLabel?: string;
};

export function PagePlaceholder({
  title,
  description,
  ctaHref,
  ctaLabel,
}: PagePlaceholderProps) {
  return (
    <div className="mx-auto w-full max-w-3xl p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">{description}</p>
          {ctaHref && ctaLabel ? (
            <Link className="text-sm font-medium text-primary underline" href={ctaHref}>
              {ctaLabel}
            </Link>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
