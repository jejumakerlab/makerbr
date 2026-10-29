import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { isStaffRole } from "@/lib/auth/paths";
import {
  EMPTY_AUTH,
  isProfileComplete,
  type AuthProfile,
  type AuthState,
  type AuthUser,
} from "@/lib/auth/types";
import type { UserRole } from "@/types/database";

export type { AuthState, AuthUser };

function metaString(metadata: Record<string, unknown>, ...keys: string[]) {
  for (const key of keys) {
    const value = metadata[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
}

export const getAuthState = cache(async function getAuthState(): Promise<AuthState> {
  const supabase = await createClient();
  if (!supabase) return EMPTY_AUTH;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return EMPTY_AUTH;

  const metadata = (user.user_metadata ?? {}) as Record<string, unknown>;
  const fallbackName = metaString(metadata, "full_name", "name");
  const fallbackPhone = metaString(metadata, "phone", "phone_number");
  const authUser: AuthUser = { id: user.id, email: user.email ?? null };

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !profile) {
    await supabase.from("profiles").upsert(
      {
        id: user.id,
        email: user.email,
        full_name: fallbackName,
        phone: fallbackPhone,
        role: "user",
      },
      { onConflict: "id" },
    );

    const fallback: AuthProfile = {
      full_name: fallbackName,
      phone: fallbackPhone,
      zipcode: null,
      address: null,
      address_detail: null,
      role: "user",
    };
    return { user: authUser, profile: fallback, isStaff: false, profileComplete: false };
  }

  const authProfile: AuthProfile = {
    full_name: profile.full_name || fallbackName,
    phone: profile.phone || fallbackPhone,
    zipcode: profile.zipcode ?? null,
    address: profile.address ?? null,
    address_detail: profile.address_detail ?? null,
    role: (profile.role as UserRole) ?? "user",
  };

  return {
    user: authUser,
    profile: authProfile,
    isStaff: isStaffRole(profile.role),
    profileComplete: isProfileComplete({
      ...authProfile,
      full_name: profile.full_name,
      phone: profile.phone,
    }),
  };
});
