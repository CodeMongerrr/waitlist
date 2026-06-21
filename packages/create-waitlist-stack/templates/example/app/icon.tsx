import { ImageResponse } from "next/og";
import {
  FAVICON_CONTENT_TYPE,
  FAVICON_SIZE,
  FaviconElement,
} from "@waitlist-stack/seo";
import config from "../waitlist.config";

export const size = FAVICON_SIZE;
export const contentType = FAVICON_CONTENT_TYPE;

export default function Icon() {
  return new ImageResponse(<FaviconElement brand={config.brand} />, {
    ...FAVICON_SIZE,
  });
}
