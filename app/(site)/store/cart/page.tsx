"use client";

import Link from "next/link";
import { useCart } from "@/components/store/cart-provider";
import { Button, buttonVariants } from "@/components/ui/button";
import { formatKRW } from "@/lib/format";
import { cn } from "@/lib/utils";

export default function CartPage() {
  const { items, setQuantity, remove, total } = useCart();

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-semibold">장바구니</h1>
      {items.length === 0 ? (
        <p className="text-muted-foreground mt-6">담긴 상품이 없습니다.</p>
      ) : (
        <ul className="mt-8 divide-y rounded-2xl border">
          {items.map((item) => {
            const price = item.product.sale_price ?? item.product.price;
            return (
              <li key={item.product.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                <div className="flex-1">
                  <p className="font-semibold">{item.product.name}</p>
                  <p className="text-muted-foreground text-sm">{formatKRW(price)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <label className="sr-only" htmlFor={`qty-${item.product.id}`}>
                    {item.product.name} 수량
                  </label>
                  <input
                    id={`qty-${item.product.id}`}
                    type="number"
                    min={1}
                    max={item.product.stock}
                    value={item.quantity}
                    onChange={(event) =>
                      setQuantity(item.product.id, Number(event.target.value))
                    }
                    className="h-11 w-20 rounded-lg border px-3"
                  />
                  <Button variant="ghost" onClick={() => remove(item.product.id)}>
                    삭제
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <div className="mt-8 flex items-center justify-between">
        <p className="text-lg font-semibold">합계 {formatKRW(total)}</p>
        <Link
          href="/store/checkout"
          className={cn(
            buttonVariants({ size: "xl" }),
            items.length === 0 && "pointer-events-none opacity-50",
          )}
          aria-disabled={items.length === 0}
        >
          결제하기
        </Link>
      </div>
    </div>
  );
}
