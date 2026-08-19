import type { Profile } from "@/types/database";

export type AuthUser = {
  id: string;
  email: string | null;
};

export type AuthState = {
  user: AuthUser | null;
  profile: Pick<Profile, "full_name" | "phone" | "role"> | null;
  isStaff: boolean;
};

export const EMPTY_AUTH: AuthState = {
  user: null,
  profile: null,
  isStaff: false,
};
