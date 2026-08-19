import { notFound } from "next/navigation";
import { ResourceManager } from "@/components/admin/resource-manager";
import { ADMIN_RESOURCES } from "@/lib/admin/resources";
import type { AdminResourceName } from "@/types/database";

const ALIASES: Record<string, AdminResourceName> = {
  products: "products",
  orders: "orders",
  events: "events",
  applications: "applications",
  posts: "posts",
  quotes: "quotes",
  impacts: "impacts",
  portfolios: "portfolios",
  certificates: "certificates",
  inquiries: "inquiries",
};

export default async function AdminResourcePage({
  params,
}: {
  params: Promise<{ resource: string }>;
}) {
  const { resource } = await params;
  const name = ALIASES[resource];
  if (!name) notFound();
  return <ResourceManager config={ADMIN_RESOURCES[name]} />;
}
