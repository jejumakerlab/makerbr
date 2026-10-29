"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { AddressFields, type AddressValue } from "@/components/auth/address-fields";
import { SocialLoginButtons } from "@/components/auth/social-login-buttons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { safeRedirectPath } from "@/lib/auth/paths";

export function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, setPending] = useState(false);
  const [address, setAddress] = useState<AddressValue>({
    zipcode: "",
    address: "",
    addressDetail: "",
  });
  const redirectTo = safeRedirectPath(searchParams.get("redirect"));
  const callbackPath = `/auth/callback?redirect=${encodeURIComponent(redirectTo)}`;

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
    if (!address.address.trim()) {
      toast.error("주소를 입력해 주세요.");
      return;
    }

    const profile = {
      full_name: fullName,
      phone,
      zipcode: address.zipcode.trim(),
      address: address.address.trim(),
      address_detail: address.addressDetail.trim(),
    };

    setPending(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: profile,
        emailRedirectTo: `${window.location.origin}${callbackPath}`,
      },
    });

    if (error) {
      setPending(false);
      toast.error(error.message);
      return;
    }

    if (!data.session) {
      setPending(false);
      toast.success("가입 신청이 완료되었습니다. 메일함의 인증 링크를 눌러 가입을 마쳐 주세요.");
      router.push(`/login?redirect=${encodeURIComponent(redirectTo)}`);
      return;
    }

    if (data.user) {
      await supabase.from("profiles").upsert({ id: data.user.id, email, ...profile }, { onConflict: "id" });
    }
    toast.success("회원가입이 완료되었습니다.");
    // /auth/callback 은 페이지가 아닌 라우트 핸들러라 전체 이동으로 보내야 리다이렉트가 따라갑니다.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.assign(callbackPath);
  }

  return (
    <>
      <SocialLoginButtons redirectTo={redirectTo} />
      <form onSubmit={onSubmit} className="mt-6 grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="full_name">
            이름 <span className="text-destructive">*</span>
          </Label>
          <Input id="full_name" name="full_name" autoComplete="name" required className="h-11" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="phone">
            휴대전화 <span className="text-destructive">*</span>
          </Label>
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
        <AddressFields value={address} onChange={setAddress} required />
        <div className="grid gap-2">
          <Label htmlFor="email">
            이메일 <span className="text-destructive">*</span>
          </Label>
          <Input id="email" name="email" type="email" autoComplete="email" required className="h-11" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">
            비밀번호 <span className="text-destructive">*</span>
          </Label>
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
        <fieldset className="grid gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm">
          <legend className="px-1 text-xs font-medium text-slate-500">약관 동의</legend>
          <label className="flex items-start gap-2">
            <input type="checkbox" name="agree_terms" required className="accent-primary mt-0.5 size-4" />
            <span>
              (필수){" "}
              <Link href="/terms" target="_blank" className="font-medium underline underline-offset-4">
                이용약관
              </Link>
              에 동의합니다.
            </span>
          </label>
          <label className="flex items-start gap-2">
            <input type="checkbox" name="agree_privacy" required className="accent-primary mt-0.5 size-4" />
            <span>
              (필수){" "}
              <Link href="/privacy" target="_blank" className="font-medium underline underline-offset-4">
                개인정보 수집·이용
              </Link>
              에 동의합니다. (이름, 연락처, 주소, 이메일 · 회원 탈퇴 시까지 보관)
            </span>
          </label>
        </fieldset>
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
    </>
  );
}
