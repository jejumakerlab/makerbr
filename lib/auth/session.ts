import { createClient } from "@/lib/supabase/server";
import { isStaffRole } from "@/lib/auth/paths";
import { EMPTY_AUTH, type AuthState, type AuthUser } from "@/lib/auth/types";
import type { UserRole } from "@/types/database";

export type { AuthState, AuthUser };

export async function getAuthState(): Promise<AuthState> {
  const supabase = await createClient();
  if (!supabase) return EMPTY_AUTH;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return EMPTY_AUTH;

  const metadata = user.user_metadata ?? {};
  const fallbackName =
    typeof metadata.full_name === "string" ? metadata.full_name : null;
  const fallbackPhone = typeof metadata.phone === "string" ? metadata.phone : null;
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

    return {
      user: authUser,
      profile: {
        full_name: fallbackName,
        phone: fallbackPhone,
        role: "user",
      },
      isStaff: false,
    };
  }

  return {
    user: authUser,
    profile: {
      full_name: profile.full_name ?? fallbackName,
      phone: profile.phone ?? fallbackPhone,
      role: (profile.role as UserRole) ?? "user",
    },
    isStaff: isStaffRole(profile.role),
  };
}
