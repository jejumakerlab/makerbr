import type { Metadata } from "next";
import { PageHero } from "@/components/layout/page-hero";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { getPosts } from "@/lib/data/queries";
import { POST_TYPES } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import { InquiryForm } from "@/components/community/inquiry-form";

export const metadata: Metadata = {
  title: "커뮤니티",
  description: "공지사항, 활동 스토리, FAQ, 고객 문의",
};

export default async function CommunityPage() {
  const posts = await getPosts();
  const notices = posts.filter((item) => item.type === "notice");
  const stories = posts.filter((item) => item.type === "story");
  const faqs = posts.filter((item) => item.type === "faq");

  return (
    <>
      <PageHero
        eyebrow="Community"
        title="커뮤니티"
        description="공지, 현장 이야기, 자주 묻는 질문과 고객 문의를 확인하세요."
      />
      <div className="mx-auto grid w-full max-w-6xl gap-12 px-4 py-12 sm:px-6">
        <section aria-labelledby="notice-heading">
          <h2 id="notice-heading" className="text-2xl font-semibold">
            공지사항
          </h2>
          <ul className="mt-5 divide-y rounded-2xl border">
            {notices.map((item) => (
              <li key={item.id} className="p-5">
                <div className="flex flex-wrap items-center gap-2">
                  {item.pinned ? <Badge>고정</Badge> : null}
                  <h3 className="font-semibold">{item.title}</h3>
                </div>
                <p className="text-muted-foreground mt-2 text-sm">{item.excerpt}</p>
                <p className="text-muted-foreground mt-2 text-xs">
                  {formatDate(item.created_at)}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="story-heading">
          <h2 id="story-heading" className="text-2xl font-semibold">
            활동 스토리
          </h2>
          <ul className="mt-5 grid gap-4 md:grid-cols-2">
            {stories.map((item) => (
              <li key={item.id} className="bg-card rounded-2xl border p-5">
                <p className="text-primary text-xs font-semibold">
                  {POST_TYPES.find((type) => type.value === item.type)?.label}
                </p>
                <h3 className="mt-2 text-lg font-semibold">{item.title}</h3>
                <p className="text-muted-foreground mt-2 text-sm leading-7">{item.excerpt}</p>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="faq-heading">
          <h2 id="faq-heading" className="text-2xl font-semibold">
            FAQ
          </h2>
          <Accordion className="mt-5 rounded-2xl border px-4">
            {faqs.map((item) => (
              <AccordionItem key={item.id} value={item.id}>
                <AccordionTrigger className="min-h-11 text-base">
                  {item.title}
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground text-sm leading-7">
                    {item.content}
                  </p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        <InquiryForm />
      </div>
    </>
  );
}
