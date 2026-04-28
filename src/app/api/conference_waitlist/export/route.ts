import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { ADMIN_TABLE_CONFERENCE_WAITLIST } from "@/lib/adminTables";
import { encodeCsvRows } from "@/lib/csvEscape";
import { fetchAllRowsForExport } from "@/lib/tableExportFetch";
import type { RegistrationRow } from "@/lib/registrationRowDisplay";
import {
  getDisplayEmail,
  getDisplayName,
} from "@/lib/registrationRowDisplay";

function buildSheetRows(rows: RegistrationRow[]): string[][] {
  return [
    ["Name", "Email"],
    ...rows.map((row) => [getDisplayName(row), getDisplayEmail(row)]),
  ];
}

export async function GET(request: NextRequest) {
  try {
    const format =
      request.nextUrl.searchParams.get("format")?.toLowerCase() ?? "xlsx";

    const { rows, error } = await fetchAllRowsForExport(
      ADMIN_TABLE_CONFERENCE_WAITLIST,
    );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const aoa = buildSheetRows(rows);
    const stamp = new Date().toISOString().slice(0, 10);

    if (format === "csv") {
      const csv = encodeCsvRows(aoa);
      const filename = `conference-waitlist-export-${stamp}.csv`;
      const headers = new Headers();
      headers.set(
        "Content-Type",
        "text/csv; charset=utf-8",
      );
      headers.set(
        "Content-Disposition",
        `attachment; filename="${filename}"`,
      );
      return new NextResponse(csv, { status: 200, headers });
    }

    if (format !== "xlsx") {
      return NextResponse.json(
        { error: 'Invalid format. Use "xlsx" or "csv".' },
        { status: 400 },
      );
    }

    const sheet = XLSX.utils.aoa_to_sheet(aoa);

    sheet["!cols"] = [{ wch: 36 }, { wch: 40 }];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, sheet, "Waitlist");

    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    const filename = `conference-waitlist-export-${stamp}.xlsx`;

    const headers = new Headers();
    headers.set(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    headers.set(
      "Content-Disposition",
      `attachment; filename="${filename}"`,
    );

    return new NextResponse(buffer, { status: 200, headers });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
