import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { LiveCount } from "@/components/LiveCount";

const countResponse = (count: number) => ({
  ok: true,
  json: async () => ({ count }),
});

// Reduced motion lets the count-up effect set the display value synchronously
// (no rAF), so we can assert the final number deterministically without a fake
// animation clock. The component reads matchMedia on first reveal.
function stubReducedMotion(reduce: boolean) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockImplementation((query: string) => ({
      matches: reduce,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  );
}

describe("LiveCount", () => {
  beforeEach(() => {
    stubReducedMotion(true);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("fetches the count from /api/waitlist/count on mount", async () => {
    const fetchMock = vi.fn().mockResolvedValue(countResponse(12));
    vi.stubGlobal("fetch", fetchMock);

    render(<LiveCount label="Private beta" />);

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    expect(fetchMock).toHaveBeenCalledWith("/api/waitlist/count");
  });

  it("below the threshold with a label shows the label and NO number", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(countResponse(12)));

    const { container } = render(<LiveCount label="Private beta" />);

    expect(await screen.findByText("Private beta")).toBeInTheDocument();
    // No fabricated number: nothing visible (i.e. not the sr-only region) shows
    // a count. The hero's visible row is just the dot + label below threshold.
    const visible = Array.from(container.querySelectorAll("span")).filter(
      (el) => !el.classList.contains("sr-only"),
    );
    const visibleText = visible.map((el) => el.textContent).join(" ");
    expect(visibleText).not.toMatch(/\bin line\b/);
    expect(visibleText).not.toMatch(/\d/);
  });

  it("below the threshold without a label falls back to the scarcity line", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(countResponse(3)));

    render(<LiveCount />);

    expect(
      await screen.findByText("Be one of the first in line"),
    ).toBeInTheDocument();
  });

  it("at/above the threshold shows the count with 'in line'", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(countResponse(50)));

    render(<LiveCount label="Private beta" />);

    expect(await screen.findByText(/50 in line/)).toBeInTheDocument();
    // Label still rides on the same row.
    expect(screen.getByText("Private beta")).toBeInTheDocument();
  });

  it("formats large counts with a thousands separator", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(countResponse(1234)));

    render(<LiveCount />);

    expect(await screen.findByText(/1,234 in line/)).toBeInTheDocument();
  });

  it("renders a screen-reader live region announcing the full status once", async () => {
    const { container } = render(
      <LiveCount label="Private beta" />,
    );
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(countResponse(120)));
    // Re-render path: mount with fetch already stubbed.
    container.remove();

    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(countResponse(120)));
    const { container: c2 } = render(<LiveCount label="Private beta" />);

    const live = await waitFor(() => {
      const el = c2.querySelector('[aria-live="polite"]');
      expect(el?.textContent).toMatch(/already in line/);
      return el as HTMLElement;
    });

    expect(live).toHaveClass("sr-only");
    // SR text uses the un-animated true count, not an interpolated frame.
    expect(live.textContent).toBe("Private beta. 120 already in line");
  });

  it("the live region carries only the scarcity label below threshold", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(countResponse(8)));

    const { container } = render(<LiveCount label="Private beta" />);

    await waitFor(() => {
      const live = container.querySelector('[aria-live="polite"]');
      expect(live?.textContent).toBe(
        "Private beta. Be one of the first in line",
      );
    });
  });

  it("omits the live region when announce={false}", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(countResponse(99)));

    const { container } = render(<LiveCount announce={false} />);

    await screen.findByText(/99 in line/);
    expect(container.querySelector('[aria-live="polite"]')).toBeNull();
  });

  it("renders the live dot as decorative (aria-hidden)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(countResponse(60)));

    const { container } = render(<LiveCount label="Private beta" />);

    // Wait for the post-fetch render so the count-up state settles before we
    // assert (avoids an unwrapped-act warning).
    await screen.findByText(/60 in line/);

    const dot = container.querySelector(".status-dot");
    expect(dot).toBeTruthy();
    expect(dot).toHaveAttribute("aria-hidden");
  });

  it("renders nothing announced before the fetch resolves", () => {
    // A pending fetch (never resolves) leaves count === null.
    vi.stubGlobal("fetch", vi.fn().mockReturnValue(new Promise(() => {})));

    const { container } = render(<LiveCount label="Private beta" />);

    // Label is static so it shows, but the live region is empty until data lands.
    const live = container.querySelector('[aria-live="polite"]');
    expect(live?.textContent).toBe("");
  });

  it("survives a failed fetch without throwing or showing a number", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, json: async () => ({}) }),
    );

    const { container } = render(<LiveCount label="Private beta" />);

    expect(await screen.findByText("Private beta")).toBeInTheDocument();
    expect(container.textContent).not.toMatch(/in line/);
  });

  it("applies start alignment when align='start'", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(countResponse(70)));

    const { container } = render(<LiveCount align="start" />);

    await screen.findByText(/70 in line/);
    expect(container.firstChild).toHaveClass("justify-start");
  });
});
