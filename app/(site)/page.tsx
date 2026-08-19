import Link from "next/link";
import { HomeHero } from "@/components/home/home-hero";
import { ImpactCounters } from "@/components/home/impact-counters";
import { SocialValueBanner } from "@/components/home/social-value-banner";
import { ProductGrid } from "@/components/store/product-card";
import { EventCard } from "@/components/events/event-card";
import { buttonVariants } from "@/components/ui/button";
import { getEvents, getImpacts, getProducts } from "@/lib/data/queries";
import { cn } from "@/lib/utils";

export default async function HomePage() {
  const [impacts, products, events] = await Promise.all([
    getImpacts(),
    getProducts(),
    getEvents(),
  ]);

  return (
    <>
      <HomeHero />
      <ImpactCounters items={impacts} />

      <section
        aria-labelledby="store-highlight-heading"
        className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6"
      >
        <div className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold tracking-[0.18em] text-emerald-600 uppercase">
              Store
            </p>
            <h2 id="store-highlight-heading" className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              메이커 스토어
            </h2>
            <p className="text-muted-foreground mt-1">
              지역 메이커와 자체 제작 상품을 소개합니다.
            </p>
          </div>
          <Link
            href="/store"
            className={cn(buttonVariants({ variant: "outline", size: "xl" }), "rounded-full")}
          >
            스토어 전체 보기
          </Link>
        </div>
        <ProductGrid products={products.slice(0, 3)} />
      </section>

      <section
        aria-labelledby="event-highlight-heading"
        className="border-y border-slate-200/80 bg-slate-50/70"
      >
        <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6">
          <div className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold tracking-[0.18em] text-emerald-600 uppercase">
                Programs
              </p>
              <h2 id="event-highlight-heading" className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                최신 교육 · 이벤트
              </h2>
              <p className="text-muted-foreground mt-1">
                워크숍부터 찾아가는 학교 교육까지 모집 중인 일정입니다.
              </p>
            </div>
            <Link
              href="/events"
              className={cn(buttonVariants({ variant: "outline", size: "xl" }), "rounded-full")}
            >
              교육 전체 보기
            </Link>
          </div>
          <ul className="grid gap-5">
            {events.slice(0, 2).map((event) => (
              <li key={event.id}>
                <EventCard event={event} />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <SocialValueBanner />
    </>
  );
}
