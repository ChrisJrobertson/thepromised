import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const expected = `Bearer ${process.env.CRON_SECRET}`;

  if (!process.env.CRON_SECRET || authHeader !== expected) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  return NextResponse.json({
    ok: true,
    message: "Reminder cron scaffolded. Reminder email processing will be implemented next.",
  });
}
