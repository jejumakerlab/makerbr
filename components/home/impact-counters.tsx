import type { Impact } from "@/types/database";
import { SITE } from "@/lib/constants";
import { formatNumber } from "@/lib/format";

export function ImpactCounters({
  items,
  description = SITE.impactDescription,
}: {
  items: Impact[];
  description?: string;
}) {
  return (
    <section
      aria-labelledby="impact-heading"
      className="relative overflow-hidden bg-[#0f4c3a] text-white"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-20 right-10 size-64 rounded-full bg-emerald-400/15 blur-3xl"
      />
      <div className="relative mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <p className="text-xs font-semibold tracking-[0.2em] text-emerald-200 uppercase">
          Impact
        </p>
        <h2 id="impact-heading" className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          사회적 가치 성과
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-7 break-keep whitespace-pre-line text-emerald-50/80">
          {description}
        </p>
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => {
            const numeric = Number(item.value);
            const formatted =
              numeric % 1 === 0 ? formatNumber(numeric) : numeric.toFixed(1);
            return (
              <li
                key={item.id}
                className="rounded-3xl border border-white/10 bg-white/8 p-6 backdrop-blur-md"
              >
                <p className="font-[family-name:var(--font-heading)] text-3xl font-semibold tracking-tight sm:text-4xl">
                  {formatted}
                  {item.unit ? (
                    <span className="ml-1 text-lg font-medium text-emerald-200">
                      {item.unit}
                    </span>
                  ) : null}
                </p>
                <p className="mt-3 text-sm font-medium text-white">{item.label}</p>
                {item.description ? (
                  <p className="mt-1 text-sm leading-6 text-emerald-50/70">
                    {item.description}
                  </p>
                ) : null}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
