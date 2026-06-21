import type { MetadataRoute } from "next";
import { buildRobots } from "@waitlist-stack/seo";
import config from "../waitlist.config";

export default function robots(): MetadataRoute.Robots {
  return buildRobots(config) as MetadataRoute.Robots;
}
