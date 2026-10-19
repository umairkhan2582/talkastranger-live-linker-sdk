const { safeParseUrl, isAllowedHostname, getPathSegments } = require("../lib/url-utils");

const ALLOWED_HOSTNAMES = ["tiktok.com", "www.tiktok.com", "m.tiktok.com"];

class TikTokAdapter {
  constructor() {
    this.name = "tiktok";
    this.displayName = "TikTok";
    this.allowedHostnames = ALLOWED_HOSTNAMES;
  }

  validateUrl(urlString) {
    try {
      this.parse(urlString);
      return true;
    } catch {
      return false;
    }
  }

  parse(urlString) {
    const parsed = safeParseUrl(urlString);
    if (!parsed) {
      throw new Error(`TikTokAdapter: Malformed stream URL "${urlString}"`);
    }

    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      throw new Error(`TikTokAdapter: Unsupported protocol "${parsed.protocol}"`);
    }

    if (!isAllowedHostname(parsed.hostname, ALLOWED_HOSTNAMES)) {
      throw new Error(`TikTokAdapter: Invalid hostname "${parsed.hostname}"`);
    }

    const segments = getPathSegments(parsed);
    let channelId = null;

    if (segments.length > 0 && segments[0].startsWith("@")) {
      channelId = segments[0].replace(/^@/, "");
    } else if (segments.length > 0) {
      channelId = segments[0];
    } else {
      throw new Error("TikTokAdapter: URL is missing TikTok username");
    }

    const normalizedUrl = `https://www.tiktok.com/@${channelId}/live`;

    return {
      platform: "tiktok",
      channelId,
      displayName: `@${channelId}`,
      normalizedUrl: urlString,
      canonicalUrl: normalizedUrl,
      metadata: {
        rawUrl: urlString,
        hostname: parsed.hostname,
        channel: channelId,
      },
    };
  }

  formatChannelUrl(channelId) {
    if (!channelId) throw new Error("TikTokAdapter: Channel ID is required");
    const clean = channelId.replace(/^@/, "");
    return `https://www.tiktok.com/@${clean}/live`;
  }
}

module.exports = {
  TikTokAdapter,
  ALLOWED_HOSTNAMES,
};
