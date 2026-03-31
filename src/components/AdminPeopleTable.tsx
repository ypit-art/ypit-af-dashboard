"use client";

import * as Dialog from "@radix-ui/react-dialog";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";
import {
  getDisplayEmail,
  getDisplayName,
  registrationDetailEntries,
  type RegistrationRow,
} from "@/lib/registrationRowDisplay";

function formatColumnLabel(key: string): string {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatCell(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

const columnHelper = createColumnHelper<RegistrationRow>();

function TableIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.375 2.625a2.121 2.121 0 1 1 3 3L13 14l-4 1 1-4Z" />
    </svg>
  );
}

function LoadingSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200/90 bg-white/90 shadow-lg shadow-zinc-200/40 ring-1 ring-zinc-200/60 backdrop-blur-sm dark:border-zinc-800/90 dark:bg-zinc-950/90 dark:shadow-black/30 dark:ring-zinc-800/80">
      <div className="border-b border-zinc-100 bg-gradient-to-r from-zinc-50 to-white px-5 py-4 dark:border-zinc-800 dark:from-zinc-900/50 dark:to-zinc-950">
        <div className="h-3 w-48 rounded-md bg-zinc-200 skeleton-shimmer dark:bg-zinc-800" />
      </div>
      <div className="space-y-3 p-5">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="flex gap-4">
            <div className="h-4 flex-1 rounded-md bg-zinc-100 skeleton-shimmer dark:bg-zinc-800/80" />
            <div className="h-4 flex-1 rounded-md bg-zinc-100 skeleton-shimmer dark:bg-zinc-800/80" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminPeopleTable() {
  const [rows, setRows] = useState<RegistrationRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([
    { id: "name", desc: false },
  ]);
  const [selected, setSelected] = useState<RegistrationRow | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/registrations", {
          credentials: "include",
        });
        const json = (await res.json().catch(() => ({}))) as {
          error?: string;
          rows?: RegistrationRow[];
        };

        if (!res.ok) {
          throw new Error(json.error || res.statusText || "Request failed");
        }

        if (!cancelled) {
          setRows(json.rows ?? []);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof Error ? e.message : "Failed to load registrations",
          );
          setRows(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const safeRows = rows ?? [];

  const columns = useMemo(
    () => [
      columnHelper.accessor((row) => getDisplayName(row), {
        id: "name",
        header: "Name",
        sortingFn: "alphanumeric",
        cell: (info) => (
          <span className="font-medium text-zinc-900 dark:text-zinc-50">
            {String(info.getValue())}
          </span>
        ),
      }),
      columnHelper.accessor((row) => getDisplayEmail(row), {
        id: "email",
        header: "Email",
        sortingFn: "alphanumeric",
        cell: (info) => (
          <span className="text-zinc-600 dark:text-zinc-400">
            {String(info.getValue())}
          </span>
        ),
      }),
    ],
    [],
  );

  const table = useReactTable({
    data: safeRows,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getRowId: (row, index) => {
      const id = row.id;
      if (id !== null && id !== undefined && String(id).length > 0) {
        return String(id);
      }
      return `row-${index}`;
    },
  });

  function openDetails(row: RegistrationRow) {
    setSelected(row);
    setDialogOpen(true);
  }

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <div
        className="overflow-hidden rounded-2xl border border-red-200/90 bg-red-50/95 px-6 py-5 shadow-lg shadow-red-200/30 backdrop-blur-sm dark:border-red-900/60 dark:bg-red-950/50 dark:shadow-none"
        role="alert"
      >
        <div className="flex gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-700 dark:bg-red-950/80 dark:text-red-300">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4M12 16h.01" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-red-900 dark:text-red-100">
              Could not load data
            </p>
            <p className="mt-1 text-sm leading-relaxed text-red-800/90 dark:text-red-200/90">
              {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-zinc-200/90 bg-white/95 shadow-xl shadow-zinc-200/50 ring-1 ring-zinc-200/50 backdrop-blur-sm dark:border-zinc-800/90 dark:bg-zinc-950/95 dark:shadow-black/40 dark:ring-zinc-800/60">
        <div className="flex flex-col gap-3 border-b border-zinc-100 bg-gradient-to-br from-zinc-50/90 via-white to-teal-50/30 px-5 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800 dark:from-zinc-900/40 dark:via-zinc-950 dark:to-teal-950/20">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-100 text-teal-800 dark:bg-teal-950/80 dark:text-teal-300">
              <TableIcon className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {safeRows.length === 0
                  ? "No registrations yet"
                  : `${safeRows.length} registration${safeRows.length === 1 ? "" : "s"}`}
              </p>
              <p className="mt-0.5 text-xs text-zinc-600 dark:text-zinc-500">
                Sort columns with the headers. Select a row to view every
                field.
              </p>
            </div>
          </div>
          {safeRows.length > 0 ? (
            <span className="inline-flex items-center gap-1.5 self-start rounded-full border border-teal-200/80 bg-teal-50/90 px-2.5 py-1 text-[11px] font-medium text-teal-900 dark:border-teal-800/60 dark:bg-teal-950/50 dark:text-teal-200">
              <span
                className="h-1.5 w-1.5 rounded-full bg-teal-500"
                aria-hidden
              />
              Tap row for details
            </span>
          ) : null}
        </div>

        {safeRows.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 text-zinc-400 dark:border-zinc-700 dark:bg-zinc-900/40 dark:text-zinc-500">
              <TableIcon className="h-7 w-7" />
            </div>
            <p className="mt-4 text-sm font-medium text-zinc-700 dark:text-zinc-300">
              No rows to show
            </p>
            <p className="mt-1 max-w-sm text-sm text-zinc-500 dark:text-zinc-500">
              The registrations table is empty, or data could not be loaded.
              Check Supabase when you expect records here.
            </p>
          </div>
        ) : (
          <div className="max-w-full overflow-x-auto">
            <table className="w-full min-w-[400px] border-collapse text-left text-sm">
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr
                    key={headerGroup.id}
                    className="border-b border-zinc-200 bg-zinc-100/95 dark:border-zinc-800 dark:bg-zinc-900/80"
                  >
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="whitespace-nowrap px-5 py-3.5 text-xs font-semibold tracking-wide text-zinc-500 uppercase dark:text-zinc-400"
                      >
                        {header.isPlaceholder ? null : (
                          <button
                            type="button"
                            className="group inline-flex cursor-pointer select-none items-center gap-1.5 rounded-lg px-2 py-1 text-left text-zinc-700 transition-colors hover:bg-zinc-200/80 hover:text-zinc-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/60 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white"
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                            {header.column.getCanSort() ? (
                              <span
                                className="text-zinc-400 transition-colors group-hover:text-teal-600 dark:group-hover:text-teal-400"
                                aria-hidden
                              >
                                {header.column.getIsSorted() === "asc"
                                  ? "↑"
                                  : header.column.getIsSorted() === "desc"
                                    ? "↓"
                                    : "↕"}
                              </span>
                            ) : null}
                          </button>
                        )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    role="button"
                    tabIndex={0}
                    className="cursor-pointer border-b border-zinc-100 transition-colors duration-150 last:border-0 odd:bg-white even:bg-zinc-50/70 hover:bg-teal-50/55 focus:outline-none focus-visible:bg-teal-50/60 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-500/50 dark:border-zinc-800/80 dark:odd:bg-zinc-950 dark:even:bg-zinc-900/35 dark:hover:bg-teal-950/25 dark:focus-visible:bg-teal-950/30"
                    onClick={() => openDetails(row.original)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        openDetails(row.original);
                      }
                    }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="max-w-[min(100vw,420px)] truncate px-5 py-3.5 leading-snug"
                        title={String(cell.getValue())}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog.Root
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setSelected(null);
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-zinc-950/55 backdrop-blur-[2px]" />
          <Dialog.Content className="fixed top-1/2 left-1/2 z-50 max-h-[85vh] w-[calc(100vw-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-zinc-200/95 bg-white p-0 shadow-2xl shadow-zinc-300/40 ring-1 ring-zinc-200/80 dark:border-zinc-700/90 dark:bg-zinc-950 dark:shadow-black/60 dark:ring-zinc-800">
            <div className="h-1 w-full bg-gradient-to-r from-teal-500 via-emerald-500 to-cyan-500 dark:from-teal-400 dark:via-emerald-400 dark:to-cyan-400" />
            <div className="relative p-6 pb-5">
              <Dialog.Close
                type="button"
                className="absolute top-4 right-4 flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                aria-label="Close"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </Dialog.Close>
              <Dialog.Title className="pr-10 text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                Registration details
              </Dialog.Title>
              <Dialog.Description className="sr-only">
                All fields for the selected registration
              </Dialog.Description>
            </div>

            {selected ? (
              <div className="border-t border-zinc-100 px-6 pb-6 dark:border-zinc-800">
                <dl className="grid gap-1">
                  {registrationDetailEntries(selected).map(([key, value], i) => (
                    <div
                      key={key}
                      className={`grid gap-1 py-3 sm:grid-cols-[minmax(0,10.5rem)_1fr] sm:gap-4 ${i !== 0 ? "border-t border-zinc-100 dark:border-zinc-800/80" : ""}`}
                    >
                      <dt className="text-[11px] font-semibold tracking-wide text-zinc-500 uppercase dark:text-zinc-500">
                        {formatColumnLabel(key)}
                      </dt>
                      <dd className="font-mono text-sm break-words text-zinc-900 tabular-nums dark:text-zinc-200">
                        {formatCell(value)}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            ) : null}

            <div className="flex justify-end border-t border-zinc-100 bg-zinc-50/90 px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900/50">
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="inline-flex h-10 cursor-pointer items-center justify-center rounded-xl bg-teal-600 px-5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-teal-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 dark:bg-teal-600 dark:hover:bg-teal-500 dark:focus-visible:ring-offset-zinc-950"
                >
                  Done
                </button>
              </Dialog.Close>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
