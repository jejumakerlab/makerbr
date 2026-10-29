import type { Profile } from "@/types/database";

export type AuthUser = {
  id: string;
  email: string | null;
};

export type AuthProfile = Pick<
  Profile,
  "full_name" | "phone" | "zipcode" | "address" | "address_detail" | "role"
>;

export type AuthState = {
  user: AuthUser | null;
  profile: AuthProfile | null;
  isStaff: boolean;
  /** 이름·연락처·주소가 모두 있어야 교육 신청·구매를 할 수 있습니다. supabase/members.sql 과 같은 기준입니다. */
  profileComplete: boolean;
};

export const EMPTY_AUTH: AuthState = {
  user: null,
  profile: null,
  isStaff: false,
  profileComplete: false,
};

export function isProfileComplete(
  profile: Pick<AuthProfile, "full_name" | "phone" | "address"> | null | undefined,
) {
  return Boolean(
    profile?.full_name?.trim() && profile.phone?.trim() && profile.address?.trim(),
  );
}

export const PROFILE_PATH = "/mypage/profile";

export function profilePathFor(redirectTo: string) {
  return `${PROFILE_PATH}?redirect=${encodeURIComponent(redirectTo)}&notice=profile_required`;
}
