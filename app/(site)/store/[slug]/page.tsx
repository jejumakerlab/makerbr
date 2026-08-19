import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { getProductBySlug, getProducts } from "@/lib/data/queries";
import { formatKRW } from "@/lib/format";
import { PRODUCT_CATEGORIES } from "@/lib/constants";
import { AddToCartButton } from "@/components/store/add-to-cart-button";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  return { title: product?.name ?? "상품" };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const category =
    PRODUCT_CATEGORIES.find((item) => item.value === product.category)?.label ??
    product.category;
  const price = product.sale_price ?? product.price;
  const image = product.images[0];

  return (
    <article className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2">
      <div className="bg-muted relative min-h-80 overflow-hidden rounded-2xl border">
        {image ? (
          <Image
            src={image}
            alt={`${product.name} 상세 사진`}
            fill
            className="object-cover"
            sizes="(min-width: 1024px) 50vw, 100vw"
            priority
          />
        ) : null}
      </div>
      <div>
        <p className="text-primary text-sm font-semibold">
          {category}
          {product.maker_name ? ` · ${product.maker_name}` : ""}
        </p>
        <h1 className="mt-2 text-3xl font-semibold">{product.name}</h1>
        <p className="mt-4 flex items-baseline gap-3">
          <span className="text-2xl font-semibold">{formatKRW(price)}</span>
          {product.sale_price ? (
            <span className="text-muted-foreground line-through">
              {formatKRW(product.price)}
            </span>
          ) : null}
        </p>
        <p className="text-muted-foreground mt-6 leading-8">{product.description}</p>
        <p className="mt-4 text-sm">재고 {product.stock}개</p>
        <div className="mt-8">
          <AddToCartButton product={product} />
        </div>
      </div>
    </article>
  );
}

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((product) => ({ slug: product.slug }));
}
