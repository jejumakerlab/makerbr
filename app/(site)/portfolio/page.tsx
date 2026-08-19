import type { Metadata } from "next";
import Image from "next/image";
import { PageHero } from "@/components/layout/page-hero";
import { FilterChips } from "@/components/shared/filter-chips";
import { PORTFOLIO_CATEGORIES } from "@/lib/constants";
import { getPortfolios } from "@/lib/data/queries";

export const metadata: Metadata = {
  title: "포트폴리오",
  description: "메이커브릿지 프로젝트 성과 갤러리",
};

export default async function PortfolioPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category = "all" } = await searchParams;
  const items = await getPortfolios(category);

  return (
    <>
      <PageHero
        eyebrow="Portfolio"
        title="프로젝트 성과"
        description="교육, 공공협력, 제품 개발, 지역사회 프로젝트를 분야별로 살펴보세요."
      />
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
        <FilterChips
          options={PORTFOLIO_CATEGORIES}
          selected={category}
          basePath="/portfolio"
        />
        <ul className="grid gap-6 sm:grid-cols-2">
          {items.map((item) => (
            <li key={item.id} className="bg-card overflow-hidden rounded-2xl border">
              <div className="bg-muted relative aspect-[16/9]">
                {item.cover_image ? (
                  <Image
                    src={item.cover_image}
                    alt={`${item.title} 프로젝트 사진`}
                    fill
                    className="object-cover"
                    sizes="(min-width: 640px) 50vw, 100vw"
                  />
                ) : null}
              </div>
              <div className="p-5">
                <p className="text-primary text-xs font-semibold tracking-wide uppercase">
                  {item.year} · {item.category}
                </p>
                <h2 className="mt-2 text-xl font-semibold">{item.title}</h2>
                <p className="text-muted-foreground mt-2 text-sm leading-7">
                  {item.summary}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
