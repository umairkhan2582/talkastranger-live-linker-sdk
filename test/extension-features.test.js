const test = require("node:test");
const assert = require("node:assert/strict");
const { EventEmitter } = require("node:events");
const { ScreenCapture, PRESETS } = require("../lib/capture");
const { AlertAudioSynthesizer } = require("../lib/alerts");
const { LiveBroadcasterHub } = require("../lib/broadcaster-hub");

// Mock RTCPeerConnection for Hub test
class MockPeer extends EventEmitter {
  constructor(config) {
    super();
    this.config = config;
    this.connectionState = "new";
    this.tracks = [];
    this.localDescription = null;
    this.remoteDescription = null;
  }
  addTrack(track, stream) {
    this.tracks.push({ track, stream });
  }
  getSenders() {
    return this.tracks.map(({ track }) => ({
      track,
      replaceTrack: async (newT) => { this.tracks[0].track = newT; }
    }));
  }
  async createOffer() {
    return { type: "offer", sdp: "v=0\r\no=broadcaster-hub\r\n" };
  }
  async setLocalDescription(desc) { this.localDescription = desc; }
  async setRemoteDescription(desc) { this.remoteDescription = desc; }
  async addIceCandidate(cand) { return true; }
  close() { this.connectionState = "closed"; }
}

test("ScreenCapture - resolution presets", () => {
  assert.equal(PRESETS["720p"].width, 1280);
  assert.equal(PRESETS["1080p"].width, 1920);
  assert.equal(PRESETS["1080p60"].frameRate, 60);
  assert.equal(PRESETS["4k"].height, 2160);
});

test("AlertAudioSynthesizer - instantiation and safe no-ops in headless environments", () => {
  const synth = new AlertAudioSynthesizer();
  assert.ok(synth);
  // Should not throw even in Node where window.AudioContext is undefined
  assert.doesNotThrow(() => synth.playSparkAlert());
  assert.doesNotThrow(() => synth.playHeartAlert());
  assert.doesNotThrow(() => synth.playCrownAlert());
});

test("LiveBroadcasterHub - multi-viewer peer session lifecycle", async () => {
  const hub = new LiveBroadcasterHub({
    RTCPeerConnection: MockPeer,
  });

  const mockTrack = { kind: "video", stop() {} };
  const mockStream = {
    getTracks: () => [mockTrack],
  };
  hub.setStream(mockStream);

  // Viewer 1 connects
  const offer1 = await hub.createViewerSession("viewer_alpha");
  assert.equal(offer1.type, "offer");
  assert.equal(hub.getViewerCount(), 1);

  // Viewer 2 connects
  const offer2 = await hub.createViewerSession("viewer_beta");
  assert.equal(offer2.type, "offer");
  assert.equal(hub.getViewerCount(), 2);

  // Viewer 1 sends answer
  await hub.handleViewerAnswer("viewer_alpha", { type: "answer", sdp: "remote-answer" });

  // Viewer 1 leaves
  hub.closeViewerSession("viewer_alpha");
  assert.equal(hub.getViewerCount(), 1);

  // Close all
  hub.closeAll();
  assert.equal(hub.getViewerCount(), 0);
});
