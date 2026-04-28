import { createAdminClient } from "@/lib/supabaseAdmin";

type Supabase = ReturnType<typeof createAdminClient>;

/** Paginated read with stable ordering fallbacks + total count */
export async function queryTablePage(
  supabase: Supabase,
  table: string,
  from: number,
  to: number,
): Promise<{
  data: Record<string, unknown>[] | null;
  error: { message: string } | null;
  count: number | null;
}> {
  const attempts = [
    () =>
      supabase
        .from(table)
        .select("*", { count: "exact" })
        .order("id", { ascending: true })
        .range(from, to),
    () =>
      supabase
        .from(table)
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(from, to),
    () =>
      supabase
        .from(table)
        .select("*", { count: "exact" })
        .range(from, to),
  ];

  let lastError: { message: string } | null = null;

  for (const run of attempts) {
    const { data, error, count } = await run();
    if (!error) {
      return {
        data: (data ?? []) as Record<string, unknown>[],
        error: null,
        count: count ?? null,
      };
    }
    lastError = error;
  }

  return { data: null, error: lastError, count: null };
}
