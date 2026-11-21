const crypto = require("crypto");
const { EventEmitter } = require("events");

class GuestSeatManager extends EventEmitter {
  constructor(options = {}) {
    super();
    this.hostId = options.hostId || "host";
    this.streamId = options.streamId || `stream_${Date.now()}`;
    this.maxGuests = options.maxGuests || 4;
    this.secret = options.secret || crypto.randomBytes(16).toString("hex");
    this.guests = new Map(); // guestId -> { id, nickname, role, admittedAt, mutedAudio, mutedVideo, peerConnection }
    this.queue = []; // Array of pending join requests
  }

  createInviteToken(options = {}) {
    const ttlMinutes = options.ttlMinutes || 60;
    const expiresAt = Date.now() + ttlMinutes * 60 * 1000;
    const payload = {
      streamId: this.streamId,
      hostId: this.hostId,
      maxGuests: this.maxGuests,
      expiresAt,
      allowAudio: options.allowAudio !== false,
      allowVideo: options.allowVideo !== false,
      nonce: crypto.randomBytes(8).toString("hex")
    };

    const dataString = Buffer.from(JSON.stringify(payload)).toString("base64url");
    const hmac = crypto.createHmac("sha256", this.secret).update(dataString).digest("base64url");
    const token = `${dataString}.${hmac}`;
    const joinUrl = `https://talkastranger.com/guest-join?token=${token}&streamId=${encodeURIComponent(this.streamId)}`;

    return {
      token,
      joinUrl,
      expiresAt,
      payload
    };
  }

  verifyInviteToken(token) {
    if (!token || typeof token !== "string" || !token.includes(".")) {
      return { valid: false, error: "Malformed token" };
    }
    const [dataString, receivedHmac] = token.split(".");
    const expectedHmac = crypto.createHmac("sha256", this.secret).update(dataString).digest("base64url");
    if (receivedHmac !== expectedHmac) {
      return { valid: false, error: "Invalid token signature" };
    }
    try {
      const payload = JSON.parse(Buffer.from(dataString, "base64url").toString("utf-8"));
      if (Date.now() > payload.expiresAt) {
        return { valid: false, error: "Invite token has expired" };
      }
      if (payload.streamId !== this.streamId) {
        return { valid: false, error: "Token stream ID mismatch" };
      }
      return { valid: true, payload };
    } catch (err) {
      return { valid: false, error: "Corrupted token payload" };
    }
  }

  requestJoin(guestInfo = {}) {
    const guestId = guestInfo.id || `guest_${crypto.randomBytes(4).toString("hex")}`;
    const nickname = guestInfo.nickname || `Viewer-${guestId.slice(-4)}`;

    if (this.guests.size >= this.maxGuests) {
      const queuePosition = this.queue.length + 1;
      const queueItem = { guestId, nickname, queuedAt: Date.now() };
      this.queue.push(queueItem);
      this.emit("guest:queued", queueItem);
      return { status: "queued", queuePosition, guestId };
    }

    const guest = {
      id: guestId,
      nickname,
      role: "guest",
      admittedAt: Date.now(),
      mutedAudio: false,
      mutedVideo: false,
      peerConnection: guestInfo.peerConnection || null
    };

    this.guests.set(guestId, guest);
    this.emit("guest:admitted", guest);
    return { status: "admitted", guest };
  }

  setMute(guestId, { audio, video } = {}) {
    const guest = this.guests.get(guestId);
    if (!guest) return false;
    if (typeof audio === "boolean") guest.mutedAudio = audio;
    if (typeof video === "boolean") guest.mutedVideo = video;
    this.emit("guest:updated", guest);
    return true;
  }

  removeGuest(guestId, reason = "left") {
    const guest = this.guests.get(guestId);
    if (!guest) return false;
    this.guests.delete(guestId);
    this.emit("guest:removed", { guestId, nickname: guest.nickname, reason });

    // Promote next in queue if available
    if (this.queue.length > 0 && this.guests.size < this.maxGuests) {
      const next = this.queue.shift();
      this.requestJoin({ id: next.guestId, nickname: next.nickname });
    }
    return true;
  }

  getSeats() {
    return {
      activeCount: this.guests.size,
      maxGuests: this.maxGuests,
      availableSeats: Math.max(0, this.maxGuests - this.guests.size),
      guests: Array.from(this.guests.values()).map(g => ({
        id: g.id,
        nickname: g.nickname,
        role: g.role,
        admittedAt: g.admittedAt,
        mutedAudio: g.mutedAudio,
        mutedVideo: g.mutedVideo
      })),
      queueCount: this.queue.length
    };
  }
}

module.exports = {
  GuestSeatManager
};
