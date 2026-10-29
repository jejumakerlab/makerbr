"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ImageUrlField } from "@/components/admin/image-url-field";
import type { AdminResourceConfig } from "@/lib/admin/resources";

type Row = Record<string, unknown> & { id: string };

export function ResourceManager({
  config,
  intro,
}: {
  config: AdminResourceConfig;
  intro?: ReactNode;
}) {
  const [rows, setRows] = useState<Row[]>([]);
  const [demo, setDemo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Row | null>(null);
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    const response = await fetch(`/api/admin/${config.name}`);
    const payload = await response.json();
    if (!response.ok) {
      toast.error(payload.error ?? "목록을 불러오지 못했습니다.");
      setLoading(false);
      return;
    }
    setRows(payload.data ?? []);
    setDemo(Boolean(payload.demo));
    setLoading(false);
  }, [config.name]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const previewKeys = useMemo(
    () => config.fields.slice(0, 4).map((field) => field.name),
    [config.fields],
  );

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{config.label}</h1>
          <p className="text-muted-foreground mt-1 text-sm">{config.description}</p>
        </div>
        <Button size="xl" onClick={() => setCreating(true)}>
          새 {config.label} 추가
        </Button>
      </div>
      {demo ? (
        <p className="bg-accent mt-4 rounded-lg px-4 py-3 text-sm" role="status">
          데모 모드입니다. `.env.local`에 Supabase 키를 넣으면 실제 DB에 저장됩니다.
        </p>
      ) : null}

      {intro}

      <div className="bg-card mt-6 overflow-hidden rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              {previewKeys.map((key) => (
                <TableHead key={key}>
                  {config.fields.find((field) => field.name === key)?.label ?? key}
                </TableHead>
              ))}
              <TableHead className="text-right">관리</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={previewKeys.length + 1}>불러오는 중...</TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={previewKeys.length + 1}>데이터가 없습니다.</TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={row.id}>
                  {previewKeys.map((key) => (
                    <TableCell key={key} className="max-w-56 truncate">
                      {formatCell(row[key])}
                    </TableCell>
                  ))}
                  <TableCell className="text-right">
                    <Button variant="ghost" onClick={() => setEditing(row)}>
                      수정
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={async () => {
                        if (!confirm("이 항목을 삭제할까요?")) return;
                        const response = await fetch(
                          `/api/admin/${config.name}/${row.id}`,
                          { method: "DELETE" },
                        );
                        if (!response.ok) {
                          const payload = await response.json();
                          toast.error(payload.error ?? "삭제 실패");
                          return;
                        }
                        toast.success("삭제했습니다.");
                        void load();
                      }}
                    >
                      삭제
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {creating || editing ? (
        <ResourceForm
          config={config}
          initial={editing}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
          onSaved={() => {
            setCreating(false);
            setEditing(null);
            void load();
          }}
        />
      ) : null}
    </div>
  );
}

function formatCell(value: unknown) {
  if (typeof value === "boolean") return value ? "예" : "아니오";
  if (value == null) return "-";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function ResourceForm({
  config,
  initial,
  onClose,
  onSaved,
}: {
  config: AdminResourceConfig;
  initial: Row | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [pending, setPending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const scheduleFields = config.scheduleFields ?? [];
  const [scheduleTbd, setScheduleTbd] = useState(
    Boolean(initial) &&
      scheduleFields.length > 0 &&
      scheduleFields.every((name) => initial?.[name] == null),
  );

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (uploading) return;
    const form = new FormData(event.currentTarget);
    const body: Record<string, unknown> = {};

    for (const field of config.fields) {
      if (scheduleTbd && scheduleFields.includes(field.name)) {
        body[field.name] = null;
        continue;
      }
      if (field.type === "checkbox") {
        body[field.name] = form.get(field.name) === "on";
        continue;
      }
      const raw = form.get(field.name);
      if (raw == null || raw === "") {
        if (!field.required) body[field.name] = null;
        continue;
      }
      if (field.type === "number") body[field.name] = Number(raw);
      else if (field.type === "datetime") {
        const date = new Date(String(raw));
        if (Number.isNaN(date.getTime())) {
          toast.error(`${field.label} 날짜 형식이 올바르지 않습니다.`);
          return;
        }
        body[field.name] = date.toISOString();
      } else if (field.type === "json") {
        try {
          body[field.name] = JSON.parse(String(raw));
        } catch {
          toast.error(`${field.label} JSON 형식이 올바르지 않습니다.`);
          return;
        }
      } else body[field.name] = String(raw);
    }

    setPending(true);
    const endpoint = initial
      ? `/api/admin/${config.name}/${initial.id}`
      : `/api/admin/${config.name}`;
    const response = await fetch(endpoint, {
      method: initial ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const payload = await response.json();
    setPending(false);
    if (!response.ok) {
      toast.error(payload.error ?? "저장에 실패했습니다.");
      return;
    }
    toast.success(payload.demo ? "데모 모드로 반영했습니다." : "저장했습니다.");
    onSaved();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="resource-form-title"
    >
      <form
        onSubmit={onSubmit}
        className="bg-card my-8 w-full max-w-xl rounded-2xl border p-6 shadow-xl"
      >
        <h2 id="resource-form-title" className="text-lg font-semibold">
          {initial ? `${config.label} 수정` : `${config.label} 추가`}
        </h2>
        <div className="mt-5 grid max-h-[70vh] gap-4 overflow-y-auto pr-1">
          {config.fields.map((field) => {
            const value = initial ? initial[field.name] : field.defaultValue;
            const isSchedule = scheduleFields.includes(field.name);
            return (
              <div key={field.name} className="grid gap-2">
                {field.name === scheduleFields[0] ? (
                  <label className="flex min-h-11 items-center gap-2 rounded-lg border bg-slate-50 px-3 text-sm font-medium">
                    <input
                      type="checkbox"
                      checked={scheduleTbd}
                      onChange={(event) => setScheduleTbd(event.target.checked)}
                      className="size-4 accent-[var(--primary)]"
                    />
                    일정 미정
                    <span className="text-muted-foreground font-normal">
                      · 체크하면 시작·종료 일정을 비우고 &lsquo;일정 미정&rsquo;으로 표시합니다
                    </span>
                  </label>
                ) : null}
                <Label htmlFor={field.name}>
                  {field.label}
                  {field.required ? <span className="text-destructive"> *</span> : null}
                </Label>
                {field.type === "textarea" || field.type === "json" ? (
                  <Textarea
                    id={field.name}
                    name={field.name}
                    required={field.required}
                    defaultValue={
                      typeof value === "object" ? JSON.stringify(value, null, 2) : (value as string) ?? ""
                    }
                    className="min-h-28"
                  />
                ) : field.type === "select" ? (
                  <select
                    id={field.name}
                    name={field.name}
                    required={field.required}
                    defaultValue={String(value ?? field.options?.[0]?.value ?? "")}
                    className="h-11 rounded-lg border bg-transparent px-3"
                  >
                    {field.options?.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : field.type === "checkbox" ? (
                  <label className="flex min-h-11 items-center gap-2 text-sm">
                    <input
                      id={field.name}
                      name={field.name}
                      type="checkbox"
                      defaultChecked={Boolean(value)}
                      className="size-4 accent-[var(--primary)]"
                    />
                    사용/공개
                  </label>
                ) : field.type === "image" ? (
                  <ImageUrlField
                    id={field.name}
                    name={field.name}
                    required={field.required}
                    defaultValue={typeof value === "string" ? value : ""}
                    folder={config.name}
                    onUploadingChange={setUploading}
                  />
                ) : (
                  <Input
                    id={field.name}
                    name={field.name}
                    type={field.type === "datetime" ? "datetime-local" : field.type}
                    step={field.type === "number" ? "any" : undefined}
                    inputMode={field.type === "number" ? "decimal" : undefined}
                    required={field.required && !(isSchedule && scheduleTbd)}
                    disabled={isSchedule && scheduleTbd}
                    defaultValue={toInputValue(value, field.type)}
                    className="h-11 disabled:opacity-50"
                  />
                )}
              </div>
            );
          })}
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            취소
          </Button>
          <Button type="submit" size="xl" disabled={pending || uploading}>
            {uploading ? "사진 올리는 중..." : pending ? "저장 중..." : "저장"}
          </Button>
        </div>
      </form>
    </div>
  );
}

function toInputValue(value: unknown, type: string) {
  if (value == null) return "";
  if (type === "datetime" && typeof value === "string") {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    // datetime-local 입력은 시간대 없이 현지 시각을 받으므로 UTC 값을 현지 시각으로 바꿔 넣습니다.
    return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
  }
  return String(value);
}
