const { EventEmitter } = require("node:events");
const { DEFAULT_ICE_SERVERS } = require("./webrtc-broadcaster");

/**
 * LiveBroadcasterHub manages 1-to-N WebRTC viewer connections for live streaming,
 * replicating the Chrome Extension's multi-viewer relay architecture.
 */
class LiveBroadcasterHub extends EventEmitter {
  constructor(options = {}) {
    super();
    this.iceServers = options.iceServers || DEFAULT_ICE_SERVERS;
    this.RTCPeerConnectionClass =
      options.RTCPeerConnection ||
      (typeof globalThis !== "undefined" ? globalThis.RTCPeerConnection : null);

    this.peers = new Map(); // peerId -> RTCPeerConnection
    this.localStream = null;
    this.isLive = false;
  }

  setStream(stream) {
    this.localStream = stream;
    // Update existing peer connections if stream changes
    for (const [peerId, pc] of this.peers.entries()) {
      if (pc.getSenders) {
        pc.getSenders().forEach((sender) => {
          if (sender.track && stream) {
            const newTrack = stream.getTracks().find((t) => t.kind === sender.track.kind);
            if (newTrack) sender.replaceTrack(newTrack).catch(() => {});
          }
        });
      }
    }
    this.emit("stream-changed", stream);
  }

  /**
   * Create a WebRTC viewer session for an incoming viewer ID.
   * @param {string} viewerId
   * @returns {Promise<RTCSessionDescriptionInit>} SDP offer
   */
  async createViewerSession(viewerId) {
    if (!this.RTCPeerConnectionClass) {
      throw new Error("RTCPeerConnection is not available.");
    }

    if (this.peers.has(viewerId)) {
      this.closeViewerSession(viewerId);
    }

    const pc = new this.RTCPeerConnectionClass({ iceServers: this.iceServers });
    this.peers.set(viewerId, pc);

    if (this.localStream && typeof this.localStream.getTracks === "function") {
      this.localStream.getTracks().forEach((track) => {
        pc.addTrack(track, this.localStream);
      });
    }

    pc.onicecandidate = (event) => {
      if (event && event.candidate) {
        this.emit("viewer-ice-candidate", { viewerId, candidate: event.candidate });
      }
    };

    pc.onconnectionstatechange = () => {
      const state = pc.connectionState;
      this.emit("viewer-state", { viewerId, state });
      if (state === "closed" || state === "failed") {
        this.peers.delete(viewerId);
        this.emit("viewer-left", viewerId);
      }
    };

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    this.emit("viewer-joined", viewerId);
    return offer;
  }

  async handleViewerAnswer(viewerId, answer) {
    const pc = this.peers.get(viewerId);
    if (!pc) throw new Error(`Viewer ${viewerId} not found.`);
    await pc.setRemoteDescription(answer);
  }

  async addViewerIceCandidate(viewerId, candidate) {
    const pc = this.peers.get(viewerId);
    if (!pc) return;
    await pc.addIceCandidate(candidate);
  }

  closeViewerSession(viewerId) {
    const pc = this.peers.get(viewerId);
    if (pc) {
      try { pc.close(); } catch {}
      this.peers.delete(viewerId);
      this.emit("viewer-left", viewerId);
    }
  }

  getViewerCount() {
    return this.peers.size;
  }

  closeAll() {
    for (const [id, pc] of this.peers.entries()) {
      try { pc.close(); } catch {}
    }
    this.peers.clear();
    this.emit("all-closed");
  }
}

module.exports = {
  LiveBroadcasterHub,
};
