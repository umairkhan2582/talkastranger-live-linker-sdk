# TalkAStranger Live Linker SDK

[![npm version](https://img.shields.io/badge/npm-1.3.0-blue.svg)](https://www.npmjs.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)]()

> Open-source WebRTC broadcast client engine and live stream bridge for real-time video chat creators and multi-platform streaming.

---

## Overview

The **TalkAStranger Live Linker SDK** provides developers with two core capabilities:
1. **WebRTC Broadcast Engine (`WebRTCBroadcaster`)**: Complete client-side management of `RTCPeerConnection`, local media streams (`getUserMedia` / screen capture), SDP offer/answer negotiation, data channels, and real-time stream telemetry metrics.
2. **Platform Stream Adapters (`TalkAStrangerLinker`)**: Validates, normalizes, and connects live stream endpoints across **Kick**, **Twitch**, **YouTube Live**, and **TikTok**.

---

## Features

- **Full WebRTC Lifecycle Management**: Built-in STUN/TURN handling, ICE candidate gathering, and connection state management.
- **Media Stream Handling**: Attach camera, mic, or screen display streams with instant track-level mute/unmute control.
- **Real-Time Data Channel**: Low-latency event and metadata communication between connected peers.
- **Stream Metrics Inspector**: Inspect outbound bitrate, packet counts, frames-per-second, and round-trip time (RTT) via `getMetrics()`.
- **Universal Multi-Platform Linking**: Parse, normalize, and validate live streams from Twitch, Kick, YouTube, and TikTok.

---

## Installation

```bash
npm install talkastranger-live-linker-sdk
```

---

## Quick Start: WebRTC Broadcast Engine

```javascript
const { WebRTCBroadcaster } = require("talkastranger-live-linker-sdk");

// Initialize broadcaster with STUN/TURN servers
const broadcaster = new WebRTCBroadcaster();
const pc = broadcaster.init();

// Listen to ICE candidates to exchange via your signaling channel
broadcaster.on("ice-candidate", (candidate) => {
  signaling.send({ type: "candidate", candidate });
});

// Capture local media and attach to peer connection
navigator.mediaDevices.getUserMedia({ video: true, audio: true })
  .then((stream) => {
    broadcaster.setLocalStream(stream);
  });

// Create SDP Offer for peer negotiation
async function startBroadcast() {
  const offer = await broadcaster.createOffer();
  signaling.send({ type: "offer", sdp: offer.sdp });
}

// Receive SDP Answer from remote peer / signaling server
async function onSignalingMessage(msg) {
  if (msg.type === "answer") {
    await broadcaster.handleAnswer(msg);
  } else if (msg.type === "candidate") {
    await broadcaster.addIceCandidate(msg.candidate);
  }
}

// Inspect real-time stream quality
setInterval(async () => {
  const metrics = await broadcaster.getMetrics();
  console.log("FPS:", metrics.video?.framesPerSecond, "RTT:", metrics.candidatePair?.currentRoundTripTime);
}, 2000);
```

---

## Multi-Platform Stream Linking

```javascript
const { TalkAStrangerLinker } = require("talkastranger-live-linker-sdk");

const linker = new TalkAStrangerLinker({
  creatorUsername: "streamer_pro"
});

// Link external Twitch or Kick stream
const stream = await linker.linkStream({
  platform: "twitch",
  streamUrl: "https://twitch.tv/shroud",
  title: "Championship Live Match"
});

console.log("Linked stream ID:", stream.id);
```

---

## Running Tests

The SDK has comprehensive unit tests covering WebRTC negotiation, stream metrics, and platform adapters:

```bash
npm test
```

---

## License

MIT © [TalkAStranger](https://talkastranger.com)
