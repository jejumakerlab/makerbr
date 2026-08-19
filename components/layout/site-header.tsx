"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, ShoppingBag, X } from "lucide-react";
import { NAV_ITEMS } from "@/lib/constants";
import { Button, buttonVariants } from "@/components/ui/button";
import { SiteLogo } from "@/components/layout/site-logo";
import { useCart } from "@/components/store/cart-provider";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { count } = useCart();

  return (
    <header className="border-border/80 bg-background/90 sticky top-0 z-50 border-b backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
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
                  "touch-target inline-flex items-center rounded-lg px-3 text-sm font-medium transition-colors",
                  current
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
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

          <Link
            href="/contact"
            className={cn(buttonVariants({ size: "xl" }), "hidden sm:inline-flex")}
          >
            견적 요청
          </Link>

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
          className="border-border bg-background border-t px-4 py-3 lg:hidden"
        >
          <nav className="flex flex-col gap-1" aria-label="모바일 메뉴">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="touch-target text-foreground flex items-center rounded-lg px-3 text-base font-medium"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
