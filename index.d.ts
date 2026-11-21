import { EventEmitter } from 'events';

export interface TalkAStrangerLinkerOptions {
  creatorUsername: string;
  autoSupportLink?: boolean;
  endpoint?: string;
  registry?: AdapterRegistry;
}

export interface LinkStreamConfig {
  platform: 'tiktok' | 'youtube' | 'twitch' | 'kick' | string;
  streamUrl: string;
  title?: string;
  description?: string;
}

export interface StreamParseResult {
  platform: string;
  channelId: string;
  displayName?: string;
  normalizedUrl: string;
  canonicalUrl: string;
  metadata?: Record<string, unknown>;
}

export interface LinkedStreamData {
  id: string;
  platform: string;
  channelId?: string;
  streamUrl: string;
  title: string;
  description: string;
  supportLink: string;
  linkedAt: string;
  creatorProfile: string;
  creatorStudio: string;
  metadata?: Record<string, unknown>;
}

export interface PlatformAdapter {
  name: string;
  displayName: string;
  allowedHostnames: string[];
  validateUrl(urlString: string): boolean;
  parse(urlString: string): StreamParseResult;
  formatChannelUrl?(channelId: string): string;
}

export interface WebRTCBroadcasterOptions {
  iceServers?: RTCIceServer[];
  RTCPeerConnection?: typeof RTCPeerConnection;
  enableDataChannel?: boolean;
  dataChannelLabel?: string;
}

export interface StreamMetrics {
  timestamp: number;
  connectionState: string;
  iceConnectionState: string;
  signalingState: string;
  audioTrackMuted: boolean;
  videoTrackMuted: boolean;
  hasDataChannel: boolean;
  dataChannelState: string | null;
}

export declare class WebRTCBroadcaster extends EventEmitter {
  constructor(options?: WebRTCBroadcasterOptions);
  setStream(stream: MediaStream): void;
  getStream(): MediaStream | null;
  setAudioMute(muted: boolean): boolean;
  setVideoMute(muted: boolean): boolean;
  createOffer(options?: RTCOfferOptions): Promise<RTCSessionDescriptionInit>;
  handleAnswer(answer: RTCSessionDescriptionInit): Promise<void>;
  addIceCandidate(candidate: RTCIceCandidateInit): Promise<void>;
  sendData(data: string | ArrayBuffer | ArrayBufferView | Blob): void;
  getMetrics(): StreamMetrics;
  close(): void;
}

export declare class LiveBroadcasterHub extends EventEmitter {
  constructor(options?: { iceServers?: RTCIceServer[]; RTCPeerConnection?: typeof RTCPeerConnection });
  setStream(stream: MediaStream): void;
  createViewerSession(viewerId: string): Promise<RTCSessionDescriptionInit>;
  handleViewerAnswer(viewerId: string, answer: RTCSessionDescriptionInit): Promise<void>;
  addViewerIceCandidate(viewerId: string, candidate: RTCIceCandidateInit): Promise<void>;
  closeViewerSession(viewerId: string): void;
  getViewerCount(): number;
  closeAll(): void;
}

export declare class ScreenCapture {
  constructor();
  captureDisplay(preset?: string, constraints?: DisplayMediaStreamOptions): Promise<MediaStream>;
  captureAudio(constraints?: MediaStreamConstraints): Promise<MediaStream>;
  mixAudioStreams(streamA: MediaStream, streamB: MediaStream): MediaStreamAudioDestinationNode | null;
  stopStream(stream: MediaStream): void;
}

export declare class AlertAudioSynthesizer {
  constructor(options?: { volume?: number; audioContext?: any });
  playCoinChime(): void;
  playSparkFanfare(): void;
  playHeartsMelody(): void;
  playCrownFanfare(): void;
  triggerGiftAlert(giftType: string): void;
}

// === NEW OMNISTREAM & SUITE MODULES ===

export interface OmniStreamDestinations {
  talkastranger?: string | { url?: string; lane?: string };
  twitch?: string | { url: string };
  youtube?: string | { url: string };
  tiktok?: string | { url: string };
  kick?: string | { url: string };
  [key: string]: any;
}

export declare class OmniStream extends EventEmitter {
  constructor(options?: {
    streamerName?: string;
    streamerUsername?: string;
    stripeAccountId?: string;
    webrtc?: WebRTCBroadcasterOptions;
    registry?: AdapterRegistry;
  });
  broadcaster: WebRTCBroadcaster;
  hub: LiveBroadcasterHub;
  capture: ScreenCapture;
  alerts: AlertAudioSynthesizer;
  guestSeats: GuestSeatManager;
  gifting: StripeGiftingBridge;
  chat: MultiChatAggregator;
  overlays: OverlayEngine;
  youtubeMonetization: YouTubeLiveMonetization;
  isBroadcasting: boolean;

  connectAll(destinations: OmniStreamDestinations): {
    success: boolean;
    connectedDestinations: Record<string, any>;
    errors: Record<string, string> | null;
  };
  disconnectAll(): void;
  getDashboardTelemetry(): {
    streamer: string;
    isBroadcasting: boolean;
    uptimeSeconds: number;
    connectedDestinations: string[];
    guestSeats: any;
    viewersConnected: number;
    broadcasterMetrics: StreamMetrics;
  };
}

export declare class GuestSeatManager extends EventEmitter {
  constructor(options?: { hostId?: string; streamId?: string; maxGuests?: number; secret?: string });
  createInviteToken(options?: { ttlMinutes?: number; allowAudio?: boolean; allowVideo?: boolean }): {
    token: string;
    joinUrl: string;
    expiresAt: number;
    payload: any;
  };
  verifyInviteToken(token: string): { valid: boolean; payload?: any; error?: string };
  requestJoin(guestInfo: { id?: string; nickname?: string; peerConnection?: any }): {
    status: 'admitted' | 'queued';
    guest?: any;
    queuePosition?: number;
    guestId?: string;
  };
  setMute(guestId: string, options: { audio?: boolean; video?: boolean }): boolean;
  removeGuest(guestId: string, reason?: string): boolean;
  getSeats(): {
    activeCount: number;
    maxGuests: number;
    availableSeats: number;
    guests: any[];
    queueCount: number;
  };
}

export declare class StripeGiftingBridge extends EventEmitter {
  constructor(options?: { creatorAccountId?: string; streamerUsername?: string; currency?: string; platformFeePercent?: number });
  getGiftCatalog(): Array<{ id: string; name: string; priceUSD: number; sound: string; icon: string; tier: string }>;
  getGift(giftId: string): any;
  createGiftCheckoutConfig(options: {
    giftId: string;
    creatorAccountId?: string;
    viewerName?: string;
    message?: string;
    successUrl?: string;
    cancelUrl?: string;
  }): any;
  recordGiftReceived(giftEvent: { giftId: string; viewerName?: string; message?: string; amountUSD?: number }): any;
}

export declare class YouTubeLiveMonetization extends EventEmitter {
  constructor(options?: { channelId?: string; creatorAccountId?: string; secret?: string });
  createPayPerViewSession(options: {
    broadcastId: string;
    title?: string;
    ticketPriceUSD?: number;
    creatorAccountId?: string;
    validHours?: number;
    successUrl?: string;
    cancelUrl?: string;
  }): {
    ticketId: string;
    accessToken: string;
    checkoutConfig: any;
    accessUrl: string;
  };
  verifyTicketAccess(accessToken: string, expectedBroadcastId?: string): {
    authorized: boolean;
    ticket?: any;
    error?: string;
  };
  createDirectTipConfig(options: {
    broadcastId: string;
    amountUSD?: number;
    viewerName?: string;
    message?: string;
    creatorAccountId?: string;
  }): any;
}

export declare class MultiChatAggregator extends EventEmitter {
  constructor(options?: { bannedWords?: string[]; slowModeSeconds?: number });
  addBannedWord(word: string): void;
  isMessageClean(text: string): boolean;
  ingestMessage(rawMessage: {
    platform?: string;
    username?: string;
    user?: string;
    message?: string;
    text?: string;
    displayName?: string;
    avatar?: string;
    badges?: string[];
    isTip?: boolean;
    tipAmount?: number;
    timestamp?: number;
  }): any;
}

export declare class OverlayEngine {
  constructor(options?: { streamerName?: string; theme?: string; mode?: 'landscape' | 'vertical' });
  getTikTokSafeZoneCss(): string;
  generateGamingHudHtml(config?: {
    theme?: string;
    streamerName?: string;
    gameTitle?: string;
    goalAmount?: number;
    currentGoal?: number;
  }): string;
  generateObsBrowserSourceUrl(options?: {
    baseUrl?: string;
    streamerUsername?: string;
    theme?: string;
    mode?: string;
    accent?: string;
  }): string;
}

export declare class TalkAStrangerLinker {
  constructor(options: TalkAStrangerLinkerOptions);
  creatorUsername: string;
  autoSupportLink: boolean;
  endpoint: string;
  registry: AdapterRegistry;
  linkStream(config: LinkStreamConfig): Promise<LinkedStreamData>;
  unlinkStream(streamId: string): boolean;
  getSupportLinkText(): string;
  getProfileUrl(): string;
  getCreatorStudioUrl(): string;
  getLinkedStreams(): LinkedStreamData[];
  getCountryLaneLinks(limit?: number): string;
}

export declare class AdapterRegistry {
  constructor();
  register(name: string, adapter: PlatformAdapter): this;
  get(name: string): PlatformAdapter | undefined;
  getSupportedPlatforms(): string[];
  parseStreamUrl(urlString: string, preferredPlatform?: string): StreamParseResult;
}

export declare const defaultRegistry: AdapterRegistry;
export declare class KickAdapter implements PlatformAdapter {
  name: string;
  displayName: string;
  allowedHostnames: string[];
  validateUrl(urlString: string): boolean;
  parse(urlString: string): StreamParseResult;
  formatChannelUrl(channelId: string): string;
}
export declare class TwitchAdapter implements PlatformAdapter {
  name: string;
  displayName: string;
  allowedHostnames: string[];
  validateUrl(urlString: string): boolean;
  parse(urlString: string): StreamParseResult;
  formatChannelUrl(channelId: string): string;
}
export declare class YouTubeAdapter implements PlatformAdapter {
  name: string;
  displayName: string;
  allowedHostnames: string[];
  validateUrl(urlString: string): boolean;
  parse(urlString: string): StreamParseResult;
}
export declare class TikTokAdapter implements PlatformAdapter {
  name: string;
  displayName: string;
  allowedHostnames: string[];
  validateUrl(urlString: string): boolean;
  parse(urlString: string): StreamParseResult;
}

export declare function parseStreamUrl(urlString: string, preferredPlatform?: string): StreamParseResult;
export declare function getAdapter(platformName: string): PlatformAdapter | undefined;
export declare function registerAdapter(platformName: string, adapter: PlatformAdapter): AdapterRegistry;
export declare const SUPPORTED_PLATFORMS: string[];
export declare const DEFAULT_ICE_SERVERS: RTCIceServer[];
export declare const PRESETS: Record<string, { width: number; height: number; frameRate: number }>;
export declare const GIFT_CATALOG: Record<string, any>;
export declare const TIKTOK_SAFE_ZONES: any;
export declare const GAMING_HUD_PRESETS: Record<string, any>;
