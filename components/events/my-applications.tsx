import Link from "next/link";
import { CalendarCheck } from "lucide-react";
import { formatDateTime, formatKRW } from "@/lib/format";
import {
  APPLICATION_STATUS_GUIDE,
  APPLICATION_STATUS_LABEL,
  APPLICATION_STATUS_STYLE,
} from "@/lib/events/applications";
import { cn } from "@/lib/utils";
import type { ApplicationWithEvent } from "@/types/database";

export function MyApplications({ applications }: { applications: ApplicationWithEvent[] }) {
  if (applications.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-2xl border border-dashed bg-white px-6 py-12 text-center">
        <CalendarCheck className="text-muted-foreground size-8" aria-hidden="true" />
        <p className="text-muted-foreground mt-3">아직 신청한 교육이 없어요.</p>
        <Link href="/events" className="mt-3 text-sm font-medium text-emerald-700 hover:underline">
          교육 · 이벤트 둘러보기
        </Link>
      </div>
    );
  }

  return (
    <ul className="grid gap-4">
      {applications.map((application) => {
        const event = application.events;
        const confirmed = application.status === "confirmed";
        return (
          <li key={application.id} className="rounded-2xl border bg-white">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b px-5 py-4">
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset",
                  APPLICATION_STATUS_STYLE[application.status],
                )}
              >
                {APPLICATION_STATUS_LABEL[application.status]}
              </span>
              {event ? (
                <Link
                  href={`/events/${event.slug}`}
                  className="font-semibold underline-offset-4 hover:underline"
                >
                  {event.title}
                </Link>
              ) : (
                <p className="font-semibold">비공개로 전환된 교육</p>
              )}
              <p className="text-muted-foreground ml-auto text-xs">
                신청 {formatDateTime(application.created_at)}
              </p>
            </div>

            <div className="grid gap-3 px-5 py-4 text-sm">
              <p
                className={cn(
                  "rounded-xl px-4 py-2.5",
                  confirmed ? "bg-emerald-50 text-[#0f4c3a]" : "bg-slate-50 text-slate-700",
                )}
              >
                {APPLICATION_STATUS_GUIDE[application.status]}
              </p>
              {event ? (
                <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5">
                  <dt className="text-muted-foreground">일정</dt>
                  <dd>{event.start_at ? formatDateTime(event.start_at) : "일정 미정"}</dd>
                  {event.location ? (
                    <>
                      <dt className="text-muted-foreground">장소</dt>
                      <dd>{event.location}</dd>
                    </>
                  ) : null}
                  <dt className="text-muted-foreground">참가비</dt>
                  <dd>{event.fee === 0 ? "무료" : formatKRW(event.fee)}</dd>
                  {event.supplies ? (
                    <>
                      <dt className="text-muted-foreground">준비물</dt>
                      <dd className="break-keep whitespace-pre-line">{event.supplies}</dd>
                    </>
                  ) : null}
                </dl>
              ) : null}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
