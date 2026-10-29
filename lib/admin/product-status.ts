import type { Product } from "@/types/database";

export type ProductStatus = "on_sale" | "sold_out" | "hidden";

export const PRODUCT_STATUS_OPTIONS: { value: ProductStatus; label: string }[] = [
  { value: "on_sale", label: "판매중" },
  { value: "sold_out", label: "품절" },
  { value: "hidden", label: "숨김" },
];

/** 숨김(is_visible=false)이 품절(stock=0)보다 우선합니다. */
export function getProductStatus(product: Pick<Product, "is_visible" | "stock">): ProductStatus {
  if (!product.is_visible) return "hidden";
  if (product.stock <= 0) return "sold_out";
  return "on_sale";
}
