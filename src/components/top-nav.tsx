import Link from "next/link";
import { UserRole } from "@prisma/client";
import { APP_NAME, ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

type LinkItem = {
  href: string;
  label: string;
};

type TopNavProps = {
  role?: UserRole | null;
  currentPath?: string;
  authenticated?: boolean;
};

function getLinks(role?: UserRole | null): LinkItem[] {
  if (role === UserRole.ADMIN) {
    return [
      { href: ROUTES.admin, label: "Admin Home" },
      { href: ROUTES.adminDraws, label: "Draws" },
      { href: ROUTES.adminCharities, label: "Charities" },
      { href: ROUTES.adminWinners, label: "Winners" },
      { href: ROUTES.adminUsers, label: "Users" },
    ];
  }

  if (role === UserRole.SUBSCRIBER) {
    return [
      { href: ROUTES.dashboard, label: "Dashboard" },
      { href: ROUTES.dashboardScores, label: "Scores" },
      { href: ROUTES.dashboardSubscription, label: "Subscription" },
      { href: ROUTES.dashboardCharity, label: "Charity" },
      { href: ROUTES.dashboardWinnings, label: "Winnings" },
    ];
  }

  return [
    { href: ROUTES.home, label: "Home" },
    { href: ROUTES.login, label: "Login" },
    { href: ROUTES.register, label: "Register" },
  ];
}

export function TopNav({ role, currentPath, authenticated }: TopNavProps) {
  const links = getLinks(role);

  return (
    <header className="glass-nav sticky top-0 z-50 animate-fade">
      <nav className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-3 sm:px-6">
        <div className="flex items-center justify-between gap-4">
          <Link
            href={ROUTES.home}
            className="animate-rise text-base font-semibold tracking-tight text-[#122840] sm:text-lg"
          >
            {APP_NAME}
          </Link>
          {authenticated ? (
            <form action="/actions/logout" method="post">
              <button
                type="submit"
                className="btn-secondary animate-rise motion-delay-1 px-3 py-1.5 text-xs sm:text-sm"
              >
                Logout
              </button>
            </form>
          ) : (
            <span className="eyebrow animate-rise motion-delay-1 hidden sm:inline-flex">Public</span>
          )}
        </div>

        <div className="stagger-rise flex items-center gap-2 overflow-x-auto pb-1">
          {links.map((link) => {
            const isActive = currentPath === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold sm:text-sm",
                  isActive
                    ? "bg-[#10293f] text-white shadow-[0_10px_22px_-18px_rgba(16,41,63,0.85)]"
                    : "bg-[#f1f6ff] text-[#2f4d67] hover:-translate-y-0.5 hover:bg-[#e4eefc]",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
