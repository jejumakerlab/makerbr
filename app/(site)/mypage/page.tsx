import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Package } from "lucide-react";
import { LogoutButton } from "@/components/auth/logout-button";
import { MyOrders } from "@/components/store/my-orders";
import { buttonVariants } from "@/components/ui/button";
import { getAuthState } from "@/lib/auth/session";
import { getSiteSettings } from "@/lib/data/queries";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";
import type { OrderWithItems } from "@/types/database";

export const metadata: Metadata = {
  title: "마이페이지",
};

export default async function MyPage() {
  const auth = await getAuthState();
  if (!auth.user) {
    redirect("/login?redirect=/mypage");
  }
  const [{ orders, error: ordersError }, site] = await Promise.all([
    getMyOrders(auth.user.id),
    getSiteSettings(),
  ]);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-semibold">마이페이지</h1>
      <div className="bg-card mt-8 rounded-2xl border p-6">
        <dl className="grid gap-4 text-sm">
          <div>
            <dt className="text-muted-foreground">이름</dt>
            <dd className="mt-1 text-base font-medium">
              {auth.profile?.full_name || "미입력"}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">이메일</dt>
            <dd className="mt-1 text-base font-medium">{auth.user.email}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">연락처</dt>
            <dd className="mt-1 text-base font-medium">
              {auth.profile?.phone || "미입력"}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">권한</dt>
            <dd className="mt-1 text-base font-medium">
              {auth.isStaff
                ? auth.profile?.role === "admin"
                  ? "관리자"
                  : "스태프"
                : "회원"}
            </dd>
          </div>
        </dl>
        <div className="mt-8 flex flex-wrap gap-3">
          {auth.isStaff ? (
            <>
              <Link href="/admin/products" className={cn(buttonVariants({ variant: "cta", size: "xl" }))}>
                <Package className="size-4" aria-hidden="true" />
                상품 관리
              </Link>
              <Link href="/admin" className={cn(buttonVariants({ size: "xl" }))}>
                관리자 모드
              </Link>
            </>
          ) : null}
          <LogoutButton className="border" />
        </div>
      </div>

      <section aria-labelledby="my-orders-heading" className="mt-12">
        <h2 id="my-orders-heading" className="text-xl font-semibold">
          내 주문 · 배송 조회
        </h2>
        <p className="text-muted-foreground mt-1 mb-5 text-sm">
          로그인한 상태에서 주문한 내역이 최신순으로 보입니다.
        </p>
        {ordersError ? (
          <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            주문 내역을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
          </p>
        ) : (
          <MyOrders
            orders={orders}
            bank={{
              bankName: site.bankName,
              bankAccount: site.bankAccount,
              bankHolder: site.bankHolder,
            }}
          />
        )}
      </section>
    </div>
  );
}

async function getMyOrders(userId: string) {
  const supabase = await createClient();
  if (!supabase) return { orders: [] as OrderWithItems[], error: null };
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) console.error("[mypage] 주문 조회 실패", error.message);
  return { orders: (data ?? []) as OrderWithItems[], error };
}
