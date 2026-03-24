import Link from "next/link";
import { UserRole } from "@prisma/client";
import { StatCard } from "@/components/stat-card";
import { TopNav } from "@/components/top-nav";
import { readSession } from "@/lib/auth";
import { ROUTES, SUBSCRIPTION_CONFIG } from "@/lib/constants";
import { toCurrency } from "@/lib/utils";
import { getFeaturedCharity, listActiveCharities } from "@/server/services/charity-service";
import { getActiveSubscriberCount } from "@/server/services/subscription-service";

export default async function HomePage() {
  const [sessionResult, featuredCharityResult, charitiesResult, activeSubscribersResult] =
    await Promise.allSettled([
      readSession(),
      getFeaturedCharity(),
      listActiveCharities(),
      getActiveSubscriberCount(),
    ]);

  const session = sessionResult.status === "fulfilled" ? sessionResult.value : null;
  const featuredCharity =
    featuredCharityResult.status === "fulfilled" ? featuredCharityResult.value : null;
  const charities = charitiesResult.status === "fulfilled" ? charitiesResult.value : [];
  const activeSubscribers =
    activeSubscribersResult.status === "fulfilled" ? activeSubscribersResult.value : 0;

  const primaryCta =
    session?.role === UserRole.ADMIN
      ? ROUTES.admin
      : session?.role === UserRole.SUBSCRIBER
        ? ROUTES.dashboard
        : ROUTES.register;
  const processSteps = [
    "Pick monthly or yearly membership to unlock the full experience.",
    "Track your latest 5 Stableford scores and keep your ticket active.",
    "Choose a charity preference and route a contribution automatically.",
    "Enter monthly draw cycles with transparent prize pool logic.",
    "Upload winner proof and follow payout status in real time.",
  ];

  return (
    <div className="min-h-screen">
      <TopNav
        role={session?.role}
        currentPath={ROUTES.home}
        authenticated={Boolean(session)}
      />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 pb-16 pt-10 sm:px-6">
        <section className="surface-card surface-card-hover animate-rise grid gap-8 overflow-hidden bg-gradient-to-br from-white via-[#f3f8ff] to-[#fff6e8] p-8 md:grid-cols-[1.2fr_0.8fr]">
          <div className="relative animate-rise motion-delay-1">
            <span className="eyebrow animate-fade motion-delay-2">Golf + Charity Platform</span>
            <h1 className="mt-4 max-w-2xl text-4xl font-bold leading-tight text-[#0f253d] sm:text-5xl">
              Play better golf while funding meaningful impact.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[#586e84] sm:text-lg">
              A premium subscription experience for golfers: track performance, enter
              monthly prize draws, and route contributions to verified charities through a
              transparent dashboard.
            </p>
            <div className="stagger-rise mt-6 flex flex-wrap gap-3">
              <Link href={primaryCta} className="btn-primary text-sm">
                Open Platform
              </Link>
              <Link href={ROUTES.login} className="btn-secondary text-sm">
                Sign In
              </Link>
            </div>
          </div>
          <div className="surface-card animate-rise motion-delay-3 rounded-2xl border border-[#d7e4f3] bg-white/95 p-5 shadow-[0_22px_38px_-26px_rgba(14,34,55,0.5)]">
            <h2 className="text-lg font-semibold text-[#112941]">Live Prize Engine</h2>
            <p className="mt-1 text-sm text-[#5a6f85]">
              Tier distribution with rollover protection:
            </p>
            <ul className="stagger-rise mt-4 space-y-2 text-sm">
              <li className="flex items-center justify-between rounded-xl bg-[#f1f6ff] px-3 py-2 text-[#1a3853]">
                <span>5-match jackpot</span>
                <strong>40%</strong>
              </li>
              <li className="flex items-center justify-between rounded-xl bg-[#f1f6ff] px-3 py-2 text-[#1a3853]">
                <span>4-match winners</span>
                <strong>35%</strong>
              </li>
              <li className="flex items-center justify-between rounded-xl bg-[#f1f6ff] px-3 py-2 text-[#1a3853]">
                <span>3-match winners</span>
                <strong>25%</strong>
              </li>
            </ul>
            <p className="mt-4 rounded-xl border border-[#dce8f6] bg-[#f8fbff] px-3 py-2 text-xs text-[#60768d]">
              If no jackpot winner exists, the 5-match pool carries into the next draw.
            </p>
          </div>
        </section>

        <section className="stagger-rise grid gap-4 sm:grid-cols-3">
          <StatCard
            label="Active Subscribers"
            value={String(activeSubscribers)}
            hint="Participants currently eligible for monthly draw cycles."
          />
          <StatCard
            label="Minimum Charity Share"
            value={`${SUBSCRIPTION_CONFIG.minimumCharityPercent}%`}
            hint="Configurable per member with safe contribution limits."
          />
          <StatCard
            label="Yearly Plan"
            value={toCurrency(SUBSCRIPTION_CONFIG.yearlyPrice)}
            hint="Best-value plan for uninterrupted access and entries."
          />
        </section>

        <section className="stagger-rise grid gap-6 md:grid-cols-2">
          <article className="surface-card surface-card-hover animate-rise p-6">
            <h2 className="text-2xl font-semibold text-[#122a43]">Experience Flow</h2>
            <ol className="stagger-rise mt-4 space-y-3 text-sm leading-6">
              {processSteps.map((step, index) => (
                <li
                  key={step}
                  className="rounded-xl border border-[#dbe7f5] bg-[#f8fbff] px-3 py-2 text-[#4f657b]"
                >
                  <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#dbeafe] text-xs font-bold text-[#1f4465]">
                    {index + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </article>

          <article className="surface-card surface-card-hover animate-rise p-6">
            <h2 className="text-2xl font-semibold text-[#122a43]">Featured Charity</h2>
            {featuredCharity ? (
              <div className="mt-4 animate-fade">
                <p className="text-lg font-semibold text-[#143553]">{featuredCharity.name}</p>
                <p className="mt-2 text-sm leading-6 text-[#556b81]">
                  {featuredCharity.description}
                </p>
              </div>
            ) : (
              <p className="mt-4 text-sm text-[#5b7890]">
                Add at least one charity from the admin panel to feature impact stories here.
              </p>
            )}
            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.12em] text-[#627990]">
              Listed Charities: {charities.length}
            </p>
          </article>
        </section>
      </main>
    </div>
  );
}
