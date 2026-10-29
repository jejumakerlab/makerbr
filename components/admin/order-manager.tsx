"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import { ArrowRight, Building2, Landmark, MapPin, Truck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatKRW } from "@/lib/format";
import {
  formatOrderDate,
  nextOrderStatus,
  ORDER_STATUS_STYLE,
  ORDER_STATUSES,
  TRACKING_CARRIERS,
} from "@/lib/store/orders";
import { cn } from "@/lib/utils";
import type { Order, OrderStatus, OrderWithItems } from "@/types/database";

type Filter = OrderStatus | "전체";

export function OrderManager({
  initialOrders,
  demo = false,
}: {
  initialOrders: OrderWithItems[];
  demo?: boolean;
}) {
  const [orders, setOrders] = useState(initialOrders);
  const [filter, setFilter] = useState<Filter>("전체");

  const counts = orders.reduce<Record<string, number>>((acc, order) => {
    acc[order.status] = (acc[order.status] ?? 0) + 1;
    return acc;
  }, {});
  const visible = filter === "전체" ? orders : orders.filter((order) => order.status === filter);

  function applyUpdate(id: string, changes: Partial<Order>) {
    setOrders((list) => list.map((order) => (order.id === id ? { ...order, ...changes } : order)));
  }

  return (
    <div>
      <div>
        <h1 className="text-2xl font-semibold">주문 · 배송</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          최신 주문부터 보입니다. 상태를 바꾸면 고객 마이페이지에도 바로 반영됩니다.
        </p>
      </div>

      {demo ? (
        <p className="bg-accent mt-4 rounded-lg px-4 py-3 text-sm" role="status">
          데모 모드입니다. Supabase 설정이 없어 변경 내용이 저장되지 않습니다.
        </p>
      ) : null}

      <div role="group" aria-label="주문 상태 필터" className="mt-6 flex flex-wrap gap-2">
        {(["전체", ...ORDER_STATUSES] as Filter[]).map((value) => {
          const count = value === "전체" ? orders.length : (counts[value] ?? 0);
          const active = filter === value;
          return (
            <button
              key={value}
              type="button"
              aria-pressed={active}
              onClick={() => setFilter(value)}
              className={cn(
                "inline-flex h-9 items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium transition-colors",
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-white hover:bg-slate-50",
              )}
            >
              {value}
              <span className={cn("tabular-nums", active ? "text-white/80" : "text-muted-foreground")}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <p className="text-muted-foreground mt-10 rounded-2xl border border-dashed bg-white py-16 text-center">
          {filter === "전체" ? "아직 들어온 주문이 없습니다." : `'${filter}' 상태의 주문이 없습니다.`}
        </p>
      ) : (
        <ul className="mt-6 grid gap-4">
          {visible.map((order) => (
            <li key={order.id}>
              <OrderCard order={order} onUpdated={applyUpdate} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function OrderCard({
  order,
  onUpdated,
}: {
  order: OrderWithItems;
  onUpdated: (id: string, changes: Partial<Order>) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [carrier, setCarrier] = useState(order.tracking_carrier ?? "");
  const [trackingNumber, setTrackingNumber] = useState(order.tracking_number ?? "");
  const next = nextOrderStatus(order.status);
  const isParcel = order.delivery_method === "택배";

  async function patch(changes: Partial<Order>, message: string) {
    setBusy(true);
    try {
      const response = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(changes),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "저장하지 못했습니다.");
      onUpdated(order.id, changes);
      toast.success(message);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "저장하지 못했습니다.");
    } finally {
      setBusy(false);
    }
  }

  function changeStatus(status: OrderStatus) {
    if (status === order.status) return;
    if (status === "취소" && !confirm(`${order.order_number} 주문을 취소할까요?\n주문 수량만큼 재고가 다시 늘어납니다.`)) {
      return;
    }
    void patch({ status }, `${order.order_number} → '${status}'(으)로 변경했습니다.`);
  }

  function saveTracking() {
    if (!carrier || !trackingNumber.trim()) {
      toast.error("택배사와 송장번호를 모두 입력해 주세요.");
      return;
    }
    // 송장을 넣는 시점이 곧 발송이므로, 준비 단계 주문은 '배송중'으로 함께 넘깁니다.
    const shipNow = order.status === "결제완료" || order.status === "제작/준비중";
    void patch(
      {
        tracking_carrier: carrier,
        tracking_number: trackingNumber.trim(),
        ...(shipNow ? { status: "배송중" as OrderStatus } : {}),
      },
      shipNow ? "송장을 저장하고 '배송중'으로 변경했습니다." : "송장 정보를 저장했습니다.",
    );
  }

  return (
    <article className={cn("rounded-2xl border bg-white", busy && "opacity-70")}>
      <header className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b px-5 py-4">
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
        <p className="ml-auto text-lg font-bold text-[#0f4c3a] tabular-nums">
          {formatKRW(order.total_amount)}
        </p>
      </header>

      <div className="grid gap-5 px-5 py-4 lg:grid-cols-[1.2fr_1fr]">
        <div className="grid content-start gap-3">
          <ul className="grid gap-2">
            {order.order_items.map((item) => (
              <li key={item.id} className="flex gap-3">
                <div className="bg-muted relative size-12 shrink-0 overflow-hidden rounded-lg border">
                  {item.thumbnail_url ? (
                    <Image src={item.thumbnail_url} alt="" fill className="object-cover" sizes="48px" />
                  ) : null}
                </div>
                <div className="min-w-0 text-sm">
                  <p className="font-medium">
                    {item.product_name}{" "}
                    <span className="text-muted-foreground font-normal">
                      · {formatKRW(item.price)} × {item.quantity}
                    </span>
                  </p>
                  {item.custom_memo ? (
                    <p className="mt-0.5 inline-block rounded-md bg-amber-50 px-2 py-0.5 text-xs text-amber-800">
                      요청사항: {item.custom_memo}
                    </p>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
          <p className="text-muted-foreground text-xs">
            상품 {formatKRW(order.items_total)} + 배송비{" "}
            {order.shipping_fee === 0 ? "무료" : formatKRW(order.shipping_fee)}
          </p>
        </div>

        <dl className="grid content-start gap-2 text-sm">
          <InfoRow label="주문자">
            {order.buyer_name} · {order.buyer_phone}
            <span className="text-muted-foreground block text-xs">{order.buyer_email}</span>
          </InfoRow>
          <InfoRow label={isParcel ? "배송지" : "수령"}>
            {isParcel ? (
              <>
                <span className="inline-flex items-center gap-1">
                  <Truck className="size-3.5 text-emerald-600" aria-hidden="true" />
                  {order.recipient_name} · {order.recipient_phone}
                </span>
                <span className="block">
                  {order.zipcode ? `(${order.zipcode}) ` : ""}
                  {order.address} {order.address_detail}
                </span>
                {order.delivery_memo ? (
                  <span className="text-muted-foreground block text-xs">메모: {order.delivery_memo}</span>
                ) : null}
              </>
            ) : (
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-3.5 text-emerald-600" aria-hidden="true" />
                제주 현장 방문 수령
              </span>
            )}
          </InfoRow>
          <InfoRow label="결제">
            <span className="inline-flex items-center gap-1">
              {order.payment_method === "기관 후불/세금계산서" ? (
                <Building2 className="size-3.5 text-emerald-600" aria-hidden="true" />
              ) : (
                <Landmark className="size-3.5 text-emerald-600" aria-hidden="true" />
              )}
              {order.payment_method}
            </span>
            {order.depositor_name ? (
              <span className="text-muted-foreground block text-xs">입금자명: {order.depositor_name}</span>
            ) : null}
            {order.billing_memo ? (
              <span className="text-muted-foreground block text-xs whitespace-pre-line">
                {order.billing_memo}
              </span>
            ) : null}
          </InfoRow>
        </dl>
      </div>

      <footer className="grid gap-3 border-t bg-slate-50/70 px-5 py-4 lg:grid-cols-2">
        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor={`status-${order.id}`} className="text-sm font-medium">
            상태
          </label>
          <select
            id={`status-${order.id}`}
            value={order.status}
            disabled={busy}
            onChange={(event) => changeStatus(event.target.value as OrderStatus)}
            className="border-input h-10 rounded-lg border bg-white px-3 text-sm"
          >
            {ORDER_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          {next ? (
            <Button type="button" size="lg" disabled={busy} onClick={() => changeStatus(next)}>
              {next}(으)로
              <ArrowRight className="size-4" aria-hidden="true" />
            </Button>
          ) : null}
        </div>

        {isParcel ? (
          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            <select
              aria-label="택배사"
              value={carrier}
              disabled={busy}
              onChange={(event) => setCarrier(event.target.value)}
              className="border-input h-10 rounded-lg border bg-white px-3 text-sm"
            >
              <option value="">택배사 선택</option>
              {TRACKING_CARRIERS.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
            <Input
              aria-label="송장번호"
              value={trackingNumber}
              disabled={busy}
              onChange={(event) => setTrackingNumber(event.target.value)}
              placeholder="송장번호"
              inputMode="numeric"
              maxLength={40}
              className="h-10 w-44 bg-white"
            />
            <Button type="button" variant="outline" size="lg" disabled={busy} onClick={saveTracking}>
              송장 저장
            </Button>
          </div>
        ) : null}
      </footer>
    </article>
  );
}

function InfoRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[3.5rem_1fr] gap-2">
      <dt className="text-muted-foreground">{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}
