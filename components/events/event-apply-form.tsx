"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { profilePathFor } from "@/lib/auth/types";
import { cn } from "@/lib/utils";

export type ApplyAccess = "guest" | "incomplete" | "member";

export function EventApplyForm({
  eventId,
  isFull,
  access,
  redirectPath,
  defaults,
}: {
  eventId: string;
  isFull: boolean;
  access: ApplyAccess;
  redirectPath: string;
  defaults?: { name: string; email: string; phone: string };
}) {
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    setPending(true);
    try {
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_id: eventId,
          name: form.get("name"),
          email: form.get("email"),
          phone: form.get("phone"),
          organization: form.get("organization"),
          message: form.get("message"),
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "신청에 실패했습니다.");
      toast.success(
        `${
          payload.status === "waitlist"
            ? "정원이 가득 차 대기자로 등록되었습니다."
            : "참가 신청이 접수되었습니다."
        } 확정 여부는 마이페이지에서 확인할 수 있어요.`,
      );
      formElement.reset();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "신청 중 오류가 발생했습니다.");
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="bg-card mt-10 rounded-2xl border p-6" aria-labelledby="apply-heading">
      <h2 id="apply-heading" className="text-xl font-semibold">
        온라인 참가 신청
      </h2>
      {isFull ? (
        <p className="text-muted-foreground mt-2 text-sm">정원이 마감되어 대기 신청만 가능합니다.</p>
      ) : null}

      {access === "guest" ? (
        <div className="mt-4 rounded-xl bg-slate-50 px-5 py-5 text-sm">
          <p className="font-medium">교육 신청은 회원만 할 수 있어요.</p>
          <p className="text-muted-foreground mt-1">
            로그인하면 신청 후 마이페이지에서 참가 확정 여부를 바로 확인할 수 있습니다.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href={`/login?redirect=${encodeURIComponent(redirectPath)}`}
              className={cn(buttonVariants({ size: "xl" }))}
            >
              로그인하고 신청하기
            </Link>
            <Link
              href={`/signup?redirect=${encodeURIComponent(redirectPath)}`}
              className={cn(buttonVariants({ variant: "outline", size: "xl" }))}
            >
              회원가입
            </Link>
          </div>
        </div>
      ) : access === "incomplete" ? (
        <div className="mt-4 rounded-xl bg-amber-50 px-5 py-5 text-sm text-amber-900">
          <p className="font-medium">신청 전에 회원정보를 입력해 주세요.</p>
          <p className="mt-1">이름, 휴대전화, 주소를 한 번만 입력하면 다음부터 자동으로 채워집니다.</p>
          <Link
            href={profilePathFor(redirectPath)}
            className={cn(buttonVariants({ size: "xl" }), "mt-4")}
          >
            회원정보 입력하기
          </Link>
        </div>
      ) : (
        <>
          <p className="text-muted-foreground mt-2 text-sm">
            신청 후 담당자가 확정하면 마이페이지에서 확정 여부를 확인할 수 있습니다.
          </p>
          <form onSubmit={onSubmit} className="mt-5 grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">이름</Label>
              <Input
                id="name"
                name="name"
                required
                className="h-11"
                autoComplete="name"
                defaultValue={defaults?.name}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                className="h-11"
                autoComplete="email"
                defaultValue={defaults?.email}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">연락처</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                required
                className="h-11"
                autoComplete="tel"
                defaultValue={defaults?.phone}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="organization">소속 (선택)</Label>
              <Input id="organization" name="organization" className="h-11" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="message">요청 사항</Label>
              <Textarea id="message" name="message" className="min-h-24" />
            </div>
            <Button type="submit" size="xl" disabled={pending}>
              {pending ? "접수 중..." : isFull ? "대기 신청하기" : "신청하기"}
            </Button>
          </form>
        </>
      )}
    </section>
  );
}
