import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SITE } from "@/lib/constants";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function HomeHero() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="relative overflow-hidden border-b border-[#d8d0c3] bg-[#efe8d8]"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/2 md:block"
      >
        <svg
          viewBox="0 0 640 640"
          className="h-full w-full text-primary/15"
          fill="none"
        >
          <path
            d="M40 420h180c70 0 90-80 160-80h220"
            stroke="currentColor"
            strokeWidth="28"
            strokeLinecap="round"
          />
          <path
            d="M40 500h210c80 0 90-90 180-90h170"
            stroke="currentColor"
            strokeWidth="16"
            strokeLinecap="round"
          />
          <circle cx="500" cy="250" r="90" className="fill-highlight/20" />
        </svg>
      </div>

      <div className="relative mx-auto grid w-full max-w-6xl gap-10 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        <div>
          <p className="text-primary text-sm font-semibold tracking-[0.18em] uppercase">
            Social enterprise · Jeju
          </p>
          <h1
            id="hero-heading"
            className="mt-4 max-w-xl text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl"
          >
            {SITE.slogan}
          </h1>
          <p className="text-muted-foreground mt-5 max-w-xl text-lg leading-8">
            {SITE.description}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/events" className={cn(buttonVariants({ size: "xl" }))}>
              교육 살펴보기
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <Link
              href="/store"
              className={cn(buttonVariants({ variant: "outline", size: "xl" }))}
            >
              메이커 스토어
            </Link>
          </div>
        </div>

        <div className="bg-card rounded-2xl border p-6 shadow-sm">
          <p className="text-sm font-medium">사회적기업이 만드는 순환</p>
          <ol className="mt-4 space-y-4">
            {[
              ["배우다", "누구나 참여하는 메이커 교육과 워크숍"],
              ["만들다", "지역 소재와 디지털 제작으로 실물을 구현"],
              ["잇다", "스토어·공공협력으로 가치와 일자리를 순환"],
            ].map(([title, body], index) => (
              <li key={title} className="flex gap-3">
                <span className="bg-primary text-primary-foreground mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold">
                  {index + 1}
                </span>
                <div>
                  <p className="font-semibold">{title}</p>
                  <p className="text-muted-foreground text-sm leading-6">{body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
