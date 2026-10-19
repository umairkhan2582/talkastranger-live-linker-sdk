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
