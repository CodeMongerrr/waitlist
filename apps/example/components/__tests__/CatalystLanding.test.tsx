import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, within, act } from "@testing-library/react";

// sonner pulls in browser-only plumbing that jsdom doesn't fully model; the
// landing only needs the Toaster to mount without throwing, so stub it to a
// no-op element. We assert against the page copy, not the toast machinery.
vi.mock("sonner", () => ({
  Toaster: () => null,
  toast: Object.assign(vi.fn(), {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
    loading: vi.fn(),
    dismiss: vi.fn(),
  }),
}));

import { CatalystLanding } from "@/components/CatalystLanding";

// The page fires fetches on mount (LiveCount -> /api/waitlist/count). Resolve
// any GET with a low count so the live-proof stays in its "Private beta" label
// state (below the 50 reveal threshold) and never fabricates a number.
const stubFetch = (count = 3) =>
  vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ count }),
  });

// LiveCount fetches its count on mount and setStates when it resolves. Flush
// those microtasks inside act() so the post-render state update is accounted
// for and React doesn't warn about an unwrapped update.
const flushMicrotasks = () => act(async () => { await Promise.resolve(); });

describe("CatalystLanding", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", stubFetch());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("renders the hero headline as the only level-1 heading", async () => {
    render(<CatalystLanding />);
    const h1 = screen.getByRole("heading", { level: 1 });
    // The headline is split across spans; its accessible name concatenates them.
    expect(h1).toHaveTextContent(/Sound like\s*yourself\s*on X/i);
    expect(h1).toHaveTextContent(/even on the days you can't write/i);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    await flushMicrotasks();
  });

  it("renders one heading from each major section", async () => {
    render(<CatalystLanding />);

    // How it works
    expect(
      screen.getByRole("heading", { name: /a loop you can audit, end to end/i }),
    ).toBeInTheDocument();

    // Control (TrustStrip)
    expect(
      screen.getByRole("heading", {
        name: /built for people who guard their account/i,
      }),
    ).toBeInTheDocument();

    // FAQ
    expect(
      screen.getByRole("heading", { name: /what people ask before they join/i }),
    ).toBeInTheDocument();

    // CTA
    expect(
      screen.getByRole("heading", {
        name: /stay consistent on X without it becoming a second job/i,
      }),
    ).toBeInTheDocument();
    await flushMicrotasks();
  });

  it("anchors each section by its scroll id so nav links resolve", async () => {
    const { container } = render(<CatalystLanding />);
    for (const id of ["top", "how", "control", "faq", "join"]) {
      expect(container.querySelector(`#${id}`)).toBeTruthy();
    }
    await flushMicrotasks();
  });

  it("renders the footer with the Catalyst brand and waitlist status", async () => {
    render(<CatalystLanding />);
    const footer = screen.getByRole("contentinfo");
    expect(footer).toBeInTheDocument();
    expect(within(footer).getByText(/private waitlist open/i)).toBeInTheDocument();
    // © line carries the brand + positioning.
    expect(within(footer).getByText(/© 2026 Catalyst/i)).toBeInTheDocument();
    await flushMicrotasks();
  });

  it("exposes the email-only signup with its honeypot in the hero and CTA", async () => {
    render(<CatalystLanding />);

    // Email-only: a placeholder email input, no @handle field. The form lives
    // in both the hero (FloatingSignup) and the final CTA, so expect two.
    const emails = screen.getAllByPlaceholderText("you@email.com");
    expect(emails.length).toBe(2);

    // Honeypot trap must be present (renamed from company -> website_url).
    const honeypots = document.querySelectorAll('input[name="website_url"]');
    expect(honeypots.length).toBe(2);

    // No X/@handle field anywhere on the page.
    expect(document.querySelector('input[name="x_handle"]')).toBeNull();
    await flushMicrotasks();
  });

  it('repeats the "Join the waitlist" call to action across header, form, and footer', async () => {
    render(<CatalystLanding />);
    // Header CTA link + footer link + two submit buttons (hero + CTA forms).
    const all = screen.getAllByText(/join the waitlist/i);
    expect(all.length).toBeGreaterThanOrEqual(3);

    // At least one is an actual submit button (the form CTA).
    const submitButtons = screen.getAllByRole("button", {
      name: /join the waitlist/i,
    });
    expect(submitButtons.length).toBeGreaterThanOrEqual(1);
    await flushMicrotasks();
  });

  it("shows the 'Private beta' live-proof label without a fabricated number below the reveal threshold", async () => {
    render(<CatalystLanding />);
    // count=3 (< 50) means the hero shows the label only, never a count like
    // "3 in line". The CTA (no label) falls back to the scarcity phrase, which
    // is fine; what must never appear is a fabricated number.
    expect(screen.getAllByText(/private beta/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByText(/\d[\d,]*\s+in line/i)).toBeNull();
    expect(screen.queryByText(/already in line/i)).toBeNull();
    await flushMicrotasks();
  });

  it("mounts the full tree without throwing", async () => {
    expect(() => render(<CatalystLanding />)).not.toThrow();
    // Header brand mark also reads "Catalyst" (appears in header + footer).
    expect(screen.getAllByText("Catalyst").length).toBeGreaterThanOrEqual(2);
    await flushMicrotasks();
  });
});
