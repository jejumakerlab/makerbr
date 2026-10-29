import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageHero({
  eyebrow,
  title,
  description,
  actions,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  /** 제목 영역 우측 상단 버튼 */
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("bg-mesh relative overflow-hidden border-b border-slate-200/80", className)}>
      <div aria-hidden="true" className="bg-dot-grid pointer-events-none absolute inset-0 opacity-60" />
      <div className="relative mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <div
          className={cn(
            actions && "flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between",
          )}
        >
          <div>
            {eyebrow ? (
              <p className="text-xs font-semibold tracking-[0.18em] text-emerald-600 uppercase">
                {eyebrow}
              </p>
            ) : null}
            <h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight sm:text-5xl">
              {title}
            </h1>
            {description ? (
              <p className="text-muted-foreground mt-4 max-w-2xl text-base leading-7 sm:text-lg">
                {description}
              </p>
            ) : null}
          </div>
          {actions ? <div className="shrink-0">{actions}</div> : null}
        </div>
      </div>
    </section>
  );
}
