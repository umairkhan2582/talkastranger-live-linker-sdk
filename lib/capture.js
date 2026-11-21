/**
 * ScreenCapture - Screen, window, and tab capture helper with resolution presets
 * and audio mixing for WebRTC streaming.
 */

const PRESETS = {
  "720p": { width: 1280, height: 720, frameRate: 30 },
  "1080p": { width: 1920, height: 1080, frameRate: 30 },
  "1080p60": { width: 1920, height: 1080, frameRate: 60 },
  "4k": { width: 3840, height: 2160, frameRate: 30 },
};

class ScreenCapture {
  /**
   * Capture screen or window with a resolution preset.
   * @param {Object} [options={}]
   * @param {"720p"|"1080p"|"1080p60"|"4k"} [options.preset="1080p"]
   * @param {boolean} [options.audio=true] - Include system/tab audio
   * @param {"always"|"motion"|"never"} [options.cursor="always"]
   * @returns {Promise<MediaStream>}
   */
  static async captureDisplay(options = {}) {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getDisplayMedia) {
      throw new Error("getDisplayMedia is not available in this environment.");
    }

    const preset = PRESETS[options.preset || "1080p"] || PRESETS["1080p"];
    const constraints = {
      video: {
        width: { ideal: preset.width },
        height: { ideal: preset.height },
        frameRate: { ideal: preset.frameRate },
        cursor: options.cursor || "always",
      },
      audio: options.audio !== false,
    };

    return await navigator.mediaDevices.getDisplayMedia(constraints);
  }

  /**
   * Mix microphone audio track into an existing display MediaStream.
   * @param {MediaStream} displayStream
   * @param {MediaStream} micStream
   * @param {AudioContext} [audioCtx]
   * @returns {MediaStream} Mixed MediaStream
   */
  static mixAudio(displayStream, micStream, audioCtx) {
    if (typeof AudioContext === "undefined" && typeof webkitAudioContext === "undefined") {
      throw new Error("Web Audio API is not available in this environment.");
    }

    const Ctx = globalThis.AudioContext || globalThis.webkitAudioContext;
    const ctx = audioCtx || new Ctx();
    const dest = ctx.createMediaStreamDestination();

    if (displayStream.getAudioTracks().length > 0) {
      const displaySource = ctx.createMediaStreamSource(new MediaStream(displayStream.getAudioTracks()));
      displaySource.connect(dest);
    }

    if (micStream && micStream.getAudioTracks().length > 0) {
      const micSource = ctx.createMediaStreamSource(micStream);
      micSource.connect(dest);
    }

    const mixedTracks = [
      ...displayStream.getVideoTracks(),
      ...dest.stream.getAudioTracks(),
    ];

    return new MediaStream(mixedTracks);
  }
}

module.exports = {
  ScreenCapture,
  PRESETS,
};
