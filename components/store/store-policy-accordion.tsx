"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { formatKRW } from "@/lib/format";
import { FREE_SHIPPING_THRESHOLD, SHIPPING_FEE } from "@/lib/store/shipping";

export function StorePolicyAccordion({ phone, email }: { phone: string; email: string }) {
  const sections = [
    {
      value: "shipping",
      title: "배송 안내",
      lines: [
        `기본 배송비는 ${formatKRW(SHIPPING_FEE)}이며, ${formatKRW(FREE_SHIPPING_THRESHOLD)} 이상 구매 시 무료로 배송됩니다.`,
        "결제 확인 후 영업일 기준 2~5일 이내에 출고됩니다. 주문제작·각인 상품은 제작 기간이 추가로 소요될 수 있습니다.",
        "도서산간 지역은 추가 배송비가 발생할 수 있으며, 별도로 안내해 드립니다.",
      ],
    },
    {
      value: "exchange",
      title: "교환 · 반품 안내",
      lines: [
        "상품 수령 후 7일 이내에 고객센터로 교환·반품을 신청해 주세요.",
        "단순 변심에 의한 교환·반품은 왕복 배송비가 고객 부담이며, 상품이 훼손되지 않은 경우에만 가능합니다.",
        "상품 불량·오배송의 경우 배송비 없이 교환 또는 반품해 드립니다.",
        "주문제작·각인 등 요청사항이 반영된 상품은 제작이 시작된 이후 취소·교환·반품이 어렵습니다.",
      ],
    },
    {
      value: "refund",
      title: "환불 안내",
      lines: [
        "반품 상품이 도착해 확인된 후 영업일 기준 3일 이내에 결제하신 수단으로 환불됩니다.",
        "무통장 입금 주문은 환불받으실 계좌를 알려 주시면 해당 계좌로 환불해 드립니다.",
        `문의: ${phone} · ${email}`,
      ],
    },
  ];

  return (
    <Accordion className="rounded-2xl border border-slate-200 bg-white px-5">
      {sections.map((section) => (
        <AccordionItem key={section.value} value={section.value}>
          <AccordionTrigger className="py-4 text-base font-semibold hover:no-underline">
            {section.title}
          </AccordionTrigger>
          <AccordionContent>
            <ul className="text-muted-foreground grid list-disc gap-1.5 pb-3 pl-5 leading-6">
              {section.lines.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
