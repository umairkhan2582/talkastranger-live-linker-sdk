const TIKTOK_SAFE_ZONES = {
  aspectRatio: "9:16",
  resolution: { width: 1080, height: 1920 },
  margins: {
    top: 140,      // Reserved for live header, host info, exit button
    bottom: 340,   // Reserved for chat input, gifts button, comments tray
    left: 32,      // Edge safe padding
    right: 120,    // Reserved for vertical actions (like, share, profile icons)
  },
  contentArea: {
    x: 32,
    y: 140,
    width: 928,    // 1080 - 32 - 120
    height: 1440,  // 1920 - 140 - 340
  }
};

const GAMING_HUD_PRESETS = {
  "esports-fps": {
    name: "Esports FPS Tactical",
    primaryColor: "#00f0ff",
    secondaryColor: "#ff003c",
    bgGlass: "rgba(10, 15, 29, 0.82)",
    fontFamily: "'JetBrains Mono', 'Segoe UI', monospace",
    elements: ["cam-frame", "kd-ticker", "chat-box", "sponsor-slot", "goal-bar"]
  },
  "neon-cyberpunk": {
    name: "Neon Cyberpunk 2077",
    primaryColor: "#ffe600",
    secondaryColor: "#00ffff",
    bgGlass: "rgba(17, 10, 32, 0.85)",
    fontFamily: "'Rajdhani', sans-serif",
    elements: ["cam-frame", "chat-box", "gift-ticker", "superchat-feed"]
  },
  "retro-arcade": {
    name: "16-Bit Retro Arcade",
    primaryColor: "#ff007f",
    secondaryColor: "#39ff14",
    bgGlass: "rgba(5, 5, 20, 0.90)",
    fontFamily: "'Press Start 2P', monospace",
    elements: ["cam-frame", "high-score", "chat-box"]
  },
  "minimal-dark": {
    name: "Minimal Clean Creator",
    primaryColor: "#ffffff",
    secondaryColor: "#6366f1",
    bgGlass: "rgba(15, 23, 42, 0.75)",
    fontFamily: "'Inter', sans-serif",
    elements: ["cam-frame", "chat-box", "goal-bar"]
  }
};

class OverlayEngine {
  constructor(options = {}) {
    this.streamerName = options.streamerName || "Creator";
    this.theme = options.theme || "esports-fps";
    this.mode = options.mode || "landscape"; // "landscape" (16:9) or "vertical" (9:16)
  }

  getTikTokSafeZoneCss() {
    return [
      ".tiktok-safe-container {",
      "  position: relative;",
      "  width: 1080px;",
      "  height: 1920px;",
      "  overflow: hidden;",
      "  box-sizing: border-box;",
      "}",
      ".tiktok-safe-content {",
      `  position: absolute;`,
      `  top: ${TIKTOK_SAFE_ZONES.margins.top}px;`,
      `  bottom: ${TIKTOK_SAFE_ZONES.margins.bottom}px;`,
      `  left: ${TIKTOK_SAFE_ZONES.margins.left}px;`,
      `  right: ${TIKTOK_SAFE_ZONES.margins.right}px;`,
      "  pointer-events: auto;",
      "}",
      ".tiktok-hud-cam {",
      "  position: absolute;",
      "  top: 20px;",
      "  left: 20px;",
      "  width: 380px;",
      "  height: 285px;",
      "  border: 3px solid #00f0ff;",
      "  border-radius: 16px;",
      "  box-shadow: 0 0 25px rgba(0, 240, 255, 0.4);",
      "  background: rgba(0, 0, 0, 0.5);",
      "}",
      ".tiktok-hud-chat {",
      "  position: absolute;",
      "  bottom: 20px;",
      "  left: 20px;",
      "  width: 480px;",
      "  max-height: 420px;",
      "  overflow: hidden;",
      "  mask-image: linear-gradient(to top, black 80%, transparent 100%);",
      "}"
    ].join("\n");
  }

  generateGamingHudHtml(config = {}) {
    const preset = GAMING_HUD_PRESETS[config.theme || this.theme] || GAMING_HUD_PRESETS["esports-fps"];
    const streamer = config.streamerName || this.streamerName;
    const game = config.gameTitle || "Live Stream";
    const goal = config.goalAmount ? `$${config.currentGoal || 0} / $${config.goalAmount}` : "$0 / $100";

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${streamer} - Gaming HUD Overlay</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: transparent;
      font-family: ${preset.fontFamily};
      color: #ffffff;
      width: 100vw;
      height: 100vh;
      overflow: hidden;
    }
    .hud-header {
      position: absolute;
      top: 24px;
      left: 24px;
      display: flex;
      align-items: center;
      gap: 16px;
      background: ${preset.bgGlass};
      border-left: 4px solid ${preset.primaryColor};
      padding: 10px 20px;
      border-radius: 8px;
      backdrop-filter: blur(12px);
    }
    .hud-title { font-size: 18px; font-weight: bold; color: ${preset.primaryColor}; }
    .hud-game { font-size: 14px; opacity: 0.8; }
    .hud-webcam-frame {
      position: absolute;
      top: 24px;
      right: 24px;
      width: 420px;
      height: 236px;
      border: 2px solid ${preset.primaryColor};
      border-radius: 12px;
      box-shadow: 0 0 20px ${preset.primaryColor}40;
      background: rgba(0,0,0,0.2);
    }
    .hud-goal-bar {
      position: absolute;
      bottom: 24px;
      left: 24px;
      background: ${preset.bgGlass};
      padding: 8px 16px;
      border-radius: 8px;
      border: 1px solid ${preset.secondaryColor}60;
    }
  </style>
</head>
<body>
  <div class="hud-header">
    <div class="hud-title">${streamer}</div>
    <div class="hud-game">● ${game}</div>
  </div>
  <div class="hud-webcam-frame"></div>
  <div class="hud-goal-bar">Tip Goal: ${goal}</div>
</body>
</html>`;
  }

  generateObsBrowserSourceUrl(options = {}) {
    const baseUrl = options.baseUrl || "https://talkastranger.com/overlay.html";
    const params = new URLSearchParams();
    if (options.streamerUsername) params.set("streamerUsername", options.streamerUsername);
    if (options.theme) params.set("theme", options.theme);
    if (options.mode) params.set("mode", options.mode);
    if (options.accent) params.set("accent", options.accent);
    return `${baseUrl}?${params.toString()}`;
  }
}

module.exports = {
  TIKTOK_SAFE_ZONES,
  GAMING_HUD_PRESETS,
  OverlayEngine
};
