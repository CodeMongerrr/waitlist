export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-surface-footer">
      <div className="hairline" />
      {/* Ghosted brutalist watermark bleeding off the bottom. */}
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-[-4%] left-1/2 -translate-x-1/2 select-none whitespace-nowrap text-[clamp(64px,24vw,260px)] font-extrabold leading-none tracking-[-0.04em] text-[rgba(244,244,245,0.045)]"
      >
        Catalyst
      </div>

      <div className="relative z-[1] mx-auto flex max-w-[1180px] flex-wrap justify-between gap-8 px-5 pt-[clamp(48px,8vw,96px)] sm:gap-12 sm:px-8 lg:px-[72px]">
        <div className="max-w-[440px] flex-[1_1_300px]">
          <div className="mb-3.5 flex items-center gap-2.5">
            <span className="flex size-[22px] items-center justify-center rounded-md bg-foreground text-sm font-extrabold leading-none text-background">
              c
            </span>
            <span className="text-xl font-semibold tracking-[-0.01em] text-foreground">
              Catalyst
            </span>
          </div>
          <div className="mb-3 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
            Consistency on X, in your voice, on your call
          </div>
          <div className="max-w-[360px] text-[13.5px] leading-relaxed text-muted-foreground">
            Catalyst drafts and schedules your X posts in your voice, on your
            approval.
          </div>
        </div>

        <div className="flex flex-wrap gap-12">
          <div>
            <div className="mb-3.5 font-mono text-[11px] uppercase tracking-[0.16em] text-faint">
              Product
            </div>
            <a href="#how" className="mb-2.5 block text-[13.5px] text-muted-foreground no-underline hover:text-foreground">
              How it works
            </a>
            <a href="#control" className="mb-2.5 block text-[13.5px] text-muted-foreground no-underline hover:text-foreground">
              Control
            </a>
            <a href="#join" className="mb-2.5 block text-[13.5px] text-muted-foreground no-underline hover:text-foreground">
              Join the waitlist
            </a>
          </div>
          <div>
            <div className="mb-3.5 font-mono text-[11px] uppercase tracking-[0.16em] text-faint">
              Catalyst
            </div>
            <span className="mb-2.5 block text-[13.5px] text-faint">Built for X</span>
            <span className="mb-2.5 block text-[13.5px] text-faint">Human-approved</span>
            <span className="mb-2.5 block text-[13.5px] text-faint">Private beta</span>
          </div>
        </div>
      </div>

      <div className="relative z-[1] mx-auto mt-12 flex max-w-[1180px] flex-wrap items-center justify-center gap-x-3 gap-y-2 border-t border-border px-5 py-[22px] text-center font-mono text-[10.5px] uppercase tracking-[0.16em] text-faint sm:justify-between sm:text-left lg:px-[72px] sm:px-8">
        <span>© 2026 Catalyst · Built for X · Human-approved</span>
        <span className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-[5px] text-muted-foreground">
          <span className="status-dot animate-[dotPulse_2s_infinite] text-live" />
          Private waitlist open
        </span>
        <span>Built for people who&apos;d rather build than post</span>
      </div>
    </footer>
  );
}
