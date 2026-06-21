import type { MetadataRoute } from "next";
import { buildSitemap } from "@waitlist-stack/seo";
import config from "../waitlist.config";

export default function sitemap(): MetadataRoute.Sitemap {
  return buildSitemap(config) as MetadataRoute.Sitemap;
}
