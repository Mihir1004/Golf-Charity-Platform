import { cn } from "@/lib/utils";

type ActionFeedbackProps = {
  message: string;
  tone: "success" | "error";
  className?: string;
};

export function ActionFeedback({ message, tone, className }: ActionFeedbackProps) {
  return (
    <p
      className={cn(
        "animate-fade rounded-xl border px-3 py-2 text-sm font-medium shadow-[0_10px_20px_-18px_rgba(13,36,61,0.45)]",
        tone === "success"
          ? "border-[#caecd8] bg-[#effaf4] text-[#1a6a45]"
          : "border-[#ffd2c5] bg-[#fff1ec] text-[#8a2b15]",
        className,
      )}
    >
      {message}
    </p>
  );
}
