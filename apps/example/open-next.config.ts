import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Default config for the open-next Cloudflare adapter. Most apps don't
// need to override anything here; this file exists so wrangler can find
// it during the build step.

export default defineCloudflareConfig();
