"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink, PackageX, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ProductFormSheet } from "@/components/admin/product-form-sheet";
import { ToggleSwitch } from "@/components/admin/toggle-switch";
import { strikePrice } from "@/components/store/product-card";
import { removeProductImages } from "@/lib/admin/product-images";
import { getProductStatus, type ProductStatus } from "@/lib/admin/product-status";
import { formatKRW } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/database";

const STATUS_BADGE: Record<ProductStatus, { label: string; className: string }> = {
  on_sale: { label: "판매중", className: "bg-emerald-50 text-emerald-700 ring-emerald-600/20" },
  sold_out: { label: "품절", className: "bg-rose-50 text-rose-700 ring-rose-600/20" },
  hidden: { label: "숨김", className: "bg-slate-100 text-slate-600 ring-slate-500/20" },
};

export function ProductManager({
  initialProducts,
  openNewOnMount = false,
  demo = false,
}: {
  initialProducts: Product[];
  openNewOnMount?: boolean;
  demo?: boolean;
}) {
  const [products, setProducts] = useState(initialProducts);
  const [sheetOpen, setSheetOpen] = useState(openNewOnMount);
  const [editing, setEditing] = useState<Product | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    if (openNewOnMount) window.history.replaceState(null, "", "/admin/products");
  }, [openNewOnMount]);

  const counts = products.reduce(
    (acc, item) => {
      acc[getProductStatus(item)] += 1;
      return acc;
    },
    { on_sale: 0, sold_out: 0, hidden: 0 } as Record<ProductStatus, number>,
  );

  function openCreate() {
    setEditing(null);
    setSheetOpen(true);
  }

  function openEdit(product: Product) {
    setEditing(product);
    setSheetOpen(true);
  }

  async function patch(product: Product, changes: Partial<Product>, successMessage: string) {
    const previous = products;
    setBusyId(product.id);
    setProducts((list) =>
      list.map((item) => (item.id === product.id ? { ...item, ...changes } : item)),
    );
    try {
      const response = await fetch(`/api/admin/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(changes),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "변경하지 못했습니다.");
      toast.success(successMessage);
    } catch (error) {
      setProducts(previous);
      toast.error(error instanceof Error ? error.message : "변경하지 못했습니다.");
    } finally {
      setBusyId(null);
    }
  }

  async function remove(product: Product) {
    if (!confirm(`'${product.name}' 상품을 삭제할까요?\n삭제하면 되돌릴 수 없습니다.`)) return;
    setBusyId(product.id);
    try {
      const response = await fetch(`/api/admin/products/${product.id}`, { method: "DELETE" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "삭제하지 못했습니다.");
      setProducts((list) => list.filter((item) => item.id !== product.id));
      void removeProductImages([product.thumbnail_url, ...(product.detail_images ?? [])]);
      toast.success("상품을 삭제했습니다.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "삭제하지 못했습니다.");
    } finally {
      setBusyId(null);
    }
  }

  function onSaved(saved: Product, isNew: boolean) {
    setProducts((list) =>
      isNew ? [saved, ...list] : list.map((item) => (item.id === saved.id ? saved : item)),
    );
    setSheetOpen(false);
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">상품 관리</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            전체 {products.length}개 · 판매중 {counts.on_sale} · 품절 {counts.sold_out} · 숨김{" "}
            {counts.hidden}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/store"
            target="_blank"
            className="border-border inline-flex h-11 items-center gap-1.5 rounded-full border bg-white px-4 text-sm font-medium hover:bg-slate-50"
          >
            스토어 보기
            <ExternalLink className="size-4" aria-hidden="true" />
          </Link>
          <Button size="xl" onClick={openCreate}>
            <Plus className="size-4" aria-hidden="true" />
            상품 등록하기
          </Button>
        </div>
      </div>

      {demo ? (
        <p className="bg-accent mt-4 rounded-lg px-4 py-3 text-sm" role="status">
          데모 모드입니다. Supabase 설정이 없어 변경 내용이 저장되지 않습니다.
        </p>
      ) : null}

      <div className="bg-card mt-6 overflow-hidden rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 hover:bg-slate-50">
              <TableHead className="w-20 pl-4">사진</TableHead>
              <TableHead>카테고리</TableHead>
              <TableHead>상품명</TableHead>
              <TableHead className="text-right">판매가</TableHead>
              <TableHead>재고 상태</TableHead>
              <TableHead className="text-center">노출</TableHead>
              <TableHead className="pr-4 text-right">관리</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-16 text-center">
                  <p className="text-muted-foreground">아직 등록된 상품이 없습니다.</p>
                  <Button className="mt-4" size="xl" onClick={openCreate}>
                    <Plus className="size-4" aria-hidden="true" />첫 상품 등록하기
                  </Button>
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => {
                const status = getProductStatus(product);
                const badge = STATUS_BADGE[status];
                const originalPrice = strikePrice(product);
                const busy = busyId === product.id;
                return (
                  <TableRow key={product.id} className={cn(busy && "opacity-60")}>
                    <TableCell className="pl-4">
                      <div className="bg-muted relative size-14 overflow-hidden rounded-lg border">
                        {product.thumbnail_url ? (
                          <Image
                            src={product.thumbnail_url}
                            alt=""
                            fill
                            className="object-cover"
                            sizes="56px"
                          />
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{product.category}</TableCell>
                    <TableCell className="max-w-64">
                      <p className="truncate font-medium">{product.name}</p>
                      <p className="text-muted-foreground truncate text-xs">{product.maker_name}</p>
                    </TableCell>
                    <TableCell className="text-right">
                      <p className="font-medium">{formatKRW(product.price)}</p>
                      {originalPrice ? (
                        <p className="text-muted-foreground text-xs line-through">
                          {formatKRW(originalPrice)}
                        </p>
                      ) : null}
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
                          badge.className,
                        )}
                      >
                        {badge.label}
                      </span>
                      <span className="text-muted-foreground ml-2 text-xs">
                        재고 {product.stock}개
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <ToggleSwitch
                        checked={product.is_visible}
                        disabled={busy}
                        label={`${product.name} 스토어 노출`}
                        onCheckedChange={(checked) =>
                          void patch(
                            product,
                            { is_visible: checked },
                            checked ? "스토어에 노출했습니다." : "스토어에서 숨겼습니다.",
                          )
                        }
                      />
                    </TableCell>
                    <TableCell className="pr-4">
                      <div className="flex justify-end gap-1">
                        {product.stock > 0 ? (
                          <Button
                            variant="outline"
                            size="lg"
                            disabled={busy}
                            onClick={() =>
                              void patch(product, { stock: 0 }, `'${product.name}'을(를) 품절 처리했습니다.`)
                            }
                          >
                            <PackageX className="size-4" aria-hidden="true" />
                            품절 처리
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="lg"
                            disabled={busy}
                            onClick={() => openEdit(product)}
                          >
                            재고 입력
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="lg"
                          disabled={busy}
                          onClick={() => openEdit(product)}
                        >
                          <Pencil className="size-4" aria-hidden="true" />
                          수정
                        </Button>
                        <Button
                          variant="destructive"
                          size="lg"
                          disabled={busy}
                          onClick={() => void remove(product)}
                        >
                          <Trash2 className="size-4" aria-hidden="true" />
                          삭제
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <ProductFormSheet
        open={sheetOpen}
        product={editing}
        onOpenChange={setSheetOpen}
        onSaved={onSaved}
      />
    </div>
  );
}
