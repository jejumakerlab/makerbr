import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { ProductPurchasePanel } from "@/components/store/product-purchase-panel";
import { StorePolicyAccordion } from "@/components/store/store-policy-accordion";
import { PRODUCT_CATEGORIES } from "@/lib/constants";
import { getProductById, getSiteSettings, getVisibleProductIds } from "@/lib/data/queries";

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
  const [product, site] = await Promise.all([getProductById(id), getSiteSettings()]);
  if (!product) notFound();

  const detailImages = product.detail_images ?? [];
  const categoryValue = PRODUCT_CATEGORIES.find((item) => item.label === product.category)?.value;
  const soldOut = product.stock <= 0;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <nav aria-label="현재 위치" className="text-muted-foreground mb-6 flex items-center gap-1 text-sm">
        <Link href="/store" className="hover:text-[#0f4c3a]">
          메이커 스토어
        </Link>
        <ChevronRight className="size-4" aria-hidden="true" />
        <Link
          href={categoryValue ? `/store?category=${categoryValue}` : "/store"}
          className="hover:text-[#0f4c3a]"
        >
          {product.category}
        </Link>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-14">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="bg-muted relative aspect-[4/3] overflow-hidden rounded-3xl border border-slate-200">
            {product.thumbnail_url ? (
              <Image
                src={product.thumbnail_url}
                alt={`${product.name} 대표 사진`}
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 560px, 100vw"
                preload
              />
            ) : (
              <div className="text-muted-foreground flex h-full items-center justify-center text-sm">
                이미지 준비 중
              </div>
            )}
            {soldOut ? (
              <div className="absolute inset-0 flex items-center justify-center bg-white/55">
                <span className="rounded-full bg-slate-900/85 px-5 py-2 text-sm font-semibold text-white">
                  품절된 상품입니다
                </span>
              </div>
            ) : null}
          </div>
        </div>

        <ProductPurchasePanel
          product={product}
          supplier={{
            legalName: site.legalName,
            ceo: site.ceo,
            businessNumber: site.businessNumber,
            postalCode: site.postalCode,
            address: site.address,
            phone: site.phone,
            fax: site.fax,
            email: site.email,
            bankName: site.bankName,
            bankAccount: site.bankAccount,
            bankHolder: site.bankHolder,
          }}
        />
      </div>

      <section aria-labelledby="product-detail-heading" className="mt-16 border-t border-slate-200 pt-12 sm:mt-20">
        <div className="mx-auto max-w-3xl">
          <h2 id="product-detail-heading" className="text-xl font-semibold tracking-tight">
            상품 상세 정보
          </h2>

          {product.description ? (
            <p className="mt-6 text-[15px] leading-8 break-keep whitespace-pre-line text-slate-700">
              {product.description}
            </p>
          ) : null}

          {detailImages.length > 0 ? (
            <div className="mt-10 grid gap-4">
              {detailImages.map((src, index) => (
                <Image
                  key={src}
                  src={src}
                  alt={`${product.name} 상세 사진 ${index + 1}`}
                  width={1200}
                  height={900}
                  sizes="(min-width: 768px) 768px, 100vw"
                  className="h-auto w-full rounded-2xl border border-slate-200 bg-slate-50"
                />
              ))}
            </div>
          ) : null}

          {!product.description && detailImages.length === 0 ? (
            <p className="text-muted-foreground mt-6">상세 정보가 준비 중입니다.</p>
          ) : null}

          <div className="mt-14">
            <h2 className="mb-4 text-xl font-semibold tracking-tight">배송 · 교환 · 환불 안내</h2>
            <StorePolicyAccordion phone={site.phone} email={site.email} />
          </div>
        </div>
      </section>
    </div>
  );
}

export async function generateStaticParams() {
  const ids = await getVisibleProductIds();
  return ids.map((id) => ({ id }));
}
