const { EventEmitter } = require("events");

class MultiChatAggregator extends EventEmitter {
  constructor(options = {}) {
    super();
    this.bannedWords = new Set((options.bannedWords || []).map(w => w.toLowerCase()));
    this.slowModeSeconds = options.slowModeSeconds || 0;
    this.lastUserMessageTime = new Map();
    this.channels = {
      twitch: null,
      youtube: null,
      tiktok: null,
      talkastranger: null
    };
  }

  addBannedWord(word) {
    if (word) this.bannedWords.add(word.toLowerCase().trim());
  }

  isMessageClean(text) {
    if (!text || typeof text !== "string") return false;
    const lower = text.toLowerCase();
    for (const banned of this.bannedWords) {
      if (lower.includes(banned)) return false;
    }
    return true;
  }

  ingestMessage(rawMessage) {
    const platform = rawMessage.platform || "talkastranger";
    const user = rawMessage.username || rawMessage.user || "viewer";
    const text = rawMessage.message || rawMessage.text || "";

    // Slow mode check
    const now = Date.now();
    if (this.slowModeSeconds > 0) {
      const last = this.lastUserMessageTime.get(user) || 0;
      if (now - last < this.slowModeSeconds * 1000) {
        return null; // Rate limited
      }
      this.lastUserMessageTime.set(user, now);
    }

    if (!this.isMessageClean(text)) {
      this.emit("chat:filtered", { user, text, reason: "banned_word", platform });
      return null;
    }

    const normalized = {
      id: rawMessage.id || `msg_${now}_${Math.random().toString(36).slice(2, 7)}`,
      platform,
      username: user,
      displayName: rawMessage.displayName || user,
      message: text,
      avatar: rawMessage.avatar || null,
      badges: rawMessage.badges || [],
      isTip: Boolean(rawMessage.isTip),
      tipAmount: rawMessage.tipAmount || null,
      timestamp: rawMessage.timestamp || now
    };

    this.emit("chat:message", normalized);
    if (normalized.isTip) {
      this.emit("chat:tip", normalized);
    }
    return normalized;
  }
}

module.exports = {
  MultiChatAggregator
};
