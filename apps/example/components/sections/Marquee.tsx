const MARQUEE_ITEMS = [
  "Sounds like you, not a bot",
  "You approve every post",
  "No auto-post, ever",
  "Built for X, done right",
  "Researched from Reddit, HN, and Google News",
  "A loop you can audit",
  "Your voice, amplified",
];

function Strip() {
  return (
    <span className="inline-flex items-center">
      {MARQUEE_ITEMS.map((x) => (
        <span key={x} className="inline-flex items-center">
          <span className="px-4 font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground sm:px-[22px]">
            {x}
          </span>
          <span className="text-foreground">◆</span>
        </span>
      ))}
    </span>
  );
}

export function Marquee() {
  return (
    <div aria-hidden className="marquee border-y border-border bg-white/[0.015] py-4">
      <div className="marquee-track">
        <Strip />
        <Strip />
      </div>
    </div>
  );
}
