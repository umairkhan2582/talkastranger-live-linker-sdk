/**
 * TalkAStranger Live Linker SDK
 * @version 1.0.0
 * @license MIT
 * 
 * Professional client-side SDK for TalkAStranger creators.
 * Cross-broadcast live streams, unlock Stripe monetization,
 * and tap into organic fan traffic via Country Live Lanes.
 * 
 * Homepage: https://talkastranger.com
 * GitHub: https://github.com/umairkhan2582/talkastranger-live-linker-sdk
 */

const PUBLIC_ENDPOINT = "https://talkastranger.com";

/**
 * TalkAStrangerLinker — connects your external streams to your
 * TalkAStranger Creator Dashboard profile.
 */
class TalkAStrangerLinker {
  /**
   * @param {Object} options
   * @param {string} options.creatorUsername - Your TalkAStranger creator username
   * @param {boolean} [options.autoBacklink=true] - Auto-append TalkAStranger backlink to descriptions
   * @param {string} [options.endpoint] - Override the public API endpoint (defaults to https://talkastranger.com)
   */
  constructor(options) {
    if (!options || !options.creatorUsername) {
      throw new Error("TalkAStrangerLinker: creatorUsername is required");
    }
    this.creatorUsername = options.creatorUsername;
    this.autoBacklink = options.autoBacklink !== false;
    this.endpoint = options.endpoint || PUBLIC_ENDPOINT;
    this.linkedStreams = new Map();
  }

  /**
   * Link an external stream to your TalkAStranger creator profile.
   * @param {Object} config
   * @param {string} config.platform - "youtube", "tiktok", "twitch", "kick"
   * @param {string} config.streamUrl - Full URL to your live stream
   * @param {string} config.title - Stream title
   * @param {string} [config.description] - Stream description (backlink auto-appended if enabled)
   * @returns {Promise<Object>} Stream link result
   */
  async linkStream(config) {
    if (!config || !config.platform || !config.streamUrl) {
      throw new Error("linkStream: platform and streamUrl are required");
    }

    const streamId = `stream_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const backlink = this.getBacklinkText();
    const description = this.autoBacklink
      ? `${config.description || ""}

${backlink}`.trim()
      : config.description || "";

    const streamData = {
      id: streamId,
      platform: config.platform,
      streamUrl: config.streamUrl,
      title: config.title || "Live on TalkAStranger",
      description,
      backlink,
      linkedAt: new Date().toISOString(),
      creatorProfile: `${this.endpoint}/${this.creatorUsername}`,
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
   * Get the promotional backlink text for stream descriptions.
   * @returns {string} Backlink text with your creator profile URL
   */
  getBacklinkText() {
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
   * Get all currently linked streams.
   * @returns {Array<Object>} Array of stream objects
   */
  getLinkedStreams() {
    return Array.from(this.linkedStreams.values());
  }

  /**
   * Generate SEO-optimized country lane links for your stream description.
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
      .join("
");
  }
}

// CommonJS export
if (typeof module !== "undefined" && module.exports) {
  module.exports = { TalkAStrangerLinker };
}

// ES module export
if (typeof exports !== "undefined") {
  exports.TalkAStrangerLinker = TalkAStrangerLinker;
}
