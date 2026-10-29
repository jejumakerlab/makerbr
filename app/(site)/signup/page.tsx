import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AuthCard } from "@/components/auth/auth-card";
import { SignupForm } from "@/components/auth/signup-form";
import { getAuthState } from "@/lib/auth/session";
import { safeRedirectPath } from "@/lib/auth/paths";

export const metadata: Metadata = {
  title: "회원가입",
  description: "메이커브릿지 회원가입",
};

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const { redirect: redirectParam } = await searchParams;
  const redirectTo = safeRedirectPath(redirectParam);
  const auth = await getAuthState();
  if (auth.user) {
    redirect(redirectTo);
  }

  return (
    <AuthCard
      title="회원가입"
      description="소셜 계정으로 간편하게 가입하거나, 이름·휴대전화·주소·이메일을 입력해 가입하세요."
    >
      <Suspense>
        <SignupForm />
      </Suspense>
    </AuthCard>
  );
}
