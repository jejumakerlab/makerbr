import type { Metadata } from "next";
import { Noto_Sans_KR, Outfit } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { SkipLink } from "@/components/layout/skip-link";
import { CartProvider } from "@/components/store/cart-provider";
import { SITE } from "@/lib/constants";
import "./globals.css";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const notoSansKr = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-noto-sans",
});

const outfit = Outfit({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: {
    default: `${SITE.nameKo} | ${SITE.slogan}`,
    template: `%s | ${SITE.nameKo}`,
  },
  description: SITE.description,
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      className={`${notoSansKr.variable} ${outfit.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-[#F8FAFC]">
        <SkipLink />
        <CartProvider>
          {children}
          <Toaster />
        </CartProvider>
      </body>
    </html>
  );
}
