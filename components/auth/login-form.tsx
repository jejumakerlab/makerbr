"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { SocialLoginButtons } from "@/components/auth/social-login-buttons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { safeRedirectPath } from "@/lib/auth/paths";

export function LoginForm() {
  const searchParams = useSearchParams();
  const [pending, setPending] = useState(false);
  const redirectTo = safeRedirectPath(searchParams.get("redirect"));

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const supabase = createClient();

    if (!supabase) {
      toast.error("인증 서버가 설정되지 않았습니다. 환경 변수를 확인해 주세요.");
      return;
    }

    setPending(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setPending(false);
      toast.error(
        error.message === "Invalid login credentials"
          ? "이메일 또는 비밀번호가 올바르지 않습니다."
          : error.message,
      );
      return;
    }

    toast.success("로그인했습니다.");
    // /auth/callback 은 페이지가 아닌 라우트 핸들러라 전체 이동으로 보내야 리다이렉트가 따라갑니다.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.assign(`/auth/callback?redirect=${encodeURIComponent(redirectTo)}`);
  }

  return (
    <>
    <SocialLoginButtons redirectTo={redirectTo} />
    <form onSubmit={onSubmit} className="mt-6 grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="email">이메일</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="h-11"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="password">비밀번호</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="h-11"
        />
      </div>
      <Button type="submit" size="xl" disabled={pending}>
        {pending ? "로그인 중..." : "로그인"}
      </Button>
      <p className="text-muted-foreground text-center text-sm">
        아직 계정이 없으신가요?{" "}
        <Link
          href={`/signup?redirect=${encodeURIComponent(redirectTo)}`}
          className="text-primary font-medium underline-offset-4 hover:underline"
        >
          회원가입
        </Link>
      </p>
    </form>
    </>
  );
}
