import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Panel } from "@/components/panel";
import { PageIntro } from "@/components/page-intro";
import { StatCard } from "@/components/stat-card";
import { requireAdmin } from "@/lib/auth";
import { ROUTES } from "@/lib/constants";
import { toCurrency } from "@/lib/utils";
import { getAdminAnalytics } from "@/server/services/analytics-service";

export default async function AdminHomePage() {
  const session = await requireAdmin();
  const analytics = await getAdminAnalytics();

  return (
    <AppShell role={session.role} currentPath={ROUTES.admin} authenticated>
      <PageIntro
        title="Admin Dashboard"
        subtitle="Control users, draws, charities, winner verification, and payout progression."
      />

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <StatCard label="Total Users" value={String(analytics.totalUsers)} />
        <StatCard
          label="Active Subscribers"
          value={String(analytics.activeSubscribers)}
        />
        <StatCard label="Draw Cycles" value={String(analytics.totalDraws)} />
        <StatCard
          label="Published Pool Value"
          value={toCurrency(analytics.totalPrizePool)}
        />
        <StatCard
          label="Total Charity Funds"
          value={toCurrency(analytics.totalCharityContributions)}
        />
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <Panel title="Admin Modules">
          <ul className="space-y-2 text-sm text-[#3e6078]">
            <li className="rounded-xl border border-[#dce8f6] bg-[#f8fbff] px-3 py-2">
              <Link href={ROUTES.adminDraws} className="font-semibold text-[#0a74b5]">
                Draw Management
              </Link>{" "}
              - run simulation, switch mode, publish monthly outcomes.
            </li>
            <li className="rounded-xl border border-[#dce8f6] bg-[#f8fbff] px-3 py-2">
              <Link href={ROUTES.adminCharities} className="font-semibold text-[#0a74b5]">
                Charity Management
              </Link>{" "}
              - add/edit/archive charities and highlight featured organizations.
            </li>
            <li className="rounded-xl border border-[#dce8f6] bg-[#f8fbff] px-3 py-2">
              <Link href={ROUTES.adminWinners} className="font-semibold text-[#0a74b5]">
                Winner Verification
              </Link>{" "}
              - review proofs, approve/reject, and mark payouts completed.
            </li>
            <li className="rounded-xl border border-[#dce8f6] bg-[#f8fbff] px-3 py-2">
              <Link href={ROUTES.adminUsers} className="font-semibold text-[#0a74b5]">
                User Management
              </Link>{" "}
              - view users, latest scores, and subscription statuses.
            </li>
          </ul>
        </Panel>

        <Panel title="Charity Contribution Leaderboard">
          <ul className="space-y-2 text-sm text-[#3e6078]">
            {analytics.charityTotals.length > 0 ? (
              analytics.charityTotals.slice(0, 6).map((row) => (
                <li key={row.charityId} className="rounded-xl border border-[#dce8f6] bg-[#f8fbff] px-3 py-2">
                  {row.charityName}: <strong>{toCurrency(row.total)}</strong>
                </li>
              ))
            ) : (
              <li className="rounded-xl border border-[#dce8f6] bg-[#f8fbff] px-3 py-2">
                No contribution data yet.
              </li>
            )}
          </ul>
        </Panel>
      </section>
    </AppShell>
  );
}
