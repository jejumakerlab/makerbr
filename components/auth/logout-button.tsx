"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

export function LogoutButton({
  className,
  onLoggedOut,
}: {
  className?: string;
  onLoggedOut?: () => void;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function onClick() {
    const supabase = createClient();
    setPending(true);
    if (supabase) {
      await supabase.auth.signOut();
    }
    setPending(false);
    toast.success("로그아웃했습니다.");
    onLoggedOut?.();
    router.push("/");
    router.refresh();
  }

  return (
    <Button
      type="button"
      variant="ghost"
      className={cn("min-h-11", className)}
      disabled={pending}
      onClick={() => void onClick()}
    >
      {pending ? "로그아웃 중..." : "로그아웃"}
    </Button>
  );
}
