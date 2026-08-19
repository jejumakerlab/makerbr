import { redirect } from "next/navigation";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const params = await searchParams;
  if (params.error === "unauthorized") {
    redirect("/?notice=admin_required");
  }
  const next = params.next?.startsWith("/") ? params.next : "/admin";
  redirect(`/login?redirect=${encodeURIComponent(next)}`);
}
