import type { Metadata } from "next";
import { OrderManager } from "@/components/admin/order-manager";
import { MOCK_ORDERS } from "@/lib/mock-data";
import { createClient } from "@/lib/supabase/server";
import type { OrderWithItems } from "@/types/database";

export const metadata: Metadata = {
  title: "주문 · 배송",
};

export default async function AdminOrdersPage() {
  const supabase = await createClient();
  if (!supabase) {
    return <OrderManager initialOrders={MOCK_ORDERS} demo />;
  }

  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .order("created_at", { ascending: false })
    .limit(300);

  if (error) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-800">
        주문 목록을 불러오지 못했습니다: {error.message}
        <p className="mt-2 text-rose-700">
          Supabase SQL Editor에서 <code>supabase/orders.sql</code> 을 실행했는지 확인해 주세요.
        </p>
      </div>
    );
  }

  return <OrderManager initialOrders={(data ?? []) as OrderWithItems[]} />;
}
