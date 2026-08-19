import type { ReactNode } from "react";
import { Suspense } from "react";
import { RouteNotice } from "@/components/auth/route-notice";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { getAuthState } from "@/lib/auth/session";

export default async function SiteLayout({ children }: { children: ReactNode }) {
  const auth = await getAuthState();

  return (
    <>
      <SiteHeader auth={auth} />
      <Suspense fallback={null}>
        <RouteNotice />
      </Suspense>
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
