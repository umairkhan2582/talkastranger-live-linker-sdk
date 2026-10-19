const { safeParseUrl, isAllowedHostname, getPathSegments } = require("../lib/url-utils");

const ALLOWED_HOSTNAMES = ["twitch.tv", "www.twitch.tv", "m.twitch.tv"];
const CHANNEL_REGEX = /^[a-zA-Z0-9_]{3,25}$/;

const RESERVED_PATHS = new Set([
  "directory",
  "p",
  "videos",
  "moderator",
  "settings",
  "friends",
  "subscriptions",
  "inventory",
  "wallet",
  "drops",
  "messages",
  "popout",
  "embed",
  "downloads",
  "jobs",
  "turbo",
  "prime",
  "broadcast",
  "creatorcamp",
  "team",
  "search",
  "login",
  "signup",
  "live",
]);

class TwitchAdapter {
  constructor() {
    this.name = "twitch";
    this.displayName = "Twitch";
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
      throw new Error(`TwitchAdapter: Malformed stream URL "${urlString}"`);
    }

    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      throw new Error(`TwitchAdapter: Unsupported protocol "${parsed.protocol}" - only HTTP and HTTPS are allowed`);
    }

    if (!isAllowedHostname(parsed.hostname, ALLOWED_HOSTNAMES)) {
      throw new Error(`TwitchAdapter: Invalid or deceptive hostname "${parsed.hostname}" - expected twitch.tv, www.twitch.tv, or m.twitch.tv`);
    }

    const segments = getPathSegments(parsed);
    if (segments.length === 0) {
      throw new Error("TwitchAdapter: URL is missing channel identifier");
    }

    if (segments.length > 1) {
      throw new Error(`TwitchAdapter: Unsupported channel subpath "/${segments.join("/")}" - only root channel URLs are supported`);
    }

    const channelRaw = segments[0];
    const channelLower = channelRaw.toLowerCase();

    if (RESERVED_PATHS.has(channelLower)) {
      throw new Error(`TwitchAdapter: "${channelRaw}" is a reserved Twitch platform path, not a user channel`);
    }

    if (!CHANNEL_REGEX.test(channelRaw)) {
      throw new Error(`TwitchAdapter: Invalid Twitch channel identifier "${channelRaw}" - expected 3-25 alphanumeric characters or underscores`);
    }

    const normalizedUrl = `https://www.twitch.tv/${channelLower}`;

    return {
      platform: "twitch",
      channelId: channelLower,
      displayName: channelRaw,
      normalizedUrl,
      canonicalUrl: normalizedUrl,
      metadata: {
        rawUrl: urlString,
        hostname: parsed.hostname,
        channel: channelLower,
        query: Object.fromEntries(parsed.searchParams.entries()),
      },
    };
  }

  formatChannelUrl(channelId) {
    if (!channelId || !CHANNEL_REGEX.test(channelId)) {
      throw new Error(`TwitchAdapter: Invalid channel identifier "${channelId}"`);
    }
    return `https://www.twitch.tv/${channelId.toLowerCase()}`;
  }
}

module.exports = {
  TwitchAdapter,
  ALLOWED_HOSTNAMES,
  CHANNEL_REGEX,
  RESERVED_PATHS,
};
