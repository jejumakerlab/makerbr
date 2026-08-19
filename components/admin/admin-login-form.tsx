"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SiteLogo } from "@/components/layout/site-logo";
import { createClient } from "@/lib/supabase/client";

export function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, setPending] = useState(false);
  const unauthorized = searchParams.get("error") === "unauthorized";

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");
    const supabase = createClient();

    if (!supabase) {
      toast.message("Supabase가 설정되지 않아 데모 관리자로 진입합니다.");
      router.push("/admin");
      return;
    }

    setPending(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setPending(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    router.push(searchParams.get("next") || "/admin");
    router.refresh();
  }

  return (
    <main
      id="main-content"
      className="flex min-h-full flex-col items-center justify-center px-4 py-16"
    >
      <div className="bg-card w-full max-w-md rounded-2xl border p-8">
        <SiteLogo />
        <h1 className="mt-6 text-2xl font-semibold">관리자 로그인</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          스태프/관리자 계정만 대시보드에 접근할 수 있습니다.
        </p>
        {unauthorized ? (
          <p className="text-destructive mt-3 text-sm" role="alert">
            관리 권한이 없는 계정입니다.
          </p>
        ) : null}
        <form onSubmit={onSubmit} className="mt-6 grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">이메일</Label>
            <Input id="email" name="email" type="email" required className="h-11" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">비밀번호</Label>
            <Input id="password" name="password" type="password" required className="h-11" />
          </div>
          <Button type="submit" size="xl" disabled={pending}>
            {pending ? "로그인 중..." : "로그인"}
          </Button>
        </form>
      </div>
    </main>
  );
}
