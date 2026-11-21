# TalkAStranger Live Linker SDK

[![npm version](https://img.shields.io/badge/npm-1.4.0-blue.svg)](https://www.npmjs.com/package/talkastranger-live-linker-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)]()
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

> Open-source WebRTC broadcast engine, multi-platform OmniStream bridge, audience co-host seats, and Stripe Connect live gifting for creators.

---

## What's New in v1.4.0

- 🚀 **`OmniStream` (Connect-All-in-One)**: Launch multi-platform broadcasts to TalkAStranger, Twitch, YouTube, TikTok, and Kick with a single command.
- 👥 **Audience "Guest Seat" Co-Hosting**: Generate 1-click signed WebRTC invites for audience members to join live on stage (picture-in-picture video/audio).
- 🎁 **Stripe Connect Live Gifting**: Direct 0%-cut creator tipping with animated on-screen gifts (Rose, Diamond, Crown, Dragon, Galaxy, Universe) and Web Audio chimes.
- 💰 **YouTube Live Monetization Gate**: Pay-Per-View ticket pass generation and 0%-platform-cut tipping alternative to YouTube SuperChat (bypassing the 30% platform fee).
- 💬 **Unified Multi-Chat Aggregator**: Ingest and normalize chat across Twitch, YouTube Live, TikTok, and TalkAStranger with built-in profanity filters and slow mode.
- 📱 **TikTok 9:16 Safe Zones & Gaming HUDs**: Vertical mobile layout templates respecting TikTok UI safe zones, plus customizable esports and cyberpunk overlays.

---

## Installation

```bash
npm install talkastranger-live-linker-sdk
```

---

## Quick Start

### 1. Connect All Platforms in One Go (`OmniStream`)

```javascript
const { OmniStream } = require("talkastranger-live-linker-sdk");

const omni = new OmniStream({
  streamerName: "Umair",
  streamerUsername: "umairkhan",
  stripeAccountId: "acct_1Nxxxxxxxxxxxx" // Stripe Connect Express ID
});

// Broadcast everywhere at once
const session = omni.connectAll({
  talkastranger: { lane: "us" },
  twitch: "https://twitch.tv/umairlive",
  youtube: "https://youtube.com/@umairlive",
  kick: "https://kick.com/umairlive"
});

console.log("Connected destinations:", session.connectedDestinations);

// Real-time telemetry dashboard
console.log(omni.getDashboardTelemetry());
```

---

### 2. Audience "Guest Seat" Co-Hosting (`GuestSeatManager`)

Invite viewers from chat to join your live broadcast via WebRTC:

```javascript
const { GuestSeatManager } = require("talkastranger-live-linker-sdk");

const guestSeats = new GuestSeatManager({ hostId: "umairkhan", maxGuests: 3 });

// Generate a signed 30-minute guest invite link
const invite = guestSeats.createInviteToken({ ttlMinutes: 30 });
console.log("Share this link in chat:", invite.joinUrl);

// When a viewer clicks join
guestSeats.requestJoin({ id: "viewer_42", nickname: "GamerAlex" });

// Host mute controls
guestSeats.setMute("viewer_42", { audio: true, video: false });
```

---

### 3. Stripe Connect Live Gifting (`StripeGiftingBridge`)

Let viewers tip directly to your Stripe account with real-time alerts:

```javascript
const { StripeGiftingBridge } = require("talkastranger-live-linker-sdk");

const gifting = new StripeGiftingBridge({
  creatorAccountId: "acct_1Nxxxxxxxxxxxx",
  streamerUsername: "umairkhan"
});

// Create checkout session for a $10.00 "Golden Crown" gift
const checkoutConfig = gifting.createGiftCheckoutConfig({
  giftId: "crown",
  viewerName: "SuperFan42",
  message: "GG incredible ace!"
});

// On payment webhook, play sound & display on-screen gift
gifting.recordGiftReceived({
  giftId: "crown",
  viewerName: "SuperFan42"
});
```

---

### 4. YouTube Live Paywall & Pro Tipping (`YouTubeLiveMonetization`)

Monetize exclusive YouTube Live broadcasts or offer 0%-cut tipping:

```javascript
const { YouTubeLiveMonetization } = require("talkastranger-live-linker-sdk");

const yt = new YouTubeLiveMonetization({
  creatorAccountId: "acct_1Nxxxxxxxxxxxx"
});

// Create a $15 Pay-Per-View live stream pass
const ppv = yt.createPayPerViewSession({
  broadcastId: "yt_broadcast_id_here",
  title: "VIP Tournament Finals Pass",
  ticketPriceUSD: 14.99
});

// Verify ticket access token when viewer joins
const access = yt.verifyTicketAccess(ppv.accessToken, "yt_broadcast_id_here");
if (access.authorized) {
  console.log("Access granted to viewer");
}

// Direct Stripe tip alternative to YouTube SuperChat (bypassing 30% cut)
const tipConfig = yt.createDirectTipConfig({
  broadcastId: "yt_broadcast_id_here",
  amountUSD: 25.0,
  viewerName: "VIP Supporter"
});
```

---

### 5. TikTok 9:16 Safe Zones & Gaming Overlays

```javascript
const { OverlayEngine, TIKTOK_SAFE_ZONES } = require("talkastranger-live-linker-sdk");

const overlays = new OverlayEngine({ streamerName: "Umair", theme: "esports-fps" });

// Generate standalone HTML HUD
const hudHtml = overlays.generateGamingHudHtml({ gameTitle: "Valorant" });

// Get OBS Browser Source URL with parameters
const obsUrl = overlays.generateObsBrowserSourceUrl({
  streamerUsername: "umairkhan",
  theme: "neon-cyberpunk",
  mode: "vertical"
});
```

---

## Running Tests

```bash
npm test
```

Includes 39 automated unit tests verifying WebRTC negotiation, adapters, OmniStream, guest co-hosting, Stripe Connect checkout payloads, and chat filters.

---

## License

MIT © [TalkAStranger](https://talkastranger.com)
