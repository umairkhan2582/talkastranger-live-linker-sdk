const test = require("node:test");
const assert = require("node:assert/strict");

const {
  OmniStream,
  GuestSeatManager,
  StripeGiftingBridge,
  GIFT_CATALOG,
  MultiChatAggregator,
  OverlayEngine,
  TIKTOK_SAFE_ZONES,
  GAMING_HUD_PRESETS,
  YouTubeLiveMonetization
} = require("../talkastranger-linker");

test("OverlayEngine - TikTok 9:16 safe zones and gaming HUD", () => {
  const engine = new OverlayEngine({ streamerName: "ProGamer", theme: "esports-fps" });
  assert.equal(TIKTOK_SAFE_ZONES.aspectRatio, "9:16");
  assert.equal(TIKTOK_SAFE_ZONES.resolution.width, 1080);
  assert.equal(TIKTOK_SAFE_ZONES.resolution.height, 1920);

  const css = engine.getTikTokSafeZoneCss();
  assert.ok(css.includes(".tiktok-safe-container"));
  assert.ok(css.includes(".tiktok-hud-cam"));

  const html = engine.generateGamingHudHtml({ gameTitle: "Valorant Champions" });
  assert.ok(html.includes("ProGamer"));
  assert.ok(html.includes("Valorant Champions"));

  const obsUrl = engine.generateObsBrowserSourceUrl({
    streamerUsername: "progamer",
    theme: "neon-cyberpunk",
    mode: "vertical"
  });
  assert.ok(obsUrl.includes("streamerUsername=progamer"));
  assert.ok(obsUrl.includes("theme=neon-cyberpunk"));
  assert.ok(obsUrl.includes("mode=vertical"));
});

test("GuestSeatManager - creates signed invites and manages audience co-hosts", () => {
  const manager = new GuestSeatManager({ hostId: "streamer_uma", maxGuests: 3 });
  const invite = manager.createInviteToken({ ttlMinutes: 30 });

  assert.ok(invite.token);
  assert.ok(invite.joinUrl.includes("token="));

  const verification = manager.verifyInviteToken(invite.token);
  assert.equal(verification.valid, true);
  assert.equal(verification.payload.hostId, "streamer_uma");

  const badToken = manager.verifyInviteToken("fake.token");
  assert.equal(badToken.valid, false);

  // Admit guests
  const g1 = manager.requestJoin({ nickname: "Alice" });
  const g2 = manager.requestJoin({ nickname: "Bob" });
  const g3 = manager.requestJoin({ nickname: "Charlie" });
  assert.equal(g1.status, "admitted");
  assert.equal(g2.status, "admitted");
  assert.equal(g3.status, "admitted");

  // 4th guest should be queued
  const g4 = manager.requestJoin({ nickname: "Dave" });
  assert.equal(g4.status, "queued");
  assert.equal(g4.queuePosition, 1);

  // Mute control
  manager.setMute(g1.guest.id, { audio: true, video: false });
  const seats = manager.getSeats();
  assert.equal(seats.activeCount, 3);
  assert.equal(seats.guests[0].mutedAudio, true);

  // Removing a guest promotes the queued guest
  manager.removeGuest(g1.guest.id);
  const updatedSeats = manager.getSeats();
  assert.equal(updatedSeats.activeCount, 3);
  assert.ok(updatedSeats.guests.some(g => g.nickname === "Dave"));
});

test("StripeGiftingBridge - live gifting tiers and Stripe Connect checkout payload", () => {
  const bridge = new StripeGiftingBridge({
    creatorAccountId: "acct_123456789",
    streamerUsername: "uma_live"
  });

  const catalog = bridge.getGiftCatalog();
  assert.ok(catalog.length >= 7);
  assert.equal(GIFT_CATALOG.rose.priceUSD, 1.0);
  assert.equal(GIFT_CATALOG.universe.priceUSD, 100.0);

  const checkout = bridge.createGiftCheckoutConfig({
    giftId: "crown",
    viewerName: "SuperFan99",
    message: "Incredible play!"
  });

  assert.equal(checkout.mode, "payment");
  assert.equal(checkout.payment_intent_data.transfer_data.destination, "acct_123456789");
  assert.equal(checkout.line_items[0].price_data.unit_amount, 1000); // $10.00 in cents
  assert.equal(checkout.metadata.giftId, "crown");

  // Receiving gift emits event
  let received = null;
  bridge.on("gift:received", (e) => { received = e; });
  bridge.recordGiftReceived({ giftId: "crown", viewerName: "SuperFan99" });
  assert.ok(received);
  assert.equal(received.giftName, "Golden Crown");
  assert.equal(received.sound, "crown");
});

test("YouTubeLiveMonetization - pay-per-view gate and 0% direct tip session", () => {
  const yt = new YouTubeLiveMonetization({
    creatorAccountId: "acct_yt_creator_99"
  });

  const ppv = yt.createPayPerViewSession({
    broadcastId: "live_stream_abc123",
    title: "Exclusive Pro Masterclass",
    ticketPriceUSD: 14.99
  });

  assert.ok(ppv.ticketId);
  assert.ok(ppv.accessToken);
  assert.equal(ppv.checkoutConfig.line_items[0].price_data.unit_amount, 1499);
  assert.equal(ppv.checkoutConfig.payment_intent_data.transfer_data.destination, "acct_yt_creator_99");

  // Verify access token
  const auth = yt.verifyTicketAccess(ppv.accessToken, "live_stream_abc123");
  assert.equal(auth.authorized, true);
  assert.equal(auth.ticket.broadcastId, "live_stream_abc123");

  const mismatch = yt.verifyTicketAccess(ppv.accessToken, "different_broadcast");
  assert.equal(mismatch.authorized, false);

  // Direct 0% fee tip config vs 30% SuperChat
  const tipConfig = yt.createDirectTipConfig({
    broadcastId: "live_stream_abc123",
    amountUSD: 20.0,
    viewerName: "Sam"
  });
  assert.equal(tipConfig.comparisonVsSuperChat.youtubeSuperChatDeduction, "30% (Avoided)");
  assert.equal(tipConfig.stripeConfig.line_items[0].price_data.unit_amount, 2000);
});

test("MultiChatAggregator - filters banned words and rate limits messages", () => {
  const chat = new MultiChatAggregator({ slowModeSeconds: 1 });
  chat.addBannedWord("badword");

  let receivedMessages = [];
  chat.on("chat:message", (msg) => { receivedMessages.push(msg); });

  const clean = chat.ingestMessage({
    platform: "twitch",
    username: "user1",
    message: "Hello world!"
  });
  assert.ok(clean);
  assert.equal(receivedMessages.length, 1);

  // Filtered message
  const filtered = chat.ingestMessage({
    platform: "youtube",
    username: "troll",
    message: "This is a BADWORD here!"
  });
  assert.equal(filtered, null);
  assert.equal(receivedMessages.length, 1);
});

test("OmniStream - connectAll in one go across multiple platforms", () => {
  const omni = new OmniStream({
    streamerName: "Umair",
    streamerUsername: "umairkhan",
    stripeAccountId: "acct_live_streamer"
  });

  const connection = omni.connectAll({
    twitch: "https://twitch.tv/umairlive",
    youtube: "https://youtube.com/@umairlive",
    kick: "https://kick.com/umairlive",
    talkastranger: { lane: "us" }
  });

  assert.equal(connection.success, true);
  assert.ok(connection.connectedDestinations.twitch);
  assert.ok(connection.connectedDestinations.youtube);
  assert.ok(connection.connectedDestinations.kick);
  assert.ok(connection.connectedDestinations.talkastranger);

  const telemetry = omni.getDashboardTelemetry();
  assert.equal(telemetry.streamer, "Umair");
  assert.equal(telemetry.isBroadcasting, true);
  assert.equal(telemetry.connectedDestinations.length, 4);

  omni.disconnectAll();
  assert.equal(omni.isBroadcasting, false);
});
