import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/types/database";
import { formatKRW } from "@/lib/format";
import { cn } from "@/lib/utils";

/** 판매가보다 높은 정가가 있을 때만 취소선으로 보여줄 금액 */
export function strikePrice(product: Product) {
  return product.original_price != null && product.original_price > product.price
    ? product.original_price
    : null;
}

export function ProductCard({ product }: { product: Product }) {
  const image = product.thumbnail_url;
  const originalPrice = strikePrice(product);
  const soldOut = product.stock <= 0;

  return (
    <article className="bg-card group overflow-hidden rounded-2xl border">
      <Link
        href={`/store/${product.id}`}
        className="block focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        <div className="bg-muted relative aspect-[4/3] overflow-hidden">
          {image ? (
            <Image
              src={image}
              alt={`${product.name} 상품 사진`}
              fill
              className="object-cover transition-transform group-hover:scale-[1.03]"
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            />
          ) : (
            <div className="text-muted-foreground flex h-full items-center justify-center text-sm">
              이미지 준비 중
            </div>
          )}
          {soldOut ? (
            <span className="absolute top-3 left-3 rounded-full bg-slate-900/80 px-3 py-1 text-xs font-semibold text-white">
              품절
            </span>
          ) : null}
        </div>
        <div className="p-4">
          <p className="text-primary text-xs font-semibold tracking-wide uppercase">
            {product.category}
            {product.maker_name ? ` · ${product.maker_name}` : ""}
          </p>
          <h3 className="mt-1 text-lg font-semibold">{product.name}</h3>
          <p className="mt-3 flex items-baseline gap-2">
            <span className="text-lg font-semibold">{formatKRW(product.price)}</span>
            {originalPrice ? (
              <span className="text-muted-foreground text-sm line-through">
                {formatKRW(originalPrice)}
              </span>
            ) : null}
          </p>
        </div>
      </Link>
    </article>
  );
}

export function ProductGrid({
  products,
  className,
}: {
  products: Product[];
  className?: string;
}) {
  if (products.length === 0) {
    return <p className="text-muted-foreground">등록된 상품이 없습니다.</p>;
  }

  return (
    <ul className={cn("grid gap-6 sm:grid-cols-2 lg:grid-cols-3", className)}>
      {products.map((product) => (
        <li key={product.id}>
          <ProductCard product={product} />
        </li>
      ))}
    </ul>
  );
}
