import { test, expect, type Page } from "@playwright/test";

// The hero and the CTA each render a signup form, and after signup both cards
// flip to the referral view, so always target the first match.
const emailField = (page: Page) => page.getByPlaceholder("you@email.com").first();
const joinButton = (page: Page) =>
  page.getByRole("button", { name: /join the waitlist/i }).first();

test("landing renders the hero and signup form", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Sound like");
  await expect(page.getByText(/get early access/i).first()).toBeVisible();
  await expect(emailField(page)).toBeVisible();
});

test("rejects an invalid email client-side and stays on the form", async ({ page }) => {
  await page.goto("/");
  await emailField(page).fill("notanemail");
  await joinButton(page).click({ force: true });
  await expect(page.getByText(/doesn't look like an email/i)).toBeVisible();
  await expect(page.getByText("You're on the list")).toHaveCount(0);
});

test("a valid signup reveals the referral card with position + share", async ({ page }) => {
  await page.goto("/");
  const email = `e2e-${Date.now()}@example.com`;
  await emailField(page).fill(email);
  await joinButton(page).click({ force: true });

  await expect(page.getByText("You're on the list").first()).toBeVisible({
    timeout: 15000,
  });
  await expect(
    page.getByRole("button", { name: /share on x/i }).first(),
  ).toBeVisible();
  await expect(page.getByText(/\?ref=/).first()).toBeVisible();
});
