import { AdminPeopleTable } from "@/components/AdminPeopleTable";

export default function Home() {
  return (
    <div className="relative flex min-h-full flex-1 flex-col text-zinc-900 dark:text-zinc-100">
      {/* subtle ambient background */}
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-zinc-100 dark:bg-zinc-950"
        aria-hidden
      />
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_120%_80%_at_50%_-30%,rgba(13,148,136,0.14),transparent_55%)] dark:bg-[radial-gradient(ellipse_100%_60%_at_50%_-20%,rgba(45,212,191,0.12),transparent_50%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none fixed bottom-0 left-1/2 -z-10 h-[320px] w-[min(900px,100vw)] -translate-x-1/2 translate-y-1/2 rounded-full bg-teal-400/10 blur-3xl dark:bg-teal-400/5"
        aria-hidden
      />

      <header className="relative border-b border-zinc-200/90 bg-white/75 px-6 py-8 pb-10 backdrop-blur-xl dark:border-zinc-800/90 dark:bg-zinc-950/75 sm:px-8">
        <div className="mx-auto max-w-[1400px]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold tracking-widest text-teal-700 uppercase dark:text-teal-400">
                YPIT · Internal
              </p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl dark:text-white">
                Registrations
              </h1>
              <p className="mt-2 max-w-xl text-pretty text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                Read-only directory backed by the{" "}
                <code className="rounded-md border border-zinc-200 bg-zinc-50 px-1.5 py-0.5 text-[0.8em] font-medium text-zinc-800 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">
                  registrations
                </code>{" "}
                table. Sign in with your admin credentials, then open a row for
                the full record.
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2 sm:pt-1">
              <span className="rounded-full border border-zinc-200/80 bg-white/90 px-3 py-1 text-xs font-medium text-zinc-600 shadow-sm dark:border-zinc-700 dark:bg-zinc-900/90 dark:text-zinc-400">
                Secure session
              </span>
              <span className="rounded-full border border-teal-200/90 bg-teal-50 px-3 py-1 text-xs font-medium text-teal-900 shadow-sm dark:border-teal-800/80 dark:bg-teal-950/80 dark:text-teal-200">
                Live data
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-8 pb-16 sm:px-6 sm:py-10">
        <AdminPeopleTable />
      </main>
    </div>
  );
}
