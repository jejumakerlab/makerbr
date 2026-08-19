import Image from "next/image";
import Link from "next/link";
import type { EventItem } from "@/types/database";
import { EVENT_CATEGORIES } from "@/lib/constants";
import { formatDateTime, formatKRW, remainingSeats } from "@/lib/format";
import { Badge } from "@/components/ui/badge";

export function EventCard({ event }: { event: EventItem }) {
  const remain = remainingSeats(event.capacity, event.enrolled_count);
  const category =
    EVENT_CATEGORIES.find((item) => item.value === event.category)?.label ??
    event.category;

  return (
    <article className="bg-card overflow-hidden rounded-2xl border">
      <Link
        href={`/events/${event.slug}`}
        className="grid focus-visible:outline-2 focus-visible:outline-offset-2 md:grid-cols-[240px_1fr]"
      >
        <div className="bg-muted relative min-h-44">
          {event.cover_image ? (
            <Image
              src={event.cover_image}
              alt={`${event.title} 대표 이미지`}
              fill
              className="object-cover"
              sizes="(min-width: 768px) 240px, 100vw"
            />
          ) : null}
        </div>
        <div className="p-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{category}</Badge>
            {remain === 0 ? (
              <Badge variant="destructive">정원 마감 · 대기 신청</Badge>
            ) : event.capacity > 0 ? (
              <Badge variant="outline">잔여 {remain}석</Badge>
            ) : null}
          </div>
          <h3 className="mt-3 text-xl font-semibold">{event.title}</h3>
          {event.start_at ? (
            <p className="text-muted-foreground mt-2 text-sm">
              {formatDateTime(event.start_at)}
              {event.location ? ` · ${event.location}` : ""}
            </p>
          ) : null}
          <p className="mt-3 text-sm font-medium">
            {event.fee === 0 ? "참가비 무료" : formatKRW(event.fee)}
          </p>
        </div>
      </Link>
    </article>
  );
}
