"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function QuoteForm() {
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setPending(true);
    try {
      const response = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          organization: form.get("organization"),
          email: form.get("email"),
          phone: form.get("phone"),
          request_type: form.get("request_type"),
          budget_range: form.get("budget_range"),
          message: form.get("message"),
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "견적 요청에 실패했습니다.");
      toast.success("견적 요청이 접수되었습니다.");
      event.currentTarget.reset();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "오류가 발생했습니다.");
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="bg-card rounded-2xl border p-6" aria-labelledby="quote-heading">
      <h2 id="quote-heading" className="text-xl font-semibold">
        맞춤형 제작/교육 견적 요청
      </h2>
      <form onSubmit={onSubmit} className="mt-5 grid gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="name">이름</Label>
            <Input id="name" name="name" required className="h-11" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="organization">기관/단체</Label>
            <Input id="organization" name="organization" className="h-11" />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="email">이메일</Label>
            <Input id="email" name="email" type="email" required className="h-11" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="phone">연락처</Label>
            <Input id="phone" name="phone" type="tel" className="h-11" />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="request_type">요청 유형</Label>
            <select
              id="request_type"
              name="request_type"
              className="h-11 rounded-lg border bg-transparent px-3"
              defaultValue="education"
            >
              <option value="education">교육</option>
              <option value="product">제품/제작</option>
              <option value="custom">기타 맞춤</option>
            </select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="budget_range">예산 범위</Label>
            <Input id="budget_range" name="budget_range" className="h-11" placeholder="예: 300만원 이상" />
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="message">요청 내용</Label>
          <Textarea id="message" name="message" required className="min-h-36" />
        </div>
        <Button type="submit" size="xl" disabled={pending}>
          {pending ? "전송 중..." : "견적 요청 보내기"}
        </Button>
      </form>
    </section>
  );
}
