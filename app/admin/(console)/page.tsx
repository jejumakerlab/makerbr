import Link from "next/link";
import { ADMIN_NAV } from "@/lib/constants";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import {
  MOCK_APPLICATIONS,
  MOCK_ORDERS,
  MOCK_PRODUCTS,
  MOCK_QUOTES,
} from "@/lib/mock-data";

export default function AdminHomePage() {
  const demo = !isSupabaseConfigured();
  const cards = [
    { label: "공개 상품", value: MOCK_PRODUCTS.length, href: "/admin/products" },
    { label: "주문", value: MOCK_ORDERS.length, href: "/admin/orders" },
    { label: "교육 신청", value: MOCK_APPLICATIONS.length, href: "/admin/applications" },
    { label: "견적 요청", value: MOCK_QUOTES.length, href: "/admin/quotes" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold">대시보드</h1>
      <p className="text-muted-foreground mt-2 text-sm">
        코드 수정 없이 상품, 주문, 교육 신청, 게시글, 견적, 성과 수치를 관리합니다.
      </p>
      {demo ? (
        <p className="bg-accent mt-4 rounded-lg px-4 py-3 text-sm" role="status">
          현재는 데모 데이터입니다. Supabase 스키마(`supabase/schema.sql`)와 환경 변수를
          연결하면 실제 DB를 다룹니다.
        </p>
      ) : null}
      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <li key={card.href}>
            <Link
              href={card.href}
              className="bg-card block rounded-2xl border p-5 focus-visible:outline-2"
            >
              <p className="text-muted-foreground text-sm">{card.label}</p>
              <p className="mt-2 text-3xl font-semibold">{card.value}</p>
            </Link>
          </li>
        ))}
      </ul>
      <section className="mt-10">
        <h2 className="text-lg font-semibold">바로가기</h2>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {ADMIN_NAV.slice(1).map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="bg-card hover:bg-muted flex min-h-11 items-center rounded-xl border px-4 text-sm font-medium"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
