import type { ReactNode } from "react";

export type LegalSection = {
  title: string;
  body: ReactNode;
};

export function LegalDocument({
  title,
  intro,
  effectiveDate,
  sections,
}: {
  title: string;
  intro: ReactNode;
  effectiveDate: string;
  sections: LegalSection[];
}) {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
      <p className="text-muted-foreground mt-2 text-sm">시행일: {effectiveDate}</p>
      <div className="mt-6 rounded-2xl bg-emerald-50/70 px-5 py-4 text-sm leading-7 text-[#0f4c3a]">
        {intro}
      </div>

      <nav aria-label="목차" className="mt-8 rounded-2xl border border-slate-200 bg-white px-5 py-4">
        <p className="text-sm font-semibold">목차</p>
        <ol className="text-muted-foreground mt-2 grid gap-1 text-sm sm:grid-cols-2">
          {sections.map((section, index) => (
            <li key={section.title}>
              <a href={`#section-${index + 1}`} className="hover:text-[#0f4c3a] hover:underline">
                {section.title}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <div className="mt-10 grid gap-10">
        {sections.map((section, index) => (
          <section
            key={section.title}
            id={`section-${index + 1}`}
            className="scroll-mt-24"
          >
            <h2 className="text-lg font-semibold">{section.title}</h2>
            <div className="mt-3 grid gap-3 text-[15px] leading-7 break-keep text-slate-700 [&_li]:mt-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_table]:w-full [&_table]:border-collapse [&_table]:text-sm [&_td]:border [&_td]:border-slate-200 [&_td]:px-3 [&_td]:py-2 [&_td]:align-top [&_th]:border [&_th]:border-slate-200 [&_th]:bg-slate-50 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-medium [&_ul]:list-disc [&_ul]:pl-5">
              {section.body}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
