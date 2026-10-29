"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingBag, Trash2, Truck } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCart, type CartItem } from "@/components/store/cart-provider";
import { QuantityStepper } from "@/components/store/quantity-stepper";
import { formatKRW } from "@/lib/format";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/store/shipping";

export function CartDrawer() {
  const router = useRouter();
  const { items, count, subtotal, shippingFee, total, isOpen, setOpen, closeCart } = useCart();
  const remainingForFree = FREE_SHIPPING_THRESHOLD - subtotal;

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetContent
        side="right"
        className="gap-0 data-[side=right]:w-full data-[side=right]:sm:max-w-md"
      >
        <SheetHeader className="border-b px-6 py-5">
          <SheetTitle className="text-lg font-semibold">장바구니</SheetTitle>
          <SheetDescription>
            {count > 0 ? `${count}개 상품이 담겨 있습니다.` : "담긴 상품이 없습니다."}
          </SheetDescription>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <span className="flex size-16 items-center justify-center rounded-full bg-emerald-50 text-[#0f4c3a]">
              <ShoppingBag className="size-7" aria-hidden="true" />
            </span>
            <p className="text-muted-foreground">장바구니가 비어 있어요.</p>
            <Button
              size="xl"
              variant="outline"
              onClick={() => {
                closeCart();
                router.push("/store");
              }}
            >
              스토어 둘러보기
            </Button>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y overflow-y-auto px-6">
              {items.map((item) => (
                <CartLine key={item.key} item={item} onNavigate={closeCart} />
              ))}
            </ul>

            <div className="border-t bg-slate-50/80 px-6 py-5">
              {remainingForFree > 0 ? (
                <p className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2.5 text-sm text-[#0f4c3a]">
                  <Truck className="size-4 shrink-0" aria-hidden="true" />
                  {formatKRW(remainingForFree)} 더 담으면 무료배송이에요.
                </p>
              ) : (
                <p className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2.5 text-sm font-medium text-[#0f4c3a]">
                  <Truck className="size-4 shrink-0" aria-hidden="true" />
                  무료배송 조건을 충족했어요.
                </p>
              )}
              <dl className="grid gap-1.5 text-sm">
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
                  <dt className="font-semibold">결제 예정 금액</dt>
                  <dd className="text-xl font-semibold text-[#0f4c3a] tabular-nums">
                    {formatKRW(total)}
                  </dd>
                </div>
              </dl>
              <Button
                size="xl"
                className="mt-5 w-full"
                onClick={() => {
                  closeCart();
                  router.push("/checkout");
                }}
              >
                주문하기
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function CartLine({ item, onNavigate }: { item: CartItem; onNavigate: () => void }) {
  const { setQuantity, remove } = useCart();
  const { product } = item;

  return (
    <li className="flex gap-4 py-5">
      <Link
        href={`/store/${product.id}`}
        onClick={onNavigate}
        className="bg-muted relative size-20 shrink-0 overflow-hidden rounded-xl border"
      >
        {product.thumbnail_url ? (
          <Image
            src={product.thumbnail_url}
            alt={`${product.name} 사진`}
            fill
            className="object-cover"
            sizes="80px"
          />
        ) : null}
      </Link>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs font-medium text-emerald-700">{product.maker_name}</p>
            <Link
              href={`/store/${product.id}`}
              onClick={onNavigate}
              className="line-clamp-2 font-medium hover:underline"
            >
              {product.name}
            </Link>
          </div>
          <button
            type="button"
            onClick={() => remove(item.key)}
            className="text-muted-foreground -mt-1 -mr-1 flex size-8 shrink-0 items-center justify-center rounded-full hover:bg-rose-50 hover:text-rose-600"
            aria-label={`${product.name} 삭제`}
          >
            <Trash2 className="size-4" aria-hidden="true" />
          </button>
        </div>
        {item.memo ? (
          <p className="text-muted-foreground mt-1 line-clamp-2 rounded-lg bg-slate-50 px-2 py-1 text-xs">
            요청사항: {item.memo}
          </p>
        ) : null}
        <div className="mt-3 flex items-center justify-between gap-2">
          <QuantityStepper
            size="sm"
            value={item.quantity}
            max={Math.max(product.stock, 1)}
            onChange={(value) => setQuantity(item.key, value)}
            label={`${product.name} 수량`}
          />
          <p className="font-semibold tabular-nums">{formatKRW(product.price * item.quantity)}</p>
        </div>
      </div>
    </li>
  );
}
