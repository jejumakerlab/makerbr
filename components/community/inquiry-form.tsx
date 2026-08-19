"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function InquiryForm() {
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setPending(true);
    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          email: form.get("email"),
          phone: form.get("phone"),
          title: form.get("title"),
          content: form.get("content"),
          is_private: form.get("is_private") === "on",
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "문의 등록에 실패했습니다.");
      toast.success("문의가 접수되었습니다. 순차적으로 답변드립니다.");
      event.currentTarget.reset();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "오류가 발생했습니다.");
    } finally {
      setPending(false);
    }
  }

  return (
    <section aria-labelledby="inquiry-heading" className="bg-card rounded-2xl border p-6">
      <h2 id="inquiry-heading" className="text-2xl font-semibold">
        고객 문의
      </h2>
      <p className="text-muted-foreground mt-2 text-sm">
        개인정보가 포함된 내용은 비공개로 접수하는 것을 권장합니다.
      </p>
      <form onSubmit={onSubmit} className="mt-5 grid gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="inq-name">이름</Label>
            <Input id="inq-name" name="name" required className="h-11" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="inq-email">이메일</Label>
            <Input id="inq-email" name="email" type="email" required className="h-11" />
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="inq-phone">연락처</Label>
          <Input id="inq-phone" name="phone" type="tel" className="h-11" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="inq-title">제목</Label>
          <Input id="inq-title" name="title" required className="h-11" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="inq-content">내용</Label>
          <Textarea id="inq-content" name="content" required className="min-h-32" />
        </div>
        <label className="flex min-h-11 items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="is_private"
            defaultChecked
            className="size-4 accent-[var(--primary)]"
          />
          비공개로 접수합니다
        </label>
        <Button type="submit" size="xl" disabled={pending}>
          {pending ? "접수 중..." : "문의 보내기"}
        </Button>
      </form>
    </section>
  );
}
