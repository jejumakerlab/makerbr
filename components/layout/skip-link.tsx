export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="bg-primary text-primary-foreground focus:ring-ring sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-100 focus:rounded-lg focus:px-4 focus:py-3 focus:text-sm focus:font-semibold focus:ring-2 focus:outline-none"
    >
      본문으로 건너뛰기
    </a>
  );
}
