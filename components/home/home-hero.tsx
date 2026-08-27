import Link from "next/link";
import { ArrowRight, GraduationCap, Leaf, Sparkles, Wrench } from "lucide-react";
import { SITE } from "@/lib/constants";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    step: "01",
    title: "메이커 교육",
    body: "누구나 참여하는 디지털 제작 워크숍과 찾아가는 교실.",
    icon: GraduationCap,
  },
  {
    step: "02",
    title: "로컬 제작",
    body: "제주 소재와 장비로 아이디어를 실물 프로토타입으로.",
    icon: Wrench,
  },
  {
    step: "03",
    title: "친환경 순환",
    body: "업사이클 제품과 공공 협업으로 가치를 다시 돌립니다.",
    icon: Leaf,
  },
] as const;

export function HomeHero({
  slogan = SITE.slogan,
  description = SITE.description,
}: {
  slogan?: string;
  description?: string;
}) {
  return (
    <section
      aria-labelledby="hero-heading"
      className="bg-mesh relative overflow-hidden"
    >
      <div aria-hidden="true" className="bg-dot-grid pointer-events-none absolute inset-0 opacity-70" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/4 size-72 rounded-full bg-emerald-300/25 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-0 bottom-0 size-96 rounded-full bg-teal-800/10 blur-3xl"
      />

      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:py-28">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-emerald-200/80 bg-white/70 px-3 py-1 text-xs font-medium tracking-wide text-[#134e4a] shadow-sm backdrop-blur-md">
            <Sparkles className="size-3.5 text-emerald-500" aria-hidden="true" />
            제주 메이커 · 로컬 제작
          </p>
          <h1
            id="hero-heading"
            className="mt-6 max-w-xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-[3.5rem] lg:leading-[1.12]"
          >
            {slogan === SITE.slogan ? (
              <>
                만드는 사람과
                <br />
                <span className="from-primary to-emerald-500 bg-linear-to-r bg-clip-text text-transparent">
                  세상을 잇다
                </span>
              </>
            ) : (
              <span className="from-primary to-emerald-500 bg-linear-to-r bg-clip-text text-transparent">
                {slogan}
              </span>
            )}
          </h1>
          <p className="text-muted-foreground mt-5 max-w-lg text-lg leading-8 tracking-tight">
            {description}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/events"
              className={cn(buttonVariants({ size: "xl" }), "rounded-full px-6")}
            >
              교육 살펴보기
              <ArrowRight className="size-4 transition-transform group-hover/button:translate-x-0.5" aria-hidden="true" />
            </Link>
            <Link
              href="/store"
              className={cn(
                buttonVariants({ variant: "outline", size: "xl" }),
                "rounded-full bg-white/70 px-6 backdrop-blur-md",
              )}
            >
              메이커 스토어
            </Link>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-md lg:max-w-none">
          <p className="sr-only">메이커 교육, 로컬 제작, 친환경 순환의 세 단계</p>
          <ol className="flex flex-col gap-4 lg:block lg:h-[420px]">
            {STEPS.map((item, index) => {
              const Icon = item.icon;
              return (
                <li
                  key={item.step}
                  className={cn(
                    "glass-panel rounded-3xl p-5 transition-transform duration-300 hover:-translate-y-1",
                    "lg:absolute lg:w-[86%]",
                    index === 0 && "lg:top-0 lg:left-0 lg:rotate-[-3deg]",
                    index === 1 && "lg:top-[118px] lg:left-[8%] lg:rotate-[1.5deg]",
                    index === 2 && "lg:top-[236px] lg:left-[2%] lg:rotate-[-1.5deg]",
                  )}
                >
                  <div className="flex items-start gap-4">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[#0f4c3a] text-white">
                      <Icon className="size-5" aria-hidden="true" />
                    </span>
                    <div>
                      <p className="text-[11px] font-semibold tracking-[0.18em] text-emerald-600 uppercase">
                        Step {item.step}
                      </p>
                      <h2 className="mt-1 text-lg font-semibold tracking-tight">
                        {item.title}
                      </h2>
                      <p className="text-muted-foreground mt-1.5 text-sm leading-6">
                        {item.body}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
