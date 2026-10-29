"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2, CreditCard, Landmark, MapPin, Search, ShoppingBag, Truck } from "lucide-react";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/components/store/cart-provider";
import { formatKRW } from "@/lib/format";
import { LAST_ORDER_STORAGE_KEY, type PlacedOrder } from "@/lib/store/orders";
import { FREE_SHIPPING_THRESHOLD, shippingFeeFor } from "@/lib/store/shipping";
import { cn } from "@/lib/utils";
import type { DeliveryMethod, PaymentMethod } from "@/types/database";

type DaumPostcodeData = {
  zonecode: string;
  roadAddress: string;
  jibunAddress: string;
  buildingName: string;
};

declare global {
  interface Window {
    daum?: {
      Postcode: new (options: { oncomplete: (data: DaumPostcodeData) => void }) => {
        open: () => void;
      };
    };
  }
}

const POSTCODE_SCRIPT = "https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
const MEMO_PRESETS = [
  "문 앞에 놓아 주세요.",
  "경비실에 맡겨 주세요.",
  "배송 전에 연락 부탁드립니다.",
  "직접 입력",
];

function loadPostcodeScript() {
  return new Promise<void>((resolve, reject) => {
    if (window.daum?.Postcode) return resolve();
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${POSTCODE_SCRIPT}"]`);
    const script = existing ?? document.createElement("script");
    script.addEventListener("load", () => resolve(), { once: true });
    script.addEventListener("error", () => reject(new Error("주소 검색을 불러오지 못했습니다.")), {
      once: true,
    });
    if (!existing) {
      script.src = POSTCODE_SCRIPT;
      script.async = true;
      document.head.appendChild(script);
    }
  });
}

export type CheckoutPrefill = { name: string; phone: string; email: string };

export function CheckoutForm({
  bank,
  pickup,
  prefill,
}: {
  bank: { bankName: string; bankAccount: string; bankHolder: string };
  pickup: { address: string; phone: string; hours: string };
  prefill: CheckoutPrefill;
}) {
  const router = useRouter();
  const { items, subtotal, clear, openCart } = useCart();

  const [buyer, setBuyer] = useState(prefill);
  const [delivery, setDelivery] = useState<DeliveryMethod>("택배");
  const [sameAsBuyer, setSameAsBuyer] = useState(true);
  const [recipient, setRecipient] = useState({ name: "", phone: "" });
  const [zipcode, setZipcode] = useState("");
  const [address, setAddress] = useState("");
  const [addressDetail, setAddressDetail] = useState("");
  const [memoPreset, setMemoPreset] = useState("");
  const [memoCustom, setMemoCustom] = useState("");
  const [payment, setPayment] = useState<PaymentMethod>("무통장입금/계좌이체");
  const [depositor, setDepositor] = useState("");
  const [institution, setInstitution] = useState({
    name: "",
    contact: "",
    taxInvoice: true,
    memo: "",
  });
  const [agreed, setAgreed] = useState(false);
  const [pending, setPending] = useState(false);

  const shippingFee = delivery === "방문수령" ? 0 : shippingFeeFor(subtotal);
  const total = subtotal + shippingFee;
  const cardSelected = payment === "카드결제(준비중)";

  async function searchAddress() {
    try {
      await loadPostcodeScript();
      new window.daum!.Postcode({
        oncomplete: (data) => {
          setZipcode(data.zonecode);
          setAddress(
            [data.roadAddress || data.jibunAddress, data.buildingName && `(${data.buildingName})`]
              .filter(Boolean)
              .join(" "),
          );
          document.getElementById("address_detail")?.focus();
        },
      }).open();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "주소 검색을 열지 못했습니다.");
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (items.length === 0) return;
    if (cardSelected) {
      toast.error("카드 결제는 준비 중입니다. 다른 결제 수단을 선택해 주세요.");
      return;
    }
    if (delivery === "택배" && !address.trim()) {
      toast.error("배송지 주소를 입력해 주세요.");
      return;
    }
    if (payment === "기관 후불/세금계산서" && (!institution.name.trim() || !institution.contact.trim())) {
      toast.error("기관·학교명과 담당자 연락처를 입력해 주세요.");
      return;
    }
    if (!agreed) {
      toast.error("주문 내용 확인 및 동의에 체크해 주세요.");
      return;
    }

    const deliveryMemo = memoPreset === "직접 입력" ? memoCustom : memoPreset;
    const billingMemo =
      payment === "기관 후불/세금계산서"
        ? [
            `기관·학교: ${institution.name.trim()}`,
            `담당자 연락처: ${institution.contact.trim()}`,
            `세금계산서: ${institution.taxInvoice ? "발행 요청" : "요청 안 함"}`,
            institution.memo.trim() && `메모: ${institution.memo.trim()}`,
          ]
            .filter(Boolean)
            .join("\n")
        : undefined;

    setPending(true);
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buyer_name: buyer.name,
          buyer_phone: buyer.phone,
          buyer_email: buyer.email,
          delivery_method: delivery,
          recipient_name: sameAsBuyer ? buyer.name : recipient.name,
          recipient_phone: sameAsBuyer ? buyer.phone : recipient.phone,
          zipcode,
          address,
          address_detail: addressDetail,
          delivery_memo: delivery === "택배" ? deliveryMemo : "현장 방문 수령",
          payment_method: payment,
          depositor_name:
            payment === "무통장입금/계좌이체" ? depositor.trim() || buyer.name : undefined,
          billing_memo: billingMemo,
          items: items.map((item) => ({
            product_id: item.product.id,
            quantity: item.quantity,
            custom_memo: item.memo || undefined,
          })),
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "주문을 저장하지 못했습니다.");

      const placed: PlacedOrder = {
        ...payload.order,
        buyer_name: buyer.name,
        depositor_name:
          payment === "무통장입금/계좌이체" ? depositor.trim() || buyer.name : null,
      };
      sessionStorage.setItem(LAST_ORDER_STORAGE_KEY, JSON.stringify(placed));
      clear();
      router.push(`/checkout/success?no=${encodeURIComponent(placed.order_number)}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "주문 처리 중 오류가 발생했습니다.");
      setPending(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center rounded-3xl border border-slate-200 bg-white p-10 text-center">
        <span className="flex size-16 items-center justify-center rounded-full bg-emerald-50 text-[#0f4c3a]">
          <ShoppingBag className="size-7" aria-hidden="true" />
        </span>
        <p className="text-muted-foreground mt-4">
          {pending ? "주문 완료 페이지로 이동하는 중입니다..." : "장바구니가 비어 있어요."}
        </p>
        {pending ? null : (
          <Link href="/store" className={cn(buttonVariants({ size: "xl" }), "mt-6")}>
            스토어 둘러보기
          </Link>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <div className="grid gap-6">
        <Section title="주문자 정보">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="buyer_name" label="이름" required>
              <Input
                id="buyer_name"
                value={buyer.name}
                onChange={(event) => setBuyer({ ...buyer, name: event.target.value })}
                required
                maxLength={50}
                autoComplete="name"
                className="h-11"
              />
            </Field>
            <Field id="buyer_phone" label="연락처" required>
              <Input
                id="buyer_phone"
                type="tel"
                value={buyer.phone}
                onChange={(event) => setBuyer({ ...buyer, phone: event.target.value })}
                required
                maxLength={30}
                placeholder="010-0000-0000"
                autoComplete="tel"
                className="h-11"
              />
            </Field>
          </div>
          <Field id="buyer_email" label="이메일" required hint="주문 확인 및 세금계산서 안내에 사용됩니다.">
            <Input
              id="buyer_email"
              type="email"
              value={buyer.email}
              onChange={(event) => setBuyer({ ...buyer, email: event.target.value })}
              required
              maxLength={120}
              autoComplete="email"
              className="h-11"
            />
          </Field>
        </Section>

        <Section title="배송 방법">
          <div role="radiogroup" aria-label="배송 방법" className="grid gap-3 sm:grid-cols-2">
            <OptionCard
              selected={delivery === "택배"}
              onSelect={() => setDelivery("택배")}
              icon={<Truck className="size-5" aria-hidden="true" />}
              title="일반 택배 배송"
              description={`배송비 ${formatKRW(3000)} · ${formatKRW(FREE_SHIPPING_THRESHOLD)} 이상 무료`}
            />
            <OptionCard
              selected={delivery === "방문수령"}
              onSelect={() => setDelivery("방문수령")}
              icon={<MapPin className="size-5" aria-hidden="true" />}
              title="제주 현장 방문 수령"
              description="배송비 무료 · 준비 완료 후 연락드려요"
            />
          </div>

          {delivery === "방문수령" ? (
            <div className="rounded-2xl bg-emerald-50/70 px-4 py-3 text-sm text-[#0f4c3a]">
              <p className="font-semibold">수령 장소</p>
              <p className="mt-0.5">{pickup.address}</p>
              <p className="mt-0.5 text-emerald-800/80">
                {pickup.hours} · 문의 {pickup.phone}
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={sameAsBuyer}
                  onChange={(event) => setSameAsBuyer(event.target.checked)}
                  className="accent-primary size-4"
                />
                주문자 정보와 동일
              </label>
              {sameAsBuyer ? null : (
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field id="recipient_name" label="받는 분" required>
                    <Input
                      id="recipient_name"
                      value={recipient.name}
                      onChange={(event) => setRecipient({ ...recipient, name: event.target.value })}
                      required
                      maxLength={50}
                      className="h-11"
                    />
                  </Field>
                  <Field id="recipient_phone" label="받는 분 연락처" required>
                    <Input
                      id="recipient_phone"
                      type="tel"
                      value={recipient.phone}
                      onChange={(event) => setRecipient({ ...recipient, phone: event.target.value })}
                      required
                      maxLength={30}
                      className="h-11"
                    />
                  </Field>
                </div>
              )}
              <Field id="address" label="주소" required>
                <div className="grid gap-2">
                  <div className="flex gap-2">
                    <Input
                      id="zipcode"
                      aria-label="우편번호"
                      value={zipcode}
                      onChange={(event) => setZipcode(event.target.value)}
                      placeholder="우편번호"
                      maxLength={10}
                      className="h-11 w-32"
                    />
                    <Button type="button" variant="outline" size="xl" onClick={searchAddress}>
                      <Search className="size-4" aria-hidden="true" />
                      주소 검색
                    </Button>
                  </div>
                  <Input
                    id="address"
                    value={address}
                    onChange={(event) => setAddress(event.target.value)}
                    placeholder="주소 검색을 누르거나 직접 입력해 주세요"
                    required
                    maxLength={200}
                    autoComplete="street-address"
                    className="h-11"
                  />
                  <Input
                    id="address_detail"
                    aria-label="상세 주소"
                    value={addressDetail}
                    onChange={(event) => setAddressDetail(event.target.value)}
                    placeholder="상세 주소 (동·호수 등)"
                    maxLength={200}
                    className="h-11"
                  />
                </div>
              </Field>
              <Field id="delivery_memo" label="배송 메모">
                <select
                  id="delivery_memo"
                  value={memoPreset}
                  onChange={(event) => setMemoPreset(event.target.value)}
                  className="border-input h-11 rounded-lg border bg-transparent px-3 text-base"
                >
                  <option value="">선택 안 함</option>
                  {MEMO_PRESETS.map((preset) => (
                    <option key={preset} value={preset}>
                      {preset}
                    </option>
                  ))}
                </select>
                {memoPreset === "직접 입력" ? (
                  <Input
                    aria-label="배송 메모 직접 입력"
                    value={memoCustom}
                    onChange={(event) => setMemoCustom(event.target.value)}
                    maxLength={300}
                    placeholder="배송 기사님께 전달할 내용을 적어 주세요"
                    className="h-11"
                  />
                ) : null}
              </Field>
            </div>
          )}
        </Section>

        <Section title="결제 수단">
          <div role="radiogroup" aria-label="결제 수단" className="grid gap-3 sm:grid-cols-3">
            <OptionCard
              selected={payment === "무통장입금/계좌이체"}
              onSelect={() => setPayment("무통장입금/계좌이체")}
              icon={<Landmark className="size-5" aria-hidden="true" />}
              title="무통장 입금"
              description="계좌이체"
            />
            <OptionCard
              selected={payment === "기관 후불/세금계산서"}
              onSelect={() => setPayment("기관 후불/세금계산서")}
              icon={<Building2 className="size-5" aria-hidden="true" />}
              title="기관·학교 후불"
              description="세금계산서 발행"
            />
            <OptionCard
              selected={cardSelected}
              onSelect={() => setPayment("카드결제(준비중)")}
              icon={<CreditCard className="size-5" aria-hidden="true" />}
              title="신용카드"
              description="준비 중"
            />
          </div>

          {payment === "무통장입금/계좌이체" ? (
            <div className="grid gap-4">
              <div className="rounded-2xl bg-emerald-50/70 px-4 py-3 text-sm text-[#0f4c3a]">
                <p className="font-semibold">입금 계좌</p>
                <p className="mt-0.5 text-base font-semibold">
                  {bank.bankName} {bank.bankAccount}
                </p>
                <p className="text-emerald-800/80">
                  예금주 {bank.bankHolder} · 주문 후 3일 이내 입금해 주세요.
                </p>
              </div>
              <Field id="depositor_name" label="입금자명" hint="비워 두면 주문자 이름으로 접수됩니다.">
                <Input
                  id="depositor_name"
                  value={depositor}
                  onChange={(event) => setDepositor(event.target.value)}
                  placeholder={buyer.name || "입금하실 분 이름"}
                  maxLength={50}
                  className="h-11"
                />
              </Field>
            </div>
          ) : null}

          {payment === "기관 후불/세금계산서" ? (
            <div className="grid gap-4">
              <p className="text-muted-foreground text-sm">
                학교·공공기관 등은 납품 후 세금계산서 발행 → 후불 결제로 진행할 수 있습니다.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field id="institution_name" label="기관·학교명" required>
                  <Input
                    id="institution_name"
                    value={institution.name}
                    onChange={(event) => setInstitution({ ...institution, name: event.target.value })}
                    placeholder="예) 제주중앙초등학교 행정실"
                    maxLength={100}
                    className="h-11"
                  />
                </Field>
                <Field id="institution_contact" label="담당자·연락처" required>
                  <Input
                    id="institution_contact"
                    value={institution.contact}
                    onChange={(event) =>
                      setInstitution({ ...institution, contact: event.target.value })
                    }
                    placeholder="예) 김행정 064-000-0000"
                    maxLength={100}
                    className="h-11"
                  />
                </Field>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={institution.taxInvoice}
                  onChange={(event) =>
                    setInstitution({ ...institution, taxInvoice: event.target.checked })
                  }
                  className="accent-primary size-4"
                />
                세금계산서 발행을 요청합니다 (사업자등록증은 이메일로 보내 주세요)
              </label>
              <Field id="billing_memo" label="요청 메모">
                <Textarea
                  id="billing_memo"
                  value={institution.memo}
                  onChange={(event) => setInstitution({ ...institution, memo: event.target.value })}
                  placeholder="예산 집행 일정, 필요한 서류(견적서·거래명세서 등)를 적어 주세요."
                  maxLength={500}
                  className="min-h-24"
                />
              </Field>
            </div>
          ) : null}

          {cardSelected ? (
            <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-5 text-center text-sm">
              <p className="font-semibold">신용카드 결제는 준비 중입니다.</p>
              <p className="text-muted-foreground mt-1">
                토스페이먼츠 연동 후 열릴 예정이에요. 지금은 무통장 입금 또는 기관 후불을 이용해 주세요.
              </p>
            </div>
          ) : null}
        </Section>
      </div>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-3xl border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">주문 상품 {items.length}종</h2>
            <button
              type="button"
              onClick={openCart}
              className="text-sm font-medium text-emerald-700 underline-offset-4 hover:underline"
            >
              장바구니 수정
            </button>
          </div>
          <ul className="mt-4 max-h-80 divide-y overflow-y-auto">
            {items.map((item) => (
              <li key={item.key} className="flex gap-3 py-3">
                <div className="bg-muted relative size-16 shrink-0 overflow-hidden rounded-xl border">
                  {item.product.thumbnail_url ? (
                    <Image src={item.product.thumbnail_url} alt="" fill className="object-cover" sizes="64px" />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1 text-sm">
                  <p className="line-clamp-2 font-medium">{item.product.name}</p>
                  {item.memo ? (
                    <p className="text-muted-foreground line-clamp-2 text-xs">요청사항: {item.memo}</p>
                  ) : null}
                  <p className="text-muted-foreground mt-1 text-xs">
                    {formatKRW(item.product.price)} × {item.quantity}개
                  </p>
                </div>
                <p className="text-sm font-semibold tabular-nums">
                  {formatKRW(item.product.price * item.quantity)}
                </p>
              </li>
            ))}
          </ul>
          <dl className="mt-4 grid gap-1.5 border-t pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">상품 금액</dt>
              <dd className="tabular-nums">{formatKRW(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">
                배송비 {delivery === "방문수령" ? "(방문 수령)" : ""}
              </dt>
              <dd className="tabular-nums">
                {shippingFee === 0 ? "무료" : `+${formatKRW(shippingFee)}`}
              </dd>
            </div>
            <div className="mt-2 flex items-baseline justify-between border-t pt-3">
              <dt className="font-semibold">총 결제 금액</dt>
              <dd className="text-2xl font-bold text-[#0f4c3a] tabular-nums">{formatKRW(total)}</dd>
            </div>
          </dl>
          <label className="mt-5 flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(event) => setAgreed(event.target.checked)}
              className="accent-primary mt-0.5 size-4"
            />
            <span>
              주문 상품·금액을 확인했으며, 주문 처리를 위한 개인정보 수집·이용에 동의합니다.
            </span>
          </label>
          <Button
            type="submit"
            size="xl"
            className="mt-5 w-full"
            disabled={pending || cardSelected}
          >
            {pending
              ? "주문 저장 중..."
              : cardSelected
                ? "카드 결제 준비 중"
                : `${formatKRW(total)} 주문 완료하기`}
          </Button>
          <p className="text-muted-foreground mt-3 text-center text-xs">
            최종 금액은 주문 시점의 상품 가격·재고로 다시 확인됩니다.
          </p>
        </div>
      </aside>
    </form>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="grid gap-5 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
      <h2 className="text-lg font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function Field({
  id,
  label,
  required,
  hint,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>
        {label}
        {required ? <span className="text-destructive"> *</span> : null}
      </Label>
      {children}
      {hint ? <p className="text-muted-foreground text-xs">{hint}</p> : null}
    </div>
  );
}

function OptionCard({
  selected,
  onSelect,
  icon,
  title,
  description,
}: {
  selected: boolean;
  onSelect: () => void;
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={cn(
        "flex items-start gap-3 rounded-2xl border p-4 text-left transition-colors",
        selected
          ? "border-[#0f4c3a] bg-emerald-50/60 ring-1 ring-[#0f4c3a]"
          : "border-slate-200 bg-white hover:border-slate-300",
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full",
          selected ? "bg-[#0f4c3a] text-white" : "bg-slate-100 text-slate-500",
        )}
      >
        {icon}
      </span>
      <span>
        <span className="block font-semibold">{title}</span>
        <span className="text-muted-foreground block text-xs">{description}</span>
      </span>
    </button>
  );
}
