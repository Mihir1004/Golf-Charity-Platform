import { ActionFeedback } from "@/components/action-feedback";
import { AppShell } from "@/components/app-shell";
import { Panel } from "@/components/panel";
import { PageIntro } from "@/components/page-intro";
import { requireAdmin } from "@/lib/auth";
import { ROUTES } from "@/lib/constants";
import { getActionFeedback, type SearchParams } from "@/lib/page-params";
import { toCurrency, toMonthKey } from "@/lib/utils";
import { runDrawAction } from "@/server/actions/admin-actions";
import { listRecentDraws } from "@/server/services/draw-service";

type DrawsPageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function AdminDrawsPage({ searchParams }: DrawsPageProps) {
  const session = await requireAdmin();
  const [params, draws] = await Promise.all([searchParams, listRecentDraws()]);
  const feedback = getActionFeedback(params);

  return (
    <AppShell role={session.role} currentPath={ROUTES.adminDraws} authenticated>
      <PageIntro
        title="Draw Management"
        subtitle="Run simulation cycles and publish monthly results."
      >
        {feedback ? <ActionFeedback message={feedback.message} tone={feedback.tone} /> : null}
      </PageIntro>

      <Panel title="Run Draw" subtitle="Set month and mode before executing.">
        <form action={runDrawAction} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto_auto]">
          <input
            name="monthKey"
            defaultValue={toMonthKey(new Date())}
            pattern="\d{4}-\d{2}"
            required
            className="px-3 py-2"
          />
          <select name="mode" className="px-3 py-2">
            <option value="RANDOM">Random Draw</option>
            <option value="ALGORITHMIC">Algorithmic Draw</option>
          </select>
          <label className="flex items-center gap-2 rounded-xl border border-[#d2e8f8] bg-[#f8fbff] px-3 py-2 text-sm text-[#456a82]">
            <input name="publishNow" type="checkbox" />
            Publish now
          </label>
          <button
            type="submit"
            className="btn-primary rounded-xl px-4 py-2 text-sm"
          >
            Run Draw
          </button>
        </form>
      </Panel>

      <Panel title="Recent Draw Cycles">
        <div className="space-y-4">
          {draws.length > 0 ? (
            draws.map((draw) => (
              <article key={draw.id} className="rounded-2xl border border-[#dce8f6] bg-[#f8fbff] p-4">
                <p className="text-sm font-semibold text-[#0b4167]">
                  {draw.monthKey} - {draw.mode} - {draw.status}
                </p>
                <p className="mt-1 text-sm text-[#4b6d85]">
                  Numbers: {(draw.winningNumbers as number[]).join(", ")} - Pool:{" "}
                  {toCurrency(Number(draw.totalPool))}
                </p>
                <ul className="mt-3 space-y-1 text-xs text-[#4d6f87]">
                  {draw.results.slice(0, 5).map((result) => (
                    <li key={result.id}>
                      {result.user.fullName} ({result.user.email}) matched {result.matchedCount} -{" "}
                      {toCurrency(Number(result.prizeAmount))}
                    </li>
                  ))}
                  {draw.results.length === 0 ? <li>No winners for this cycle yet.</li> : null}
                </ul>
              </article>
            ))
          ) : (
            <p className="rounded-2xl border border-[#dce8f6] bg-[#f8fbff] px-3 py-3 text-sm text-[#4d6f87]">
              No draw cycles run yet.
            </p>
          )}
        </div>
      </Panel>
    </AppShell>
  );
}
