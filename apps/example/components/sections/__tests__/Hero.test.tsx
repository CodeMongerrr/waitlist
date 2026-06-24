import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { Hero } from "@/components/sections/Hero";
import type { Signup } from "@/lib/helpers";

// ReferralCard (reached through FloatingSignup once a signup exists) imports
// sonner's toast at module load. Stub it so the import chain resolves without a
// real toast runtime.
vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

// LiveCount fires fetch("/api/waitlist/count") on mount. Hand it a resolved
// response by default so the count-up effect never throws.
const stubCountFetch = (count?: number) => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => (typeof count === "number" ? { count } : {}),
    }),
  );
};

// LiveCount's count-up effect calls window.matchMedia, which jsdom does not
// implement. Returning reduce=true makes the displayed count jump straight to
// the final value (no requestAnimationFrame interpolation), keeping the
// at-threshold assertion deterministic.
const stubReducedMotion = (reduce = true) => {
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockReturnValue({
      matches: reduce,
      media: "(prefers-reduced-motion: reduce)",
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
      onchange: null,
    }),
  );
};

const renderHero = (overrides?: Partial<{ signup: Signup | null }>) => {
  const setSignup = vi.fn();
  render(
    <Hero
      signup={overrides?.signup ?? null}
      setSignup={setSignup}
    />,
  );
  return { setSignup };
};

describe("Hero", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("renders the headline claim with the emphasized differentiator", () => {
    stubCountFetch();
    renderHero();

    const heading = screen.getByRole("heading", { level: 1 });
    // The visible claim is split across spans; the accessible name concatenates.
    expect(heading).toHaveTextContent("Sound like");
    expect(heading).toHaveTextContent("yourself");
    expect(heading).toHaveTextContent("on X");
    // The quieter qualifier line about the days you can't write.
    expect(heading).toHaveTextContent(/even on the days you can.?t write/i);
  });

  it("keeps 'yourself' as a distinct emphasized span inside the h1", () => {
    stubCountFetch();
    renderHero();

    const heading = screen.getByRole("heading", { level: 1 });
    const emphasized = screen.getByText("yourself");
    // It is rendered as its own element, nested within the heading, not just
    // inline text on the headline node itself.
    expect(emphasized.tagName).toBe("SPAN");
    expect(heading).toContainElement(emphasized);
    expect(emphasized).not.toBe(heading);
  });

  it("renders the subhead describing the in-your-voice drafting", () => {
    stubCountFetch();
    renderHero();

    expect(
      screen.getByText(/Catalyst drafts posts/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/in your voice/i)).toBeInTheDocument();
    expect(
      screen.getByText(/approve the good ones in ten/i),
    ).toBeInTheDocument();
  });

  it("renders the FloatingSignup email input and join button when no signup yet", () => {
    stubCountFetch();
    renderHero();

    expect(
      screen.getByPlaceholderText("you@email.com"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /join the waitlist/i }),
    ).toBeInTheDocument();
    // Honeypot trap must be present in the embedded form.
    expect(
      document.querySelector('input[name="website_url"]'),
    ).toBeTruthy();
  });

  it("shows the 'Private beta' status label from the live count row", () => {
    stubCountFetch();
    renderHero();

    expect(screen.getByText("Private beta")).toBeInTheDocument();
  });

  it("does not show a fabricated number while the count is below the reveal threshold", async () => {
    stubReducedMotion();
    stubCountFetch(12); // below REVEAL_THRESHOLD (50)
    renderHero();

    expect(await screen.findByText("Private beta")).toBeInTheDocument();
    // No "N already in line" total is announced; the qualitative scarcity line
    // stands in instead of a weak small number.
    await waitFor(() =>
      expect(
        screen.getByText(/Private beta\. Be one of the first in line/i),
      ).toBeInTheDocument(),
    );
    expect(screen.queryByText(/already in line/i)).not.toBeInTheDocument();
    // And there is no digit anywhere in the count row's visible/announced text.
    expect(screen.queryByText(/\b12\b/)).not.toBeInTheDocument();
  });

  it("surfaces the real count once it reaches the reveal threshold", async () => {
    stubReducedMotion();
    stubCountFetch(204); // at/above REVEAL_THRESHOLD (50)
    renderHero();

    // Visible proof segment carries the formatted total followed by "in line".
    await waitFor(() =>
      expect(screen.getByText(/204 in line/i)).toBeInTheDocument(),
    );
    // Screen-reader status announces the label plus the final total once.
    expect(
      screen.getByText(/Private beta\. 204 already in line/i),
    ).toBeInTheDocument();
  });

  it("replaces the form with the referral view when a signup is present", () => {
    stubCountFetch();
    const signup: Signup = {
      name: "Alice",
      email: "alice@example.com",
      code: "ABCDEFGHJK",
      position: 42,
      referralCount: 0,
    };
    renderHero({ signup });

    // No email input once signed up; the ReferralCard owns the floating box.
    expect(
      screen.queryByPlaceholderText("you@email.com"),
    ).not.toBeInTheDocument();
  });
});
