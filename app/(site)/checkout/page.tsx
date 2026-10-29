import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CheckoutForm } from "@/components/store/checkout-form";
import { getAuthState } from "@/lib/auth/session";
import { profilePathFor } from "@/lib/auth/types";
import { getSiteSettings } from "@/lib/data/queries";

export const metadata: Metadata = {
  title: "주문서",
};

export default async function CheckoutPage() {
  const [site, auth] = await Promise.all([getSiteSettings(), getAuthState()]);

  if (!auth.user) {
    redirect("/login?redirect=/checkout&notice=member_only");
  }
  if (!auth.profileComplete && !auth.isStaff) {
    redirect(profilePathFor("/checkout"));
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="text-3xl font-semibold tracking-tight">주문서</h1>
      <p className="text-muted-foreground mt-2 mb-8 text-sm">
        회원정보의 이름·연락처·주소를 미리 채워 두었어요. 주문 후 마이페이지에서 진행 상황을 확인할 수
        있습니다.
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
          email: auth.user.email ?? "",
          zipcode: auth.profile?.zipcode ?? "",
          address: auth.profile?.address ?? "",
          addressDetail: auth.profile?.address_detail ?? "",
        }}
      />
    </div>
  );
}
