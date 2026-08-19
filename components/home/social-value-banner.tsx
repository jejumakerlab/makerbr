import Link from "next/link";
import { Award, FileText } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SocialValueBanner() {
  return (
    <section
      aria-labelledby="social-banner-heading"
      className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6"
    >
      <div className="bg-card grid gap-6 rounded-2xl border p-6 sm:grid-cols-[1fr_auto] sm:items-center sm:p-8">
        <div>
          <h2 id="social-banner-heading" className="text-xl font-semibold">
            사회적기업 인증 · 경영공시
          </h2>
          <p className="text-muted-foreground mt-2 max-w-2xl text-sm leading-7">
            고용노동부 인증 사회적기업으로서 투명한 경영공시와 공공기관 우선구매를
            지원합니다. 인증서와 공시 자료는 회사소개에서 확인할 수 있습니다.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/about#certificates"
            className={cn(buttonVariants({ size: "xl" }), "gap-2")}
          >
            <Award className="size-4" aria-hidden="true" />
            인증서 보기
          </Link>
          <Link
            href="/about#disclosure"
            className={cn(buttonVariants({ variant: "outline", size: "xl" }), "gap-2")}
          >
            <FileText className="size-4" aria-hidden="true" />
            경영공시
          </Link>
        </div>
      </div>
    </section>
  );
}
