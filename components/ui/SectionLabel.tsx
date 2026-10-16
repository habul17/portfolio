import { cx } from "@/lib/utils";

export function SectionLabel({ index, title, className }: { index: string; title: string; className?: string }) {
  return (
    <div className={cx("mono-label flex items-center gap-3 text-muted", className)}>
      <span className="text-accent">({index})</span>
      <span className="h-px w-8 bg-line" />
      <span>{title}</span>
    </div>
  );
}
