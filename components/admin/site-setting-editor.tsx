"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const MAX_LENGTH = 500;

export function SiteSettingEditor({
  settingKey,
  title,
  description,
  initialValue,
  defaultValue,
}: {
  settingKey: string;
  title: string;
  description: string;
  initialValue: string;
  defaultValue: string;
}) {
  const [value, setValue] = useState(initialValue);
  const [saved, setSaved] = useState(initialValue);
  const [pending, setPending] = useState(false);
  const inputId = `setting-${settingKey}`;

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    const response = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: settingKey, value }),
    });
    const payload = await response.json();
    setPending(false);
    if (!response.ok) {
      toast.error(payload.error ?? "저장에 실패했습니다.");
      return;
    }
    const next = value.trim() || defaultValue;
    setValue(next);
    setSaved(next);
    toast.success(payload.demo ? "데모 모드로 반영했습니다." : "저장했습니다. 메인 페이지에 바로 반영됩니다.");
  }

  return (
    <section
      aria-labelledby={`${inputId}-title`}
      className="bg-card mt-6 rounded-xl border p-5"
    >
      <h2 id={`${inputId}-title`} className="text-base font-semibold">
        {title}
      </h2>
      <p className="text-muted-foreground mt-1 text-sm">{description}</p>
      <form onSubmit={onSubmit} className="mt-4 grid gap-2">
        <Label htmlFor={inputId} className="sr-only">
          {title}
        </Label>
        <Textarea
          id={inputId}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          maxLength={MAX_LENGTH}
          className="min-h-24"
        />
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-muted-foreground text-xs">
            {value.length}/{MAX_LENGTH}자 · 비워 두고 저장하면 기본 문구가 표시됩니다.
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={pending || value === saved}
              onClick={() => setValue(saved)}
            >
              되돌리기
            </Button>
            <Button type="submit" disabled={pending || value === saved}>
              {pending ? "저장 중..." : "문구 저장"}
            </Button>
          </div>
        </div>
      </form>
    </section>
  );
}
