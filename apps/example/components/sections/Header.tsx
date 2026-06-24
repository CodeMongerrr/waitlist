import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="sticky top-0 z-[100] bg-background/60 backdrop-blur-md">
      <div className="reveal mx-auto flex h-[68px] max-w-[1180px] items-center justify-between gap-4 px-5 sm:px-8 lg:px-[72px]">
        <a
          href="#top"
          className="flex items-center gap-[11px] rounded-md no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-foreground text-[17px] font-extrabold leading-none text-background">
            c
          </span>
          <span className="text-lg font-semibold tracking-[-0.01em] text-foreground">
            Catalyst
          </span>
        </a>

        <div className="flex items-center gap-3">
          <span className="hide-sm font-mono text-[11px] uppercase tracking-[0.2em] text-faint">
            Private beta
          </span>
          <Button
            asChild
            size="sm"
            className="h-10 min-h-[44px] rounded-full px-4 font-medium sm:h-9 sm:min-h-0"
          >
            <Link href="#join">Join the waitlist</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
