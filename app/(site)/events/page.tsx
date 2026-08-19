import type { Metadata } from "next";
import { PageHero } from "@/components/layout/page-hero";
import { EventCard } from "@/components/events/event-card";
import { FilterChips } from "@/components/shared/filter-chips";
import { EVENT_CATEGORIES } from "@/lib/constants";
import { getEvents } from "@/lib/data/queries";

export const metadata: Metadata = {
  title: "교육/이벤트",
  description: "메이커 교육과 워크숍 일정을 확인하고 신청하세요.",
};

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category = "all" } = await searchParams;
  const events = await getEvents(category);

  return (
    <>
      <PageHero
        eyebrow="Events"
        title="교육 · 이벤트"
        description="정원과 일정을 확인하고 온라인으로 참가 신청할 수 있습니다."
      />
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
        <FilterChips
          options={EVENT_CATEGORIES}
          selected={category}
          basePath="/events"
        />
        <ul className="grid gap-5">
          {events.map((event) => (
            <li key={event.id}>
              <EventCard event={event} />
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
