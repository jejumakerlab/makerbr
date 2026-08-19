import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/types/database";
import { formatKRW } from "@/lib/format";
import { PRODUCT_CATEGORIES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function ProductCard({ product }: { product: Product }) {
  const price = product.sale_price ?? product.price;
  const category =
    PRODUCT_CATEGORIES.find((item) => item.value === product.category)?.label ??
    product.category;
  const image = product.images[0];

  return (
    <article className="bg-card group overflow-hidden rounded-2xl border">
      <Link
        href={`/store/${product.slug}`}
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
        </div>
        <div className="p-4">
          <p className="text-primary text-xs font-semibold tracking-wide uppercase">
            {category}
            {product.maker_name ? ` · ${product.maker_name}` : ""}
          </p>
          <h3 className="mt-1 text-lg font-semibold">{product.name}</h3>
          <p className="mt-3 flex items-baseline gap-2">
            <span className="text-lg font-semibold">{formatKRW(price)}</span>
            {product.sale_price ? (
              <span className="text-muted-foreground text-sm line-through">
                {formatKRW(product.price)}
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
