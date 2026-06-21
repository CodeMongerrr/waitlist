import type { BrandConfig, FounderConfig } from "@waitlist-stack/config";
import { escapeAttr, escapeHtml } from "./escape";

export interface WelcomeEmailInput {
  brand: BrandConfig;
  founder: FounderConfig;
  recipientName: string;
  /** Referral code. When present, the email includes a share link. */
  referralCode?: string | null;
  /** Position. When present, included in the subject + body copy. */
  position?: number | null;
  /** Friend-jump count for share-prompt copy. Defaults to 10. */
  jumpsPerReferral?: number;
}

export interface RenderedEmail {
  subject: string;
  text: string;
  html: string;
}

// Default template. Plain prose, lower-case, reads like a founder typed it
// at 11pm. Consumers can write their own by importing escapeHtml/escapeAttr
// and following this shape.

export function welcomeEmail(input: WelcomeEmailInput): RenderedEmail {
  const { brand, founder, recipientName, referralCode, position } = input;
  const jumps = input.jumpsPerReferral ?? 10;
  const first = (recipientName.trim().split(/\s+/)[0] || "there").toLowerCase();

  const subject = position
    ? `you're #${position} on the ${brand.name} list`
    : `you're in`;

  const shareUrl = referralCode
    ? `${brand.siteUrl}/?ref=${encodeURIComponent(referralCode)}`
    : null;

  const positionPhrase = position
    ? `you're #${position} on the ${brand.name} list`
    : `you're on the ${brand.name} list`;

  const shareLine = shareUrl
    ? `\nwanna jump the queue? every friend who signs up via your link bumps you ${jumps} spots:\n${shareUrl}\n`
    : "";

  const forwardLine = shareUrl
    ? `\nor: forward this email. your code's already inside.\n`
    : "";

  const twitterLine = founder.twitterHandle
    ? `dm me on x: @${founder.twitterHandle}`
    : "";

  const text = `hey ${first},

${positionPhrase}. thanks for trusting this.

i'll email when the beta is ready.
${shareLine}${forwardLine}${twitterLine ? `\n${twitterLine}\n` : ""}
${founder.name.toLowerCase()}`;

  const shareHtml = shareUrl
    ? `<p style="margin:0 0 24px 0;font-size:15px;line-height:1.7;color:#171614;">
            wanna jump the queue? every friend who signs up via your link bumps you ${jumps} spots:<br /><br />
            <a href="${escapeAttr(shareUrl)}" style="color:#1d4ed8;text-decoration:none;border-bottom:1px solid #1d4ed8;word-break:break-all;">${escapeHtml(shareUrl)}</a>
          </p>`
    : "";

  const forwardHtml = shareUrl
    ? `<p style="margin:0 0 24px 0;font-size:15px;line-height:1.7;color:#171614;">
            or: forward this email. your code's already inside.
          </p>`
    : "";

  const twitterHtml = founder.twitterHandle
    ? `<p style="margin:0 0 30px 0;font-size:15px;line-height:1.7;color:#171614;">
            dm me on x:
            <a href="https://x.com/${escapeAttr(founder.twitterHandle)}" style="color:#1d4ed8;text-decoration:none;border-bottom:1px solid #1d4ed8;">@${escapeHtml(founder.twitterHandle)}</a>
          </p>`
    : "";

  const html = `<!doctype html>
<html><body style="margin:0;padding:0;background:#F4EFE3;color:#171614;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F4EFE3;padding:36px 16px;">
    <tr><td align="center">
      <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;background:#F4EFE3;">
        <tr><td style="padding:0 4px;">
          <p style="margin:0 0 24px 0;font-size:15px;line-height:1.7;color:#171614;">hey ${escapeHtml(first)},</p>
          <p style="margin:0 0 24px 0;font-size:15px;line-height:1.7;color:#171614;">
            ${position ? `you're <b>#${position}</b> on the ${escapeHtml(brand.name)} list` : `you're on the ${escapeHtml(brand.name)} list`}. thanks for trusting this.
          </p>
          <p style="margin:0 0 24px 0;font-size:15px;line-height:1.7;color:#171614;">i'll email when the beta is ready.</p>
          ${shareHtml}
          ${forwardHtml}
          ${twitterHtml}
          <p style="margin:0;font-size:15px;line-height:1.7;color:#171614;">${escapeHtml(founder.name.toLowerCase())}</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

  return { subject, text, html };
}
