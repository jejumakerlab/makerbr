import { cn } from "@/lib/utils";

export function PageHero({
  eyebrow,
  title,
  description,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <section className={cn("border-border/70 border-b bg-[#efe8d8]", className)}>
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        {eyebrow ? (
          <p className="text-primary text-sm font-semibold tracking-[0.16em] uppercase">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-2 max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl">
          {title}
        </h1>
        {description ? (
          <p className="text-muted-foreground mt-4 max-w-2xl text-base leading-7 sm:text-lg">
            {description}
          </p>
        ) : null}
      </div>
    </section>
  );
}
