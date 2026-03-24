import { cn } from "@/lib/utils";

type PanelProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
};

export function Panel({ title, subtitle, children, className }: PanelProps) {
  return (
    <section
      className={cn(
        "surface-card surface-card-hover animate-rise p-5 sm:p-6",
        className,
      )}
    >
      <header className="mb-4">
        <h2 className="text-lg font-semibold text-[#122842] sm:text-xl">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm text-[#566b81]">{subtitle}</p> : null}
      </header>
      {children}
    </section>
  );
}
