const { safeParseUrl, isAllowedHostname, getPathSegments } = require("../lib/url-utils");

const ALLOWED_HOSTNAMES = ["kick.com", "www.kick.com"];
const CHANNEL_REGEX = /^[a-zA-Z0-9_-]{1,50}$/;

const RESERVED_PATHS = new Set([
  "categories",
  "following",
  "leaderboard",
  "video",
  "videos",
  "clip",
  "clips",
  "terms-of-service",
  "privacy-policy",
  "community-guidelines",
  "dmca",
  "search",
  "browse",
  "about",
  "help",
  "api",
  "login",
  "signup",
  "dashboard",
  "featured",
  "channels",
  "settings",
]);

class KickAdapter {
  constructor() {
    this.name = "kick";
    this.displayName = "Kick.com";
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
      throw new Error(`KickAdapter: Malformed stream URL "${urlString}"`);
    }

    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      throw new Error(`KickAdapter: Unsupported protocol "${parsed.protocol}" - only HTTP and HTTPS are allowed`);
    }

    if (!isAllowedHostname(parsed.hostname, ALLOWED_HOSTNAMES)) {
      throw new Error(`KickAdapter: Invalid or deceptive hostname "${parsed.hostname}" - expected kick.com or www.kick.com`);
    }

    const segments = getPathSegments(parsed);
    if (segments.length === 0) {
      throw new Error("KickAdapter: URL is missing channel path");
    }

    if (segments.length > 1) {
      throw new Error(`KickAdapter: Unsupported channel subpath "/${segments.join("/")}" - only root channel URLs are supported`);
    }

    const channelRaw = segments[0];
    const channelLower = channelRaw.toLowerCase();

    if (RESERVED_PATHS.has(channelLower)) {
      throw new Error(`KickAdapter: "${channelRaw}" is a reserved Kick platform path, not a channel`);
    }

    if (!CHANNEL_REGEX.test(channelRaw)) {
      throw new Error(`KickAdapter: Invalid Kick channel identifier "${channelRaw}"`);
    }

    const normalizedUrl = `https://kick.com/${channelRaw}`;

    return {
      platform: "kick",
      channelId: channelRaw,
      displayName: channelRaw,
      normalizedUrl,
      canonicalUrl: normalizedUrl,
      metadata: {
        rawUrl: urlString,
        hostname: parsed.hostname,
        channel: channelRaw,
        query: Object.fromEntries(parsed.searchParams.entries()),
      },
    };
  }

  formatChannelUrl(channelId) {
    if (!channelId || !CHANNEL_REGEX.test(channelId)) {
      throw new Error(`KickAdapter: Invalid channel identifier "${channelId}"`);
    }
    return `https://kick.com/${channelId}`;
  }
}

module.exports = {
  KickAdapter,
  ALLOWED_HOSTNAMES,
  CHANNEL_REGEX,
  RESERVED_PATHS,
};
