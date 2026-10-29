import type { Metadata } from "next";
import { ProductManager } from "@/components/admin/product-manager";
import { MOCK_PRODUCTS } from "@/lib/mock-data";
import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/types/database";

export const metadata: Metadata = {
  title: "상품 관리",
};

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ new?: string }>;
}) {
  const { new: openNew } = await searchParams;
  const supabase = await createClient();

  if (!supabase) {
    return <ProductManager initialProducts={MOCK_PRODUCTS} openNewOnMount={openNew === "1"} demo />;
  }

  // 관리자 세션이므로 숨김 상품까지 모두 조회됩니다(products_staff_all 정책).
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-800">
        상품 목록을 불러오지 못했습니다: {error.message}
      </div>
    );
  }

  return (
    <ProductManager
      initialProducts={(data ?? []) as Product[]}
      openNewOnMount={openNew === "1"}
    />
  );
}
