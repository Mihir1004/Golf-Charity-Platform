import { AuthCard } from "@/components/auth-card";
import { ROUTES } from "@/lib/constants";
import { getActionFeedback, type SearchParams } from "@/lib/page-params";
import { loginAction } from "@/server/actions/auth-actions";

type LoginPageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const feedback = getActionFeedback(await searchParams);

  return (
    <AuthCard
      currentPath={ROUTES.login}
      title="Welcome back"
      subtitle="Log in to manage scores, subscriptions, draws, and charity impact."
      action={loginAction}
      submitLabel="Log In"
      footerText="New here?"
      footerHref={ROUTES.register}
      footerLinkLabel="Create an account"
      feedback={feedback}
    >
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-[#1f4b6c]">Email</span>
        <input
          name="email"
          type="email"
          required
          className="w-full px-3 py-2"
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-[#1f4b6c]">Password</span>
        <input
          name="password"
          type="password"
          minLength={8}
          required
          className="w-full px-3 py-2"
        />
      </label>
    </AuthCard>
  );
}
