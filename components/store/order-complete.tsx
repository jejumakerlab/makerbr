"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { formatKRW } from "@/lib/format";
import { LAST_ORDER_STORAGE_KEY, type PlacedOrder } from "@/lib/store/orders";
import { cn } from "@/lib/utils";

function readLastOrder(): string | null {
  try {
    return sessionStorage.getItem(LAST_ORDER_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function OrderComplete({
  orderNumber,
  isMember,
  bank,
  contact,
}: {
  orderNumber: string | null;
  isMember: boolean;
  bank: { bankName: string; bankAccount: string; bankHolder: string };
  contact: { phone: string; email: string; address: string };
}) {
  const raw = useSyncExternalStore(
    () => () => {},
    readLastOrder,
    () => null,
  );
  const parsed = raw ? (JSON.parse(raw) as PlacedOrder) : null;
  const order = parsed && (!orderNumber || parsed.order_number === orderNumber) ? parsed : null;
  const number = order?.order_number ?? orderNumber;

  return (
    <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-8 text-center sm:p-10">
      <CheckCircle2 className="mx-auto size-14 text-emerald-600" aria-hidden="true" />
      <h1 className="mt-4 text-2xl font-semibold">주문이 완료되었습니다</h1>
      {number ? (
        <p className="text-muted-foreground mt-2">
          주문번호 <span className="font-semibold text-slate-900">{number}</span>
        </p>
      ) : null}

      {order ? (
        <dl className="mt-6 grid gap-1.5 rounded-2xl bg-slate-50 px-5 py-4 text-left text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">상품 금액</dt>
            <dd className="tabular-nums">{formatKRW(order.items_total)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">
              배송비 {order.delivery_method === "방문수령" ? "(방문 수령)" : ""}
            </dt>
            <dd className="tabular-nums">
              {order.shipping_fee === 0 ? "무료" : formatKRW(order.shipping_fee)}
            </dd>
          </div>
          <div className="mt-1 flex justify-between border-t pt-2 font-semibold">
            <dt>총 결제 금액</dt>
            <dd className="text-[#0f4c3a] tabular-nums">{formatKRW(order.total_amount)}</dd>
          </div>
        </dl>
      ) : null}

      {order?.payment_method === "기관 후불/세금계산서" ? (
        <div className="mt-4 rounded-2xl bg-emerald-50 px-5 py-4 text-left text-sm text-[#0f4c3a]">
          <p className="font-semibold">기관·학교 후불 결제 안내</p>
          <p className="mt-1">
            담당자 확인 후 연락드리고, 납품과 함께 세금계산서를 발행해 드립니다. 사업자등록증은{" "}
            {contact.email} 로 보내 주세요.
          </p>
        </div>
      ) : (
        <div className="mt-4 rounded-2xl bg-emerald-50 px-5 py-4 text-left text-sm text-[#0f4c3a]">
          <p className="font-semibold">입금 안내</p>
          <p className="mt-1 text-base font-semibold">
            {bank.bankName} {bank.bankAccount}
          </p>
          <p>예금주 {bank.bankHolder}</p>
          {order ? (
            <p className="mt-1">
              입금 금액 <span className="font-semibold">{formatKRW(order.total_amount)}</span>
              {order.depositor_name ? ` · 입금자명 ${order.depositor_name}` : ""}
            </p>
          ) : null}
          <p className="mt-1 text-emerald-800/80">
            주문 후 3일 이내 입금해 주세요. 입금이 확인되면 순서대로 준비해 드립니다.
          </p>
        </div>
      )}

      {order?.delivery_method === "방문수령" ? (
        <p className="text-muted-foreground mt-4 text-left text-sm">
          방문 수령 장소: {contact.address} · 준비가 끝나면 연락드릴게요.
        </p>
      ) : null}

      <p className="text-muted-foreground mt-6 text-sm">
        {isMember
          ? "주문·배송 진행 상황은 마이페이지에서 확인할 수 있어요."
          : `비회원 주문은 주문번호를 꼭 메모해 두세요. 문의 ${contact.phone}`}
      </p>

      <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
        {isMember ? (
          <Link href="/mypage" className={cn(buttonVariants({ size: "xl" }))}>
            주문 내역 보기
          </Link>
        ) : null}
        <Link href="/store" className={cn(buttonVariants({ variant: "outline", size: "xl" }))}>
          쇼핑 계속하기
        </Link>
      </div>
    </div>
  );
}
