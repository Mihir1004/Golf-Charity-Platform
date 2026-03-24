import Link from "next/link";
import { ActionFeedback } from "@/components/action-feedback";
import { AppShell } from "@/components/app-shell";
import { Panel } from "@/components/panel";
import { PageIntro } from "@/components/page-intro";
import { StatCard } from "@/components/stat-card";
import { requireSubscriber } from "@/lib/auth";
import { ROUTES } from "@/lib/constants";
import { getActionFeedback, type SearchParams } from "@/lib/page-params";
import { toCurrency } from "@/lib/utils";
import { addScoreAction } from "@/server/actions/user-actions";
import { listRecentDraws } from "@/server/services/draw-service";
import { getUserDashboardSnapshot } from "@/server/services/user-service";

type DashboardPageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const session = await requireSubscriber();
  const feedback = getActionFeedback(await searchParams);

  const [snapshot, draws] = await Promise.all([
    getUserDashboardSnapshot(session.userId),
    listRecentDraws(),
  ]);
  const hasActiveSubscription = Boolean(snapshot.activeSubscription);

  return (
    <AppShell role={session.role} currentPath={ROUTES.dashboard} authenticated>
        <PageIntro
          title={`Welcome, ${snapshot.user.fullName}`}
          subtitle="Track scores, manage subscription, and monitor your draw participation."
        >
          {feedback ? (
            <ActionFeedback message={feedback.message} tone={feedback.tone} />
          ) : null}
        </PageIntro>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Subscription"
            value={snapshot.activeSubscription ? snapshot.activeSubscription.status : "INACTIVE"}
            hint={
              snapshot.activeSubscription
                ? `Renews ${snapshot.activeSubscription.renewalDate.toLocaleDateString()}`
                : "Choose a plan to unlock all features"
            }
          />
          <StatCard
            label="Scores Stored"
            value={`${snapshot.scores.length}/5`}
            hint="Latest scores retained automatically"
          />
          <StatCard
            label="Draws Entered"
            value={String(snapshot.drawsEntered)}
            hint="Based on published and simulated cycles"
          />
          <StatCard
            label="Total Won"
            value={toCurrency(snapshot.totalWon)}
            hint="Gross winnings before payout processing"
          />
        </section>

        {hasActiveSubscription ? (
          <section className="grid gap-6 lg:grid-cols-2">
            <Panel title="Quick Score Entry" subtitle="Stableford score between 1 and 45">
              <form action={addScoreAction} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
                <input
                  name="score"
                  type="number"
                  min={1}
                  max={45}
                  required
                  placeholder="Score"
                  className="px-3 py-2"
                />
                <input
                  name="playedOn"
                  type="date"
                  required
                  className="px-3 py-2"
                />
                <button
                  type="submit"
                  className="btn-primary rounded-xl px-4 py-2 text-sm"
                >
                  Save
                </button>
              </form>
              <ul className="mt-4 space-y-2 text-sm text-[#4f647a]">
                {snapshot.scores.length > 0 ? (
                  snapshot.scores.map((entry) => (
                    <li key={entry.id} className="rounded-xl border border-[#dce8f6] bg-[#f8fbff] px-3 py-2">
                      {entry.score} points on {entry.playedOn.toLocaleDateString()}
                    </li>
                  ))
                ) : (
                  <li className="rounded-xl border border-[#dce8f6] bg-[#f8fbff] px-3 py-2">
                    No scores yet. Add your first score to activate ticket tracking.
                  </li>
                )}
              </ul>
            </Panel>

            <Panel
              title="Recent Draw Participation"
              subtitle="Monthly results with verification and payout states"
            >
              <ul className="space-y-2 text-sm text-[#4f647a]">
                {snapshot.drawResults.length > 0 ? (
                  snapshot.drawResults.slice(0, 5).map((entry) => (
                    <li key={entry.id} className="rounded-xl border border-[#dce8f6] bg-[#f8fbff] px-3 py-2">
                      {entry.draw.monthKey}: matched {entry.matchedCount} number
                      {entry.matchedCount === 1 ? "" : "s"} - payout{" "}
                      {entry.payoutStatus ?? "N/A"}
                    </li>
                  ))
                ) : (
                  <li className="rounded-xl border border-[#dce8f6] bg-[#f8fbff] px-3 py-2">
                    No winnings yet. Keep your scores updated for monthly draws.
                  </li>
                )}
              </ul>
              <p className="mt-3 text-xs text-[#5d7388]">
                Latest draw cycle: {draws[0]?.monthKey ?? "No draw generated yet"}
              </p>
            </Panel>
          </section>
        ) : (
          <Panel
            title="Restricted Access Until Subscription"
            subtitle="Activate a plan to use score entry, draw participation, charity contribution, and winnings modules."
          >
            <Link
              href={ROUTES.dashboardSubscription}
              className="btn-primary inline-flex rounded-xl px-4 py-2 text-sm"
            >
              Activate Subscription
            </Link>
          </Panel>
        )}
    </AppShell>
  );
}
