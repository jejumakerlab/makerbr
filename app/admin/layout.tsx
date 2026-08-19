import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: `관리자 | ${SITE.nameKo}`,
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return children;
}
