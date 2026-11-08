import { timingSafeEqual } from "node:crypto";
import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db";
import { demoAccount, demoEnabled } from "@/lib/demo";
import { workspaceSummary, writeDemoWorkspace } from "@/lib/demo-seed";

// Called by Vercel Cron (see vercel.json) to put the public demo back to its seeded state,
// so one visitor's deletes don't break the demo for the next. Vercel sends
// `Authorization: Bearer $CRON_SECRET`; without CRON_SECRET set the route refuses everything.
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function authorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const given = Buffer.from(request.headers.get("authorization") ?? "");
  const expected = Buffer.from(`Bearer ${secret}`);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

export async function GET(request: Request) {
  if (!authorized(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  // DEMO_DISABLED=1 means the workspace holds real data: never wipe it.
  if (!demoEnabled) {
    return Response.json({ error: "The demo is disabled here." }, { status: 409 });
  }

  try {
    await sql.begin((tx) => writeDemoWorkspace(tx, demoAccount));
  } catch (error) {
    console.error("Demo reset failed", error);
    return Response.json({ error: "Reset failed" }, { status: 500 });
  }

  revalidatePath("/", "layout");
  const summary = await workspaceSummary(sql);
  console.log("Demo reset", summary);
  return Response.json({ ok: true, ...summary });
}
