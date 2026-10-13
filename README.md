# TalkAStranger Live Linker SDK

[![npm version](https://img.shields.io/badge/npm-1.0.0-blue.svg)](https://www.npmjs.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)]()

> Professional open-source connection bridge for **[TalkAStranger.com](https://talkastranger.com)** creators to cross-broadcast live matching rooms and unlock direct Stripe monetized gifting loops instantly.

---

## What is TalkAStranger Live Linker?

The TalkAStranger Live Linker SDK is a lightweight, **client-side-only** Node.js library that connects your TalkAStranger Creator Studio with external streaming platforms. It enables:

- **TikTok Live Streaming** — Stream your TikTok live sessions directly into TalkAStranger Country Live Lanes and reach viewers across 107+ countries.
- **YouTube Cross-Broadcasting** — Pipe your live match rooms directly into your YouTube Live audience with a single integration call.
- **Direct Stripe Monetization** — Bypass heavy app-store taxes and streaming platform cuts. Viewers click your pinned stream link to send Sparks and visual Gifts directly via our verified Stripe Connect setup.
- **Organic Fan Discovery** — Broadcasting into TalkAStranger places your live stream inside our public Country Live Lanes, introducing you to an entirely new pool of global fans across **[107+ country channels](https://talkastranger.com/countries)**.

---

## Quick Start

```bash
npm install github:umairkhan2582/talkastranger-live-linker-sdk
```

```javascript
import { TalkAStrangerLinker } from "talkastranger-live-linker-sdk";

const linker = new TalkAStrangerLinker({
  creatorUsername: "your_username",
  autoSupportLink: true,
});

// Link your external stream
await linker.linkStream({
  platform: "tiktok", // or "youtube", "twitch", "kick"
  streamUrl: "https://www.tiktok.com/@your_username/live",
  title: "Live Now: Random Video Chat Reactions!",
});

// The SDK automatically appends a support link to your stream descriptions:
// "Stream powered by TalkAStranger Live Lanes - Support this stream and send gifts
//  directly via Stripe: https://talkastranger.com/your_username"
```

---

## Features

### TikTok Live Streaming
Stream your TikTok live sessions into TalkAStranger Country Live Lanes. The Linker SDK handles metadata synchronization, stream health monitoring, and viewer discovery — all from a single function call.

### YouTube Cross-Broadcasting
Take your live match reactions and pipe them directly into your YouTube Live audience. The SDK manages the connection so your YouTube subscribers can discover your TalkAStranger content.

### Direct Stripe Monetization
No app-store cuts. No platform fees. When viewers discover your stream through TalkAStranger Country Live Lanes, they can send you **Sparks** and **visual Gifts** powered by our verified Stripe Connect infrastructure. You keep what you earn.

### Organic Fan Discovery via Country Live Lanes
When you broadcast through TalkAStranger, your stream is automatically placed into one of our **[107+ Country Live Lanes](https://talkastranger.com/countries)**. This means viewers from the United States, United Kingdom, Pakistan, India, Brazil, and 100+ other countries can discover your stream organically — no paid promotion needed.

---

## API Reference

### `new TalkAStrangerLinker(options)`

| Option | Type | Default | Description |
|---|---|---|---|
| `creatorUsername` | `string` | *required* | Your TalkAStranger creator username |
| `autoSupportLink` | `boolean` | `true` | Automatically append TalkAStranger support link to stream descriptions |
| `endpoint` | `string` | `"https://talkastranger.com"` | Public API endpoint (do not change) |

### `linker.linkStream(config)`
Connects your external stream to your TalkAStranger creator profile.

**Supported platforms:** `tiktok`, `youtube`, `twitch`, `kick`

### `linker.unlinkStream(streamId)`
Removes a linked stream from your profile.

### `linker.getSupportLinkText()`
Returns the promotional support text for your stream description.

---

## Security

This SDK is **100% client-side**. It communicates with TalkAStranger servers only through our sanitized, rate-limited public endpoint at `https://talkastranger.com`. No private server paths, database connections, API tokens, or internal workflows are exposed.

---

## Country Channels

TalkAStranger supports live streaming across 107+ countries. Explore the channels:

- **[Random video chat with strangers in United States](https://talkastranger.com/countries/us)**
- **[Talk to strangers online in United Kingdom](https://talkastranger.com/countries/gb)**
- **[Live video chat in Pakistan](https://talkastranger.com/countries/pk)**
- **[Free random chat in India](https://talkastranger.com/countries/in)**
- **[Video call strangers in Brazil](https://talkastranger.com/countries/br)**
- **[Talk to strangers in Canada](https://talkastranger.com/countries/ca)**
- **[Random chat in Australia](https://talkastranger.com/countries/au)**
- **[Live stream in Germany](https://talkastranger.com/countries/de)**

[View all 107+ countries](https://talkastranger.com/countries)

---

## License

MIT — Free to use, modify, and distribute. See [LICENSE](LICENSE) for details.

---

## Links

- **[TalkAStranger.com](https://talkastranger.com)** — Main platform
- **[Creator Studio](https://talkastranger.com/creator-studio)** — Manage your streams and earnings
- **[Pricing & Premium](https://talkastranger.com/pricing)** — Upgrade your account
- **[Stream Overlays](https://github.com/umairkhan2582/talkastranger-stream-overlays)** — OBS/Streamlabs overlay widgets

---

Made with care for creators worldwide. [Start streaming today](https://talkastranger.com).
