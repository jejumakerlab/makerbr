"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ImageDropzone } from "@/components/admin/image-dropzone";
import { ProductCard } from "@/components/store/product-card";
import { removeProductImages } from "@/lib/admin/product-images";
import {
  getProductStatus,
  PRODUCT_STATUS_OPTIONS,
  type ProductStatus,
} from "@/lib/admin/product-status";
import { PRODUCT_CATEGORIES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Product, ProductCategory } from "@/types/database";

const DEFAULT_MAKER = "메이커브릿지";
const COLLAB_CATEGORY: ProductCategory = "메이커 협업";
const CATEGORY_OPTIONS = PRODUCT_CATEGORIES.filter((option) => option.value !== "all").map(
  (option) => option.label as ProductCategory,
);

export function ProductFormSheet({
  open,
  product,
  onOpenChange,
  onSaved,
}: {
  open: boolean;
  /** null 이면 새 상품 등록 */
  product: Product | null;
  onOpenChange: (open: boolean) => void;
  onSaved: (product: Product, isNew: boolean) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="gap-0 data-[side=right]:w-full data-[side=right]:sm:max-w-xl"
      >
        <SheetHeader className="border-b px-6 py-5">
          <SheetTitle className="text-lg font-semibold">
            {product ? "상품 수정" : "새 상품 등록"}
          </SheetTitle>
          <SheetDescription>
            사진을 올리고 내용을 채운 뒤 저장하면 메이커 스토어에 바로 반영됩니다.
          </SheetDescription>
        </SheetHeader>
        <ProductForm
          key={product?.id ?? "new"}
          product={product}
          onCancel={() => onOpenChange(false)}
          onSaved={onSaved}
        />
      </SheetContent>
    </Sheet>
  );
}

function ProductForm({
  product,
  onCancel,
  onSaved,
}: {
  product: Product | null;
  onCancel: () => void;
  onSaved: (product: Product, isNew: boolean) => void;
}) {
  const [thumbnail, setThumbnail] = useState<string[]>(
    product?.thumbnail_url ? [product.thumbnail_url] : [],
  );
  const [detailImages, setDetailImages] = useState<string[]>(product?.detail_images ?? []);
  const [category, setCategory] = useState<ProductCategory>(product?.category ?? "자체 상품");
  const [makerName, setMakerName] = useState(product?.maker_name ?? DEFAULT_MAKER);
  const [name, setName] = useState(product?.name ?? "");
  const [price, setPrice] = useState(product ? String(product.price) : "");
  const [originalPrice, setOriginalPrice] = useState(
    product?.original_price != null ? String(product.original_price) : "",
  );
  const [stock, setStock] = useState(product ? String(product.stock) : "99");
  const [status, setStatus] = useState<ProductStatus>(
    product ? getProductStatus(product) : "on_sale",
  );
  const [description, setDescription] = useState(product?.description ?? "");
  const [uploadingThumb, setUploadingThumb] = useState(false);
  const [uploadingDetail, setUploadingDetail] = useState(false);
  const [saving, setSaving] = useState(false);

  const initialUrls = useRef(
    product ? [product.thumbnail_url, ...(product.detail_images ?? [])].filter(Boolean) : [],
  );
  // 이번에 올렸지만 저장하지 않고 닫은 사진은 스토리지에서 정리합니다.
  const uploadedThisSession = useRef(new Set<string>());
  const saved = useRef(false);

  useEffect(() => {
    const uploaded = uploadedThisSession.current;
    return () => {
      if (!saved.current && uploaded.size > 0) {
        void removeProductImages([...uploaded]);
      }
    };
  }, []);

  function rememberUploads(urls: string[]) {
    for (const url of urls) {
      if (!initialUrls.current.includes(url)) uploadedThisSession.current.add(url);
    }
  }

  function onThumbnailChange(urls: string[]) {
    rememberUploads(urls);
    setThumbnail(urls);
  }

  function onDetailImagesChange(urls: string[]) {
    rememberUploads(urls);
    setDetailImages(urls);
  }

  function changeCategory(next: ProductCategory) {
    if (next === COLLAB_CATEGORY && category !== COLLAB_CATEGORY && makerName === DEFAULT_MAKER) {
      setMakerName("");
    }
    if (next !== COLLAB_CATEGORY && category === COLLAB_CATEGORY) {
      setMakerName(DEFAULT_MAKER);
    }
    setCategory(next);
  }

  const isCollab = category === COLLAB_CATEGORY;
  const uploading = uploadingThumb || uploadingDetail;
  const priceNumber = Number(price);
  const originalNumber = originalPrice === "" ? null : Number(originalPrice);
  const stockNumber = status === "sold_out" ? 0 : Number(stock);

  const preview: Product = {
    id: product?.id ?? "preview",
    category,
    maker_name: makerName || DEFAULT_MAKER,
    name: name || "상품명",
    price: Number.isFinite(priceNumber) ? priceNumber : 0,
    original_price: originalNumber,
    thumbnail_url: thumbnail[0] ?? "",
    detail_images: detailImages,
    summary: product?.summary ?? null,
    description,
    stock: Number.isFinite(stockNumber) ? stockNumber : 0,
    is_visible: status !== "hidden",
    created_at: product?.created_at ?? new Date().toISOString(),
  };

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const problems = [
      thumbnail.length === 0 && "대표 사진을 올려 주세요.",
      !name.trim() && "상품명을 입력해 주세요.",
      !makerName.trim() && "제작자/브랜드명을 입력해 주세요.",
      (price === "" || !Number.isInteger(priceNumber) || priceNumber < 0) &&
        "판매가를 0 이상의 숫자로 입력해 주세요.",
      originalNumber != null &&
        (!Number.isInteger(originalNumber) || originalNumber < 0) &&
        "정가는 0 이상의 숫자로 입력해 주세요.",
      status !== "sold_out" &&
        (stock === "" || !Number.isInteger(stockNumber) || stockNumber < 0) &&
        "재고를 0 이상의 숫자로 입력해 주세요.",
      status === "on_sale" &&
        stockNumber === 0 &&
        "판매중으로 두려면 재고를 1개 이상 입력하거나 '품절'을 선택해 주세요.",
    ].filter((problem): problem is string => Boolean(problem));
    if (problems.length > 0) {
      toast.error(problems[0]);
      return;
    }

    const body = {
      category,
      maker_name: makerName.trim(),
      name: name.trim(),
      price: priceNumber,
      original_price: originalNumber,
      thumbnail_url: thumbnail[0],
      detail_images: detailImages.length > 0 ? detailImages : null,
      description: description.trim() || null,
      stock: stockNumber,
      is_visible: status !== "hidden",
    };

    setSaving(true);
    try {
      const response = await fetch(
        product ? `/api/admin/products/${product.id}` : "/api/admin/products",
        {
          method: product ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
      );
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "저장하지 못했습니다.");

      saved.current = true;
      const finalUrls = [thumbnail[0], ...detailImages];
      const discarded = [...initialUrls.current, ...uploadedThisSession.current].filter(
        (url) => !finalUrls.includes(url),
      );
      void removeProductImages(discarded);

      toast.success(product ? "상품을 수정했습니다." : "상품을 등록했습니다.");
      onSaved(payload.data as Product, !product);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "저장하지 못했습니다.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
      <div className="grid flex-1 gap-6 overflow-y-auto px-6 py-6">
        <ImageDropzone
          label="대표 사진 (필수)"
          hint="스토어 카드에 보이는 사진 · 가로형 4:3 권장 · 5MB 이하"
          value={thumbnail}
          onChange={onThumbnailChange}
          onUploadingChange={setUploadingThumb}
        />
        <ImageDropzone
          label="상세 사진 (선택, 여러 장)"
          hint="상품 상세 페이지 아래에 순서대로 보입니다 · 5MB 이하"
          value={detailImages}
          onChange={onDetailImagesChange}
          onUploadingChange={setUploadingDetail}
          multiple
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="product-category">카테고리</Label>
            <select
              id="product-category"
              value={category}
              onChange={(event) => changeCategory(event.target.value as ProductCategory)}
              className="border-input h-11 rounded-lg border bg-transparent px-3 text-base"
            >
              {CATEGORY_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="product-maker">제작자/브랜드명</Label>
            <Input
              id="product-maker"
              value={makerName}
              onChange={(event) => setMakerName(event.target.value)}
              readOnly={!isCollab}
              placeholder="예) 한라공방"
              className={cn("h-11", !isCollab && "bg-muted text-muted-foreground cursor-not-allowed")}
            />
            <p className="text-muted-foreground text-xs">
              {isCollab ? "협업한 메이커 이름을 입력하세요." : "'메이커 협업'일 때만 바꿀 수 있습니다."}
            </p>
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="product-name">상품명</Label>
          <Input
            id="product-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="예) 현무암 텍스처 코스터 세트"
            className="h-11"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="product-price">판매가 (원)</Label>
            <Input
              id="product-price"
              type="number"
              inputMode="numeric"
              min={0}
              step={1}
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              placeholder="24000"
              className="h-11"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="product-original-price">정가 (선택)</Label>
            <Input
              id="product-original-price"
              type="number"
              inputMode="numeric"
              min={0}
              step={1}
              value={originalPrice}
              onChange={(event) => setOriginalPrice(event.target.value)}
              placeholder="할인 전 가격"
              className="h-11"
            />
            <p className="text-muted-foreground text-xs">
              판매가보다 높게 입력하면 스토어에 취소선으로 표시됩니다.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="product-stock">재고 수량</Label>
            <Input
              id="product-stock"
              type="number"
              inputMode="numeric"
              min={0}
              step={1}
              value={status === "sold_out" ? "0" : stock}
              onChange={(event) => setStock(event.target.value)}
              disabled={status === "sold_out"}
              className="h-11"
            />
          </div>
          <div className="grid gap-2">
            <p id="product-status-label" className="text-sm font-medium">
              노출 상태
            </p>
            <div
              role="radiogroup"
              aria-labelledby="product-status-label"
              className="grid h-11 grid-cols-3 rounded-full bg-slate-100 p-1"
            >
              {PRODUCT_STATUS_OPTIONS.map((option) => {
                const active = status === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setStatus(option.value)}
                    className={cn(
                      "rounded-full text-sm font-medium transition-colors",
                      active
                        ? option.value === "on_sale"
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : option.value === "sold_out"
                            ? "bg-rose-600 text-white shadow-sm"
                            : "bg-slate-600 text-white shadow-sm"
                        : "text-slate-600 hover:text-slate-900",
                    )}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
            <p className="text-muted-foreground text-xs">
              {status === "on_sale"
                ? "스토어에 보이고 구매할 수 있습니다."
                : status === "sold_out"
                  ? "스토어에 '품절'로 보이고 구매할 수 없습니다."
                  : "스토어에서 보이지 않습니다."}
            </p>
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="product-description">상세 설명</Label>
          <Textarea
            id="product-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder={"크기, 재질, 구성품, 배송 안내 등을 자유롭게 적어 주세요.\n줄바꿈은 그대로 표시됩니다."}
            className="min-h-40 text-base leading-7"
          />
        </div>

        <div className="grid gap-2">
          <p className="text-sm font-medium">스토어 카드 미리보기</p>
          <div inert className="pointer-events-none max-w-72">
            <ProductCard product={preview} />
          </div>
        </div>
      </div>

      <div className="flex gap-2 border-t bg-white px-6 py-4">
        <Button type="button" variant="outline" size="xl" onClick={onCancel} className="flex-1">
          취소
        </Button>
        <Button type="submit" size="xl" disabled={saving || uploading} className="flex-1">
          {uploading ? "사진 올리는 중..." : saving ? "저장 중..." : product ? "수정 저장" : "등록하기"}
        </Button>
      </div>
    </form>
  );
}
