import type { Metadata } from "next";
import { CheckoutForm } from "@/components/store/checkout-form";
import { getAuthState } from "@/lib/auth/session";
import { getSiteSettings } from "@/lib/data/queries";

export const metadata: Metadata = {
  title: "주문서",
};

export default async function CheckoutPage() {
  const [site, auth] = await Promise.all([getSiteSettings(), getAuthState()]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="text-3xl font-semibold tracking-tight">주문서</h1>
      <p className="text-muted-foreground mt-2 mb-8 text-sm">
        {auth.user
          ? "로그인한 계정으로 주문하면 마이페이지에서 진행 상황을 확인할 수 있어요."
          : "비회원으로 주문할 수 있어요. 로그인하면 마이페이지에서 주문·배송 상태를 확인할 수 있습니다."}
      </p>
      <CheckoutForm
        bank={{
          bankName: site.bankName,
          bankAccount: site.bankAccount,
          bankHolder: site.bankHolder,
        }}
        pickup={{ address: site.address, phone: site.phone, hours: site.hours }}
        prefill={{
          name: auth.profile?.full_name ?? "",
          phone: auth.profile?.phone ?? "",
          email: auth.user?.email ?? "",
        }}
      />
    </div>
  );
}
