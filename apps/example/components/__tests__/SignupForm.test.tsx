import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SignupForm } from "@/components/SignupForm";

const okResponse = (body: Record<string, unknown>) => ({
  ok: true,
  json: async () => body,
});

describe("SignupForm", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders an email field, submit button, and the hidden honeypot", () => {
    render(<SignupForm />);
    expect(screen.getByPlaceholderText("you@email.com")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /join the waitlist/i }),
    ).toBeInTheDocument();
    const honeypot = document.querySelector('input[name="website_url"]');
    expect(honeypot).toBeTruthy();
    expect(honeypot).toHaveAttribute("aria-hidden", "true");
    expect(honeypot).toHaveAttribute("tabindex", "-1");
  });

  it("shows an error and never fetches on an invalid email", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();
    render(<SignupForm />);

    await user.type(screen.getByPlaceholderText("you@email.com"), "notanemail");
    await user.click(screen.getByRole("button", { name: /join the waitlist/i }));

    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("offers a typo correction and only sends after 'send anyway'", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      okResponse({ ok: true, referralCode: "ABCDEFGHJK", position: 3, referralCount: 0 }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();
    render(<SignupForm />);

    await user.type(screen.getByPlaceholderText("you@email.com"), "bob@gmial.com");
    await user.click(screen.getByRole("button", { name: /join the waitlist/i }));

    // suggestion shown, not sent yet
    expect(await screen.findByText(/did you mean/i)).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: /no, send anyway/i }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
  });

  it("posts an email-only body and reports success", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      okResponse({ ok: true, referralCode: "CODE123456", position: 7, referralCount: 0 }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const onSuccess = vi.fn();
    const user = userEvent.setup();
    render(<SignupForm onSuccess={onSuccess} />);

    await user.type(screen.getByPlaceholderText("you@email.com"), "Alice@Example.com");
    await user.click(screen.getByRole("button", { name: /join the waitlist/i }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));

    const [url, opts] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/waitlist");
    const body = JSON.parse((opts as RequestInit).body as string);
    expect(body.email).toBe("alice@example.com"); // trimmed + lowercased
    expect(body.website_url).toBe(""); // honeypot empty
    expect("x_handle" in body).toBe(false); // email-only: no handle field
    expect(onSuccess).toHaveBeenCalledWith(
      expect.objectContaining({ code: "CODE123456", position: 7 }),
    );
  });
});
