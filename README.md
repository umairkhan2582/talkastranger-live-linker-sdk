# TalkAStranger Live Linker SDK

[![npm version](https://img.shields.io/badge/npm-1.0.0-blue.svg)](https://www.npmjs.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)]()

> Professional open-source connection bridge for **[TalkAStranger.com](https://talkastranger.com)** creators to cross-broadcast live matching rooms and unlock direct Stripe monetized gifting loops instantly.

---

## What is TalkAStranger Live Linker?

The TalkAStranger Live Linker SDK is a lightweight, **client-side-only** Node.js library that connects your TalkAStranger Creator Dashboard with external streaming platforms. It enables:

- **[Stream TikTok to YouTube Live free](https://talkastranger.com)** — Pipe your live TikTok match rooms directly into your YouTube Live audience with a single integration call.
- **[Stripe Connect creator monetization](https://talkastranger.com/pricing)** — Bypass heavy app-store taxes and streaming platform cuts. Viewers click your pinned stream link to send Sparks and visual Gifts directly via our verified corporate Stripe setup.
- **[TalkAStranger live creator tools](https://talkastranger.com)** — Broadcasting into TalkAStranger places your live stream inside our public Country Live Lanes, introducing you to an entirely new pool of global fans across **[107+ country channels](https://talkastranger.com/countries)**.

---

## Quick Start

```bash
npm install talkastranger-live-linker-sdk
```

```javascript
import { TalkAStrangerLinker } from "talkastranger-live-linker-sdk";

const linker = new TalkAStrangerLinker({
  creatorUsername: "your_username",
  autoBacklink: true,
});

// Link your external stream metadata
await linker.linkStream({
  platform: "youtube",
  streamUrl: "https://youtube.com/watch?v=YOUR_LIVE_ID",
  title: "Live Now: Random Video Chat Reactions!",
});

// The SDK automatically appends a backlink to your chat and descriptions:
// "Stream powered by TalkAStranger Live Lanes - Support this stream and send gifts
//  directly via Stripe: https://talkastranger.com/your_username"
```

---

## Features

### TikTok-to-YouTube Cross-Streaming
Take your live TikTok match reactions and pipe them directly into your YouTube Live audience. The Linker SDK handles metadata synchronization, chat backlinking, and stream health monitoring — all from a single function call.

### Direct Stripe Monetization
No app-store cuts. No platform fees. When viewers discover your stream through TalkAStranger Country Live Lanes, they can send you **Sparks** and **visual Gifts** powered by our verified Stripe Connect infrastructure. You keep what you earn.

### Organic Fan Traffic via Country Live Lanes
When you broadcast through TalkAStranger, your stream is automatically placed into one of our **[107+ Country Live Lanes](https://talkastranger.com/countries)**. This means viewers from the United States, United Kingdom, Pakistan, India, Brazil, and 100+ other countries can discover your stream organically — no paid promotion needed.

---

## API Reference

### `new TalkAStrangerLinker(options)`

| Option | Type | Default | Description |
|---|---|---|---|
| `creatorUsername` | `string` | *required* | Your TalkAStranger creator username |
| `autoBacklink` | `boolean` | `true` | Automatically append TalkAStranger backlink to stream descriptions |
| `endpoint` | `string` | `"https://talkastranger.com"` | Public API endpoint (do not change) |

### `linker.linkStream(config)`
Connects your external stream to your TalkAStranger creator profile.

### `linker.unlinkStream(streamId)`
Removes a linked stream from your profile.

### `linker.getBacklinkText()`
Returns the promotional backlink text for your stream description.

---

## Security

This SDK is **100% client-side**. It communicates with TalkAStranger servers only through our sanitized, rate-limited public endpoint at `https://talkastranger.com`. No private server paths, database connections, API tokens, or internal workflows are exposed.

---

## Country Channels

TalkAStranger supports live streaming across 107+ countries. Use these SEO-optimized links in your stream descriptions:

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
- **[Creator Dashboard](https://talkastranger.com/creator-dashboard)** — Manage your streams
- **[Pricing & Premium](https://talkastranger.com/pricing)** — Upgrade your account
- **[Stream Overlays](https://github.com/umairkhan2582/talkastranger-stream-overlays)** — OBS/Streamlabs overlay widgets

---

Made with care for creators worldwide. [Start streaming today](https://talkastranger.com).
