import type { ReactNode } from "react";
import { Suspense } from "react";
import { RouteNotice } from "@/components/auth/route-notice";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { getAuthState } from "@/lib/auth/session";
import { getSiteSettings } from "@/lib/data/queries";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function SiteLayout({ children }: { children: ReactNode }) {
  const [auth, site] = await Promise.all([getAuthState(), getSiteSettings()]);

  return (
    <>
      <SiteHeader auth={auth} />
      <Suspense fallback={null}>
        <RouteNotice />
      </Suspense>
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <SiteFooter site={site} />
    </>
  );
}
