import type { BrandConfig, FounderConfig } from "@waitlist-stack/config";
import { escapeAttr, escapeHtml } from "./escape";
import type { RenderedEmail } from "./welcome";

export interface LaunchEmailInput {
  brand: BrandConfig;
  founder: FounderConfig;
  recipientName: string;
  /** URL the user clicks to claim the launched product. */
  ctaUrl: string;
  /** Optional CTA button label. Defaults to "Get started". */
  ctaLabel?: string;
}

// Sent on launch day to everyone on the waitlist. Bigger visual statement
// than the welcome (serif h1, button CTA). Same monospace body.

export function launchEmail(input: LaunchEmailInput): RenderedEmail {
  const { brand, founder, recipientName, ctaUrl } = input;
  const ctaLabel = input.ctaLabel ?? "Get started";
  const first = recipientName.trim().split(/\s+/)[0] || "there";
  const subject = `${brand.name} is live.`;

  const text = `Hi ${first},

${brand.name} is live: ${ctaUrl}

${founder.name}${founder.twitterHandle ? `\nx.com/${founder.twitterHandle}` : ""}`;

  const html = `<!doctype html>
<html><body style="margin:0;padding:0;background:#F4EFE3;color:#171614;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F4EFE3;padding:48px 16px;">
    <tr><td align="center">
      <table role="presentation" width="540" cellpadding="0" cellspacing="0" style="max-width:540px;width:100%;">
        <tr><td>
          <h1 style="margin:0 0 18px 0;font-family:Georgia,serif;font-size:44px;line-height:1.05;color:#171614;font-weight:400;">
            ${escapeHtml(brand.name)} is <em style="font-style:italic;">live</em><span style="color:#1d4ed8;">.</span>
          </h1>
          <p style="margin:0 0 24px 0;font-size:14.5px;line-height:1.7;">Hi ${escapeHtml(first)}, your access is ready.</p>
          <p style="margin:0 0 24px 0;">
            <a href="${escapeAttr(ctaUrl)}" style="display:inline-block;background:#171614;color:#F4EFE3;padding:14px 22px;text-decoration:none;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;">
              ${escapeHtml(ctaLabel)} &rarr;
            </a>
          </p>
          <p style="margin:0;font-size:13px;line-height:1.7;color:#6B6357;">${escapeHtml(founder.name)}</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

  return { subject, text, html };
}
