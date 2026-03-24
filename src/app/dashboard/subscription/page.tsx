import { ActionFeedback } from "@/components/action-feedback";
import { AppShell } from "@/components/app-shell";
import { Panel } from "@/components/panel";
import { PageIntro } from "@/components/page-intro";
import { requireSubscriber } from "@/lib/auth";
import { ROUTES, SUBSCRIPTION_CONFIG } from "@/lib/constants";
import { getActionFeedback, type SearchParams } from "@/lib/page-params";
import { toCurrency } from "@/lib/utils";
import {
  cancelSubscriptionAction,
  subscribeAction,
} from "@/server/actions/user-actions";
import { getSubscriptionSummary } from "@/server/services/subscription-service";

type SubscriptionPageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function SubscriptionPage({
  searchParams,
}: SubscriptionPageProps) {
  const session = await requireSubscriber();

  const [params, summary] = await Promise.all([
    searchParams,
    getSubscriptionSummary(session.userId),
  ]);
  const feedback = getActionFeedback(params);

  return (
    <AppShell
      role={session.role}
      currentPath={ROUTES.dashboardSubscription}
      authenticated
      maxWidthClass="max-w-5xl"
    >
      <PageIntro title="Subscription Plans" subtitle="Activate one plan at a time.">
        {feedback ? <ActionFeedback message={feedback.message} tone={feedback.tone} /> : null}
      </PageIntro>

        <Panel title="Subscription Plans" subtitle="Activate one plan at a time.">
          <div className="grid gap-4 sm:grid-cols-2">
            <form action={subscribeAction} className="rounded-2xl border border-[#d8e5f4] bg-[#f8fbff] p-4">
              <input type="hidden" name="plan" value="MONTHLY" />
              <p className="text-xs uppercase tracking-[0.1em] text-[#5b7086]">Monthly</p>
              <p className="mt-1 text-3xl font-bold text-[#112942]">
                {toCurrency(SUBSCRIPTION_CONFIG.monthlyPrice)}
              </p>
              <p className="mt-2 text-sm text-[#5a6f84]">
                Flexible monthly billing with draw eligibility.
              </p>
              <button
                type="submit"
                className="btn-primary mt-4 w-full rounded-xl px-4 py-2 text-sm"
              >
                Choose Monthly
              </button>
            </form>

            <form action={subscribeAction} className="rounded-2xl border border-[#d8e5f4] bg-[#f8fbff] p-4">
              <input type="hidden" name="plan" value="YEARLY" />
              <p className="text-xs uppercase tracking-[0.1em] text-[#5b7086]">Yearly</p>
              <p className="mt-1 text-3xl font-bold text-[#112942]">
                {toCurrency(SUBSCRIPTION_CONFIG.yearlyPrice)}
              </p>
              <p className="mt-2 text-sm text-[#5a6f84]">
                Discounted annual plan with continuous access.
              </p>
              <button
                type="submit"
                className="btn-secondary mt-4 w-full rounded-xl px-4 py-2 text-sm"
              >
                Choose Yearly
              </button>
            </form>
          </div>
          {summary.active ? (
            <form action={cancelSubscriptionAction} className="mt-4">
              <button
                type="submit"
                className="rounded-xl border border-[#cc907d] bg-[#fff4f0] px-4 py-2 text-sm font-semibold text-[#8a2b15] hover:bg-[#ffe7df]"
              >
                Cancel Active Subscription
              </button>
            </form>
          ) : null}
        </Panel>

        <Panel title="Subscription History">
          <ul className="space-y-2 text-sm text-[#50657c]">
            {summary.history.length > 0 ? (
              summary.history.map((entry) => (
                <li key={entry.id} className="rounded-xl border border-[#dce8f6] bg-[#f8fbff] px-3 py-2">
                  {entry.plan} - {entry.status} - {toCurrency(Number(entry.amount))} - Renew
                  {` ${entry.renewalDate.toLocaleDateString()}`}
                </li>
              ))
            ) : (
              <li className="rounded-xl border border-[#dce8f6] bg-[#f8fbff] px-3 py-2">
                No subscription history yet.
              </li>
            )}
          </ul>
        </Panel>
    </AppShell>
  );
}
