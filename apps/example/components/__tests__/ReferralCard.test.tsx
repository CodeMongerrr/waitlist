import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReferralCard } from "@/components/ReferralCard";
import type { Signup } from "@/lib/helpers";

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

import { toast } from "sonner";

const baseSignup: Signup = {
  name: "Alice",
  email: "alice@example.com",
  code: "ABCDEFGHJK",
  position: 1234,
  referralCount: 0,
  jumpsPerReferral: 5,
};

const make = (over: Partial<Signup> = {}): Signup => ({ ...baseSignup, ...over });

// NOTE: userEvent.setup() installs its own clipboard stub on navigator, so the
// real writeText spy must be (re)defined AFTER setup() or it gets clobbered.
const setClipboard = (writeText = vi.fn().mockResolvedValue(undefined)) => {
  Object.defineProperty(navigator, "clipboard", {
    value: { writeText },
    configurable: true,
  });
  return writeText;
};

// Radix Progress reports value via the indicator transform (translateX(-(100-pct)%)),
// not aria-valuenow, so read the percentage back out of the inline style.
const progressPct = () => {
  const indicator = document.querySelector(
    '[data-slot="progress-indicator"]',
  ) as HTMLElement | null;
  const m = indicator?.style.transform.match(/translateX\(-(\d+)%\)/);
  return m ? 100 - Number(m[1]) : null;
};

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  vi.clearAllMocks();
});

describe("ReferralCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the position with thousands separator and the confirmation email", () => {
    render(<ReferralCard signup={make({ position: 1234 })} />);
    expect(screen.getByText("#1,234")).toBeInTheDocument();
    expect(screen.getByText("alice@example.com")).toBeInTheDocument();
    expect(screen.getByText(/you're on the list/i)).toBeInTheDocument();
  });

  it("shows the not-yet-reached progress copy for 0 referrals", () => {
    render(<ReferralCard signup={make({ referralCount: 0, jumpsPerReferral: 5 })} />);
    // header: "0 of 3 invited"
    expect(screen.getByText("0 of 3 invited")).toBeInTheDocument();
    // spots earned so far: 0 * 5 = 0
    expect(screen.getByText("+0 spots")).toBeInTheDocument();
    // "Invite 3 more to jump 15 spots." -> remaining 3, 3 * 5 = 15
    expect(screen.getByText("3 more")).toBeInTheDocument();
    expect(screen.getByText(/jump 15 spots/i)).toBeInTheDocument();
    // progress is 0%
    expect(screen.getByLabelText("Referral progress")).toBeInTheDocument();
    expect(progressPct()).toBe(0);
  });

  it("recomputes remaining/jumps copy for a partial referral count", () => {
    render(<ReferralCard signup={make({ referralCount: 1, jumpsPerReferral: 5 })} />);
    expect(screen.getByText("1 of 3 invited")).toBeInTheDocument();
    expect(screen.getByText("+5 spots")).toBeInTheDocument(); // 1 * 5
    expect(screen.getByText("2 more")).toBeInTheDocument(); // 3 - 1
    expect(screen.getByText(/jump 10 spots/i)).toBeInTheDocument(); // 2 * 5
    // pct = round(1/3 * 100) = 33
    expect(progressPct()).toBe(33);
  });

  it("switches to the reached state at the milestone (referralCount >= 3)", () => {
    render(<ReferralCard signup={make({ referralCount: 3, jumpsPerReferral: 5 })} />);
    expect(screen.getByText(/climbing fast/i)).toBeInTheDocument();
    expect(screen.getByText("+15 spots")).toBeInTheDocument(); // 3 * 5
    expect(screen.getByText(/3 friends joined/i)).toBeInTheDocument();
    expect(screen.getByText(/moves you up 5 spots/i)).toBeInTheDocument();
    // no "invite N more" copy in the reached state
    expect(screen.queryByText(/invite/i)).not.toBeInTheDocument();
    // pct caps at 100
    expect(progressPct()).toBe(100);
  });

  it("caps the progress bar at 100% when referrals exceed the milestone", () => {
    render(<ReferralCard signup={make({ referralCount: 10, jumpsPerReferral: 5 })} />);
    expect(progressPct()).toBe(100);
    expect(screen.getByText("+50 spots")).toBeInTheDocument(); // 10 * 5
  });

  it("defaults jumpsPerReferral to 5 and referralCount to 0 when omitted", () => {
    render(
      <ReferralCard
        signup={{ name: "Bo", email: "bo@x.io", code: "ZZZZZZZZZZ", position: 9 }}
      />,
    );
    expect(screen.getByText("0 of 3 invited")).toBeInTheDocument();
    expect(screen.getByText("3 more")).toBeInTheDocument();
    expect(screen.getByText(/jump 15 spots/i)).toBeInTheDocument(); // default jumps = 5
  });

  it("renders the invite link without the protocol and copies the full /?ref=CODE url", async () => {
    const user = userEvent.setup();
    const writeText = setClipboard(); // after setup(): userEvent installs its own clipboard
    render(<ReferralCard signup={make({ code: "MYCODE1234" })} />);

    // jsdom origin is http://localhost:3000; display strips the protocol
    expect(screen.getByText("localhost:3000/?ref=MYCODE1234")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /copy invite link/i }));

    await waitFor(() =>
      expect(writeText).toHaveBeenCalledWith(
        "http://localhost:3000/?ref=MYCODE1234",
      ),
    );
    expect(toast.success).toHaveBeenCalledWith("Invite link copied");
  });

  it("flips the copy button to 'Copied' after a successful copy", async () => {
    const user = userEvent.setup();
    setClipboard(); // after setup(): userEvent installs its own clipboard
    render(<ReferralCard signup={make()} />);

    expect(
      screen.getByRole("button", { name: /copy invite link/i }),
    ).toHaveTextContent("Copy");
    await user.click(screen.getByRole("button", { name: /copy invite link/i }));
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: /copy invite link/i }),
      ).toHaveTextContent("Copied"),
    );
  });

  it("surfaces an error toast and does not crash when clipboard is unavailable", async () => {
    const user = userEvent.setup();
    // after setup(): force-remove the clipboard userEvent installed
    Object.defineProperty(navigator, "clipboard", {
      value: undefined,
      configurable: true,
    });
    render(<ReferralCard signup={make()} />);

    await user.click(screen.getByRole("button", { name: /copy invite link/i }));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        "Couldn't copy. Select the link and copy it manually.",
      ),
    );
    expect(toast.success).not.toHaveBeenCalled();
  });

  it("opens an x.com/intent/tweet anchor when Share on X is clicked", async () => {
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, "click");
    let capturedHref = "";
    let capturedTarget = "";
    let capturedRel = "";
    clickSpy.mockImplementation(function (this: HTMLAnchorElement) {
      capturedHref = this.href;
      capturedTarget = this.target;
      capturedRel = this.rel;
    });

    const user = userEvent.setup();
    render(<ReferralCard signup={make({ code: "SHARECODE9" })} />);

    await user.click(
      screen.getByRole("button", { name: /share on x → skip the line/i }),
    );

    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(capturedHref).toContain("https://x.com/intent/tweet");
    expect(capturedHref).not.toContain("intent/post");
    expect(capturedTarget).toBe("_blank");
    expect(capturedRel).toBe("noopener noreferrer");
    // the share url carries the encoded invite link with the code
    expect(capturedHref).toContain(
      encodeURIComponent("http://localhost:3000/?ref=SHARECODE9"),
    );
  });

  it("cleans up the temporary anchor it creates for sharing", async () => {
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    const user = userEvent.setup();
    render(<ReferralCard signup={make()} />);

    await user.click(
      screen.getByRole("button", { name: /share on x → skip the line/i }),
    );
    // no leftover anchor pointing at the intent url
    expect(
      document.querySelector('a[href*="x.com/intent/tweet"]'),
    ).toBeNull();
  });

  it("renders the back button and calls onDone when provided", async () => {
    const onDone = vi.fn();
    const user = userEvent.setup();
    render(<ReferralCard signup={make()} onDone={onDone} />);

    const back = screen.getByRole("button", { name: /back/i });
    await user.click(back);
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it("omits the back button when onDone is not passed", () => {
    render(<ReferralCard signup={make()} />);
    expect(screen.queryByRole("button", { name: /back/i })).not.toBeInTheDocument();
  });
});
