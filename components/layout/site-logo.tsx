import Link from "next/link";
import { SITE } from "@/lib/constants";

export function SiteLogo({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      href="/"
      className="group flex min-h-11 items-center gap-2.5 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4"
      aria-label={`${SITE.nameKo} 홈`}
    >
      <span
        aria-hidden="true"
        className="bg-primary text-primary-foreground flex size-9 items-center justify-center rounded-md font-[family-name:var(--font-heading)] text-sm font-bold tracking-tight"
      >
        MB
      </span>
      <span className="flex flex-col leading-none">
        <span className="font-[family-name:var(--font-heading)] text-base font-semibold tracking-tight">
          {SITE.nameKo}
        </span>
        {!compact ? (
          <span className="text-muted-foreground mt-0.5 text-[11px] tracking-[0.14em] uppercase">
            {SITE.nameEn}
          </span>
        ) : null}
      </span>
    </Link>
  );
}
