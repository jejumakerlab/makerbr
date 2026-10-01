import type { ReactNode } from "react";
import Link from "next/link";
import { Mail, MessageCircle, Phone, Printer } from "lucide-react";
import { NAV_ITEMS, SITE, SNS, type SiteContent } from "@/lib/constants";
import { SiteLogo } from "@/components/layout/site-logo";

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

const SNS_ICONS = {
  instagram: InstagramIcon,
  kakao: MessageCircle,
} as const;

function FooterColumn({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section aria-labelledby={id}>
      <h2
        id={id}
        className="font-[family-name:var(--font-heading)] text-base font-semibold tracking-tight text-white"
      >
        {title}
      </h2>
      <span aria-hidden="true" className="mt-3 block h-px w-6 bg-emerald-300/70" />
      <div className="mt-5">{children}</div>
    </section>
  );
}

function InfoList({ rows }: { rows: [string, ReactNode][] }) {
  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2.5 text-sm leading-6">
      {rows.map(([label, value]) => (
        <div key={label} className="contents">
          <dt className="text-emerald-100/55">{label}</dt>
          <dd className="break-keep text-emerald-50/90">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function SiteFooter({ site = SITE }: { site?: SiteContent }) {
  return (
    <footer className="mt-auto bg-[#0f4c3a] text-white">
      <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
        <div className="flex flex-col gap-6 border-b border-white/10 pb-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="[&_span]:text-white [&_.text-slate-500]:text-emerald-100/70">
            <SiteLogo />
          </div>
          <ul className="flex flex-wrap gap-2" aria-label="공식 채널">
            {SNS.map((item) => {
              const Icon = SNS_ICONS[item.id];
              return (
                <li key={item.id}>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={item.label}
                    className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 text-sm font-medium text-white transition hover:-translate-y-0.5 hover:border-white/30 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  >
                    <Icon className="size-4" />
                    {item.name}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="grid gap-10 pt-10 sm:grid-cols-2 lg:grid-cols-[1.05fr_1fr_1.6fr_0.8fr] lg:gap-8">
          <FooterColumn id="footer-support" title="고객센터">
            <ul className="space-y-1 text-sm text-emerald-50/90">
              <li>
                <a
                  href={site.phoneHref}
                  aria-label={`전화 걸기 ${site.phone}`}
                  className="inline-flex min-h-11 items-center gap-2.5 text-lg font-semibold tracking-tight text-white underline-offset-4 hover:underline"
                >
                  <Phone className="size-4 text-emerald-300" aria-hidden="true" />
                  {site.phone}
                </a>
              </li>
              <li className="flex min-h-9 items-center gap-2.5">
                <Printer className="size-4 text-emerald-300" aria-hidden="true" />
                <span>
                  <span className="sr-only">팩스 </span>
                  {site.fax}
                  <span aria-hidden="true" className="ml-1.5 text-xs text-emerald-100/55">
                    FAX
                  </span>
                </span>
              </li>
              <li>
                <a
                  href={`mailto:${site.email}`}
                  className="inline-flex min-h-11 items-center gap-2.5 underline-offset-4 hover:text-white hover:underline"
                >
                  <Mail className="size-4 text-emerald-300" aria-hidden="true" />
                  {site.email}
                </a>
              </li>
            </ul>
            <span aria-hidden="true" className="my-4 block h-px w-6 bg-white/15" />
            <InfoList
              rows={[
                ["평일", site.weekdayHours],
                ["휴무", site.holidays],
              ]}
            />
          </FooterColumn>

          <FooterColumn id="footer-bank" title="결제계좌">
            <InfoList
              rows={[
                ["계좌번호", <span key="account" className="tabular-nums">{site.bankAccount}</span>],
                ["은행명", site.bankName],
                ["예금주", site.bankHolder],
              ]}
            />
          </FooterColumn>

          <FooterColumn id="footer-company" title={site.legalName}>
            <InfoList
              rows={[
                ["대표", site.ceo],
                ["주소", `${site.postalCode} ${site.address}`],
                ["사업자등록번호", site.businessNumber],
                ["통신판매업 신고번호", site.mailOrderNumber],
                ["개인정보관리자", site.privacyOfficer],
              ]}
            />
          </FooterColumn>

          <FooterColumn id="footer-links" title="바로가기">
            <ul className="-mt-2.5">
              {NAV_ITEMS.slice(1).map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="inline-flex min-h-11 items-center text-sm text-emerald-50/80 underline-offset-4 hover:text-white hover:underline"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </FooterColumn>
        </div>
      </div>

      <div className="border-t border-white/10">
        <p className="mx-auto w-full max-w-6xl px-4 py-5 text-xs text-emerald-100/60 sm:px-6">
          © {new Date().getFullYear()} {site.legalName}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
