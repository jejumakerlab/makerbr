"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { safeRedirectPath } from "@/lib/auth/paths";

export function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, setPending] = useState(false);
  const redirectTo = safeRedirectPath(searchParams.get("redirect"));

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const fullName = String(form.get("full_name") ?? "").trim();
    const phone = String(form.get("phone") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const supabase = createClient();

    if (!supabase) {
      toast.error("인증 서버가 설정되지 않았습니다. 환경 변수를 확인해 주세요.");
      return;
    }

    if (password.length < 8) {
      toast.error("비밀번호는 8자 이상이어야 합니다.");
      return;
    }

    setPending(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone,
        },
      },
    });
    setPending(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    const user = data.user;
    if (user) {
      const { error: profileError } = await supabase.from("profiles").upsert(
        {
          id: user.id,
          email,
          full_name: fullName,
          phone,
        },
        { onConflict: "id" },
      );
      if (profileError) {
        toast.message("계정은 생성되었습니다. 프로필은 첫 로그인 시 완성됩니다.");
      }
    }

    if (!data.session) {
      toast.success("가입이 완료되었습니다. 이메일 인증 후 로그인해 주세요.");
      router.push(`/login?redirect=${encodeURIComponent(redirectTo)}`);
      return;
    }

    toast.success("회원가입이 완료되었습니다.");
    router.push(redirectTo);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="full_name">이름</Label>
        <Input
          id="full_name"
          name="full_name"
          autoComplete="name"
          required
          className="h-11"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="phone">연락처</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          required
          className="h-11"
          placeholder="010-0000-0000"
        />
      </div>
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
          autoComplete="new-password"
          required
          minLength={8}
          className="h-11"
        />
        <p className="text-muted-foreground text-xs">8자 이상 입력해 주세요.</p>
      </div>
      <Button type="submit" size="xl" disabled={pending}>
        {pending ? "가입 중..." : "회원가입"}
      </Button>
      <p className="text-muted-foreground text-center text-sm">
        이미 계정이 있으신가요?{" "}
        <Link
          href={`/login?redirect=${encodeURIComponent(redirectTo)}`}
          className="text-primary font-medium underline-offset-4 hover:underline"
        >
          로그인
        </Link>
      </p>
    </form>
  );
}
