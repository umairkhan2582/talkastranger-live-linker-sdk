# TalkAStranger Live Linker SDK

[![npm version](https://img.shields.io/badge/npm-1.2.0-blue.svg)](https://www.npmjs.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)]()

> Professional open-source connection bridge for **[TalkAStranger.com](https://talkastranger.com)** creators to cross-broadcast live matching rooms and unlock direct Stripe monetized gifting loops instantly across **Kick**, **Twitch**, **TikTok**, and **YouTube**.

---

## What is TalkAStranger Live Linker?

The TalkAStranger Live Linker SDK is a lightweight, **client-side-only** Node.js library that connects your TalkAStranger Creator Studio with external streaming platforms. It enables:

- **Kick.com Live Streaming** — Link your Kick stream directly into TalkAStranger Country Live Lanes with strict channel validation and normalized metadata.
- **Twitch Stream Linking** — Connect your Twitch channel with automated channel regex parsing, case normalization, and deep audience integration.
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
import { TalkAStrangerLinker, parseStreamUrl } from "talkastranger-live-linker-sdk";

const linker = new TalkAStrangerLinker({
  creatorUsername: "your_username",
  autoSupportLink: true,
});

// 1. Link a Kick.com stream
await linker.linkStream({
  platform: "kick",
  streamUrl: "https://kick.com/your_channel",
  title: "Live on Kick: Random Video Chat Reactions!",
});

// 2. Link a Twitch stream
await linker.linkStream({
  platform: "twitch",
  streamUrl: "https://www.twitch.tv/your_channel",
  title: "Streaming live reactions with fans worldwide",
});

// 3. Link TikTok or YouTube
await linker.linkStream({
  platform: "tiktok",
  streamUrl: "https://www.tiktok.com/@your_username/live",
});
```

---

## Platform Adapters

### Kick.com Adapter
- **Supported URL Formats:**
  - `https://kick.com/channel`
  - `https://www.kick.com/channel`
  - Protocol-relative `//kick.com/channel`
  - Trailing slashes, query parameters, and fragments
- **Security & Validation:**
  - Strict hostname validation (strictly `kick.com` or `www.kick.com`, rejecting lookalikes such as `kick.com.fake.com` or `notkick.com`).
  - Channel regex parser matching `^[a-zA-Z0-9_-]{1,50}$`.
  - Rejection of reserved platform routes (`/categories`, `/following`, `/leaderboard`, `/video`, etc.).

### Twitch Adapter
- **Supported URL Formats:**
  - `https://twitch.tv/channel`
  - `https://www.twitch.tv/channel`
  - `https://m.twitch.tv/channel`
- **Security & Validation:**
  - Strict hostname validation (strictly `twitch.tv`, `www.twitch.tv`, or `m.twitch.tv`).
  - Channel regex validation matching Twitch specification (`^[a-zA-Z0-9_]{3,25}$`).
  - Automatic case normalization (lowercasing channel identifiers).
  - Rejection of reserved paths (`/directory`, `/videos`, `/moderator`, `/settings`, etc.).

---

## API Reference

### `new TalkAStrangerLinker(options)`

| Option | Type | Default | Description |
|---|---|---|---|
| `creatorUsername` | `string` | *required* | Your TalkAStranger creator username |
| `autoSupportLink` | `boolean` | `true` | Automatically append TalkAStranger support link to stream descriptions |
| `endpoint` | `string` | `"https://talkastranger.com"` | Public API endpoint (defaults to https://talkastranger.com) |

### `linker.linkStream(config)`
Connects your external stream to your TalkAStranger creator profile.
- **Supported platforms:** `kick`, `twitch`, `tiktok`, `youtube`
- **Returns:** Promise resolving to `LinkedStreamData` containing `id`, `platform`, `channelId`, `streamUrl`, `supportLink`, and `metadata`.

### `parseStreamUrl(urlString, preferredPlatform?)`
Utility function to parse any supported stream URL, validate hostnames, and return normalized metadata.

---

## Testing

Run the isolated test suite using Node.js native test runner:

```bash
npm test
```

---

## License

MIT — Free to use, modify, and distribute. See [LICENSE](LICENSE) for details.
