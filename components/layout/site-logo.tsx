import Link from "next/link";
import { SITE } from "@/lib/constants";

export function SiteLogo({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      href="/"
      className="group flex min-h-11 items-center gap-2.5 rounded-full focus-visible:outline-2 focus-visible:outline-offset-4"
      aria-label={`${SITE.nameKo} 홈`}
    >
      <span
        aria-hidden="true"
        className="flex size-9 items-center justify-center rounded-2xl bg-[#0f4c3a] font-[family-name:var(--font-heading)] text-sm font-bold tracking-tight text-white shadow-sm"
      >
        MB
      </span>
      <span className="flex flex-col leading-none">
        <span className="font-[family-name:var(--font-heading)] text-[15px] font-semibold tracking-tight text-[#0f4c3a]">
          {SITE.nameKo}
        </span>
        {!compact ? (
          <span className="mt-0.5 text-[10px] tracking-[0.16em] text-slate-500 uppercase">
            {SITE.nameEn}
          </span>
        ) : null}
      </span>
    </Link>
  );
}
