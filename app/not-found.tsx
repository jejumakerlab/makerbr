import Link from "next/link";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="mx-auto flex w-full max-w-xl flex-1 flex-col px-4 py-24">
        <h1 className="text-3xl font-semibold">페이지를 찾을 수 없습니다</h1>
        <p className="text-muted-foreground mt-3">
          요청하신 주소가 변경되었거나 존재하지 않습니다.
        </p>
        <Link href="/" className={cn(buttonVariants({ size: "xl" }), "mt-8 w-fit")}>
          메인으로 돌아가기
        </Link>
      </main>
      <SiteFooter />
    </>
  );
}

