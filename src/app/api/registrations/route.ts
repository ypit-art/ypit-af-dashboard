import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabaseAdmin";

const DEFAULT_PAGE_SIZE = 25;
const MAX_PAGE_SIZE = 100;

async function queryRegistrationsPage(
  supabase: ReturnType<typeof createAdminClient>,
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
        .from("registrations")
        .select("*", { count: "exact" })
        .order("id", { ascending: true })
        .range(from, to),
    () =>
      supabase
        .from("registrations")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(from, to),
    () =>
      supabase
        .from("registrations")
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

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const pageRaw = parseInt(searchParams.get("page") ?? "1", 10);
    const pageSizeRaw = parseInt(
      searchParams.get("pageSize") ?? String(DEFAULT_PAGE_SIZE),
      10,
    );

    const page = Number.isFinite(pageRaw) && pageRaw >= 1 ? pageRaw : 1;
    const pageSize = Number.isFinite(pageSizeRaw)
      ? Math.min(MAX_PAGE_SIZE, Math.max(1, pageSizeRaw))
      : DEFAULT_PAGE_SIZE;

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const supabase = createAdminClient();
    let rangeFrom = from;
    let rangeTo = to;

    const first = await queryRegistrationsPage(
      supabase,
      rangeFrom,
      rangeTo,
    );

    if (first.error) {
      return NextResponse.json({ error: first.error.message }, { status: 500 });
    }

    let rows = first.data ?? [];
    const totalCount = first.count ?? 0;
    const totalPages =
      totalCount === 0 ? 1 : Math.ceil(totalCount / pageSize);

    let effectivePage = page;
    if (totalCount > 0 && page > totalPages) {
      effectivePage = totalPages;
      rangeFrom = (effectivePage - 1) * pageSize;
      rangeTo = rangeFrom + pageSize - 1;
      const retry = await queryRegistrationsPage(supabase, rangeFrom, rangeTo);
      if (retry.error) {
        return NextResponse.json(
          { error: retry.error.message },
          { status: 500 },
        );
      }
      rows = retry.data ?? [];
    }

    const hasNextPage = effectivePage < totalPages;
    const hasPreviousPage = effectivePage > 1;

    const rangeStart =
      totalCount === 0 ? 0 : Math.min(rangeFrom + 1, totalCount);
    const rangeEnd =
      totalCount === 0 ? 0 : Math.min(rangeFrom + rows.length, totalCount);

    return NextResponse.json({
      rows,
      page: effectivePage,
      pageSize,
      totalCount,
      totalPages,
      hasNextPage,
      hasPreviousPage,
      rangeStart,
      rangeEnd,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
