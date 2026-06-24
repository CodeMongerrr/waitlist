import { cn } from "@/lib/utils";
import { Section, SectionHeading } from "./Section";

export function TrustStrip() {
  const clauses = [
    {
      no: "01",
      marker: "In control",
      dot: "var(--rail-1)",
      statement: (
        <>
          You approve <span className="italic font-normal text-foreground">every post</span>
        </>
      ),
      sub: "No auto-post, no silent timer. Drafts wait until you say go.",
      bright: true,
    },
    {
      no: "02",
      marker: "In your voice",
      dot: "var(--rail-1)",
      statement: (
        <>
          Amplifies you, <span className="italic font-normal text-foreground">never replaces you</span>
        </>
      ),
      sub: "Sound like you on a day you can't write, not an AI chasing numbers.",
    },
    {
      no: "03",
      marker: "Scoped on purpose",
      dot: "var(--rail-2)",
      statement: (
        <>
          <span className="italic font-normal text-foreground">One platform</span>, done right
        </>
      ),
      sub: "No cross-posting, no follower promises. Just posts you'd put your name on.",
    },
  ];

  return (
    <Section id="control">
      <SectionHeading>Built for people who guard their account.</SectionHeading>

      <div>
        {clauses.map((c, i) => (
          <div
            key={c.no}
            className="reveal relative"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            {c.bright && (
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(60%_100%_at_14%_0%,rgba(255,255,255,0.07),transparent_60%)]"
              />
            )}
            <div
              className={cn("h-px", !c.bright && "hairline")}
              style={c.bright ? { background: "rgba(255,255,255,0.4)" } : undefined}
            />
            <div className="clause relative z-[1] py-[clamp(34px,6vw,56px)]">
              <div className="flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                <span className="status-dot" style={{ color: c.dot }} />
                {c.no} · {c.marker}
              </div>
              <div>
                <div className="text-[clamp(23px,3.4vw,38px)] font-semibold leading-[1.12] tracking-[-0.02em] text-balance text-foreground">
                  {c.statement}
                </div>
                <div className="mt-3 max-w-[56ch] text-sm leading-relaxed text-muted-foreground">
                  {c.sub}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Signature line: a single honest tag, centered below the clauses. */}
      <div className="mt-2 flex flex-wrap items-center justify-center gap-3 border-t border-border-strong pt-[18px]">
        <span className="inline-flex items-center gap-[7px] rounded-full border border-border bg-white/[0.02] px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
          <span className="status-dot text-rail-2" />
          Built for X
        </span>
      </div>

      <div className="mx-auto mt-[26px] max-w-[600px] text-center text-[clamp(14px,1.4vw,16px)] leading-relaxed text-muted-foreground">
        For solo founders, DevRels, and creators whose X is pipeline, not a hobby.
      </div>
      <div className="mt-2.5 text-center font-mono text-[10.5px] uppercase tracking-[0.16em] text-faint">
        Nothing posts without your click · Not affiliated with X
      </div>
    </Section>
  );
}
