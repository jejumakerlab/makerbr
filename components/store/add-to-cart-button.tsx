"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/store/cart-provider";
import type { Product } from "@/types/database";

export function AddToCartButton({ product }: { product: Product }) {
  const { add } = useCart();

  return (
    <Button
      size="xl"
      disabled={product.stock <= 0}
      onClick={() => {
        add(product, 1);
        toast.success("장바구니에 담았습니다.");
      }}
    >
      {product.stock <= 0 ? "품절" : "장바구니 담기"}
    </Button>
  );
}
