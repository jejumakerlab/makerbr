import Link from "next/link";
import { cn } from "@/lib/utils";

type Option = { value: string; label: string };

export function FilterChips({
  options,
  selected = "all",
  basePath,
  allLabel = "전체",
}: {
  options: readonly Option[] | Option[];
  selected?: string;
  basePath: string;
  allLabel?: string;
}) {
  return (
    <div
      role="group"
      aria-label="카테고리 필터"
      className="mb-8 flex flex-wrap gap-2"
    >
      {options.map((option) => {
        const active = selected === option.value;
        const href =
          option.value === "all" ? basePath : `${basePath}?category=${option.value}`;
        return (
          <Link
            key={option.value}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "touch-target inline-flex items-center rounded-full border px-4 text-sm font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card hover:bg-muted border-border",
            )}
          >
            {option.label === "전체" ? allLabel : option.label}
          </Link>
        );
      })}
    </div>
  );
}
