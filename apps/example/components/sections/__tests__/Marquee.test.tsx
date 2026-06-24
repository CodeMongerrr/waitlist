import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { Marquee } from "@/components/sections/Marquee";

const PHRASES = [
  "Sounds like you, not a bot",
  "You approve every post",
  "No auto-post, ever",
  "Built for X, done right",
  "Researched from Reddit, HN, and Google News",
  "A loop you can audit",
  "Your voice, amplified",
];

describe("Marquee", () => {
  it("renders an aria-hidden decorative marquee wrapper", () => {
    const { container } = render(<Marquee />);
    const outer = container.querySelector(".marquee");
    expect(outer).toBeTruthy();
    // aria-hidden because the strip is purely decorative and duplicated
    expect(outer).toHaveAttribute("aria-hidden");
    expect(outer).not.toBeNull();
  });

  it("renders the animated track holding the two strips", () => {
    const { container } = render(<Marquee />);
    const track = container.querySelector(".marquee-track");
    expect(track).toBeTruthy();
    // two Strip components are rendered inside the track
    expect(track?.children.length).toBe(2);
  });

  it("renders every phrase twice, once per duplicated strip", () => {
    render(<Marquee />);
    for (const phrase of PHRASES) {
      const hits = screen.getAllByText(phrase);
      expect(hits).toHaveLength(2);
    }
  });

  it("exposes the approval value-prop copy", () => {
    render(<Marquee />);
    // load-bearing product claim: user approves every post, no auto-posting
    expect(screen.getAllByText("You approve every post").length).toBeGreaterThan(0);
    expect(screen.getAllByText("No auto-post, ever").length).toBeGreaterThan(0);
  });

  it("renders a diamond separator after each phrase in a strip", () => {
    const { container } = render(<Marquee />);
    const track = container.querySelector(".marquee-track");
    const diamonds = within(track as HTMLElement).queryAllByText("◆");
    // 7 phrases per strip, two strips => 14 separators total
    expect(diamonds).toHaveLength(PHRASES.length * 2);
  });

  it("contains no interactive elements (decorative only)", () => {
    render(<Marquee />);
    expect(screen.queryAllByRole("link")).toHaveLength(0);
    expect(screen.queryAllByRole("button")).toHaveLength(0);
  });
});
