/**
 * TalkAStranger Live Linker SDK
 * @version 1.2.0
 * @license MIT
 * 
 * Professional client-side SDK for TalkAStranger creators.
 * Cross-broadcast live streams across TikTok, YouTube, Twitch, and Kick.
 * Unlock direct Stripe monetization and organic fan discovery via Country Live Lanes.
 * 
 * Homepage: https://talkastranger.com
 * Creator Studio: https://talkastranger.com/creator-studio
 * GitHub: https://github.com/umairkhan2582/talkastranger-live-linker-sdk
 */

const {
  AdapterRegistry,
  defaultRegistry,
  KickAdapter,
  TwitchAdapter,
  YouTubeAdapter,
  TikTokAdapter,
} = require("./adapters/registry");

const PUBLIC_ENDPOINT = "https://talkastranger.com";

/**
 * TalkAStrangerLinker — connects your external streams to your
 * TalkAStranger Creator Studio profile.
 */
class TalkAStrangerLinker {
  /**
   * @param {Object} options
   * @param {string} options.creatorUsername - Your TalkAStranger creator username
   * @param {boolean} [options.autoSupportLink=true] - Auto-append TalkAStranger support link to descriptions
   * @param {string} [options.endpoint] - Override the public API endpoint (defaults to https://talkastranger.com)
   * @param {AdapterRegistry} [options.registry] - Custom adapter registry
   */
  constructor(options) {
    if (!options || !options.creatorUsername) {
      throw new Error("TalkAStrangerLinker: creatorUsername is required");
    }
    this.creatorUsername = options.creatorUsername;
    this.autoSupportLink = options.autoSupportLink !== false;
    this.endpoint = options.endpoint || PUBLIC_ENDPOINT;
    this.registry = options.registry || defaultRegistry;
    this.linkedStreams = new Map();
  }

  /**
   * Link an external stream to your TalkAStranger creator profile.
   * @param {Object} config
   * @param {string} config.platform - "tiktok", "youtube", "twitch", "kick"
   * @param {string} config.streamUrl - Full URL to your live stream
   * @param {string} [config.title] - Stream title
   * @param {string} [config.description] - Stream description (support link auto-appended if enabled)
   * @returns {Promise<Object>} Stream link result
   */
  async linkStream(config) {
    if (!config || !config.platform || !config.streamUrl) {
      throw new Error("linkStream: platform and streamUrl are required");
    }

    const platform = config.platform.toLowerCase();
    const validPlatforms = this.registry.getSupportedPlatforms();
    if (!validPlatforms.includes(platform)) {
      throw new Error(`linkStream: platform must be one of ${validPlatforms.join(", ")}`);
    }

    // Parse and validate via platform adapter
    const parsed = this.registry.parseStreamUrl(config.streamUrl, platform);

    const streamId = `stream_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const supportLink = this.getSupportLinkText();
    const description = this.autoSupportLink
      ? `${config.description || ""}\n\n${supportLink}`.trim()
      : config.description || "";

    const streamData = {
      id: streamId,
      platform,
      channelId: parsed.channelId,
      streamUrl: parsed.normalizedUrl || config.streamUrl,
      title: config.title || "Live on TalkAStranger",
      description,
      supportLink,
      linkedAt: new Date().toISOString(),
      creatorProfile: `${this.endpoint}/${this.creatorUsername}`,
      creatorStudio: `${this.endpoint}/creator-studio`,
      metadata: parsed.metadata || {},
    };

    this.linkedStreams.set(streamId, streamData);
    return streamData;
  }

  /**
   * Remove a linked stream from your profile.
   * @param {string} streamId - The stream ID returned by linkStream()
   * @returns {boolean} True if stream was removed
   */
  unlinkStream(streamId) {
    return this.linkedStreams.delete(streamId);
  }

  /**
   * Get the promotional support text for stream descriptions.
   * @returns {string} Support text with your creator profile URL
   */
  getSupportLinkText() {
    return `Stream powered by TalkAStranger Live Lanes - Support this stream and send gifts directly via Stripe: ${this.endpoint}/${this.creatorUsername}`;
  }

  /**
   * Get your TalkAStranger creator profile URL.
   * @returns {string} Full URL to your creator profile
   */
  getProfileUrl() {
    return `${this.endpoint}/${this.creatorUsername}`;
  }

  /**
   * Get your TalkAStranger Creator Studio URL.
   * @returns {string} Full URL to the Creator Studio dashboard
   */
  getCreatorStudioUrl() {
    return `${this.endpoint}/creator-studio`;
  }

  /**
   * Get all currently linked streams.
   * @returns {Array<Object>} Array of stream objects
   */
  getLinkedStreams() {
    return Array.from(this.linkedStreams.values());
  }

  /**
   * Generate country lane links for your stream description.
   * @param {number} [limit=10] - Max number of country links to include
   * @returns {string} Formatted country links block
   */
  getCountryLaneLinks(limit = 10) {
    const countries = [
      { code: "us", name: "United States" },
      { code: "gb", name: "United Kingdom" },
      { code: "pk", name: "Pakistan" },
      { code: "in", name: "India" },
      { code: "br", name: "Brazil" },
      { code: "ca", name: "Canada" },
      { code: "au", name: "Australia" },
      { code: "de", name: "Germany" },
      { code: "fr", name: "France" },
      { code: "ng", name: "Nigeria" },
    ];

    return countries
      .slice(0, limit)
      .map(
        (c) =>
          `- [Live video chat in ${c.name}](${this.endpoint}/countries/${c.code})`
      )
      .join("\n");
  }
}

function parseStreamUrl(urlString, preferredPlatform) {
  return defaultRegistry.parseStreamUrl(urlString, preferredPlatform);
}

function getAdapter(platformName) {
  return defaultRegistry.get(platformName);
}

function registerAdapter(platformName, adapter) {
  return defaultRegistry.register(platformName, adapter);
}

const SUPPORTED_PLATFORMS = defaultRegistry.getSupportedPlatforms();

module.exports = {
  TalkAStrangerLinker,
  KickAdapter,
  TwitchAdapter,
  YouTubeAdapter,
  TikTokAdapter,
  AdapterRegistry,
  defaultRegistry,
  parseStreamUrl,
  getAdapter,
  registerAdapter,
  SUPPORTED_PLATFORMS,
};
