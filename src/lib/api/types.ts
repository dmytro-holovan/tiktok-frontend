export type Platform = "TIKTOK" | "YOUTUBE" | "TWITCH";

export type StreamStatus =
  | "CREATED"
  | "CONNECTING"
  | "RECONNECTING"
  | "LIVE"
  | "DISCONNECTED"
  | "ENDED"
  | "OFFLINE"
  | "ERROR";

export type WidgetType =
  | "LIKE_GOAL"
  | "GIFT_TRIGGER"
  | "EVENT_FEED"
  | "TIKTOK_BEST_GIFT";

export interface TikTokBestGift {
  streamId: string;
  giftId?: string | null;
  giftName?: string | null;
  giftImageUrl?: string | null;
  repeatCount: number;
  diamondCount?: number | null;
  totalDiamonds: number;
  eventTs?: string | null;
  createdAt?: string | null;
  viewer?: {
    id?: string | null;
    uniqueId?: string | null;
    nickname?: string | null;
    avatarUrl?: string | null;
  } | null;
}

export interface User {
  id: string;
  email: string;
  streamer?: Streamer;
}

export interface Streamer {
  id: string;
  displayName: string;
  bio?: string | null;
  platformAccounts?: PlatformAccount[];
  streams?: LiveStream[];
  widgets?: Widget[];
}

export interface PlatformAccount {
  id: string;
  platform: Platform;
  handle: string;
  displayName?: string | null;
  status: "ACTIVE" | "DISABLED";
  createdAt: string;
}

export interface LiveStream {
  id: string;
  platform: Platform;
  status: StreamStatus;
  externalRoomId?: string | null;
  totalLikes: number;
  lastLikeEventAt?: string | null;
  platformAccount?: PlatformAccount;
  createdAt: string;
  updatedAt: string;
}

export interface StreamState {
  streamId: string;
  platform: Platform;
  handle: string;
  platformAccountId: string;
  status: StreamStatus;
  externalRoomId?: string | null;
  connectedInProcess: boolean;
  reconnectScheduled: boolean;
  reconnectAttempts: number;
  maxReconnectAttempts: number;
  totalLikes: number;
  lastLikeEventAt?: string | null;
  lastConnectedAt?: string | null;
  lastDisconnectedAt?: string | null;
  lastReconnectAt?: string | null;
  nextReconnectAt?: string | null;
  errorMessage?: string | null;
  updatedAt: string;
}

export interface Widget {
  id: string;
  type: WidgetType;
  name: string;
  enabled: boolean;
  settings?: Record<string, unknown> | null;
  publicToken: string;
  createdAt: string;
}

export interface PublicWidget {
  id: string;
  publicToken: string;
  type: WidgetType;
  name: string;
  enabled: boolean;
  settings?: Record<string, unknown> | null;
  streamer: {
    id: string;
    displayName: string;
  };
  currentStream?: {
    id: string;
    status: StreamStatus;
    totalLikes: number;
    lastLikeEventAt?: string | null;
    bestGift?: TikTokBestGift | null;
  } | null;
}

export interface WidgetEvent {
  id: string;
  widgetId: string;
  publicToken: string;
  source: "LIVE" | "DEMO";
  type: string;
  payload: Record<string, unknown>;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}
