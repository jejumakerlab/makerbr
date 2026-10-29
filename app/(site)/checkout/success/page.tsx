import type { Metadata } from "next";
import { OrderComplete } from "@/components/store/order-complete";
import { getAuthState } from "@/lib/auth/session";
import { getSiteSettings } from "@/lib/data/queries";

export const metadata: Metadata = {
  title: "주문 완료",
};

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ no?: string }>;
}) {
  const [{ no }, site, auth] = await Promise.all([searchParams, getSiteSettings(), getAuthState()]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <OrderComplete
        orderNumber={no ?? null}
        isMember={Boolean(auth.user)}
        bank={{
          bankName: site.bankName,
          bankAccount: site.bankAccount,
          bankHolder: site.bankHolder,
        }}
        contact={{ phone: site.phone, email: site.email, address: site.address }}
      />
    </div>
  );
}
