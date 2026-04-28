import type { RegistrationRow } from "@/lib/registrationRowDisplay";
import { createAdminClient } from "@/lib/supabaseAdmin";

export const MAX_EXPORT_ROWS = 10_000;

const CHUNK_SIZE = 500;

type SupabaseLike = ReturnType<typeof createAdminClient>;

async function fetchChunkNoCount(
  supabase: SupabaseLike,
  table: string,
  from: number,
  to: number,
): Promise<{
  data: Record<string, unknown>[] | null;
  error: { message: string } | null;
}> {
  const attempts = [
    () =>
      supabase
        .from(table)
        .select("*")
        .order("id", { ascending: true })
        .range(from, to),
    () =>
      supabase
        .from(table)
        .select("*")
        .order("created_at", { ascending: false })
        .range(from, to),
    () => supabase.from(table).select("*").range(from, to),
  ];

  let lastError: { message: string } | null = null;
  for (const run of attempts) {
    const { data, error } = await run();
    if (!error) {
      return { data: (data ?? []) as Record<string, unknown>[], error: null };
    }
    lastError = error;
  }
  return { data: null, error: lastError };
}

/** Full export for spreadsheets (chunks until empty or MAX_EXPORT_ROWS). */
export async function fetchAllRowsForExport(
  table: string,
): Promise<{
  rows: RegistrationRow[];
  error: { message: string } | null;
}> {
  const supabase = createAdminClient();
  const rows: RegistrationRow[] = [];

  let offset = 0;
  while (offset < MAX_EXPORT_ROWS) {
    const take = Math.min(CHUNK_SIZE, MAX_EXPORT_ROWS - offset);
    const rangeTo = offset + take - 1;
    const { data, error } = await fetchChunkNoCount(supabase, table, offset, rangeTo);

    if (error) return { rows: [], error };

    const chunk = data ?? [];
    if (chunk.length === 0) break;

    rows.push(...(chunk as RegistrationRow[]));

    if (chunk.length < take) break;

    offset += chunk.length;

    if (rows.length >= MAX_EXPORT_ROWS) break;
  }

  return { rows, error: null };
}
