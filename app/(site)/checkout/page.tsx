import type { Metadata } from "next";
import { CheckoutForm } from "@/components/store/checkout-form";
import { getSiteSettings } from "@/lib/data/queries";

export const metadata: Metadata = {
  title: "주문서",
};

export default async function CheckoutPage() {
  const site = await getSiteSettings();

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="mb-8 text-3xl font-semibold tracking-tight">주문서</h1>
      <CheckoutForm
        bank={{
          bankName: site.bankName,
          bankAccount: site.bankAccount,
          bankHolder: site.bankHolder,
        }}
      />
    </div>
  );
}
