"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Shield, ShoppingBag, X } from "lucide-react";
import { NAV_ITEMS } from "@/lib/constants";
import { Button, buttonVariants } from "@/components/ui/button";
import { SiteLogo } from "@/components/layout/site-logo";
import { LogoutButton } from "@/components/auth/logout-button";
import { useCart } from "@/components/store/cart-provider";
import { cn } from "@/lib/utils";
import { EMPTY_AUTH, type AuthState } from "@/lib/auth/types";

export function SiteHeader({ auth = EMPTY_AUTH }: { auth?: AuthState }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { count } = useCart();
  const close = () => setOpen(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/70 backdrop-blur-md">
      <div className="mx-auto flex h-[4.25rem] w-full max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <SiteLogo />

        <nav
          className="hidden items-center gap-1 lg:flex"
          aria-label="주요 메뉴"
        >
          {NAV_ITEMS.map((item) => {
            const current =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={current ? "page" : undefined}
                className={cn(
                  "touch-target inline-flex items-center rounded-full px-3.5 text-[13px] font-medium tracking-tight transition-colors",
                  current
                    ? "bg-[#0f4c3a] text-white"
                    : "text-slate-500 hover:bg-slate-100 hover:text-[#0f4c3a]",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/store/cart"
            className={cn(buttonVariants({ variant: "ghost", size: "icon-xl" }), "relative")}
            aria-label={count > 0 ? `장바구니, ${count}개 상품` : "장바구니"}
          >
            <ShoppingBag className="size-5" aria-hidden="true" />
            {count > 0 ? (
              <span className="bg-highlight text-highlight-foreground absolute top-1.5 right-1.5 flex size-4 items-center justify-center rounded-full text-[10px] font-bold">
                {count}
              </span>
            ) : null}
          </Link>

          {auth.isStaff ? (
            <Link
              href="/admin"
              className={cn(
                buttonVariants({ variant: "cta", size: "xl" }),
                "hidden md:inline-flex",
              )}
            >
              <Shield className="size-4" aria-hidden="true" />
              관리자 모드
            </Link>
          ) : null}

          {auth.user ? (
            <div className="hidden items-center gap-1 sm:flex">
              <Link
                href="/mypage"
                className={cn(buttonVariants({ variant: "outline", size: "xl" }))}
              >
                마이페이지
              </Link>
              <LogoutButton />
            </div>
          ) : (
            <div className="hidden items-center gap-1 sm:flex">
              <Link
                href="/login"
                className={cn(buttonVariants({ variant: "outline", size: "xl" }))}
              >
                로그인
              </Link>
              <Link href="/signup" className={cn(buttonVariants({ size: "xl" }))}>
                회원가입
              </Link>
            </div>
          )}

          <Button
            className="lg:hidden"
            variant="outline"
            size="icon-xl"
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((value) => !value)}
          >
            <span className="sr-only">{open ? "메뉴 닫기" : "메뉴 열기"}</span>
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </div>

      {open ? (
        <div
          id="mobile-nav"
          className="border-border bg-white/90 border-t px-4 py-3 backdrop-blur-md lg:hidden"
        >
          <nav className="flex flex-col gap-1" aria-label="모바일 메뉴">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={close}
                className="touch-target text-foreground flex items-center rounded-lg px-3 text-base font-medium"
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-2 flex flex-col gap-2 border-t pt-3">
              {auth.isStaff ? (
                <Link
                  href="/admin"
                  onClick={close}
                  className={cn(buttonVariants({ variant: "cta", size: "xl" }), "justify-center")}
                >
                  <Shield className="size-4" aria-hidden="true" />
                  관리자 모드
                </Link>
              ) : null}
              {auth.user ? (
                <>
                  <Link
                    href="/mypage"
                    onClick={close}
                    className={cn(buttonVariants({ variant: "outline", size: "xl" }), "justify-center")}
                  >
                    마이페이지
                  </Link>
                  <LogoutButton onLoggedOut={close} />
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={close}
                    className={cn(buttonVariants({ variant: "outline", size: "xl" }), "justify-center")}
                  >
                    로그인
                  </Link>
                  <Link
                    href="/signup"
                    onClick={close}
                    className={cn(buttonVariants({ size: "xl" }), "justify-center")}
                  >
                    회원가입
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
