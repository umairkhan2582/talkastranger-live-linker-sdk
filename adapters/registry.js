const { KickAdapter } = require("./kick");
const { TwitchAdapter } = require("./twitch");
const { YouTubeAdapter } = require("./youtube");
const { TikTokAdapter } = require("./tiktok");
const { safeParseUrl } = require("../lib/url-utils");

class AdapterRegistry {
  constructor() {
    this.adapters = new Map();
    this.register("kick", new KickAdapter());
    this.register("twitch", new TwitchAdapter());
    this.register("youtube", new YouTubeAdapter());
    this.register("tiktok", new TikTokAdapter());
  }

  register(platformName, adapter) {
    if (!platformName || typeof platformName !== "string") {
      throw new Error("register: platformName must be a non-empty string");
    }
    if (!adapter || typeof adapter.parse !== "function" || typeof adapter.validateUrl !== "function") {
      throw new Error("register: adapter must implement validateUrl() and parse()");
    }
    this.adapters.set(platformName.toLowerCase(), adapter);
  }

  get(platformName) {
    if (!platformName || typeof platformName !== "string") return null;
    return this.adapters.get(platformName.toLowerCase()) || null;
  }

  has(platformName) {
    if (!platformName || typeof platformName !== "string") return false;
    return this.adapters.has(platformName.toLowerCase());
  }

  getSupportedPlatforms() {
    return Array.from(this.adapters.keys());
  }

  detectPlatform(urlString) {
    const parsed = safeParseUrl(urlString);
    if (!parsed) return null;
    const host = parsed.hostname.toLowerCase().replace(/\.$/, "").split(":")[0];

    for (const [platform, adapter] of this.adapters.entries()) {
      if (adapter.allowedHostnames && adapter.allowedHostnames.includes(host)) {
        return platform;
      }
    }
    return null;
  }

  parseStreamUrl(urlString, preferredPlatform) {
    if (!urlString) {
      throw new Error("parseStreamUrl: urlString is required");
    }

    let targetPlatform = preferredPlatform;
    if (!targetPlatform) {
      targetPlatform = this.detectPlatform(urlString);
    }

    if (!targetPlatform) {
      throw new Error(`parseStreamUrl: Unable to detect platform from stream URL "${urlString}"`);
    }

    const adapter = this.get(targetPlatform);
    if (!adapter) {
      throw new Error(`parseStreamUrl: No adapter registered for platform "${targetPlatform}"`);
    }

    return adapter.parse(urlString);
  }
}

const defaultRegistry = new AdapterRegistry();

module.exports = {
  AdapterRegistry,
  defaultRegistry,
  KickAdapter,
  TwitchAdapter,
  YouTubeAdapter,
  TikTokAdapter,
};
