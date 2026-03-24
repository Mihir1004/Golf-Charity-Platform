import { redirect } from "next/navigation";
import { ActionFeedback } from "@/components/action-feedback";
import { AppShell } from "@/components/app-shell";
import { Panel } from "@/components/panel";
import { PageIntro } from "@/components/page-intro";
import { requireSubscriber } from "@/lib/auth";
import { ROUTES } from "@/lib/constants";
import { getActionFeedback, type SearchParams } from "@/lib/page-params";
import { addScoreAction, updateScoreAction } from "@/server/actions/user-actions";
import { getLatestScores } from "@/server/services/score-service";
import { getActiveSubscription } from "@/server/services/subscription-service";

type ScoresPageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function ScoresPage({ searchParams }: ScoresPageProps) {
  const session = await requireSubscriber();

  const activeSubscription = await getActiveSubscription(session.userId);
  if (!activeSubscription) {
    redirect(`${ROUTES.dashboardSubscription}?error=subscription_required`);
  }

  const [params, scores] = await Promise.all([searchParams, getLatestScores(session.userId)]);
  const feedback = getActionFeedback(params);

  return (
    <AppShell role={session.role} currentPath={ROUTES.dashboardScores} authenticated maxWidthClass="max-w-5xl">
      <PageIntro
        title="Score Management"
        subtitle="Latest 5 scores are retained automatically and shown newest first."
      >
        {feedback ? <ActionFeedback message={feedback.message} tone={feedback.tone} /> : null}
      </PageIntro>

        <Panel
          title="Add New Score"
          subtitle="Stableford score between 1 and 45."
        >
          <form action={addScoreAction} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
            <input
              name="score"
              type="number"
              min={1}
              max={45}
              required
              placeholder="Score (1-45)"
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
              Add Score
            </button>
          </form>
        </Panel>

        <Panel title="Edit Existing Scores">
          <div className="space-y-3">
            {scores.length > 0 ? (
              scores.map((entry) => (
                <form
                  key={entry.id}
                  action={updateScoreAction}
                  className="grid items-center gap-3 rounded-2xl border border-[#d7ebf8] bg-[#f7fcff] p-3 sm:grid-cols-[auto_1fr_1fr_auto]"
                >
                  <input type="hidden" name="scoreId" value={entry.id} />
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#527188]">
                    {entry.playedOn.toLocaleDateString()}
                  </p>
                  <input
                    name="score"
                    type="number"
                    defaultValue={entry.score}
                    min={1}
                    max={45}
                    required
                    className="px-3 py-2"
                  />
                  <input
                    name="playedOn"
                    type="date"
                    required
                    defaultValue={entry.playedOn.toISOString().slice(0, 10)}
                    className="px-3 py-2"
                  />
                  <button
                    type="submit"
                    className="btn-secondary rounded-xl px-3 py-2 text-xs"
                  >
                    Update
                  </button>
                </form>
              ))
            ) : (
              <p className="rounded-2xl border border-[#dce8f6] bg-[#f8fbff] px-3 py-3 text-sm text-[#52667d]">
                No scores available yet.
              </p>
            )}
          </div>
        </Panel>
    </AppShell>
  );
}
