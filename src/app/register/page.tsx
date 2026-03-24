import { AuthCard } from "@/components/auth-card";
import { ROUTES } from "@/lib/constants";
import { getActionFeedback, type SearchParams } from "@/lib/page-params";
import { registerAction } from "@/server/actions/auth-actions";

type RegisterPageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const feedback = getActionFeedback(await searchParams);

  return (
    <AuthCard
      currentPath={ROUTES.register}
      title="Create account"
      subtitle="Start contributing to charity while competing in monthly golf draws."
      action={registerAction}
      submitLabel="Create Account"
      footerText="Already have an account?"
      footerHref={ROUTES.login}
      footerLinkLabel="Log in"
      feedback={feedback}
    >
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-[#1f4b6c]">Full name</span>
        <input
          name="fullName"
          type="text"
          minLength={2}
          required
          className="w-full px-3 py-2"
        />
      </label>
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
