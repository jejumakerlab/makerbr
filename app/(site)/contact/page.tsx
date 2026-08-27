import type { Metadata } from "next";
import { Mail, Phone, ShieldCheck } from "lucide-react";
import { PageHero } from "@/components/layout/page-hero";
import { SNS } from "@/lib/constants";
import { QuoteForm } from "@/components/contact/quote-form";
import { getSiteSettings } from "@/lib/data/queries";

export const metadata: Metadata = {
  title: "견적/문의",
  description: "맞춤 제작·교육 견적 요청 및 공공·학교 협력 안내",
};

export default async function ContactPage() {
  const site = await getSiteSettings();
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="견적 · 문의"
        description="맞춤 제작, 교육 과정, 공공·학교 협력을 상담합니다."
      />
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_0.85fr]">
        <QuoteForm />
        <aside className="space-y-6">
          <section className="bg-card rounded-2xl border p-6" aria-labelledby="priority-heading">
            <div className="flex items-center gap-2">
              <ShieldCheck className="text-primary size-5" aria-hidden="true" />
              <h2 id="priority-heading" className="text-lg font-semibold">
                공공·학교 협력
              </h2>
            </div>
            <p className="text-muted-foreground mt-3 text-sm leading-7">
              교육 과정, 찾아가는 교실, 제품 납품 문의는 담당자가 확인 후 견적서와
              함께 회신합니다.
            </p>
            <ul className="text-muted-foreground mt-4 list-disc space-y-1 pl-5 text-sm">
              <li>교육 과정 / 찾아가는 메이커 교실</li>
              <li>업사이클·로컬 제품 납품</li>
              <li>맞춤 제작 및 공간 컨설팅</li>
            </ul>
          </section>
          <section className="rounded-2xl border p-6" aria-labelledby="direct-heading">
            <h2 id="direct-heading" className="text-lg font-semibold">
              직접 연락
            </h2>
            <a
              href={site.phoneHref}
              className="mt-4 flex min-h-11 items-center gap-2 text-sm underline-offset-4 hover:underline"
            >
              <Phone className="size-4" aria-hidden="true" />
              {site.phone}
            </a>
            <a
              href={`mailto:${site.email}`}
              className="flex min-h-11 items-center gap-2 text-sm underline-offset-4 hover:underline"
            >
              <Mail className="size-4" aria-hidden="true" />
              {site.email}
            </a>
            <ul className="mt-4 flex flex-wrap gap-3">
              {SNS.map((item) => (
                <li key={item.name}>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={item.label}
                    className="text-primary inline-flex min-h-11 items-center text-sm underline-offset-4 hover:underline"
                  >
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </>
  );
}
