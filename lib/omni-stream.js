const { EventEmitter } = require("events");
const { defaultRegistry } = require("../adapters/registry");
const { WebRTCBroadcaster } = require("./webrtc-broadcaster");
const { LiveBroadcasterHub } = require("./broadcaster-hub");
const { ScreenCapture } = require("./capture");
const { AlertAudioSynthesizer } = require("./alerts");
const { GuestSeatManager } = require("./guest-seat");
const { StripeGiftingBridge } = require("./gifting");
const { MultiChatAggregator } = require("./unified-chat");
const { OverlayEngine } = require("./overlays");
const { YouTubeLiveMonetization } = require("./youtube-monetization");

class OmniStream extends EventEmitter {
  constructor(options = {}) {
    super();
    this.streamerName = options.streamerName || "Creator";
    this.streamerUsername = options.streamerUsername || "creator";
    this.stripeAccountId = options.stripeAccountId || null;
    this.registry = options.registry || defaultRegistry;

    // Submodules
    this.broadcaster = new WebRTCBroadcaster(options.webrtc || {});
    this.hub = new LiveBroadcasterHub();
    this.capture = new ScreenCapture();
    this.alerts = new AlertAudioSynthesizer();
    this.guestSeats = new GuestSeatManager({ hostId: this.streamerUsername });
    this.gifting = new StripeGiftingBridge({
      creatorAccountId: this.stripeAccountId,
      streamerUsername: this.streamerUsername
    });
    this.chat = new MultiChatAggregator();
    this.overlays = new OverlayEngine({ streamerName: this.streamerName });
    this.youtubeMonetization = new YouTubeLiveMonetization({
      creatorAccountId: this.stripeAccountId
    });

    this.destinations = new Map();
    this.isBroadcasting = false;
    this.startedAt = null;

    // Forward internal gifting events to audio alerts
    this.gifting.on("gift:received", (gift) => {
      this.alerts.triggerGiftAlert(gift.sound || "spark");
      this.emit("gift", gift);
    });
  }

  connectAll(destinations = {}) {
    const results = {};
    const errors = {};

    // Validate destinations using adapter registry
    for (const [platform, config] of Object.entries(destinations)) {
      if (!config) continue;
      const url = typeof config === "string" ? config : config.url;
      try {
        const adapter = this.registry.get(platform);
        if (adapter) {
          const parsed = adapter.parse(url);
          this.destinations.set(platform, { url, parsed, status: "connected" });
          results[platform] = { connected: true, details: parsed };
        } else if (platform === "talkastranger") {
          this.destinations.set("talkastranger", {
            url: "https://talkastranger.com",
            status: "connected",
            lane: config.lane || "global"
          });
          results["talkastranger"] = { connected: true, lane: config.lane || "global" };
        } else {
          errors[platform] = `Unsupported destination adapter: ${platform}`;
        }
      } catch (err) {
        errors[platform] = err.message;
      }
    }

    this.isBroadcasting = true;
    this.startedAt = Date.now();
    this.emit("broadcast:started", { destinations: results, errors });

    return {
      success: Object.keys(results).length > 0,
      connectedDestinations: results,
      errors: Object.keys(errors).length > 0 ? errors : null
    };
  }

  disconnectAll() {
    this.isBroadcasting = false;
    this.destinations.clear();
    this.hub.closeAll();
    this.broadcaster.close();
    this.emit("broadcast:stopped");
  }

  getDashboardTelemetry() {
    return {
      streamer: this.streamerName,
      isBroadcasting: this.isBroadcasting,
      uptimeSeconds: this.startedAt ? Math.floor((Date.now() - this.startedAt) / 1000) : 0,
      connectedDestinations: Array.from(this.destinations.keys()),
      guestSeats: this.guestSeats.getSeats(),
      viewersConnected: this.hub.getViewerCount(),
      broadcasterMetrics: this.broadcaster.getMetrics()
    };
  }
}

module.exports = {
  OmniStream
};
