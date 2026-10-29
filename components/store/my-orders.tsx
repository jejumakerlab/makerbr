import Image from "next/image";
import Link from "next/link";
import { Check, Package } from "lucide-react";
import { formatKRW } from "@/lib/format";
import {
  formatOrderDate,
  ORDER_STATUS_FLOW,
  ORDER_STATUS_STYLE,
} from "@/lib/store/orders";
import { cn } from "@/lib/utils";
import type { OrderWithItems } from "@/types/database";

export function MyOrders({
  orders,
  bank,
}: {
  orders: OrderWithItems[];
  bank: { bankName: string; bankAccount: string; bankHolder: string };
}) {
  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-2xl border border-dashed bg-white px-6 py-12 text-center">
        <Package className="text-muted-foreground size-8" aria-hidden="true" />
        <p className="text-muted-foreground mt-3">아직 주문 내역이 없어요.</p>
        <Link href="/store" className="mt-3 text-sm font-medium text-emerald-700 hover:underline">
          메이커 스토어 둘러보기
        </Link>
      </div>
    );
  }

  return (
    <ul className="grid gap-4">
      {orders.map((order) => {
        const step = ORDER_STATUS_FLOW.indexOf(order.status);
        const cancelled = order.status === "취소";
        const awaitingDeposit =
          order.status === "입금대기" && order.payment_method === "무통장입금/계좌이체";

        return (
          <li key={order.id} className="rounded-2xl border bg-white">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b px-5 py-4">
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset",
                  ORDER_STATUS_STYLE[order.status],
                )}
              >
                {order.status}
              </span>
              <p className="font-semibold tabular-nums">{order.order_number}</p>
              <p className="text-muted-foreground text-sm">{formatOrderDate(order.created_at)}</p>
              <p className="ml-auto font-bold text-[#0f4c3a] tabular-nums">
                {formatKRW(order.total_amount)}
              </p>
            </div>

            <div className="grid gap-4 px-5 py-4">
              {cancelled ? null : (
                <ol className="grid grid-cols-5 gap-1" aria-label="진행 단계">
                  {ORDER_STATUS_FLOW.map((status, index) => {
                    const done = index <= step;
                    return (
                      <li key={status} className="grid justify-items-center gap-1.5 text-center">
                        <span
                          className={cn(
                            "flex size-7 items-center justify-center rounded-full text-xs font-semibold",
                            done ? "bg-[#0f4c3a] text-white" : "bg-slate-100 text-slate-400",
                            index === step && "ring-4 ring-emerald-100",
                          )}
                          aria-hidden="true"
                        >
                          {done ? <Check className="size-3.5" /> : index + 1}
                        </span>
                        <span
                          className={cn(
                            "text-[11px] leading-tight sm:text-xs",
                            index === step ? "font-semibold text-[#0f4c3a]" : "text-muted-foreground",
                          )}
                        >
                          {status}
                          {index === step ? <span className="sr-only"> (현재 단계)</span> : null}
                        </span>
                      </li>
                    );
                  })}
                </ol>
              )}

              {order.tracking_number ? (
                <p className="rounded-xl bg-emerald-50 px-4 py-2.5 text-sm text-[#0f4c3a]">
                  <span className="font-semibold">송장번호</span> · {order.tracking_carrier}{" "}
                  <span className="font-semibold tabular-nums select-all">{order.tracking_number}</span>
                </p>
              ) : null}

              {awaitingDeposit ? (
                <p className="rounded-xl bg-amber-50 px-4 py-2.5 text-sm text-amber-800">
                  입금 대기 중 · {bank.bankName} {bank.bankAccount} (예금주 {bank.bankHolder}) ·{" "}
                  {formatKRW(order.total_amount)}
                  {order.depositor_name ? ` · 입금자명 ${order.depositor_name}` : ""}
                </p>
              ) : null}

              <ul className="grid gap-2">
                {order.order_items.map((item) => (
                  <li key={item.id} className="flex items-center gap-3">
                    <div className="bg-muted relative size-12 shrink-0 overflow-hidden rounded-lg border">
                      {item.thumbnail_url ? (
                        <Image src={item.thumbnail_url} alt="" fill className="object-cover" sizes="48px" />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1 text-sm">
                      <p className="truncate font-medium">{item.product_name}</p>
                      <p className="text-muted-foreground text-xs">
                        {formatKRW(item.price)} × {item.quantity}개
                        {item.custom_memo ? ` · 요청사항: ${item.custom_memo}` : ""}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>

              <p className="text-muted-foreground text-xs">
                {order.delivery_method === "방문수령"
                  ? "제주 현장 방문 수령"
                  : `${order.recipient_name} · ${order.address ?? ""} ${order.address_detail ?? ""}`}{" "}
                · {order.payment_method}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
