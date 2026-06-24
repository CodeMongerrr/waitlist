import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { FloatingSignup } from "@/components/FloatingSignup";
import type { Signup } from "@/lib/helpers";

// ReferralCard pulls in sonner; stub it so toasts are no-ops under jsdom.
vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const makeSignup = (overrides: Partial<Signup> = {}): Signup => ({
  name: "Alice",
  email: "alice@example.com",
  code: "CODE123456",
  position: 1234,
  referralCount: 0,
  jumpsPerReferral: 5,
  ...overrides,
});

describe("FloatingSignup", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("renders the 'Get early access' header and the signup form when signup is null", () => {
    render(<FloatingSignup signup={null} setSignup={() => {}} />);

    expect(screen.getByText("Get early access")).toBeInTheDocument();
    expect(
      screen.getByText(/join the catalyst private beta/i),
    ).toBeInTheDocument();

    // SignupForm is mounted: email field + submit + honeypot.
    expect(screen.getByPlaceholderText("you@email.com")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /join the waitlist/i }),
    ).toBeInTheDocument();
    expect(
      document.querySelector('input[name="website_url"]'),
    ).toBeTruthy();
  });

  it("does not render the ReferralCard while signup is null", () => {
    render(<FloatingSignup signup={null} setSignup={() => {}} />);

    expect(screen.queryByText(/you're on the list/i)).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /share on x/i }),
    ).not.toBeInTheDocument();
  });

  it("renders the ReferralCard with the #position once a signup is provided", () => {
    render(
      <FloatingSignup signup={makeSignup({ position: 1234 })} setSignup={() => {}} />,
    );

    // Position is shown, locale-formatted, prefixed with #.
    expect(screen.getByText("#1,234")).toBeInTheDocument();
    expect(screen.getByText(/you're on the list/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /share on x/i }),
    ).toBeInTheDocument();
    // The confirmation email address surfaces in the card.
    expect(screen.getByText("alice@example.com")).toBeInTheDocument();
  });

  it("hides the signup form and 'Get early access' header in the success state", () => {
    render(<FloatingSignup signup={makeSignup()} setSignup={() => {}} />);

    expect(screen.queryByText("Get early access")).not.toBeInTheDocument();
    expect(
      screen.queryByPlaceholderText("you@email.com"),
    ).not.toBeInTheDocument();
  });

  it("reflects the referral bump of 5 spots per referral in the card", () => {
    render(
      <FloatingSignup
        signup={makeSignup({ referralCount: 2, jumpsPerReferral: 5 })}
        setSignup={() => {}}
      />,
    );

    // 2 referrals * 5 = +10 spots; 1 more invite still jumps 5.
    expect(screen.getByText("+10 spots")).toBeInTheDocument();
    expect(screen.getByText(/jump 5 spots/i)).toBeInTheDocument();
  });
});
