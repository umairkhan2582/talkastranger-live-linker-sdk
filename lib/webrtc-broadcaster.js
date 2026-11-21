const { EventEmitter } = require("node:events");

const DEFAULT_ICE_SERVERS = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
  { urls: "stun:stun2.l.google.com:19302" },
];

/**
 * WebRTCBroadcaster manages peer connection lifecycle, media tracks,
 * SDP negotiation, and data channel communication for live streaming.
 */
class WebRTCBroadcaster extends EventEmitter {
  constructor(options = {}) {
    super();
    this.iceServers = options.iceServers || DEFAULT_ICE_SERVERS;
    this.RTCPeerConnectionClass =
      options.RTCPeerConnection ||
      (typeof globalThis !== "undefined" ? globalThis.RTCPeerConnection : null);

    this.enableDataChannel = options.enableDataChannel !== false;
    this.dataChannelLabel = options.dataChannelLabel || "talkastranger-meta";

    this.peerConnection = null;
    this.localStream = null;
    this.remoteStream = null;
    this.dataChannel = null;
    this.connectionState = "new";
    this.iceConnectionState = "new";
    this.pendingCandidates = [];
  }

  init(customConfig = {}) {
    if (!this.RTCPeerConnectionClass) {
      throw new Error(
        "RTCPeerConnection is not available in the current environment. " +
          "In Node.js, pass a polyfill (e.g. @koush/wrtc or node-webrtc) via options.RTCPeerConnection."
      );
    }

    if (this.peerConnection) {
      this.close();
    }

    const config = {
      iceServers: this.iceServers,
      ...customConfig,
    };

    this.peerConnection = new this.RTCPeerConnectionClass(config);

    this.peerConnection.onicecandidate = (event) => {
      if (event && event.candidate) {
        this.emit("ice-candidate", event.candidate);
      }
    };

    this.peerConnection.onconnectionstatechange = () => {
      this.connectionState = this.peerConnection.connectionState;
      this.emit("connection-state", this.connectionState);
    };

    this.peerConnection.oniceconnectionstatechange = () => {
      this.iceConnectionState = this.peerConnection.iceConnectionState;
      this.emit("ice-state", this.iceConnectionState);
    };

    this.peerConnection.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        this.remoteStream = event.streams[0];
      }
      this.emit("track", event);
    };

    if (this.enableDataChannel) {
      this._setupDataChannel();
    }

    this.peerConnection.ondatachannel = (event) => {
      this._bindDataChannelEvents(event.channel);
      this.emit("datachannel", event.channel);
    };

    return this.peerConnection;
  }

  _setupDataChannel() {
    if (!this.peerConnection) return;
    try {
      this.dataChannel = this.peerConnection.createDataChannel(
        this.dataChannelLabel,
        { ordered: true }
      );
      this._bindDataChannelEvents(this.dataChannel);
    } catch (err) {
      this.emit("error", err);
    }
  }

  _bindDataChannelEvents(channel) {
    if (!channel) return;
    channel.onopen = () => this.emit("datachannel-open", channel);
    channel.onclose = () => this.emit("datachannel-close", channel);
    channel.onerror = (err) => this.emit("datachannel-error", err);
    channel.onmessage = (event) => {
      let data = event.data;
      try {
        data = JSON.parse(event.data);
      } catch {}
      this.emit("message", data);
    };
  }

  setLocalStream(stream) {
    this.localStream = stream;
    if (!this.peerConnection || !stream) return;

    if (typeof stream.getTracks === "function") {
      stream.getTracks().forEach((track) => {
        this.peerConnection.addTrack(track, stream);
      });
    }
  }

  async createOffer(options = {}) {
    if (!this.peerConnection) this.init();
    const offer = await this.peerConnection.createOffer(options);
    await this.peerConnection.setLocalDescription(offer);
    return offer;
  }

  async handleAnswer(answer) {
    if (!this.peerConnection) {
      throw new Error("Cannot handle answer: RTCPeerConnection not initialized.");
    }
    await this.peerConnection.setRemoteDescription(answer);
    await this._flushPendingCandidates();
  }

  async handleOfferAndAnswer(offer) {
    if (!this.peerConnection) this.init();
    await this.peerConnection.setRemoteDescription(offer);
    await this._flushPendingCandidates();
    const answer = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(answer);
    return answer;
  }

  async addIceCandidate(candidate) {
    if (!candidate) return;
    if (
      this.peerConnection &&
      this.peerConnection.remoteDescription &&
      this.peerConnection.remoteDescription.type
    ) {
      await this.peerConnection.addIceCandidate(candidate);
    } else {
      this.pendingCandidates.push(candidate);
    }
  }

  async _flushPendingCandidates() {
    if (!this.peerConnection) return;
    while (this.pendingCandidates.length > 0) {
      const cand = this.pendingCandidates.shift();
      try {
        await this.peerConnection.addIceCandidate(cand);
      } catch (err) {
        this.emit("error", err);
      }
    }
  }

  sendData(data) {
    if (!this.dataChannel || this.dataChannel.readyState !== "open") {
      throw new Error("RTC DataChannel is not currently open.");
    }
    const payload = typeof data === "string" ? data : JSON.stringify(data);
    this.dataChannel.send(payload);
  }

  setAudioEnabled(enabled) {
    if (!this.localStream || typeof this.localStream.getAudioTracks !== "function") return;
    this.localStream.getAudioTracks().forEach((track) => {
      track.enabled = !!enabled;
    });
  }

  setVideoEnabled(enabled) {
    if (!this.localStream || typeof this.localStream.getVideoTracks !== "function") return;
    this.localStream.getVideoTracks().forEach((track) => {
      track.enabled = !!enabled;
    });
  }

  async getMetrics() {
    if (!this.peerConnection || typeof this.peerConnection.getStats !== "function") {
      return { status: this.connectionState, available: false };
    }

    const stats = await this.peerConnection.getStats();
    const result = {
      status: this.connectionState,
      iceState: this.iceConnectionState,
      available: true,
      audio: {},
      video: {},
      candidatePair: {},
    };

    stats.forEach((report) => {
      if (report.type === "outbound-rtp") {
        if (report.kind === "video") {
          result.video = {
            framesPerSecond: report.framesPerSecond,
            bytesSent: report.bytesSent,
            packetsSent: report.packetsSent,
          };
        } else if (report.kind === "audio") {
          result.audio = {
            bytesSent: report.bytesSent,
            packetsSent: report.packetsSent,
          };
        }
      } else if (report.type === "candidate-pair" && report.state === "succeeded") {
        result.candidatePair = {
          currentRoundTripTime: report.currentRoundTripTime,
          availableOutgoingBitrate: report.availableOutgoingBitrate,
        };
      }
    });

    return result;
  }

  close() {
    if (this.dataChannel) {
      try { this.dataChannel.close(); } catch {}
      this.dataChannel = null;
    }

    if (this.localStream && typeof this.localStream.getTracks === "function") {
      this.localStream.getTracks().forEach((t) => {
        try { t.stop(); } catch {}
      });
    }

    if (this.peerConnection) {
      try { this.peerConnection.close(); } catch {}
      this.peerConnection = null;
    }

    this.connectionState = "closed";
    this.emit("close");
  }
}

module.exports = {
  WebRTCBroadcaster,
  DEFAULT_ICE_SERVERS,
};
