import type { EmailProvider } from "./types";
import { ResendProvider } from "./resend";
import { PostmarkProvider } from "./postmark";
import { SendGridProvider } from "./sendgrid";

export { ResendProvider } from "./resend";
export { PostmarkProvider } from "./postmark";
export { SendGridProvider } from "./sendgrid";
export type { EmailProvider, SendArgs, SendResult } from "./types";

export function getProvider(name: "resend" | "postmark" | "sendgrid"): EmailProvider {
  switch (name) {
    case "resend":
      return ResendProvider;
    case "postmark":
      return PostmarkProvider;
    case "sendgrid":
      return SendGridProvider;
  }
}
