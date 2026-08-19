import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { NAV_ITEMS, SITE, SNS } from "@/lib/constants";
import { SiteLogo } from "@/components/layout/site-logo";

export function SiteFooter() {
  return (
    <footer className="bg-brand-ink text-background mt-auto">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="[&_span]:text-background [&_.text-muted-foreground]:text-background/70">
            <SiteLogo />
          </div>
          <p className="mt-4 max-w-md text-sm leading-7 text-white/80">
            {SITE.slogan}. 메이커 교육, 로컬 제작, 친환경 유통을 연결하는 사회적기업입니다.
          </p>
        </div>

        <div>
          <h2 className="font-[family-name:var(--font-heading)] text-sm font-semibold tracking-wide text-white">
            바로가기
          </h2>
          <ul className="mt-4 space-y-2">
            {NAV_ITEMS.slice(1).map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="inline-flex min-h-11 items-center text-sm text-white/80 underline-offset-4 hover:text-white hover:underline"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="font-[family-name:var(--font-heading)] text-sm font-semibold tracking-wide text-white">
            연락처
          </h2>
          <ul className="mt-4 space-y-3 text-sm text-white/80">
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <span>{SITE.address}</span>
            </li>
            <li>
              <a
                href={SITE.phoneHref}
                className="flex min-h-11 items-center gap-2 underline-offset-4 hover:text-white hover:underline"
              >
                <Phone className="size-4" aria-hidden="true" />
                {SITE.phone}
              </a>
            </li>
            <li>
              <a
                href={`mailto:${SITE.email}`}
                className="flex min-h-11 items-center gap-2 underline-offset-4 hover:text-white hover:underline"
              >
                <Mail className="size-4" aria-hidden="true" />
                {SITE.email}
              </a>
            </li>
          </ul>
          <ul className="mt-4 flex flex-wrap gap-3">
            {SNS.map((item) => (
              <li key={item.name}>
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={item.label}
                  className="inline-flex min-h-11 items-center text-sm text-white underline-offset-4 hover:underline"
                >
                  {item.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="text-background/70 mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-5 text-xs sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>
            © {new Date().getFullYear()} {SITE.nameKo}. Social enterprise.
          </p>
          <p>
            사업자등록번호 {SITE.businessNumber} · 사회적기업 인증 {SITE.socialEnterpriseNo}
          </p>
        </div>
      </div>
    </footer>
  );
}
