import { describe, it, expect, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Faq } from "@/components/sections/Faq";

const QUESTIONS = [
  "Will this get my account flagged?",
  "Will my posts sound like AI?",
  "Do I have to post every day?",
  "What if I do not have time to review?",
];

const ANSWER_FRAGMENTS = [
  /Catalyst never posts on its own/i,
  /drafts from how you already write/i,
  /Approve what's good, skip the rest/i,
  /Nothing expires into an auto-post/i,
];

describe("Faq", () => {
  afterEach(() => {
    // no globals/timers stubbed here, but keep parity with harness conventions
  });

  it("renders the section heading", () => {
    render(<Faq />);
    expect(
      screen.getByRole("heading", {
        name: /what people ask before they join/i,
      }),
    ).toBeInTheDocument();
  });

  it("renders all four question triggers as buttons", () => {
    render(<Faq />);
    for (const q of QUESTIONS) {
      expect(
        screen.getByRole("button", { name: new RegExp(q.replace(/[?]/g, "\\?"), "i") }),
      ).toBeInTheDocument();
    }
    // exactly four accordion triggers
    expect(screen.getAllByRole("button")).toHaveLength(QUESTIONS.length);
  });

  it("numbers the questions 01..04", () => {
    render(<Faq />);
    ["01", "02", "03", "04"].forEach((n) => {
      expect(screen.getByText(n)).toBeInTheDocument();
    });
  });

  it("keeps every answer collapsed by default", () => {
    render(<Faq />);
    // Radix single+collapsible: closed content is hidden (data-state=closed / hidden attr).
    // The visible text should not be present to assistive tech / queries.
    for (const frag of ANSWER_FRAGMENTS) {
      expect(screen.queryByText(frag)).not.toBeInTheDocument();
    }
    // All triggers report collapsed
    screen.getAllByRole("button").forEach((btn) => {
      expect(btn).toHaveAttribute("aria-expanded", "false");
    });
  });

  it("reveals an answer when its trigger is clicked", async () => {
    const user = userEvent.setup();
    render(<Faq />);

    const trigger = screen.getByRole("button", {
      name: /will this get my account flagged/i,
    });
    await user.click(trigger);

    await waitFor(() => {
      expect(screen.getByText(/Catalyst never posts on its own/i)).toBeInTheDocument();
    });
    expect(trigger).toHaveAttribute("aria-expanded", "true");
  });

  it("only one answer is open at a time (type=single)", async () => {
    const user = userEvent.setup();
    render(<Faq />);

    const first = screen.getByRole("button", {
      name: /will this get my account flagged/i,
    });
    const second = screen.getByRole("button", {
      name: /will my posts sound like ai/i,
    });

    await user.click(first);
    await waitFor(() =>
      expect(screen.getByText(/Catalyst never posts on its own/i)).toBeInTheDocument(),
    );

    await user.click(second);
    await waitFor(() =>
      expect(
        screen.getByText(/drafts from how you already write/i),
      ).toBeInTheDocument(),
    );

    // opening the second collapses the first
    await waitFor(() =>
      expect(
        screen.queryByText(/Catalyst never posts on its own/i),
      ).not.toBeInTheDocument(),
    );
    expect(first).toHaveAttribute("aria-expanded", "false");
    expect(second).toHaveAttribute("aria-expanded", "true");
  });

  it("collapsible: clicking an open trigger closes it again", async () => {
    const user = userEvent.setup();
    render(<Faq />);

    const trigger = screen.getByRole("button", {
      name: /do i have to post every day/i,
    });

    await user.click(trigger);
    await waitFor(() =>
      expect(
        screen.getByText(/Approve what's good, skip the rest/i),
      ).toBeInTheDocument(),
    );

    await user.click(trigger);
    await waitFor(() =>
      expect(
        screen.queryByText(/Approve what's good, skip the rest/i),
      ).not.toBeInTheDocument(),
    );
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });
});
