import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { getProductById, getVisibleProductIds } from "@/lib/data/queries";
import { formatKRW } from "@/lib/format";
import { AddToCartButton } from "@/components/store/add-to-cart-button";
import { strikePrice } from "@/components/store/product-card";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductById(id);
  return {
    title: product?.name ?? "상품",
    description: product?.summary ?? undefined,
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) notFound();

  const image = product.thumbnail_url;
  const originalPrice = strikePrice(product);
  const detailImages = product.detail_images ?? [];

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
          {product.category}
          {product.maker_name ? ` · ${product.maker_name}` : ""}
        </p>
        <h1 className="mt-2 text-3xl font-semibold">{product.name}</h1>
        <p className="mt-4 flex items-baseline gap-3">
          <span className="text-2xl font-semibold">{formatKRW(product.price)}</span>
          {originalPrice ? (
            <span className="text-muted-foreground line-through">
              {formatKRW(originalPrice)}
            </span>
          ) : null}
        </p>
        <p className="text-muted-foreground mt-6 leading-8 whitespace-pre-line">
          {product.description}
        </p>
        <p className="mt-4 text-sm">
          {product.stock > 0 ? `재고 ${product.stock}개` : "품절"}
        </p>
        <div className="mt-8">
          <AddToCartButton product={product} />
        </div>
      </div>
      {detailImages.length > 0 ? (
        <div className="grid gap-4 lg:col-span-2">
          {detailImages.map((src, index) => (
            <div
              key={src}
              className="bg-muted relative aspect-[4/3] overflow-hidden rounded-2xl border"
            >
              <Image
                src={src}
                alt={`${product.name} 상세 이미지 ${index + 1}`}
                fill
                className="object-cover"
                sizes="(min-width: 1152px) 1104px, 100vw"
              />
            </div>
          ))}
        </div>
      ) : null}
    </article>
  );
}

export async function generateStaticParams() {
  const ids = await getVisibleProductIds();
  return ids.map((id) => ({ id }));
}
