const test = require("node:test");
const assert = require("node:assert/strict");
const { EventEmitter } = require("node:events");
const { WebRTCBroadcaster, DEFAULT_ICE_SERVERS } = require("/tmp/webrtc-broadcaster");

// Mock RTCPeerConnection for Node.js testing
class MockRTCPeerConnection extends EventEmitter {
  constructor(config) {
    super();
    this.config = config;
    this.connectionState = "new";
    this.iceConnectionState = "new";
    this.localDescription = null;
    this.remoteDescription = null;
    this.tracks = [];
    this.dataChannel = null;
  }

  createDataChannel(label, options) {
    const dc = new EventEmitter();
    dc.label = label;
    dc.options = options;
    dc.readyState = "open";
    dc.send = (data) => dc.emit("mock-sent", data);
    dc.close = () => {
      dc.readyState = "closed";
      dc.emit("close");
    };
    this.dataChannel = dc;
    return dc;
  }

  addTrack(track, stream) {
    this.tracks.push({ track, stream });
    return { track };
  }

  async createOffer(opts) {
    return { type: "offer", sdp: "v=0\r\no=mock 12345 2 IN IP4 127.0.0.1\r\ns=MockOffer\r\n" };
  }

  async createAnswer(opts) {
    return { type: "answer", sdp: "v=0\r\no=mock 12345 2 IN IP4 127.0.0.1\r\ns=MockAnswer\r\n" };
  }

  async setLocalDescription(desc) {
    this.localDescription = desc;
  }

  async setRemoteDescription(desc) {
    this.remoteDescription = desc;
  }

  async addIceCandidate(cand) {
    return true;
  }

  async getStats() {
    const map = new Map();
    map.set("v1", {
      type: "outbound-rtp",
      kind: "video",
      framesPerSecond: 30,
      bytesSent: 1048576,
      packetsSent: 1000,
    });
    map.set("a1", {
      type: "outbound-rtp",
      kind: "audio",
      bytesSent: 65536,
      packetsSent: 500,
    });
    map.set("p1", {
      type: "candidate-pair",
      state: "succeeded",
      currentRoundTripTime: 0.025,
      availableOutgoingBitrate: 2500000,
    });
    return map;
  }

  close() {
    this.connectionState = "closed";
  }
}

test("WebRTCBroadcaster - initialization and defaults", () => {
  const broadcaster = new WebRTCBroadcaster({
    RTCPeerConnection: MockRTCPeerConnection,
  });

  assert.equal(broadcaster.iceServers, DEFAULT_ICE_SERVERS);
  const pc = broadcaster.init();
  assert.ok(pc);
  assert.equal(broadcaster.connectionState, "new");
  assert.ok(broadcaster.dataChannel);
  assert.equal(broadcaster.dataChannel.label, "talkastranger-meta");
});

test("WebRTCBroadcaster - SDP offer creation and answer handling", async () => {
  const broadcaster = new WebRTCBroadcaster({
    RTCPeerConnection: MockRTCPeerConnection,
  });
  broadcaster.init();

  const offer = await broadcaster.createOffer();
  assert.equal(offer.type, "offer");
  assert.ok(offer.sdp.includes("MockOffer"));

  await broadcaster.handleAnswer({ type: "answer", sdp: "MockAnswer" });
  assert.equal(broadcaster.peerConnection.remoteDescription.type, "answer");
});

test("WebRTCBroadcaster - Media track attachment and mute controls", () => {
  const broadcaster = new WebRTCBroadcaster({
    RTCPeerConnection: MockRTCPeerConnection,
  });
  broadcaster.init();

  const audioTrack = { kind: "audio", enabled: true, stop() {} };
  const videoTrack = { kind: "video", enabled: true, stop() {} };
  const mockStream = {
    getTracks: () => [audioTrack, videoTrack],
    getAudioTracks: () => [audioTrack],
    getVideoTracks: () => [videoTrack],
  };

  broadcaster.setLocalStream(mockStream);
  assert.equal(broadcaster.peerConnection.tracks.length, 2);

  broadcaster.setAudioEnabled(false);
  assert.equal(audioTrack.enabled, false);

  broadcaster.setVideoEnabled(false);
  assert.equal(videoTrack.enabled, false);
});

test("WebRTCBroadcaster - Data channel messaging", (t, done) => {
  const broadcaster = new WebRTCBroadcaster({
    RTCPeerConnection: MockRTCPeerConnection,
  });
  broadcaster.init();

  broadcaster.on("message", (msg) => {
    assert.deepEqual(msg, { event: "tip", amount: 10 });
    done();
  });

  // Simulate incoming data message
  broadcaster.dataChannel.onmessage({ data: JSON.stringify({ event: "tip", amount: 10 }) });
});

test("WebRTCBroadcaster - Metrics retrieval", async () => {
  const broadcaster = new WebRTCBroadcaster({
    RTCPeerConnection: MockRTCPeerConnection,
  });
  broadcaster.init();

  const metrics = await broadcaster.getMetrics();
  assert.equal(metrics.available, true);
  assert.equal(metrics.video.framesPerSecond, 30);
  assert.equal(metrics.audio.packetsSent, 500);
  assert.equal(metrics.candidatePair.currentRoundTripTime, 0.025);
});
