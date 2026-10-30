import Image from "next/image";
import Link from "next/link";
import { SITE } from "@/lib/constants";
import { cn } from "@/lib/utils";
import logo from "@/images/logo_makerbr_512.png";

export function SiteLogo({
  compact = false,
  tone = "light",
}: {
  compact?: boolean;
  /** 어두운 배경(푸터 등)에서는 남색 로고가 묻히지 않도록 흰 타일 위에 올립니다. */
  tone?: "light" | "dark";
}) {
  const dark = tone === "dark";
  return (
    <Link
      href="/"
      className="group flex min-h-11 items-center gap-2.5 rounded-full focus-visible:outline-2 focus-visible:outline-offset-4"
      aria-label={`${SITE.nameKo} 홈`}
    >
      <span
        aria-hidden="true"
        className={cn(
          "flex shrink-0 items-center justify-center",
          dark ? "size-10 rounded-xl bg-white p-1 shadow-sm" : "size-9",
        )}
      >
        <Image src={logo} alt="" className="size-full object-contain" priority sizes="40px" />
      </span>
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            "font-[family-name:var(--font-heading)] text-[15px] font-semibold tracking-tight",
            dark ? "text-white" : "text-[#0f4c3a]",
          )}
        >
          {SITE.nameKo}
        </span>
        {!compact ? (
          <span
            className={cn(
              "mt-0.5 text-[10px] tracking-[0.16em] uppercase",
              dark ? "text-emerald-100/70" : "text-slate-500",
            )}
          >
            {SITE.nameEn}
          </span>
        ) : null}
      </span>
    </Link>
  );
}
