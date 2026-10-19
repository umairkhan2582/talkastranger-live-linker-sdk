const { safeParseUrl, isAllowedHostname, getPathSegments } = require("../lib/url-utils");

const ALLOWED_HOSTNAMES = ["youtube.com", "www.youtube.com", "m.youtube.com", "youtu.be"];

class YouTubeAdapter {
  constructor() {
    this.name = "youtube";
    this.displayName = "YouTube";
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
      throw new Error(`YouTubeAdapter: Malformed stream URL "${urlString}"`);
    }

    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      throw new Error(`YouTubeAdapter: Unsupported protocol "${parsed.protocol}"`);
    }

    if (!isAllowedHostname(parsed.hostname, ALLOWED_HOSTNAMES)) {
      throw new Error(`YouTubeAdapter: Invalid hostname "${parsed.hostname}"`);
    }

    const segments = getPathSegments(parsed);
    let channelId = null;

    if (parsed.hostname.toLowerCase() === "youtu.be") {
      channelId = segments[0] || "live";
    } else if (segments.length > 0) {
      if (segments[0].startsWith("@")) {
        channelId = segments[0];
      } else if (segments[0] === "channel" || segments[0] === "c" || segments[0] === "user") {
        channelId = segments[1] || segments[0];
      } else if (segments[0] === "watch") {
        channelId = parsed.searchParams.get("v") || "live";
      } else {
        channelId = segments[0];
      }
    } else {
      channelId = "live";
    }

    const normalizedUrl = `https://www.youtube.com/${channelId.startsWith("@") ? channelId : "watch?v=" + channelId}`;

    return {
      platform: "youtube",
      channelId,
      displayName: channelId,
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
    if (!channelId) throw new Error("YouTubeAdapter: Channel ID is required");
    if (channelId.startsWith("@")) return `https://www.youtube.com/${channelId}`;
    return `https://www.youtube.com/channel/${channelId}`;
  }
}

module.exports = {
  YouTubeAdapter,
  ALLOWED_HOSTNAMES,
};
