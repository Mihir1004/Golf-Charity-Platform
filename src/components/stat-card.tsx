import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: string;
  hint?: string;
  className?: string;
};

export function StatCard({ label, value, hint, className }: StatCardProps) {
  return (
    <article
      className={cn(
        "surface-card surface-card-hover animate-rise rounded-2xl bg-gradient-to-br from-white to-[#f3f8ff] p-4 text-[#122842]",
        className,
      )}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#5a7188]">{label}</p>
      <p className="mt-1 text-2xl font-bold text-[#10263d]">{value}</p>
      {hint ? <p className="mt-1 text-xs text-[#5d7389]">{hint}</p> : null}
    </article>
  );
}
