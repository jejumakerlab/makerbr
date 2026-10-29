import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHero } from "@/components/layout/page-hero";
import { StoreCatalog } from "@/components/store/store-catalog";
import { buttonVariants } from "@/components/ui/button";
import { getAuthState } from "@/lib/auth/session";
import { getProducts } from "@/lib/data/queries";
import { cn } from "@/lib/utils";

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
  const [products, auth] = await Promise.all([getProducts(), getAuthState()]);

  return (
    <>
      <PageHero
        eyebrow="Store"
        title="메이커 스토어"
        description="업사이클 리빙, 교육 키트, 지역 메이커 협업 상품을 만나보세요."
        actions={
          auth.isStaff ? (
            <Link
              href="/admin/products?new=1"
              className={cn(buttonVariants({ variant: "cta", size: "xl" }))}
            >
              <Plus className="size-4" aria-hidden="true" />
              상품 등록하기
            </Link>
          ) : null
        }
      />
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
        <StoreCatalog products={products} initialCategory={category} />
      </div>
    </>
  );
}
