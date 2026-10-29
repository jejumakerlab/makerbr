"use client";

import { useState } from "react";
import { Printer } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatKRW } from "@/lib/format";
import { createQuoteNumber, splitVat, toKoreanAmount } from "@/lib/store/quote";
import { shippingFeeFor } from "@/lib/store/shipping";
import type { SiteContent } from "@/lib/constants";
import type { Product } from "@/types/database";

export type QuoteSupplier = Pick<
  SiteContent,
  | "legalName"
  | "ceo"
  | "businessNumber"
  | "postalCode"
  | "address"
  | "phone"
  | "fax"
  | "email"
  | "bankName"
  | "bankAccount"
  | "bankHolder"
>;

type QuoteProps = {
  product: Product;
  quantity: number;
  memo: string;
  supplier: QuoteSupplier;
};

export function QuoteDialog({
  open,
  onOpenChange,
  ...quote
}: QuoteProps & { open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        id="print-quote-dialog"
        showCloseButton={false}
        className="max-h-[92vh] gap-0 overflow-y-auto p-0 sm:max-w-3xl"
      >
        <QuoteBody {...quote} onClose={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}

function QuoteBody({
  product,
  quantity,
  memo,
  supplier,
  onClose,
}: QuoteProps & { onClose: () => void }) {
  const [recipient, setRecipient] = useState("");
  const [issuedAt] = useState(() => new Date());
  const [quoteNumber] = useState(() => createQuoteNumber());

  const itemsTotal = product.price * quantity;
  const shippingFee = shippingFeeFor(itemsTotal);
  const total = itemsTotal + shippingFee;
  const { supply, vat } = splitVat(total);
  const validUntil = new Date(issuedAt);
  validUntil.setDate(validUntil.getDate() + 30);
  const formatDate = (date: Date) =>
    date.toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" });

  return (
    <>
      <div className="sticky top-0 z-10 flex flex-col gap-3 border-b bg-white px-6 py-4 sm:flex-row sm:items-end print:hidden">
        <div className="grid flex-1 gap-1.5">
          <DialogTitle className="text-base font-semibold">견적서 미리보기</DialogTitle>
          <label htmlFor="quote-recipient" className="text-muted-foreground text-xs">
            수신 기관·학교명을 입력하면 견적서에 함께 표시됩니다.
          </label>
          <Input
            id="quote-recipient"
            value={recipient}
            onChange={(event) => setRecipient(event.target.value)}
            placeholder="예) 제주중앙초등학교 행정실"
            className="h-10"
          />
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="lg" onClick={onClose}>
            닫기
          </Button>
          <Button type="button" size="lg" onClick={() => window.print()}>
            <Printer className="size-4" aria-hidden="true" />
            인쇄 · PDF 저장
          </Button>
        </div>
      </div>

      <article id="print-quote" className="bg-white px-6 py-8 text-[13px] leading-relaxed text-slate-900 sm:px-10">
        <header className="border-b-2 border-[#0f4c3a] pb-4 text-center">
          <h2 className="text-3xl font-bold tracking-[0.5em] text-[#0f4c3a]">견적서</h2>
          <p className="mt-1 text-xs text-slate-500">QUOTATION</p>
        </header>

        <div className="mt-6 grid gap-6 sm:grid-cols-2 print:grid-cols-2">
          <section>
            <p className="text-lg font-semibold">
              {recipient.trim() ? (
                <span className="underline decoration-slate-300 underline-offset-8">
                  {recipient.trim()}
                </span>
              ) : (
                <span className="inline-block w-48 border-b border-slate-400 align-bottom" />
              )}{" "}
              귀하
            </p>
            <dl className="mt-5 grid grid-cols-[5rem_1fr] gap-y-1.5 text-slate-700">
              <dt className="text-slate-500">견적번호</dt>
              <dd>{quoteNumber}</dd>
              <dt className="text-slate-500">견적일자</dt>
              <dd>{formatDate(issuedAt)}</dd>
              <dt className="text-slate-500">유효기간</dt>
              <dd>{formatDate(validUntil)}까지 (30일)</dd>
            </dl>
            <p className="mt-5 text-slate-700">아래와 같이 견적합니다.</p>
          </section>

          <section>
            <table className="w-full border-collapse border border-slate-300 text-xs">
              <caption className="bg-[#0f4c3a] py-1.5 text-center text-xs font-semibold tracking-widest text-white">
                공 급 자
              </caption>
              <tbody>
                {[
                  ["상호", supplier.legalName],
                  ["대표자", `${supplier.ceo} (인)`],
                  ["사업자번호", supplier.businessNumber],
                  ["주소", `(${supplier.postalCode}) ${supplier.address}`],
                  ["전화 · 팩스", `${supplier.phone} · ${supplier.fax}`],
                  ["이메일", supplier.email],
                ].map(([label, value]) => (
                  <tr key={label}>
                    <th className="w-20 border border-slate-300 bg-slate-50 px-2 py-1.5 text-left font-medium text-slate-600">
                      {label}
                    </th>
                    <td className="border border-slate-300 px-2 py-1.5">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>

        <div className="mt-6 flex flex-wrap items-baseline justify-between gap-2 border-y-2 border-[#0f4c3a] bg-emerald-50/60 px-4 py-3">
          <span className="font-semibold">합계 금액 (부가세 포함)</span>
          <span className="text-base font-bold">
            일금 {toKoreanAmount(total)}원정{" "}
            <span className="text-[#0f4c3a]">({formatKRW(total)})</span>
          </span>
        </div>

        <table className="mt-6 w-full border-collapse text-xs">
          <thead>
            <tr className="bg-slate-100 text-slate-600">
              <th className="border border-slate-300 px-2 py-2 font-medium">No</th>
              <th className="border border-slate-300 px-2 py-2 text-left font-medium">품명 · 규격</th>
              <th className="border border-slate-300 px-2 py-2 font-medium">수량</th>
              <th className="border border-slate-300 px-2 py-2 text-right font-medium">단가</th>
              <th className="border border-slate-300 px-2 py-2 text-right font-medium">금액</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-slate-300 px-2 py-2 text-center">1</td>
              <td className="border border-slate-300 px-2 py-2">
                <p className="font-medium">{product.name}</p>
                <p className="text-slate-500">
                  {product.category} · {product.maker_name}
                </p>
              </td>
              <td className="border border-slate-300 px-2 py-2 text-center tabular-nums">{quantity}</td>
              <td className="border border-slate-300 px-2 py-2 text-right tabular-nums">
                {formatKRW(product.price)}
              </td>
              <td className="border border-slate-300 px-2 py-2 text-right tabular-nums">
                {formatKRW(itemsTotal)}
              </td>
            </tr>
            <tr>
              <td className="border border-slate-300 px-2 py-2 text-center">2</td>
              <td className="border border-slate-300 px-2 py-2">
                배송비
                {shippingFee === 0 ? (
                  <span className="text-slate-500"> (무료배송 적용)</span>
                ) : null}
              </td>
              <td className="border border-slate-300 px-2 py-2 text-center">1</td>
              <td className="border border-slate-300 px-2 py-2 text-right tabular-nums">
                {formatKRW(shippingFee)}
              </td>
              <td className="border border-slate-300 px-2 py-2 text-right tabular-nums">
                {formatKRW(shippingFee)}
              </td>
            </tr>
          </tbody>
          <tfoot>
            {[
              ["공급가액", supply],
              ["부가세", vat],
              ["합계", total],
            ].map(([label, value]) => (
              <tr key={label} className={label === "합계" ? "font-semibold" : undefined}>
                <td colSpan={4} className="border border-slate-300 bg-slate-50 px-2 py-1.5 text-right">
                  {label}
                </td>
                <td className="border border-slate-300 px-2 py-1.5 text-right tabular-nums">
                  {formatKRW(value as number)}
                </td>
              </tr>
            ))}
          </tfoot>
        </table>

        <section className="mt-6 grid gap-1.5 text-xs text-slate-700">
          <p>
            <span className="font-semibold">입금 계좌</span> · {supplier.bankName}{" "}
            {supplier.bankAccount} (예금주 {supplier.bankHolder})
          </p>
          {memo.trim() ? (
            <p className="whitespace-pre-line">
              <span className="font-semibold">요청사항</span> · {memo.trim()}
            </p>
          ) : null}
          <p className="text-slate-500">
            ※ 온라인 스토어 판매가 기준 견적이며, 수량·사양·납기에 따라 조정될 수 있습니다.
            세금계산서 발행이 필요하시면 사업자등록증과 함께 {supplier.email} 로 요청해 주세요.
          </p>
        </section>

        <footer className="mt-10 text-right text-sm">
          <p className="font-semibold">{supplier.legalName}</p>
          <p className="text-slate-500">대표 {supplier.ceo} (인)</p>
        </footer>
      </article>
    </>
  );
}
