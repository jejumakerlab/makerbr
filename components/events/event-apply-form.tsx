"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function EventApplyForm({
  eventId,
  isFull,
}: {
  eventId: string;
  isFull: boolean;
}) {
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
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
        payload.status === "waitlist"
          ? "정원이 가득 차 대기자로 등록되었습니다."
          : "참가 신청이 접수되었습니다.",
      );
      event.currentTarget.reset();
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
        <p className="text-muted-foreground mt-2 text-sm">
          정원이 마감되어 대기 신청만 가능합니다.
        </p>
      ) : null}
      <form onSubmit={onSubmit} className="mt-5 grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="name">이름</Label>
          <Input id="name" name="name" required className="h-11" autoComplete="name" />
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
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="phone">연락처</Label>
          <Input id="phone" name="phone" type="tel" className="h-11" autoComplete="tel" />
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
    </section>
  );
}
