import type { Impact } from "@/types/database";
import { formatNumber } from "@/lib/format";

export function ImpactCounters({ items }: { items: Impact[] }) {
  return (
    <section aria-labelledby="impact-heading" className="bg-primary text-primary-foreground">
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
        <h2 id="impact-heading" className="text-primary-foreground text-xl font-semibold">
          사회적 가치 성과
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-white/80">
          교육, 친환경 순환, 지역 협업으로 쌓아 온 숫자입니다. 관리자 페이지에서 수시로 갱신할 수 있습니다.
        </p>
        <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => {
            const numeric = Number(item.value);
            const formatted =
              numeric % 1 === 0 ? formatNumber(numeric) : numeric.toFixed(1);
            return (
              <li key={item.id} className="rounded-xl bg-white/10 p-5">
                <p className="text-3xl font-semibold tracking-tight">
                  {formatted}
                  {item.unit ? (
                    <span className="ml-1 text-lg font-medium">{item.unit}</span>
                  ) : null}
                </p>
                <p className="mt-2 font-medium">{item.label}</p>
                {item.description ? (
                  <p className="mt-1 text-sm text-white/75">{item.description}</p>
                ) : null}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
