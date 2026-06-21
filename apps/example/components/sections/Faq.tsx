import type { Theme } from "@/lib/theme";
import { SectionMark } from "./SectionMark";

const HAIRLINE =
  "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.16) 22%, rgba(255,255,255,0.16) 78%, rgba(255,255,255,0) 100%)";

export function Faq({ t }: { t: Theme }) {
  const mono: React.CSSProperties = {
    fontFamily: t.monoFont,
    fontSize: 11,
    letterSpacing: "0.16em",
    textTransform: "uppercase",
  };

  const items = [
    {
      q: "Will this get my account flagged?",
      a: "No. Catalyst never posts on its own. Every post goes out only after you click approve, from your normal posting behavior, on your schedule.",
    },
    {
      q: "Will my posts sound like AI?",
      a: "That is the one thing we optimize against. Catalyst drafts from how you already write: your phrasing, your takes, your restraint. If a draft does not sound like you, reject it, and it learns.",
    },
    {
      q: "Do I have to post every day?",
      a: "No. You approve what is good and skip the rest. Some days that is three posts, some days it is none. The queue waits for you.",
    },
    {
      q: "What if I do not have time to review?",
      a: "Drafts sit in your queue until you get to them. Nothing expires into an auto-post. The loop only moves when you say go.",
    },
  ];

  return (
    <section
      id="faq"
      style={{ maxWidth: 1180, margin: "0 auto", padding: "clamp(72px,10vw,128px) clamp(20px,5vw,72px)" }}
    >
      <SectionMark t={t} index="03" label="Common questions" aside="FAQ" fileTag="· catalyst.faq ·" />

      <h2
        className="reveal"
        data-reveal
        style={{
          fontFamily: t.displayFont,
          fontWeight: 700,
          fontSize: "clamp(28px,5vw,52px)",
          lineHeight: 1.04,
          letterSpacing: "-0.025em",
          margin: "0 0 clamp(20px,3vw,40px)",
          color: t.fg,
          textWrap: "balance",
          maxWidth: 760,
        }}
      >
        What people ask before they join.
      </h2>

      <div>
        {items.map((item, i) => (
          <div
            key={item.q}
            className="reveal"
            data-reveal
            style={{ animationDelay: `${i * 70}ms` }}
          >
            <div style={{ height: 1, background: HAIRLINE }} />
            <div style={{ padding: "clamp(24px,4vw,40px) 0", display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ ...mono, color: t.faint }}>{String(i + 1).padStart(2, "0")}</div>
              <div
                style={{
                  fontFamily: t.displayFont,
                  fontWeight: 600,
                  fontSize: "clamp(19px,2.4vw,24px)",
                  lineHeight: 1.2,
                  letterSpacing: "-0.015em",
                  color: t.fg,
                }}
              >
                {item.q}
              </div>
              <div
                style={{
                  fontFamily: t.uiFont,
                  fontSize: 14,
                  lineHeight: 1.6,
                  color: t.muted,
                  maxWidth: "64ch",
                }}
              >
                {item.a}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
