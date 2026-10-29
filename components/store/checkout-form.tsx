"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/components/store/cart-provider";
import { formatKRW } from "@/lib/format";
import { cn } from "@/lib/utils";

type BankInfo = { bankName: string; bankAccount: string; bankHolder: string };

export function CheckoutForm({ bank }: { bank: BankInfo }) {
  const { items, subtotal, shippingFee, total, clear, openCart } = useCart();
  const [pending, setPending] = useState(false);
  const [completed, setCompleted] = useState<{ orderNumber: string; total: number } | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (items.length === 0) {
      toast.error("장바구니가 비어 있습니다.");
      return;
    }

    const form = new FormData(event.currentTarget);
    setPending(true);
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: form.get("customer_name"),
          customer_email: form.get("customer_email"),
          customer_phone: form.get("customer_phone"),
          postal_code: form.get("postal_code"),
          address_line1: form.get("address_line1"),
          address_line2: form.get("address_line2"),
          shipping_memo: form.get("shipping_memo"),
          items: items.map((item) => ({
            product_id: item.product.id,
            // 주문 상품 테이블에 별도 메모 칸이 없어 상품명 뒤에 요청사항을 붙여 보관합니다.
            product_name: item.memo
              ? `${item.product.name} [요청사항: ${item.memo}]`
              : item.product.name,
            unit_price: item.product.price,
            quantity: item.quantity,
          })),
          total_amount: total,
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "주문에 실패했습니다.");

      setCompleted({ orderNumber: payload.order_number, total });
      clear();
      window.scrollTo({ top: 0 });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "주문 처리 중 오류가 발생했습니다.");
    } finally {
      setPending(false);
    }
  }

  if (completed) {
    return (
      <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-8 text-center">
        <CheckCircle2 className="mx-auto size-12 text-emerald-600" aria-hidden="true" />
        <h2 className="mt-4 text-2xl font-semibold">주문이 접수되었습니다</h2>
        <p className="text-muted-foreground mt-2">
          주문번호 <span className="font-semibold text-slate-900">{completed.orderNumber}</span>
        </p>
        <div className="mt-6 rounded-2xl bg-emerald-50 px-5 py-4 text-left text-sm text-[#0f4c3a]">
          <p className="font-semibold">입금 안내</p>
          <p className="mt-1">
            {bank.bankName} {bank.bankAccount} (예금주 {bank.bankHolder})
          </p>
          <p className="mt-1">
            입금 금액 <span className="font-semibold">{formatKRW(completed.total)}</span> · 입금이
            확인되면 순서대로 출고해 드립니다.
          </p>
        </div>
        <Link href="/store" className={cn(buttonVariants({ size: "xl" }), "mt-8")}>
          쇼핑 계속하기
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center rounded-3xl border border-slate-200 bg-white p-10 text-center">
        <span className="flex size-16 items-center justify-center rounded-full bg-emerald-50 text-[#0f4c3a]">
          <ShoppingBag className="size-7" aria-hidden="true" />
        </span>
        <p className="text-muted-foreground mt-4">장바구니가 비어 있어요.</p>
        <Link href="/store" className={cn(buttonVariants({ size: "xl" }), "mt-6")}>
          스토어 둘러보기
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <form id="checkout-form" onSubmit={onSubmit} className="grid gap-5 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
        <h2 className="text-lg font-semibold">주문자 · 배송 정보</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="customer_name" label="주문자명" required autoComplete="name" />
          <Field id="customer_phone" label="연락처" type="tel" required autoComplete="tel" />
        </div>
        <Field id="customer_email" label="이메일" type="email" required autoComplete="email" />
        <div className="grid gap-5 sm:grid-cols-[10rem_1fr]">
          <Field id="postal_code" label="우편번호" autoComplete="postal-code" />
          <Field id="address_line1" label="주소" required autoComplete="address-line1" />
        </div>
        <Field id="address_line2" label="상세 주소" autoComplete="address-line2" />
        <div className="grid gap-2">
          <Label htmlFor="shipping_memo">배송 메모</Label>
          <Textarea
            id="shipping_memo"
            name="shipping_memo"
            placeholder="예) 부재 시 문 앞에 놓아 주세요."
            className="min-h-24"
          />
        </div>
      </form>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-3xl border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">주문 상품</h2>
            <button
              type="button"
              onClick={openCart}
              className="text-sm font-medium text-emerald-700 underline-offset-4 hover:underline"
            >
              장바구니 수정
            </button>
          </div>
          <ul className="mt-4 divide-y">
            {items.map((item) => (
              <li key={item.key} className="flex gap-3 py-3">
                <div className="bg-muted relative size-16 shrink-0 overflow-hidden rounded-xl border">
                  {item.product.thumbnail_url ? (
                    <Image
                      src={item.product.thumbnail_url}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1 text-sm">
                  <p className="line-clamp-2 font-medium">{item.product.name}</p>
                  {item.memo ? (
                    <p className="text-muted-foreground line-clamp-2 text-xs">요청사항: {item.memo}</p>
                  ) : null}
                  <p className="text-muted-foreground mt-1 text-xs">
                    {formatKRW(item.product.price)} × {item.quantity}개
                  </p>
                </div>
                <p className="text-sm font-semibold tabular-nums">
                  {formatKRW(item.product.price * item.quantity)}
                </p>
              </li>
            ))}
          </ul>
          <dl className="mt-4 grid gap-1.5 border-t pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">상품 금액</dt>
              <dd className="tabular-nums">{formatKRW(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">배송비</dt>
              <dd className="tabular-nums">
                {shippingFee === 0 ? "무료" : `+${formatKRW(shippingFee)}`}
              </dd>
            </div>
            <div className="mt-2 flex items-baseline justify-between border-t pt-3">
              <dt className="font-semibold">총 결제 금액</dt>
              <dd className="text-2xl font-bold text-[#0f4c3a] tabular-nums">{formatKRW(total)}</dd>
            </div>
          </dl>
          <Button type="submit" form="checkout-form" size="xl" className="mt-6 w-full" disabled={pending}>
            {pending ? "주문 처리 중..." : `${formatKRW(total)} 주문하기`}
          </Button>
          <p className="text-muted-foreground mt-3 text-center text-xs">
            주문 후 안내되는 계좌로 입금해 주시면 확인 후 출고됩니다.
          </p>
        </div>
      </aside>
    </div>
  );
}

function Field({
  id,
  label,
  type = "text",
  required,
  autoComplete,
}: {
  id: string;
  label: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>
        {label}
        {required ? <span className="text-destructive"> *</span> : null}
      </Label>
      <Input
        id={id}
        name={id}
        type={type}
        required={required}
        autoComplete={autoComplete}
        className="h-11"
      />
    </div>
  );
}
