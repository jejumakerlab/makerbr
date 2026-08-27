import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { getEventBySlug, getPublishedEventSlugs } from "@/lib/data/queries";
import { EVENT_CATEGORIES } from "@/lib/constants";
import { formatDateTime, formatKRW, remainingSeats } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { EventApplyForm } from "@/components/events/event-apply-form";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  return { title: event?.title ?? "교육/이벤트" };
}

export default async function EventDetailPage({ params }: Props) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) notFound();

  const remain = remainingSeats(event.capacity, event.enrolled_count);
  const category =
    EVENT_CATEGORIES.find((item) => item.value === event.category)?.label ??
    event.category;

  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
      {event.cover_image ? (
        <div className="bg-muted relative mb-8 aspect-[16/9] overflow-hidden rounded-2xl">
          <Image
            src={event.cover_image}
            alt={`${event.title} 대표 이미지`}
            fill
            className="object-cover"
            sizes="768px"
            priority
          />
        </div>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary">{category}</Badge>
        {remain === 0 ? (
          <Badge variant="destructive">정원 마감 · 대기 신청 가능</Badge>
        ) : event.capacity > 0 ? (
          <Badge variant="outline">
            {event.enrolled_count}/{event.capacity}명 · 잔여 {remain}석
          </Badge>
        ) : null}
      </div>
      <h1 className="mt-4 text-3xl font-semibold">{event.title}</h1>
      <p className="text-muted-foreground mt-3">
        {event.start_at ? formatDateTime(event.start_at) : "일정 미정"}
        {event.location ? ` · ${event.location}` : ""}
      </p>
      <p className="mt-2 font-medium">
        {event.fee === 0 ? "참가비 무료" : `참가비 ${formatKRW(event.fee)}`}
      </p>
      <p className="mt-6 leading-8">{event.description}</p>
      <EventApplyForm eventId={event.id} isFull={remain === 0} />
    </article>
  );
}

export async function generateStaticParams() {
  const slugs = await getPublishedEventSlugs();
  return slugs.map((slug) => ({ slug }));
}
