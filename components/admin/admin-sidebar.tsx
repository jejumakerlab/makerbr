"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, LogOut } from "lucide-react";
import { ADMIN_NAV, SITE } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    if (supabase) await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <aside className="bg-sidebar text-sidebar-foreground flex w-full flex-col lg:min-h-screen lg:w-64">
      <div className="border-sidebar-border border-b px-5 py-5">
        <p className="font-[family-name:var(--font-heading)] text-lg font-semibold">
          {SITE.nameKo} 관리
        </p>
        <p className="text-sidebar-foreground/70 text-xs">통합 관리자 시스템</p>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-3" aria-label="관리자 메뉴">
        {ADMIN_NAV.map((item) => {
          const current =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={current ? "page" : undefined}
              className={cn(
                "flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-medium",
                current
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "hover:bg-sidebar-accent/70",
              )}
            >
              {item.href === "/admin" ? (
                <LayoutDashboard className="size-4" aria-hidden="true" />
              ) : null}
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-sidebar-border border-t p-3">
        <Link
          href="/"
          className="hover:bg-sidebar-accent/70 mb-1 flex min-h-11 items-center rounded-lg px-3 text-sm"
        >
          사이트로 돌아가기
        </Link>
        <Button
          variant="ghost"
          className="text-sidebar-foreground w-full justify-start"
          onClick={signOut}
        >
          <LogOut className="size-4" />
          로그아웃
        </Button>
      </div>
    </aside>
  );
}
