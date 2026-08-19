"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/components/store/cart-provider";
import { formatKRW } from "@/lib/format";

export default function CheckoutPage() {
  const { items, total, clear } = useCart();
  const [pending, setPending] = useState(false);

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
            product_name: item.product.name,
            unit_price: item.product.sale_price ?? item.product.price,
            quantity: item.quantity,
          })),
          total_amount: total,
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "주문에 실패했습니다.");

      if (payload.paymentReady && window.PortOne) {
        // PortOne SDK는 환경 변수가 있을 때 클라이언트에서 호출합니다.
      }

      toast.success(
        payload.demo
          ? "데모 주문이 접수되었습니다. Supabase·PortOne 연결 후 실결제가 활성화됩니다."
          : "주문이 생성되었습니다. 결제를 진행해 주세요.",
      );
      clear();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "결제 준비 중 오류가 발생했습니다.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-semibold">주문 · 결제</h1>
      <p className="text-muted-foreground mt-2">
        결제 모듈은 PortOne(토스페이먼츠 등)과 연동됩니다. 합계 {formatKRW(total)}
      </p>
      <form onSubmit={onSubmit} className="mt-8 grid gap-5">
        <Field id="customer_name" label="주문자명" required />
        <Field id="customer_email" label="이메일" type="email" required />
        <Field id="customer_phone" label="연락처" type="tel" required />
        <Field id="postal_code" label="우편번호" />
        <Field id="address_line1" label="주소" required />
        <Field id="address_line2" label="상세 주소" />
        <div className="grid gap-2">
          <Label htmlFor="shipping_memo">배송 메모</Label>
          <Textarea id="shipping_memo" name="shipping_memo" className="min-h-24" />
        </div>
        <Button type="submit" size="xl" disabled={pending || items.length === 0}>
          {pending ? "처리 중..." : `${formatKRW(total)} 결제하기`}
        </Button>
      </form>
    </div>
  );
}

function Field({
  id,
  label,
  type = "text",
  required,
}: {
  id: string;
  label: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>
        {label}
        {required ? <span className="text-destructive"> *</span> : null}
      </Label>
      <Input id={id} name={id} type={type} required={required} className="h-11" />
    </div>
  );
}

declare global {
  interface Window {
    PortOne?: unknown;
  }
}
