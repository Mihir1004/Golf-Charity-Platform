import { ActionFeedback } from "@/components/action-feedback";
import { AppShell } from "@/components/app-shell";
import { Panel } from "@/components/panel";
import { PageIntro } from "@/components/page-intro";
import { requireAdmin } from "@/lib/auth";
import { ROUTES } from "@/lib/constants";
import { getActionFeedback, type SearchParams } from "@/lib/page-params";
import { toCurrency } from "@/lib/utils";
import { markPaidAction, reviewWinnerAction } from "@/server/actions/admin-actions";
import { listWinnersForAdmin } from "@/server/services/winner-service";

type AdminWinnersPageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function AdminWinnersPage({
  searchParams,
}: AdminWinnersPageProps) {
  const session = await requireAdmin();
  const [params, winners] = await Promise.all([searchParams, listWinnersForAdmin()]);
  const feedback = getActionFeedback(params);

  return (
    <AppShell role={session.role} currentPath={ROUTES.adminWinners} authenticated>
      <PageIntro
        title="Winner Verification"
        subtitle="Review proof submissions, approve results, and track payouts."
      >
        {feedback ? <ActionFeedback message={feedback.message} tone={feedback.tone} /> : null}
      </PageIntro>

      <Panel title="Winner Queue">
        <div className="space-y-4">
          {winners.length > 0 ? (
            winners.map((win) => (
              <article key={win.id} className="rounded-2xl border border-[#dce8f6] bg-[#f8fbff] p-4">
                <p className="text-sm font-semibold text-[#0b4167]">
                  {win.user.fullName} ({win.user.email}) - {win.draw.monthKey} - Match{" "}
                  {win.matchedCount}
                </p>
                <p className="mt-1 text-sm text-[#4c6d85]">
                  Prize {toCurrency(Number(win.prizeAmount))} - Verification{" "}
                  {win.verificationStatus} - Payout {win.payoutStatus ?? "N/A"}
                </p>
                <p className="mt-1 text-xs text-[#567790]">
                  Proof:{" "}
                  {win.proof?.proofUrl ? (
                    <a
                      href={win.proof.proofUrl}
                      className="font-semibold text-[#0a74b5] underline"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open proof
                    </a>
                  ) : (
                    "Not submitted"
                  )}
                </p>

                <form action={reviewWinnerAction} className="mt-3 grid gap-2 md:grid-cols-[1fr_auto_auto]">
                  <input type="hidden" name="drawResultId" value={win.id} />
                  <input
                    name="reviewNotes"
                    placeholder="Review notes"
                    className="px-3 py-2"
                  />
                  <button
                    name="decision"
                    value="APPROVED"
                    className="rounded-xl bg-[#0a8d54] px-3 py-2 text-sm font-semibold text-white hover:bg-[#06693f]"
                  >
                    Approve
                  </button>
                  <button
                    name="decision"
                    value="REJECTED"
                    className="rounded-xl bg-[#8b2f1e] px-3 py-2 text-sm font-semibold text-white hover:bg-[#692315]"
                  >
                    Reject
                  </button>
                </form>

                <form action={markPaidAction} className="mt-2">
                  <input type="hidden" name="drawResultId" value={win.id} />
                  <button
                    type="submit"
                    className="rounded-xl border border-[#0b4d78] px-3 py-1.5 text-xs font-semibold text-[#0b4d78] hover:bg-[#dff2ff]"
                  >
                    Mark Paid
                  </button>
                </form>
              </article>
            ))
          ) : (
            <p className="rounded-2xl border border-[#dce8f6] bg-[#f8fbff] px-3 py-3 text-sm text-[#4d6f87]">
              No winners found yet.
            </p>
          )}
        </div>
      </Panel>
    </AppShell>
  );
}
