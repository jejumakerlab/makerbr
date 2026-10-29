"use client";

import { useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type SocialProvider = {
  id: "google" | "kakao" | "naver";
  /** Supabase 제공자 이름. 네이버는 대시보드에 'custom:naver' 커스텀 제공자로 등록합니다. */
  provider: string;
  label: string;
  className: string;
  mark: string;
};

const PROVIDERS: SocialProvider[] = [
  {
    id: "kakao",
    provider: "kakao",
    label: "카카오로 계속하기",
    className: "bg-[#FEE500] text-black/85 hover:bg-[#F5DC00]",
    mark: "K",
  },
  {
    id: "naver",
    provider: "custom:naver",
    label: "네이버로 계속하기",
    className: "bg-[#03C75A] text-white hover:bg-[#02B350]",
    mark: "N",
  },
  {
    id: "google",
    provider: "google",
    label: "Google로 계속하기",
    className: "border border-slate-300 bg-white text-slate-800 hover:bg-slate-50",
    mark: "G",
  },
];

/** NEXT_PUBLIC_AUTH_PROVIDERS=kakao,naver,google 처럼 Supabase에서 켜 둔 제공자만 버튼을 보여 줍니다. */
const ENABLED = new Set(
  (process.env.NEXT_PUBLIC_AUTH_PROVIDERS ?? "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean),
);

export function SocialLoginButtons({ redirectTo }: { redirectTo: string }) {
  const [pending, setPending] = useState<string | null>(null);
  const providers = PROVIDERS.filter((item) => ENABLED.has(item.id));
  if (providers.length === 0) return null;

  async function signIn(item: SocialProvider) {
    const supabase = createClient();
    if (!supabase) {
      toast.error("인증 서버가 설정되지 않았습니다. 환경 변수를 확인해 주세요.");
      return;
    }
    setPending(item.id);
    const { error } = await supabase.auth.signInWithOAuth({
      // supabase-js 타입에는 'custom:*' 제공자가 아직 없습니다.
      provider: item.provider as "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirectTo)}`,
      },
    });
    if (error) {
      setPending(null);
      toast.error(`${item.label.replace("로 계속하기", "")} 로그인을 시작하지 못했습니다: ${error.message}`);
    }
  }

  return (
    <div className="mt-6 grid gap-2.5">
      {providers.map((item) => (
        <button
          key={item.id}
          type="button"
          disabled={pending !== null}
          onClick={() => void signIn(item)}
          className={cn(
            "relative flex h-12 items-center justify-center rounded-xl text-sm font-semibold transition-colors disabled:opacity-60",
            item.className,
          )}
        >
          <span
            aria-hidden="true"
            className="absolute left-4 flex size-6 items-center justify-center rounded-md bg-black/5 text-sm font-black"
          >
            {item.mark}
          </span>
          {pending === item.id ? "이동 중..." : item.label}
        </button>
      ))}
      <div className="text-muted-foreground mt-3 flex items-center gap-3 text-xs">
        <span className="h-px flex-1 bg-slate-200" />
        또는 이메일로
        <span className="h-px flex-1 bg-slate-200" />
      </div>
    </div>
  );
}
