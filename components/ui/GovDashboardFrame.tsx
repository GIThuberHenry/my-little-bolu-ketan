import type { ReactNode } from "react";

/** A titled, hard-bordered panel — the basic "fake gov dashboard" building block. */
export function Panel({
  title,
  children,
  headerRight,
  bodyClassName = "p-3",
  className = "",
}: {
  title: string;
  children: ReactNode;
  headerRight?: ReactNode;
  bodyClassName?: string;
  className?: string;
}) {
  return (
    <section
      className={`flex flex-col rounded-sm border-2 border-mbg-ink bg-mbg-white ${className}`}
    >
      <div className="flex items-center justify-between gap-2 border-b-2 border-mbg-ink bg-mbg-cream px-3 py-1.5">
        <h2 className="font-serif text-sm font-bold">{title}</h2>
        {headerRight}
      </div>
      <div className={bodyClassName}>{children}</div>
    </section>
  );
}

/** Optional full-page wrapper to keep the "official document" feel consistent. */
export function GovDashboardFrame({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-mbg-cream">{children}</div>;
}
