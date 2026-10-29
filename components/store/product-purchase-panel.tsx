"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, ShoppingBag, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/components/store/cart-provider";
import { QuantityStepper } from "@/components/store/quantity-stepper";
import { QuoteDialog, type QuoteSupplier } from "@/components/store/quote-dialog";
import { formatKRW } from "@/lib/format";
import {
  discountRate,
  FREE_SHIPPING_THRESHOLD,
  SHIPPING_FEE,
  shippingFeeFor,
} from "@/lib/store/shipping";
import type { Product } from "@/types/database";

const MEMO_MAX = 200;

export function ProductPurchasePanel({
  product,
  supplier,
}: {
  product: Product;
  supplier: QuoteSupplier;
}) {
  const router = useRouter();
  const { add, openCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [memo, setMemo] = useState("");
  const [quoteOpen, setQuoteOpen] = useState(false);

  const soldOut = product.stock <= 0;
  const rate = discountRate(product.price, product.original_price);
  const itemsTotal = product.price * quantity;
  const shippingFee = shippingFeeFor(itemsTotal);

  function addToCart() {
    add(product, quantity, memo);
    openCart();
  }

  function buyNow() {
    add(product, quantity, memo);
    router.push("/checkout");
  }

  return (
    <div className="flex flex-col">
      <div className="flex flex-wrap gap-2">
        <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-[#0f4c3a]">
          {product.category}
        </span>
        <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
          {product.maker_name}
        </span>
      </div>

      <h1 className="mt-4 text-2xl leading-snug font-semibold tracking-tight break-keep sm:text-3xl">
        {product.name}
      </h1>
      {product.summary ? (
        <p className="text-muted-foreground mt-2 break-keep">{product.summary}</p>
      ) : null}

      <div className="mt-6 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        {rate > 0 ? <span className="text-2xl font-bold text-emerald-600">{rate}%</span> : null}
        <span className="text-3xl font-bold tracking-tight tabular-nums">
          {formatKRW(product.price)}
        </span>
        {rate > 0 && product.original_price ? (
          <span className="text-muted-foreground text-base line-through tabular-nums">
            {formatKRW(product.original_price)}
          </span>
        ) : null}
      </div>

      <dl className="mt-6 grid gap-3 border-y border-slate-200 py-5 text-sm">
        <div className="flex gap-4">
          <dt className="text-muted-foreground w-16 shrink-0">배송비</dt>
          <dd className="flex items-start gap-1.5">
            <Truck className="mt-0.5 size-4 shrink-0 text-emerald-600" aria-hidden="true" />
            <span>
              {formatKRW(SHIPPING_FEE)}
              <span className="text-muted-foreground">
                {" "}
                ({formatKRW(FREE_SHIPPING_THRESHOLD)} 이상 구매 시 무료배송)
              </span>
            </span>
          </dd>
        </div>
        <div className="flex gap-4">
          <dt className="text-muted-foreground w-16 shrink-0">재고</dt>
          <dd className={soldOut ? "font-semibold text-rose-600" : undefined}>
            {soldOut
              ? "품절"
              : product.stock <= 10
                ? `${product.stock}개 남음`
                : "구매 가능"}
          </dd>
        </div>
      </dl>

      <div className="mt-6 grid gap-5">
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm font-medium">수량</span>
          <QuantityStepper
            value={quantity}
            max={Math.max(product.stock, 1)}
            onChange={setQuantity}
            label={`${product.name} 수량`}
            disabled={soldOut}
          />
        </div>
        {!soldOut && quantity >= product.stock ? (
          <p className="-mt-3 text-right text-xs text-amber-700">
            현재 재고 기준 최대 {product.stock}개까지 주문할 수 있어요.
          </p>
        ) : null}

        <div className="grid gap-2">
          <label htmlFor="order-memo" className="text-sm font-medium">
            주문제작 · 요청사항 <span className="text-muted-foreground font-normal">(선택)</span>
          </label>
          <Textarea
            id="order-memo"
            value={memo}
            maxLength={MEMO_MAX}
            onChange={(event) => setMemo(event.target.value)}
            disabled={soldOut}
            placeholder="각인 문구, 색상 등 요청사항이 있으면 적어 주세요."
            className="min-h-20 resize-none bg-white text-sm"
          />
          <p className="text-muted-foreground text-right text-xs tabular-nums">
            {memo.length}/{MEMO_MAX}
          </p>
        </div>

        <div className="rounded-2xl bg-emerald-50/70 px-5 py-4">
          <div className="flex items-baseline justify-between gap-4">
            <span className="text-sm font-medium text-[#0f4c3a]">
              총 상품 금액 <span className="font-normal">({quantity}개)</span>
            </span>
            <span className="text-2xl font-bold text-[#0f4c3a] tabular-nums">
              {formatKRW(itemsTotal)}
            </span>
          </div>
          <p className="mt-1 text-right text-xs text-emerald-800/80">
            {shippingFee === 0
              ? "무료배송"
              : `배송비 ${formatKRW(shippingFee)} 별도 · ${formatKRW(FREE_SHIPPING_THRESHOLD - itemsTotal)} 더 담으면 무료배송`}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant="outline"
            size="xl"
            disabled={soldOut}
            onClick={addToCart}
            className="w-full"
          >
            <ShoppingBag className="size-4" aria-hidden="true" />
            장바구니 담기
          </Button>
          <Button type="button" size="xl" disabled={soldOut} onClick={buyNow} className="w-full">
            {soldOut ? "품절" : "바로 구매하기"}
          </Button>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="lg"
          onClick={() => setQuoteOpen(true)}
          className="justify-self-center text-slate-600 hover:text-[#0f4c3a]"
        >
          <FileText className="size-4" aria-hidden="true" />
          기관·학교용 견적서 출력
        </Button>
      </div>

      <QuoteDialog
        open={quoteOpen}
        onOpenChange={setQuoteOpen}
        product={product}
        quantity={quantity}
        memo={memo}
        supplier={supplier}
      />
    </div>
  );
}
