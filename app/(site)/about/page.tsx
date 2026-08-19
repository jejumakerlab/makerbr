import type { Metadata } from "next";
import { MapPin } from "lucide-react";
import { PageHero } from "@/components/layout/page-hero";
import { getCertificates } from "@/lib/data/queries";
import { SITE } from "@/lib/constants";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "회사소개",
  description: "메이커브릿지의 미션, 사회적 가치, 인증 및 오시는 길",
};

export default async function AboutPage() {
  const certificates = await getCertificates();

  return (
    <>
      <PageHero
        eyebrow="About"
        title="사람과 기술, 지역을 잇는 사회적기업"
        description="누구나 만들고 배우며 지역과 함께 성장하는 메이커 생태계를 만듭니다."
      />

      <div className="mx-auto grid w-full max-w-6xl gap-12 px-4 py-14 sm:px-6 lg:grid-cols-2">
        <section aria-labelledby="mission-heading">
          <h2 id="mission-heading" className="text-2xl font-semibold">
            미션
          </h2>
          <p className="text-muted-foreground mt-4 leading-8">
            디지털 제작 기술과 지역 자원을 연결해, 교육·일자리·친환경 순환이 한 방향으로
            흐르는 다리를 놓습니다. 장애인과 고령자를 포함한 모든 이용자가 참여할 수 있는
            배움의 장을 운영합니다.
          </p>
        </section>
        <section aria-labelledby="vision-heading">
          <h2 id="vision-heading" className="text-2xl font-semibold">
            비전
          </h2>
          <p className="text-muted-foreground mt-4 leading-8">
            제주에서 출발해, 메이커가 지역 사회의 문제 해결자가 되는 모델을 확산합니다.
            공공·학교·마을이 함께 쓰는 열린 제작 인프라를 지향합니다.
          </p>
        </section>
      </div>

      <section
        id="disclosure"
        aria-labelledby="value-heading"
        className="border-y bg-[#efe8d8]/70"
      >
        <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
          <h2 id="value-heading" className="text-2xl font-semibold">
            사회적 가치 실현
          </h2>
          <ul className="mt-8 grid gap-6 md:grid-cols-3">
            {[
              ["포용 교육", "연령·장애 여부와 관계없이 참여 가능한 메이커 커리큘럼"],
              ["지역 순환", "폐기 소재 업사이클과 로컬 메이커 판로 연결"],
              ["공공 협력", "우선구매·수의계약으로 공공의 사회적 가치 구매를 지원"],
            ].map(([title, body]) => (
              <li key={title} className="bg-card rounded-2xl border p-6">
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="text-muted-foreground mt-2 text-sm leading-7">{body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        id="certificates"
        aria-labelledby="cert-heading"
        className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6"
      >
        <h2 id="cert-heading" className="text-2xl font-semibold">
          인증서 · 경영공시 자료
        </h2>
        <p className="text-muted-foreground mt-2">
          관리자가 업로드한 인증·공시 자료가 갤러리로 공개됩니다.
        </p>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {certificates.map((item) => (
            <li key={item.id} className="bg-card rounded-2xl border p-5">
              <p className="font-semibold">{item.title}</p>
              <p className="text-muted-foreground mt-1 text-sm">
                {item.issued_by}
                {item.issued_on ? ` · ${formatDate(item.issued_on)}` : ""}
              </p>
              {item.file_url ? (
                <a
                  href={item.file_url}
                  className="text-primary mt-3 inline-flex min-h-11 items-center underline-offset-4 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  자료 열기 (새 창)
                </a>
              ) : null}
            </li>
          ))}
        </ul>
      </section>

      <section
        aria-labelledby="map-heading"
        className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6"
      >
        <h2 id="map-heading" className="text-2xl font-semibold">
          오시는 길
        </h2>
        <p className="text-muted-foreground mt-3 flex items-start gap-2">
          <MapPin className="mt-1 size-4 shrink-0" aria-hidden="true" />
          {SITE.address} · {SITE.hours}
        </p>
        <div className="bg-muted mt-6 overflow-hidden rounded-2xl border">
          <iframe
            title="메이커브릿지 위치 지도"
            src="https://maps.google.com/maps?q=제주특별자치도%20제주시&t=&z=13&ie=UTF8&iwloc=&output=embed"
            className="h-80 w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </section>
    </>
  );
}
