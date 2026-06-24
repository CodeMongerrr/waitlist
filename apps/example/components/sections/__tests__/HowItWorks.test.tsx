import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HowItWorks } from "@/components/sections/HowItWorks";

// The component's scroll/resize effect calls requestAnimationFrame. jsdom
// provides one, but we keep it deterministic so measure() runs synchronously
// without scheduling work that outlives the test. activeIndex itself does not
// affect the assertions below (it only changes visual emphasis).
beforeEach(() => {
  vi.stubGlobal(
    "requestAnimationFrame",
    vi.fn((cb: FrameRequestCallback) => {
      cb(0);
      return 1;
    }),
  );
  vi.stubGlobal("cancelAnimationFrame", vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("HowItWorks", () => {
  it("renders all four stages with their tags and titles", () => {
    render(<HowItWorks />);

    expect(
      screen.getByText(/a loop you can audit, end to end/i),
    ).toBeInTheDocument();

    // The four "NN / Tag" eyebrow labels (whitespace-collapsed in the DOM).
    expect(screen.getByText(/01\s*\/\s*Harvest/i)).toBeInTheDocument();
    expect(screen.getByText(/02\s*\/\s*Draft/i)).toBeInTheDocument();
    expect(screen.getByText(/03\s*\/\s*Approve/i)).toBeInTheDocument();
    expect(screen.getByText(/04\s*\/\s*Learn/i)).toBeInTheDocument();

    expect(screen.getByText(/reads what you'd read/i)).toBeInTheDocument();
    expect(screen.getByText(/in your voice/i)).toBeInTheDocument();
    expect(screen.getByText(/you approve, or you don't/i)).toBeInTheDocument();
    expect(
      screen.getByText(/posts on your call, then sharpens/i),
    ).toBeInTheDocument();
  });

  it("only renders the MiniDraft demo on stage 03", () => {
    render(<HowItWorks />);
    expect(screen.getByRole("button", { name: /^approve$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^reject$/i })).toBeInTheDocument();
    expect(screen.getByText(/your call, every time/i)).toBeInTheDocument();
  });

  it("shows the persistent counter status with the initial prompt and no count", () => {
    render(<HowItWorks />);
    const statuses = screen.getAllByRole("status");
    expect(
      statuses.some((el) => /try it · approve or reject/i.test(el.textContent ?? "")),
    ).toBe(true);
    expect(screen.queryByText(/approved here/i)).not.toBeInTheDocument();
  });

  it("shows the first draft and the 1/4 position indicator", () => {
    render(<HowItWorks />);
    expect(
      screen.getByText(/the underrated skill in shipping fast/i),
    ).toBeInTheDocument();
    expect(screen.getByText("1/4")).toBeInTheDocument();
  });

  it("Approve increments the counter and advances to the next draft after ~820ms", async () => {
    const user = userEvent.setup();
    render(<HowItWorks />);

    await user.click(screen.getByRole("button", { name: /^approve$/i }));

    // Flash overlay appears immediately as a second role=status element.
    expect(screen.getByText(/approved · queued/i)).toBeInTheDocument();
    // Counter increments immediately (bumped before the advance timer fires).
    expect(screen.getByText(/1 approved here/i)).toBeInTheDocument();
    // Draft has not rotated yet.
    expect(screen.getByText("1/4")).toBeInTheDocument();

    // After the ~820ms timer, the draft rotates and the flash clears.
    await waitFor(
      () => {
        expect(screen.getByText("2/4")).toBeInTheDocument();
      },
      { timeout: 2000 },
    );
    expect(
      screen.getByText(/spent the morning deleting code/i),
    ).toBeInTheDocument();
    expect(screen.queryByText(/approved · queued/i)).not.toBeInTheDocument();
    // Approval count persists across the advance.
    expect(screen.getByText(/1 approved here/i)).toBeInTheDocument();
  });

  it("Reject advances the draft without incrementing the counter", async () => {
    const user = userEvent.setup();
    render(<HowItWorks />);

    await user.click(screen.getByRole("button", { name: /^reject$/i }));

    // Rejection flash, not approval.
    expect(screen.getByText(/^rejected$/i)).toBeInTheDocument();
    // Counter did NOT increment.
    expect(screen.queryByText(/approved here/i)).not.toBeInTheDocument();
    expect(screen.getByText(/try it · approve or reject/i)).toBeInTheDocument();

    await waitFor(
      () => {
        expect(screen.getByText("2/4")).toBeInTheDocument();
      },
      { timeout: 2000 },
    );
    expect(screen.queryByText(/^rejected$/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/approved here/i)).not.toBeInTheDocument();
  });

  it("ignores rapid second clicks while busy (no double count, no double advance)", async () => {
    const user = userEvent.setup();
    render(<HowItWorks />);

    const approve = screen.getByRole("button", { name: /^approve$/i });
    await user.click(approve);
    // Second click during the busy window must be a no-op.
    await user.click(approve);

    expect(screen.getByText(/1 approved here/i)).toBeInTheDocument();
    expect(screen.queryByText(/2 approved here/i)).not.toBeInTheDocument();

    await waitFor(
      () => {
        expect(screen.getByText("2/4")).toBeInTheDocument();
      },
      { timeout: 2000 },
    );
    // Advanced exactly one draft, count still one.
    expect(screen.getByText(/1 approved here/i)).toBeInTheDocument();
    expect(screen.queryByText("3/4")).not.toBeInTheDocument();
  });

  it("counts across multiple full approve cycles and wraps the draft index", async () => {
    const user = userEvent.setup();
    render(<HowItWorks />);

    // Approve 1 -> wait for 2/4
    await user.click(screen.getByRole("button", { name: /^approve$/i }));
    await waitFor(() => expect(screen.getByText("2/4")).toBeInTheDocument(), {
      timeout: 2000,
    });
    // Approve 2 -> wait for 3/4
    await user.click(screen.getByRole("button", { name: /^approve$/i }));
    await waitFor(() => expect(screen.getByText("3/4")).toBeInTheDocument(), {
      timeout: 2000,
    });
    // Approve 3 -> wait for 4/4
    await user.click(screen.getByRole("button", { name: /^approve$/i }));
    await waitFor(() => expect(screen.getByText("4/4")).toBeInTheDocument(), {
      timeout: 2000,
    });
    // Approve 4 -> wraps back to 1/4
    await user.click(screen.getByRole("button", { name: /^approve$/i }));
    await waitFor(() => expect(screen.getByText("1/4")).toBeInTheDocument(), {
      timeout: 2000,
    });

    expect(screen.getByText(/4 approved here/i)).toBeInTheDocument();
    expect(
      screen.getByText(/the underrated skill in shipping fast/i),
    ).toBeInTheDocument();
  });

  it("always exposes a role=status region for the demo counter", () => {
    render(<HowItWorks />);
    const statuses = screen.getAllByRole("status");
    expect(statuses.length).toBeGreaterThanOrEqual(1);
    const counter = statuses.find((el) =>
      /try it · approve or reject/i.test(el.textContent ?? ""),
    );
    expect(counter).toBeTruthy();
    expect(
      within(counter as HTMLElement).getByText(/approve or reject/i),
    ).toBeInTheDocument();
  });
});
