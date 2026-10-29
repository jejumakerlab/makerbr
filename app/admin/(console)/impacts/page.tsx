import type { Metadata } from "next";
import { ResourceManager } from "@/components/admin/resource-manager";
import { SiteSettingEditor } from "@/components/admin/site-setting-editor";
import { ADMIN_RESOURCES } from "@/lib/admin/resources";
import { SITE } from "@/lib/constants";
import { getSiteSettings } from "@/lib/data/queries";

export const metadata: Metadata = {
  title: "성과 수치",
};

export default async function AdminImpactsPage() {
  const site = await getSiteSettings();

  return (
    <ResourceManager
      config={ADMIN_RESOURCES.impacts}
      intro={
        <SiteSettingEditor
          settingKey="impact_description"
          title="섹션 안내 문구"
          description="메인 페이지 '사회적 가치 성과' 제목 아래에 표시되는 설명입니다. 줄바꿈도 그대로 반영됩니다."
          initialValue={site.impactDescription}
          defaultValue={SITE.impactDescription}
        />
      }
    />
  );
}
