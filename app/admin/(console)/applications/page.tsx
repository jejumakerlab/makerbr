import type { Metadata } from "next";
import { ApplicationManager } from "@/components/admin/application-manager";
import { MOCK_APPLICATIONS, MOCK_EVENTS } from "@/lib/mock-data";
import { createClient } from "@/lib/supabase/server";
import type { ApplicationWithEvent } from "@/types/database";

export const metadata: Metadata = {
  title: "교육 신청자",
};

export default async function AdminApplicationsPage() {
  const supabase = await createClient();
  if (!supabase) {
    const demo: ApplicationWithEvent[] = MOCK_APPLICATIONS.map((item) => ({
      ...item,
      events: MOCK_EVENTS.find((event) => event.id === item.event_id) ?? null,
    }));
    return <ApplicationManager initialApplications={demo} demo />;
  }

  const { data, error } = await supabase
    .from("applications")
    .select("*, events(title, slug, start_at, end_at, location, fee, supplies)")
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-800">
        신청 목록을 불러오지 못했습니다: {error.message}
        <p className="mt-2 text-rose-700">
          Supabase SQL Editor에서 <code>supabase/applications.sql</code> 을 실행했는지 확인해 주세요.
        </p>
      </div>
    );
  }

  return <ApplicationManager initialApplications={(data ?? []) as ApplicationWithEvent[]} />;
}
