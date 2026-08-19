import type { ReactNode } from "react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export default function AdminConsoleLayout({ children }: { children: ReactNode }) {
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
