import { ActionFeedback } from "@/components/action-feedback";
import { AppShell } from "@/components/app-shell";
import { Panel } from "@/components/panel";
import { PageIntro } from "@/components/page-intro";
import { requireAdmin } from "@/lib/auth";
import { ROUTES } from "@/lib/constants";
import { getActionFeedback, type SearchParams } from "@/lib/page-params";
import { updateUserSubscriptionStatusAction } from "@/server/actions/admin-actions";
import { listUsersForAdmin } from "@/server/services/user-service";

type AdminUsersPageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function AdminUsersPage({ searchParams }: AdminUsersPageProps) {
  const session = await requireAdmin();
  const [params, users] = await Promise.all([searchParams, listUsersForAdmin()]);
  const feedback = getActionFeedback(params);

  return (
    <AppShell role={session.role} currentPath={ROUTES.adminUsers} authenticated>
      <PageIntro
        title="User Management"
        subtitle="Update subscription status and review member score activity."
      >
        {feedback ? <ActionFeedback message={feedback.message} tone={feedback.tone} /> : null}
      </PageIntro>

      <Panel title="Registered Users">
        <div className="space-y-4">
          {users.map((user) => {
            const currentSubscription = user.subscriptions[0];
            return (
              <article key={user.id} className="rounded-2xl border border-[#dce8f6] bg-[#f8fbff] p-4">
                <p className="text-sm font-semibold text-[#0b4167]">
                  {user.fullName} ({user.email})
                </p>
                <p className="mt-1 text-xs text-[#55768e]">
                  Role: {user.role} - Joined {user.createdAt.toLocaleDateString()}
                </p>
                <p className="mt-1 text-xs text-[#55768e]">
                  Charity: {user.charityPreference?.charity?.name ?? "Not selected"} -{" "}
                  {user.charityPreference?.contributionPercent ?? 0}% contribution
                </p>

                <form
                  action={updateUserSubscriptionStatusAction}
                  className="mt-3 flex flex-wrap items-center gap-2"
                >
                  <input type="hidden" name="userId" value={user.id} />
                  <select
                    name="status"
                    defaultValue={currentSubscription?.status ?? "ACTIVE"}
                    className="px-3 py-2 text-sm"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="LAPSED">LAPSED</option>
                    <option value="CANCELED">CANCELED</option>
                  </select>
                  <button
                    type="submit"
                    className="btn-secondary rounded-xl px-3 py-2 text-sm"
                  >
                    Save Status
                  </button>
                </form>

                <div className="mt-3 text-xs text-[#587992]">
                  Latest scores:{" "}
                  {user.scores.length > 0
                    ? user.scores
                        .map((score) => `${score.score} (${score.playedOn.toLocaleDateString()})`)
                        .join(" - ")
                    : "No scores"}
                </div>
              </article>
            );
          })}
          {users.length === 0 ? (
            <p className="rounded-2xl border border-[#dce8f6] bg-[#f8fbff] px-3 py-3 text-sm text-[#4d6f87]">
              No users registered yet.
            </p>
          ) : null}
        </div>
      </Panel>
    </AppShell>
  );
}
