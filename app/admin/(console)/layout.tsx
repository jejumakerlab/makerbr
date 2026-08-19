import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { getAuthState } from "@/lib/auth/session";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export default async function AdminConsoleLayout({
  children,
}: {
  children: ReactNode;
}) {
  if (isSupabaseConfigured()) {
    const auth = await getAuthState();
    if (!auth.user) {
      redirect("/login?redirect=/admin");
    }
    if (!auth.isStaff) {
      redirect("/?notice=admin_required");
    }
  }

  return (
    <div className="flex min-h-full flex-col lg:flex-row">
      <AdminSidebar />
      <div className="flex-1 bg-[#f3efe6]">
        <main id="main-content" className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
          {children}
        </main>
      </div>
    </div>
  );
}
