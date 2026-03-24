import Link from "next/link";
import { ActionFeedback } from "@/components/action-feedback";
import { TopNav } from "@/components/top-nav";

type AuthCardProps = {
  currentPath: string;
  title: string;
  subtitle: string;
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
  footerText: string;
  footerHref: string;
  footerLinkLabel: string;
  feedback?: {
    message: string;
    tone: "success" | "error";
  } | null;
  children: React.ReactNode;
};

export function AuthCard({
  currentPath,
  title,
  subtitle,
  action,
  submitLabel,
  footerText,
  footerHref,
  footerLinkLabel,
  feedback,
  children,
}: AuthCardProps) {
  return (
    <div className="min-h-screen">
      <TopNav currentPath={currentPath} authenticated={false} />
      <main className="mx-auto flex w-full max-w-lg px-4 py-10 sm:px-6">
        <section className="surface-card surface-card-hover animate-rise w-full bg-gradient-to-br from-white via-[#f9fcff] to-[#f3f8ff] p-6 sm:p-8">
          <span className="eyebrow animate-fade motion-delay-1">Secure Access</span>
          <h1 className="mt-3 text-3xl font-bold text-[#102742]">{title}</h1>
          <p className="mt-2 text-sm text-[#5a6f84]">{subtitle}</p>
          {feedback ? <ActionFeedback message={feedback.message} tone={feedback.tone} className="mt-4" /> : null}

          <form action={action} className="stagger-rise mt-6 space-y-4">
            {children}
            <button
              type="submit"
              className="btn-primary w-full"
            >
              {submitLabel}
            </button>
          </form>

          <p className="mt-4 text-sm text-[#5f7388]">
            {footerText}{" "}
            <Link href={footerHref} className="font-semibold text-[#0a6fb8] hover:text-[#085996]">
              {footerLinkLabel}
            </Link>
          </p>
        </section>
      </main>
    </div>
  );
}
