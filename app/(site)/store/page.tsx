import type { Metadata } from "next";
import { PageHero } from "@/components/layout/page-hero";
import { StoreCatalog } from "@/components/store/store-catalog";
import { getProducts } from "@/lib/data/queries";

export const metadata: Metadata = {
  title: "메이커 스토어",
  description: "메이커 협업 상품과 자체 제작 제품을 소개합니다.",
};

export default async function StorePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category = "all" } = await searchParams;
  const products = await getProducts();

  return (
    <>
      <PageHero
        eyebrow="Store"
        title="메이커 스토어"
        description="업사이클 리빙, 교육 키트, 지역 메이커 협업 상품을 만나보세요."
      />
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
        <StoreCatalog products={products} initialCategory={category} />
      </div>
    </>
  );
}
