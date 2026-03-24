import { UserRole } from "@prisma/client";
import { TopNav } from "@/components/top-nav";
import { cn } from "@/lib/utils";

type AppShellProps = {
  role?: UserRole | null;
  currentPath: string;
  authenticated?: boolean;
  maxWidthClass?: string;
  children: React.ReactNode;
};

export function AppShell({
  role,
  currentPath,
  authenticated = false,
  maxWidthClass = "max-w-6xl",
  children,
}: AppShellProps) {
  return (
    <div className="min-h-screen">
      <TopNav role={role} currentPath={currentPath} authenticated={authenticated} />
      <main className={cn("mx-auto flex w-full flex-col gap-6 px-4 py-8 sm:px-6", maxWidthClass, "stagger-rise")}>
        {children}
      </main>
    </div>
  );
}
