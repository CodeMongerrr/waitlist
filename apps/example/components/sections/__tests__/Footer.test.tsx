import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { Footer } from "@/components/sections/Footer";

describe("Footer", () => {
  it("renders a footer landmark with the Catalyst brand", () => {
    const { container } = render(<Footer />);
    const footer = container.querySelector("footer");
    expect(footer).toBeInTheDocument();
    // Brand wordmark appears in the visible header block.
    expect(screen.getAllByText("Catalyst").length).toBeGreaterThan(0);
  });

  it("renders the three product nav links with correct hrefs", () => {
    render(<Footer />);

    const how = screen.getByRole("link", { name: "How it works" });
    expect(how).toHaveAttribute("href", "#how");

    const control = screen.getByRole("link", { name: "Control" });
    expect(control).toHaveAttribute("href", "#control");

    const join = screen.getByRole("link", { name: "Join the waitlist" });
    expect(join).toHaveAttribute("href", "#join");
  });

  it("exposes exactly three anchor links, all in-page hash targets", () => {
    render(<Footer />);
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(3);
    for (const link of links) {
      expect(link.getAttribute("href")).toMatch(/^#/);
    }
  });

  it("shows the 'Private waitlist open' status pill with a live dot", () => {
    render(<Footer />);
    const pill = screen.getByText("Private waitlist open");
    expect(pill).toBeInTheDocument();
    // The pill wraps an animated status dot alongside the label.
    expect(pill.querySelector(".status-dot")).toBeTruthy();
  });

  it("renders the copyright line and the closing tagline", () => {
    render(<Footer />);
    expect(
      screen.getByText(/© 2026 Catalyst · Built for X · Human-approved/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/rather build than post/i),
    ).toBeInTheDocument();
  });

  it("groups the product links under a Product heading", () => {
    render(<Footer />);
    const productLabel = screen.getByText("Product");
    const group = productLabel.parentElement as HTMLElement;
    expect(group).toBeTruthy();
    const linksInGroup = within(group).getAllByRole("link");
    expect(linksInGroup.map((l) => l.getAttribute("href"))).toEqual([
      "#how",
      "#control",
      "#join",
    ]);
  });

  it("decorates the watermark as aria-hidden so it is not announced", () => {
    const { container } = render(<Footer />);
    const hidden = container.querySelector('[aria-hidden="true"]');
    expect(hidden).toBeTruthy();
    expect(hidden).toHaveTextContent("Catalyst");
  });
});
