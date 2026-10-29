import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthCard } from "@/components/auth/auth-card";
import { ProfileForm } from "@/components/auth/profile-form";
import { getAuthState } from "@/lib/auth/session";
import { safeRedirectPath } from "@/lib/auth/paths";
import { PROFILE_PATH } from "@/lib/auth/types";

export const metadata: Metadata = {
  title: "회원정보",
};

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const { redirect: redirectParam } = await searchParams;
  const redirectTo = safeRedirectPath(redirectParam, "/mypage");
  const auth = await getAuthState();
  if (!auth.user) {
    redirect(`/login?redirect=${encodeURIComponent(PROFILE_PATH)}`);
  }

  return (
    <AuthCard
      title={auth.profileComplete ? "회원정보 수정" : "회원정보 입력"}
      description={
        auth.profileComplete
          ? "교육 신청과 주문에 사용되는 정보입니다."
          : "교육 신청과 상품 구매를 하려면 이름, 휴대전화, 주소가 필요해요. 한 번만 입력하면 다음부터 자동으로 채워집니다."
      }
    >
      <ProfileForm
        userId={auth.user.id}
        email={auth.user.email ?? ""}
        redirectTo={redirectTo}
        initial={{
          fullName: auth.profile?.full_name ?? "",
          phone: auth.profile?.phone ?? "",
          zipcode: auth.profile?.zipcode ?? "",
          address: auth.profile?.address ?? "",
          addressDetail: auth.profile?.address_detail ?? "",
        }}
      />
    </AuthCard>
  );
}
