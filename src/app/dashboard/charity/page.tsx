import { redirect } from "next/navigation";
import { ActionFeedback } from "@/components/action-feedback";
import { AppShell } from "@/components/app-shell";
import { Panel } from "@/components/panel";
import { PageIntro } from "@/components/page-intro";
import { requireSubscriber } from "@/lib/auth";
import { ROUTES } from "@/lib/constants";
import { getActionFeedback, type SearchParams } from "@/lib/page-params";
import { toCurrency } from "@/lib/utils";
import {
  donateIndependentlyAction,
  updateCharityPreferenceAction,
} from "@/server/actions/user-actions";
import {
  getUserCharityPreference,
  listActiveCharities,
} from "@/server/services/charity-service";
import { getActiveSubscription } from "@/server/services/subscription-service";

type CharityPageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function CharityPage({ searchParams }: CharityPageProps) {
  const session = await requireSubscriber();

  const activeSubscription = await getActiveSubscription(session.userId);
  if (!activeSubscription) {
    redirect(`${ROUTES.dashboardSubscription}?error=subscription_required`);
  }

  const [params, charities, preference] = await Promise.all([
    searchParams,
    listActiveCharities(),
    getUserCharityPreference(session.userId),
  ]);
  const feedback = getActionFeedback(params);

  return (
    <AppShell role={session.role} currentPath={ROUTES.dashboardCharity} authenticated maxWidthClass="max-w-5xl">
      <PageIntro
        title="Charity Preferences"
        subtitle="Choose where your contribution goes and add independent donations."
      >
        {feedback ? <ActionFeedback message={feedback.message} tone={feedback.tone} /> : null}
      </PageIntro>

        <Panel
          title="Charity Preference"
          subtitle="Minimum contribution is 10% of your subscription fee."
        >
          <form action={updateCharityPreferenceAction} className="grid gap-3 sm:grid-cols-3">
            <select
              name="charityId"
              defaultValue={preference?.charityId ?? ""}
              required
              className="px-3 py-2"
            >
              <option value="" disabled>
                Select a charity
              </option>
              {charities.map((charity) => (
                <option key={charity.id} value={charity.id}>
                  {charity.name}
                </option>
              ))}
            </select>
            <input
              name="contributionPercent"
              type="number"
              min={10}
              max={90}
              defaultValue={preference?.contributionPercent ?? 12}
              className="px-3 py-2"
            />
            <button
              type="submit"
              className="btn-primary rounded-xl px-4 py-2 text-sm"
            >
              Save Preference
            </button>
          </form>

          {preference ? (
            <p className="mt-4 text-sm text-[#476b84]">
              Current setup:{" "}
              <span className="font-semibold text-[#0b4d78]">{preference.charity.name}</span>{" "}
              at <span className="font-semibold">{preference.contributionPercent}%</span>.
            </p>
          ) : null}
        </Panel>

        <Panel
          title="Independent Donation"
          subtitle="Donate without affecting draw participation."
        >
          <form action={donateIndependentlyAction} className="grid gap-3 sm:grid-cols-3">
            <select
              name="charityId"
              defaultValue={preference?.charityId ?? ""}
              required
              className="px-3 py-2"
            >
              <option value="" disabled>
                Select charity
              </option>
              {charities.map((charity) => (
                <option key={charity.id} value={charity.id}>
                  {charity.name}
                </option>
              ))}
            </select>
            <input
              name="amount"
              type="number"
              step="0.01"
              min={1}
              required
              placeholder="Amount"
              className="px-3 py-2"
            />
            <button
              type="submit"
              className="btn-secondary rounded-xl px-4 py-2 text-sm"
            >
              Donate Now
            </button>
          </form>
          <p className="mt-4 text-sm text-[#56758d]">
            Tip: combine a subscription contribution with one-time gifts for special events.
          </p>
        </Panel>

        <Panel title="Charity Directory">
          <div className="grid gap-3 sm:grid-cols-2">
            {charities.map((charity) => (
              <article key={charity.id} className="rounded-2xl border border-[#dce8f6] bg-[#f8fbff] p-4">
                <h3 className="text-lg font-semibold text-[#112942]">{charity.name}</h3>
                <p className="mt-2 text-sm leading-6 text-[#566b81]">{charity.description}</p>
                <p className="mt-3 text-xs uppercase tracking-[0.12em] text-[#60788f]">
                  Featured: {charity.isFeatured ? "Yes" : "No"}
                </p>
              </article>
            ))}
            {charities.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-[#c9dfee] px-4 py-5 text-sm text-[#5f7d93]">
                No charities available yet. Admin can add from charity management.
              </p>
            ) : null}
          </div>
          <p className="mt-3 text-xs text-[#64839a]">
            Suggested first independent donation: {toCurrency(15)}.
          </p>
        </Panel>
    </AppShell>
  );
}
