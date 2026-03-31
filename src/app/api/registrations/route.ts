import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabaseAdmin";

const ROW_LIMIT = 2000;

export async function GET() {
  try {
    const supabase = createAdminClient();

    let result = await supabase
      .from("registrations")
      .select("*")
      .order("id", { ascending: true })
      .limit(ROW_LIMIT);

    if (result.error) {
      result = await supabase
        .from("registrations")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(ROW_LIMIT);
    }

    if (result.error) {
      result = await supabase.from("registrations").select("*").limit(ROW_LIMIT);
    }

    if (result.error) {
      return NextResponse.json(
        { error: result.error.message },
        { status: 500 },
      );
    }

    const rows = (result.data ?? []) as Record<string, unknown>[];
    return NextResponse.json({ rows, limit: ROW_LIMIT });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
