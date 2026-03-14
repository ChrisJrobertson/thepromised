"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, Check, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import {
  ORGANISATION_CATEGORIES,
  ORGANISATION_CATEGORY_LABELS,
} from "@/lib/validation/cases";
import type { Organisation } from "@/types/database";

type SelectedOrg = {
  mode: "existing" | "new";
  organisation_id?: string | null;
  organisation_name: string;
  category: string;
  website?: string;
  complaint_email?: string;
  complaint_phone?: string;
};

const newOrgSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  category: z.enum(ORGANISATION_CATEGORIES, {
    error: "Please select a category",
  }),
  website: z.string().optional(),
  complaint_email: z.string().optional(),
  complaint_phone: z.string().optional(),
});

type NewOrgData = z.infer<typeof newOrgSchema>;

type OrganisationStepFormProps = {
  onNext: (org: SelectedOrg) => void;
};

export function OrganisationStepForm({ onNext }: OrganisationStepFormProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Organisation[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Organisation | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);

  const newOrgForm = useForm<NewOrgData>({
    resolver: zodResolver(newOrgSchema),
    defaultValues: {
      name: "",
      category: "other",
      website: "",
      complaint_email: "",
      complaint_phone: "",
    },
  });

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      setLoading(true);
      const supabase = createClient();
      const { data } = await supabase
        .from("organisations")
        .select("*")
        .ilike("name", `%${query}%`)
        .limit(8);
      setResults((data as Organisation[] | null) ?? []);
      setLoading(false);
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  function handleSelectExisting(org: Organisation) {
    setSelected(org);
    setShowNewForm(false);
    setQuery(org.name);
    setResults([]);
  }

  function handleContinueExisting() {
    if (!selected) return;
    onNext({
      mode: "existing",
      organisation_id: selected.id,
      organisation_name: selected.name,
      category: selected.category,
    });
  }

  function handleNewOrgSubmit(data: NewOrgData) {
    onNext({
      mode: "new",
      organisation_id: null,
      organisation_name: data.name,
      category: data.category,
      website: data.website,
      complaint_email: data.complaint_email,
      complaint_phone: data.complaint_phone,
    });
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-5">
          <div>
            <h2 className="text-lg font-semibold">Who is your complaint against?</h2>
            <p className="text-sm text-muted-foreground">
              Search for the organisation, or add one if it&apos;s not listed.
            </p>
          </div>

          {!showNewForm && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Search organisation</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-9"
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setSelected(null);
                  }}
                  placeholder="e.g. British Gas, HMRC, Barclays..."
                  value={query}
                />
              </div>

              {loading && (
                <p className="text-xs text-muted-foreground">Searching...</p>
              )}

              {results.length > 0 && (
                <div className="rounded-md border shadow-sm">
                  {results.map((org) => (
                    <button
                      className="flex w-full items-center justify-between px-3 py-2.5 text-left text-sm transition-colors hover:bg-muted/50 first:rounded-t-md last:rounded-b-md"
                      key={org.id}
                      onClick={() => handleSelectExisting(org)}
                      type="button"
                    >
                      <div>
                        <span className="font-medium">{org.name}</span>
                        {org.is_verified && (
                          <Badge className="ml-2" variant="secondary">
                            Verified
                          </Badge>
                        )}
                      </div>
                      <Badge variant="outline">
                        {ORGANISATION_CATEGORY_LABELS[org.category]}
                      </Badge>
                    </button>
                  ))}
                </div>
              )}

              {selected && (
                <div className="flex items-center gap-2 rounded-md border border-secondary/30 bg-secondary/5 px-3 py-2 text-sm">
                  <Check className="h-4 w-4 text-secondary" />
                  <div className="flex-1">
                    <span className="font-medium">{selected.name}</span>
                    <Badge className="ml-2" variant="outline">
                      {ORGANISATION_CATEGORY_LABELS[selected.category]}
                    </Badge>
                  </div>
                </div>
              )}

              {query.length > 1 && results.length === 0 && !loading && (
                <p className="text-sm text-muted-foreground">
                  No results for &ldquo;{query}&rdquo;
                </p>
              )}

              <div className="flex items-center gap-3 pt-1">
                {selected ? (
                  <Button onClick={handleContinueExisting} type="button">
                    Continue with {selected.name}
                  </Button>
                ) : null}
                <Button
                  className="text-muted-foreground"
                  onClick={() => {
                    setShowNewForm(true);
                    if (query) {
                      newOrgForm.setValue("name", query);
                    }
                  }}
                  type="button"
                  variant="ghost"
                >
                  <Plus className="mr-1.5 h-4 w-4" />
                  Add a new organisation
                </Button>
              </div>
            </div>
          )}

          {showNewForm && (
            <Form {...newOrgForm}>
              <form
                className="space-y-4"
                onSubmit={newOrgForm.handleSubmit(handleNewOrgSubmit)}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">New Organisation</h3>
                  <Button
                    onClick={() => setShowNewForm(false)}
                    size="sm"
                    type="button"
                    variant="ghost"
                  >
                    Back to search
                  </Button>
                </div>

                <FormField
                  control={newOrgForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Organisation name *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. Acme Energy Ltd"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={newOrgForm.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {ORGANISATION_CATEGORIES.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {ORGANISATION_CATEGORY_LABELS[cat]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-3 sm:grid-cols-2">
                  <FormField
                    control={newOrgForm.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Website</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://example.com"
                            type="url"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={newOrgForm.control}
                    name="complaint_email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Complaint email</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="complaints@example.com"
                            type="email"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={newOrgForm.control}
                  name="complaint_phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Complaint phone number</FormLabel>
                      <FormControl>
                        <Input placeholder="0800 000 0000" type="tel" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button className="w-full" type="submit">
                  Continue with this organisation
                </Button>
              </form>
            </Form>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
