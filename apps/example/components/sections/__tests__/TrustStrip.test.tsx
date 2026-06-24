import { describe, it, expect, afterEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { TrustStrip } from "@/components/sections/TrustStrip";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("TrustStrip", () => {
  it("renders the heading about guarding their account as an h2", () => {
    render(<TrustStrip />);
    const heading = screen.getByRole("heading", {
      level: 2,
      name: /built for people who guard their account\./i,
    });
    expect(heading).toBeInTheDocument();
  });

  it("renders the section with the control anchor id", () => {
    const { container } = render(<TrustStrip />);
    const section = container.querySelector("section#control");
    expect(section).toBeInTheDocument();
  });

  it("renders all three numbered clause markers in order", () => {
    render(<TrustStrip />);
    expect(screen.getByText(/01 · In control/)).toBeInTheDocument();
    expect(screen.getByText(/02 · In your voice/)).toBeInTheDocument();
    expect(screen.getByText(/03 · Scoped on purpose/)).toBeInTheDocument();
  });

  it("renders each clause statement and its supporting copy", () => {
    render(<TrustStrip />);

    // Clause 01: control, no auto-post.
    expect(screen.getByText(/You approve/)).toBeInTheDocument();
    expect(screen.getByText(/every post/)).toBeInTheDocument();
    expect(
      screen.getByText(/No auto-post, no silent timer\. Drafts wait until you say go\./),
    ).toBeInTheDocument();

    // Clause 02: voice, amplifies not replaces.
    expect(screen.getByText(/Amplifies you,/)).toBeInTheDocument();
    expect(screen.getByText(/never replaces you/)).toBeInTheDocument();
    expect(
      screen.getByText(/Sound like you on a day you can't write, not an AI chasing numbers\./),
    ).toBeInTheDocument();

    // Clause 03: one platform, scoped.
    expect(screen.getByText(/One platform/)).toBeInTheDocument();
    expect(screen.getByText(/, done right/)).toBeInTheDocument();
    expect(
      screen.getByText(/No cross-posting, no follower promises\. Just posts you'd put your name on\./),
    ).toBeInTheDocument();
  });

  it("renders the 'Built for X' signature tag", () => {
    render(<TrustStrip />);
    expect(screen.getByText("Built for X")).toBeInTheDocument();
  });

  it("renders the audience line naming solo founders, DevRels, and creators", () => {
    render(<TrustStrip />);
    const audience = screen.getByText(
      /For solo founders, DevRels, and creators whose X is pipeline, not a hobby\./,
    );
    expect(audience).toBeInTheDocument();
  });

  it("renders the honest disclaimer footnote", () => {
    render(<TrustStrip />);
    expect(
      screen.getByText(/Nothing posts without your click · Not affiliated with X/),
    ).toBeInTheDocument();
  });

  it("orders the clause markers 01 then 02 then 03 in the DOM", () => {
    const { container } = render(<TrustStrip />);
    const text = container.textContent ?? "";
    const i1 = text.indexOf("In control");
    const i2 = text.indexOf("In your voice");
    const i3 = text.indexOf("Scoped on purpose");
    expect(i1).toBeGreaterThan(-1);
    expect(i2).toBeGreaterThan(i1);
    expect(i3).toBeGreaterThan(i2);
  });

  it("places the audience line inside the control section", () => {
    const { container } = render(<TrustStrip />);
    const section = container.querySelector("section#control") as HTMLElement;
    expect(section).toBeTruthy();
    expect(
      within(section).getByText(/For solo founders, DevRels, and creators/),
    ).toBeInTheDocument();
    expect(within(section).getByText("Built for X")).toBeInTheDocument();
  });
});
