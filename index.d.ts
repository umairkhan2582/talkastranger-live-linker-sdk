export interface TalkAStrangerLinkerOptions {
  creatorUsername: string;
  autoSupportLink?: boolean;
  endpoint?: string;
}

export interface LinkStreamConfig {
  platform: 'tiktok' | 'youtube' | 'twitch' | 'kick';
  streamUrl: string;
  title?: string;
  description?: string;
}

export interface LinkedStreamData {
  id: string;
  platform: string;
  streamUrl: string;
  title: string;
  description: string;
  supportLink: string;
  linkedAt: string;
  creatorProfile: string;
  creatorStudio: string;
}

export class TalkAStrangerLinker {
  creatorUsername: string;
  autoSupportLink: boolean;
  endpoint: string;
  constructor(options: TalkAStrangerLinkerOptions);
  linkStream(config: LinkStreamConfig): Promise<LinkedStreamData>;
  unlinkStream(streamId: string): boolean;
  getSupportLinkText(): string;
  getProfileUrl(): string;
  getCreatorStudioUrl(): string;
  getLinkedStreams(): LinkedStreamData[];
  getCountryLaneLinks(limit?: number): string;
}
