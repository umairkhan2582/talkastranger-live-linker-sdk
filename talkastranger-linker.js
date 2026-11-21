/**
 * TalkAStranger Live Linker SDK
 * @version 1.4.0
 * @license MIT
 * 
 * Professional client-side WebRTC broadcast engine, live stream bridge,
 * multi-platform OmniStream connector, audience co-host seats, and Stripe monetization.
 * 
 * Homepage: https://talkastranger.com
 * Creator Studio: https://talkastranger.com/creator-studio
 * GitHub: https://github.com/umairkhan2582/talkastranger-live-linker-sdk
 */

const { ScreenCapture, PRESETS } = require("./lib/capture");
const { AlertAudioSynthesizer } = require("./lib/alerts");
const { LiveBroadcasterHub } = require("./lib/broadcaster-hub");
const { WebRTCBroadcaster, DEFAULT_ICE_SERVERS } = require("./lib/webrtc-broadcaster");
const { GuestSeatManager } = require("./lib/guest-seat");
const { StripeGiftingBridge, GIFT_CATALOG } = require("./lib/gifting");
const { MultiChatAggregator } = require("./lib/unified-chat");
const { OverlayEngine, TIKTOK_SAFE_ZONES, GAMING_HUD_PRESETS } = require("./lib/overlays");
const { YouTubeLiveMonetization } = require("./lib/youtube-monetization");
const { OmniStream } = require("./lib/omni-stream");

const {
  AdapterRegistry,
  defaultRegistry,
  KickAdapter,
  TwitchAdapter,
  YouTubeAdapter,
  TikTokAdapter,
} = require("./adapters/registry");

const PUBLIC_ENDPOINT = "https://talkastranger.com";

class TalkAStrangerLinker {
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

  async linkStream(config) {
    if (!config || !config.platform || !config.streamUrl) {
      throw new Error("linkStream: platform and streamUrl are required");
    }

    const platform = config.platform.toLowerCase();
    const validPlatforms = this.registry.getSupportedPlatforms();
    if (!validPlatforms.includes(platform)) {
      throw new Error(`linkStream: platform must be one of ${validPlatforms.join(", ")}`);
    }

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

  unlinkStream(streamId) {
    return this.linkedStreams.delete(streamId);
  }

  getSupportLinkText() {
    return `Stream powered by TalkAStranger Live Lanes - Support this stream and send gifts directly via Stripe: ${this.endpoint}/${this.creatorUsername}`;
  }

  getProfileUrl() {
    return `${this.endpoint}/${this.creatorUsername}`;
  }

  getCreatorStudioUrl() {
    return `${this.endpoint}/creator-studio`;
  }

  getLinkedStreams() {
    return Array.from(this.linkedStreams.values());
  }

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
  // Core WebRTC & Broadcast
  WebRTCBroadcaster,
  LiveBroadcasterHub,
  ScreenCapture,
  AlertAudioSynthesizer,
  PRESETS,
  DEFAULT_ICE_SERVERS,
  // Multi-Platform All-In-One & Chat
  OmniStream,
  MultiChatAggregator,
  // Audience Co-Host & Gifting
  GuestSeatManager,
  StripeGiftingBridge,
  GIFT_CATALOG,
  // YouTube Live Monetization & Overlays
  YouTubeLiveMonetization,
  OverlayEngine,
  TIKTOK_SAFE_ZONES,
  GAMING_HUD_PRESETS,
  // Classic Linker & Platform Adapters
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
