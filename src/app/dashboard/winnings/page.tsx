import { redirect } from "next/navigation";
import { ActionFeedback } from "@/components/action-feedback";
import { AppShell } from "@/components/app-shell";
import { Panel } from "@/components/panel";
import { PageIntro } from "@/components/page-intro";
import { requireSubscriber } from "@/lib/auth";
import { ROUTES } from "@/lib/constants";
import { getActionFeedback, type SearchParams } from "@/lib/page-params";
import { toCurrency } from "@/lib/utils";
import { submitProofAction } from "@/server/actions/user-actions";
import { getActiveSubscription } from "@/server/services/subscription-service";
import { getUserWinnings } from "@/server/services/winner-service";

type WinningsPageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function WinningsPage({ searchParams }: WinningsPageProps) {
  const session = await requireSubscriber();

  const activeSubscription = await getActiveSubscription(session.userId);
  if (!activeSubscription) {
    redirect(`${ROUTES.dashboardSubscription}?error=subscription_required`);
  }

  const [params, winnings] = await Promise.all([
    searchParams,
    getUserWinnings(session.userId),
  ]);
  const feedback = getActionFeedback(params);
  const totalWon = winnings.reduce((sum, row) => sum + Number(row.prizeAmount), 0);

  return (
    <AppShell
      role={session.role}
      currentPath={ROUTES.dashboardWinnings}
      authenticated
      maxWidthClass="max-w-5xl"
    >
      <PageIntro
        title="Winnings Overview"
        subtitle={`Track all payouts and verification updates. Total won: ${toCurrency(totalWon)}`}
      >
        {feedback ? <ActionFeedback message={feedback.message} tone={feedback.tone} /> : null}
      </PageIntro>

      <Panel title="Winning Entries">
        <div className="space-y-3">
          {winnings.length > 0 ? (
            winnings.map((win) => (
              <article key={win.id} className="rounded-2xl border border-[#dce8f6] bg-[#f8fbff] p-4">
                <p className="text-sm font-semibold text-[#0b4167]">
                  {win.draw.monthKey} draw - Match {win.matchedCount}
                </p>
                <p className="mt-1 text-sm text-[#476b84]">
                  Prize: <strong>{toCurrency(Number(win.prizeAmount))}</strong> - Verification{" "}
                  {win.verificationStatus} - Payout {win.payoutStatus ?? "N/A"}
                </p>

                <form action={submitProofAction} className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto]">
                  <input type="hidden" name="drawResultId" value={win.id} />
                  <input
                    name="proofUrl"
                    type="url"
                    required
                    placeholder="Proof URL (screenshot link)"
                    defaultValue={win.proof?.proofUrl ?? ""}
                    className="px-3 py-2"
                  />
                  <button
                    type="submit"
                    className="btn-primary rounded-xl px-4 py-2 text-sm"
                  >
                    Submit Proof
                  </button>
                </form>
              </article>
            ))
          ) : (
            <p className="rounded-2xl border border-[#dce8f6] bg-[#f8fbff] px-3 py-3 text-sm text-[#4e6d85]">
              No winnings yet. You will see match results here once draws are run.
            </p>
          )}
        </div>
      </Panel>
    </AppShell>
  );
}
