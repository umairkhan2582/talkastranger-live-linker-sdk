export interface TalkAStrangerLinkerOptions {
  creatorUsername: string;
  autoSupportLink?: boolean;
  endpoint?: string;
  registry?: AdapterRegistry;
}

export interface LinkStreamConfig {
  platform: tiktok | youtube | twitch | kick | string;
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
  allowedHostnames?: string[];
  validateUrl(urlString: string): boolean;
  parse(urlString: string): StreamParseResult;
  formatChannelUrl?(channelId: string): string;
}

export class KickAdapter implements PlatformAdapter {
  name: kick;
  displayName: Kick.com;
  allowedHostnames: string[];
  validateUrl(urlString: string): boolean;
  parse(urlString: string): StreamParseResult;
  formatChannelUrl(channelId: string): string;
}

export class TwitchAdapter implements PlatformAdapter {
  name: twitch;
  displayName: Twitch;
  allowedHostnames: string[];
  validateUrl(urlString: string): boolean;
  parse(urlString: string): StreamParseResult;
  formatChannelUrl(channelId: string): string;
}

export class YouTubeAdapter implements PlatformAdapter {
  name: youtube;
  displayName: YouTube;
  allowedHostnames: string[];
  validateUrl(urlString: string): boolean;
  parse(urlString: string): StreamParseResult;
  formatChannelUrl(channelId: string): string;
}

export class TikTokAdapter implements PlatformAdapter {
  name: tiktok;
  displayName: TikTok;
  allowedHostnames: string[];
  validateUrl(urlString: string): boolean;
  parse(urlString: string): StreamParseResult;
  formatChannelUrl(channelId: string): string;
}

export class AdapterRegistry {
  adapters: Map<string, PlatformAdapter>;
  register(platformName: string, adapter: PlatformAdapter): void;
  get(platformName: string): PlatformAdapter | null;
  has(platformName: string): boolean;
  getSupportedPlatforms(): string[];
  detectPlatform(urlString: string): string | null;
  parseStreamUrl(urlString: string, preferredPlatform?: string): StreamParseResult;
}

export const defaultRegistry: AdapterRegistry;
export const SUPPORTED_PLATFORMS: string[];

export function parseStreamUrl(urlString: string, preferredPlatform?: string): StreamParseResult;
export function getAdapter(platformName: string): PlatformAdapter | null;
export function registerAdapter(platformName: string, adapter: PlatformAdapter): void;

export class TalkAStrangerLinker {
  creatorUsername: string;
  autoSupportLink: boolean;
  endpoint: string;
  registry: AdapterRegistry;
  constructor(options: TalkAStrangerLinkerOptions);
  linkStream(config: LinkStreamConfig): Promise<LinkedStreamData>;
  unlinkStream(streamId: string): boolean;
  getSupportLinkText(): string;
  getProfileUrl(): string;
  getCreatorStudioUrl(): string;
  getLinkedStreams(): LinkedStreamData[];
  getCountryLaneLinks(limit?: number): string;
}


export interface WebRTCBroadcasterOptions {
  iceServers?: RTCIceServer[];
  RTCPeerConnection?: any;
  enableDataChannel?: boolean;
  dataChannelLabel?: string;
}

export interface WebRTCMetrics {
  status: string;
  iceState?: string;
  available: boolean;
  audio?: {
    bytesSent?: number;
    packetsSent?: number;
  };
  video?: {
    framesPerSecond?: number;
    bytesSent?: number;
    packetsSent?: number;
  };
  candidatePair?: {
    currentRoundTripTime?: number;
    availableOutgoingBitrate?: number;
  };
}

export declare const DEFAULT_ICE_SERVERS: RTCIceServer[];

export declare class WebRTCBroadcaster {
  constructor(options?: WebRTCBroadcasterOptions);
  iceServers: RTCIceServer[];
  peerConnection: any;
  localStream: any;
  remoteStream: any;
  dataChannel: any;
  connectionState: string;
  iceConnectionState: string;

  init(customConfig?: any): any;
  setLocalStream(stream: any): void;
  createOffer(options?: any): Promise<any>;
  handleAnswer(answer: any): Promise<void>;
  handleOfferAndAnswer(offer: any): Promise<any>;
  addIceCandidate(candidate: any): Promise<void>;
  sendData(data: any): void;
  setAudioEnabled(enabled: boolean): void;
  setVideoEnabled(enabled: boolean): void;
  getMetrics(): Promise<WebRTCMetrics>;
  close(): void;

  on(event: string, listener: (...args: any[]) => void): this;
  emit(event: string, ...args: any[]): boolean;
}


export interface ScreenCaptureOptions {
  preset?: "720p" | "1080p" | "1080p60" | "4k";
  audio?: boolean;
  cursor?: "always" | "motion" | "never";
}

export declare const PRESETS: Record<string, { width: number; height: number; frameRate: number }>;

export declare class ScreenCapture {
  static captureDisplay(options?: ScreenCaptureOptions): Promise<any>;
  static mixAudio(displayStream: any, micStream: any, audioCtx?: any): any;
}

export declare class AlertAudioSynthesizer {
  constructor(audioContext?: any);
  context: any;
  playSparkAlert(): void;
  playHeartAlert(): void;
  playCrownAlert(): void;
}

export declare class LiveBroadcasterHub {
  constructor(options?: WebRTCBroadcasterOptions);
  peers: Map<string, any>;
  localStream: any;
  setStream(stream: any): void;
  createViewerSession(viewerId: string): Promise<any>;
  handleViewerAnswer(viewerId: string, answer: any): Promise<void>;
  addViewerIceCandidate(viewerId: string, candidate: any): Promise<void>;
  closeViewerSession(viewerId: string): void;
  getViewerCount(): number;
  closeAll(): void;
  on(event: string, listener: (...args: any[]) => void): this;
}
