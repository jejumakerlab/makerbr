import type { ReactNode } from "react";

export function AuthCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-md px-4 py-16 sm:px-6">
      <div className="bg-card rounded-2xl border p-6 sm:p-8">
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p className="text-muted-foreground mt-2 text-sm leading-6">{description}</p>
        {children}
      </div>
    </div>
  );
}
