import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { Header } from "@/components/sections/Header";

describe("Header", () => {
  it("renders inside a banner landmark", () => {
    render(<Header />);
    expect(screen.getByRole("banner")).toBeInTheDocument();
  });

  it("links the Catalyst logo to #top", () => {
    render(<Header />);
    const logo = screen.getByRole("link", { name: /catalyst/i });
    expect(logo).toHaveAttribute("href", "#top");
    // brand mark + wordmark are both inside the logo link
    expect(within(logo).getByText("Catalyst")).toBeInTheDocument();
    expect(within(logo).getByText("c")).toBeInTheDocument();
  });

  it('exposes the "Join the waitlist" CTA as a link to #join', () => {
    render(<Header />);
    const cta = screen.getByRole("link", { name: /join the waitlist/i });
    expect(cta).toHaveAttribute("href", "#join");
  });

  it('shows the "Private beta" label', () => {
    render(<Header />);
    expect(screen.getByText("Private beta")).toBeInTheDocument();
  });

  it("renders exactly two links: the logo and the CTA", () => {
    render(<Header />);
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(2);
    const hrefs = links.map((l) => l.getAttribute("href"));
    expect(hrefs).toEqual(expect.arrayContaining(["#top", "#join"]));
  });

  it("keeps the CTA distinct from the logo link", () => {
    render(<Header />);
    const logo = screen.getByRole("link", { name: /catalyst/i });
    const cta = screen.getByRole("link", { name: /join the waitlist/i });
    expect(logo).not.toBe(cta);
  });
});
