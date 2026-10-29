"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Mail, Phone, UserRound } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  APPLICATION_STATUS_LABEL,
  APPLICATION_STATUS_STYLE,
  APPLICATION_STATUSES,
} from "@/lib/events/applications";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ApplicationStatus, ApplicationWithEvent } from "@/types/database";

type StatusFilter = ApplicationStatus | "all";

export function ApplicationManager({
  initialApplications,
  demo = false,
}: {
  initialApplications: ApplicationWithEvent[];
  demo?: boolean;
}) {
  const [applications, setApplications] = useState(initialApplications);
  const [status, setStatus] = useState<StatusFilter>("all");
  const [eventId, setEventId] = useState("all");

  const events = useMemo(() => {
    const map = new Map<string, string>();
    for (const item of initialApplications) {
      map.set(item.event_id, item.events?.title ?? "알 수 없는 교육");
    }
    return [...map.entries()];
  }, [initialApplications]);

  const inEvent =
    eventId === "all" ? applications : applications.filter((item) => item.event_id === eventId);
  const counts = inEvent.reduce<Record<string, number>>((acc, item) => {
    acc[item.status] = (acc[item.status] ?? 0) + 1;
    return acc;
  }, {});
  const visible = status === "all" ? inEvent : inEvent.filter((item) => item.status === status);

  function applyStatus(id: string, next: ApplicationStatus) {
    setApplications((list) =>
      list.map((item) => (item.id === id ? { ...item, status: next } : item)),
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold">교육 신청자</h1>
      <p className="text-muted-foreground mt-1 text-sm">
        &lsquo;참가 확정&rsquo;을 누르면 회원 신청자의 마이페이지에 바로 반영됩니다. 비회원 신청은
        연락처로 따로 안내해 주세요.
      </p>

      {demo ? (
        <p className="bg-accent mt-4 rounded-lg px-4 py-3 text-sm" role="status">
          데모 모드입니다. Supabase 설정이 없어 변경 내용이 저장되지 않습니다.
        </p>
      ) : null}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div role="group" aria-label="신청 상태 필터" className="flex flex-wrap gap-2">
          {(["all", ...APPLICATION_STATUSES] as StatusFilter[]).map((value) => {
            const count = value === "all" ? inEvent.length : (counts[value] ?? 0);
            const active = status === value;
            return (
              <button
                key={value}
                type="button"
                aria-pressed={active}
                onClick={() => setStatus(value)}
                className={cn(
                  "inline-flex h-9 items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium transition-colors",
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-white hover:bg-slate-50",
                )}
              >
                {value === "all" ? "전체" : APPLICATION_STATUS_LABEL[value]}
                <span className={cn("tabular-nums", active ? "text-white/80" : "text-muted-foreground")}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
        <label className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground shrink-0">교육</span>
          <select
            value={eventId}
            onChange={(event) => setEventId(event.target.value)}
            className="border-input h-10 max-w-64 rounded-lg border bg-white px-3"
          >
            <option value="all">전체 교육</option>
            {events.map(([id, title]) => (
              <option key={id} value={id}>
                {title}
              </option>
            ))}
          </select>
        </label>
      </div>

      {visible.length === 0 ? (
        <p className="text-muted-foreground mt-10 rounded-2xl border border-dashed bg-white py-16 text-center">
          {applications.length === 0 ? "아직 들어온 신청이 없습니다." : "조건에 맞는 신청이 없습니다."}
        </p>
      ) : (
        <ul className="mt-6 grid gap-4">
          {visible.map((application) => (
            <li key={application.id}>
              <ApplicationCard application={application} onUpdated={applyStatus} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ApplicationCard({
  application,
  onUpdated,
}: {
  application: ApplicationWithEvent;
  onUpdated: (id: string, status: ApplicationStatus) => void;
}) {
  const [busy, setBusy] = useState(false);
  const event = application.events;
  const isMember = Boolean(application.user_id);

  async function changeStatus(next: ApplicationStatus) {
    if (next === application.status) return;
    if (next === "cancelled" && !confirm(`${application.name}님의 신청을 취소할까요?`)) return;
    setBusy(true);
    try {
      const response = await fetch(`/api/admin/applications/${application.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "저장하지 못했습니다.");
      onUpdated(application.id, next);
      toast.success(`${application.name}님 → '${APPLICATION_STATUS_LABEL[next]}'(으)로 변경했습니다.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "저장하지 못했습니다.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <article className={cn("rounded-2xl border bg-white", busy && "opacity-70")}>
      <header className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b px-5 py-4">
        <span
          className={cn(
            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset",
            APPLICATION_STATUS_STYLE[application.status],
          )}
        >
          {APPLICATION_STATUS_LABEL[application.status]}
        </span>
        <p className="font-semibold">{event?.title ?? "알 수 없는 교육"}</p>
        <p className="text-muted-foreground text-sm">
          {event?.start_at ? formatDateTime(event.start_at) : "일정 미정"}
        </p>
        <p className="text-muted-foreground ml-auto text-xs">
          신청 {formatDateTime(application.created_at)}
        </p>
      </header>

      <div className="grid gap-4 px-5 py-4 lg:grid-cols-[1fr_auto] lg:items-start">
        <div className="grid gap-1.5 text-sm">
          <p className="flex flex-wrap items-center gap-2 text-base font-semibold">
            <UserRound className="text-muted-foreground size-4" aria-hidden="true" />
            {application.name}
            {application.organization ? (
              <span className="text-muted-foreground text-sm font-normal">
                · {application.organization}
              </span>
            ) : null}
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[11px] font-medium",
                isMember ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600",
              )}
            >
              {isMember ? "회원 · 마이페이지 확인 가능" : "비회원"}
            </span>
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {application.phone ? (
              <a
                href={`tel:${application.phone.replace(/\D/g, "")}`}
                className="inline-flex min-h-9 items-center gap-1.5 underline-offset-4 hover:underline"
              >
                <Phone className="text-muted-foreground size-4" aria-hidden="true" />
                {application.phone}
              </a>
            ) : null}
            <a
              href={`mailto:${application.email}`}
              className="inline-flex min-h-9 items-center gap-1.5 underline-offset-4 hover:underline"
            >
              <Mail className="text-muted-foreground size-4" aria-hidden="true" />
              {application.email}
            </a>
          </div>
          {application.message ? (
            <p className="mt-1 rounded-lg bg-amber-50 px-3 py-2 text-amber-900 whitespace-pre-line">
              요청 사항: {application.message}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2 lg:justify-end">
          {application.status !== "confirmed" ? (
            <Button disabled={busy} onClick={() => void changeStatus("confirmed")}>
              <CheckCircle2 className="size-4" aria-hidden="true" />
              참가 확정
            </Button>
          ) : null}
          <label className="sr-only" htmlFor={`status-${application.id}`}>
            신청 상태 변경
          </label>
          <select
            id={`status-${application.id}`}
            value={application.status}
            disabled={busy}
            onChange={(event) => void changeStatus(event.target.value as ApplicationStatus)}
            className="border-input h-10 rounded-lg border bg-white px-3 text-sm"
          >
            {APPLICATION_STATUSES.map((value) => (
              <option key={value} value={value}>
                {APPLICATION_STATUS_LABEL[value]}
              </option>
            ))}
          </select>
        </div>
      </div>
    </article>
  );
}
