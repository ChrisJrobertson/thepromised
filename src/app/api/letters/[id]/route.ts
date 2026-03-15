import { NextResponse } from "next/server";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import type { LetterUpdate } from "@/types/database";

const patchSchema = z.object({
  body: z.string().optional(),
  subject: z.string().optional(),
  status: z.enum(["draft", "sent", "acknowledged"]).optional(),
  sent_date: z.string().optional(),
  sent_via: z.enum(["email", "post", "not_sent"]).optional(),
  recipient_name: z.string().optional(),
  recipient_address: z.string().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    }

    const json = await request.json();
    const update = patchSchema.parse(json);

    const letterUpdate: LetterUpdate = {};
    if (update.body !== undefined) letterUpdate.body = update.body;
    if (update.subject !== undefined) letterUpdate.subject = update.subject;
    if (update.status !== undefined) letterUpdate.status = update.status;
    if (update.sent_date !== undefined) letterUpdate.sent_date = update.sent_date;
    if (update.sent_via !== undefined) letterUpdate.sent_via = update.sent_via;
    if (update.recipient_name !== undefined)
      letterUpdate.recipient_name = update.recipient_name;
    if (update.recipient_address !== undefined)
      letterUpdate.recipient_address = update.recipient_address;

    const { error } = await supabase
      .from("letters")
      .update(letterUpdate)
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request", details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const { data: letter, error } = await supabase
    .from("letters")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !letter) {
    return NextResponse.json({ error: "Letter not found" }, { status: 404 });
  }

  return NextResponse.json(letter);
}
