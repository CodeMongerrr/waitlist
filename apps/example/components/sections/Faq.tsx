import { Section, SectionHeading } from "./Section";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const items = [
  {
    q: "Will this get my account flagged?",
    a: "No. Catalyst never posts on its own. Posts go out only after you click approve, on your schedule.",
  },
  {
    q: "Will my posts sound like AI?",
    a: "The one thing we optimize against. Catalyst drafts from how you already write. If it doesn't sound like you, reject it, and it learns.",
  },
  {
    q: "Do I have to post every day?",
    a: "No. Approve what's good, skip the rest. Some days that's three posts, some days none. The queue waits.",
  },
  {
    q: "What if I do not have time to review?",
    a: "Drafts sit in your queue until you get to them. Nothing expires into an auto-post. The loop only moves when you say go.",
  },
];

export function Faq() {
  return (
    <Section id="faq">
      <SectionHeading>What people ask before they join.</SectionHeading>

      <Accordion type="single" collapsible className="reveal w-full">
        {items.map((item, i) => (
          <AccordionItem key={item.q} value={`item-${i}`} className="border-border">
            <AccordionTrigger className="gap-4 py-[clamp(20px,3vw,28px)] text-left text-[clamp(17px,2vw,22px)] font-semibold leading-tight tracking-[-0.015em] text-foreground hover:no-underline">
              <span className="flex items-baseline gap-3.5">
                <span className="font-mono text-[11px] font-normal tracking-[0.16em] text-faint">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {item.q}
              </span>
            </AccordionTrigger>
            <AccordionContent className="max-w-[64ch] pl-[34px] text-sm leading-relaxed text-muted-foreground">
              {item.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </Section>
  );
}
