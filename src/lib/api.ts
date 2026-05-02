export const API_URL = (import.meta.env.VITE_API_URL ?? "http://127.0.0.1:3000/api").replace(
  /\/$/,
  "",
);

export const LIVE_URL =
  import.meta.env.VITE_LIVE_URL ??
  API_URL.replace(/\/api$/, "").replace(/\/$/, "") + "/live";

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

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null,
): Promise<T> {
  const headers = new Headers(options.headers);

  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  const contentType = response.headers.get("content-type");
  const payload = contentType?.includes("application/json")
    ? await response.json()
    : null;

  if (!response.ok) {
    const message =
      payload && typeof payload === "object" && "message" in payload
        ? String((payload as { message: unknown }).message)
        : `Request failed with status ${response.status}`;
    throw new ApiError(message, response.status);
  }

  return payload as T;
}

export const api = {
  login: (body: { email: string; password: string }) =>
    request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  register: (body: { email: string; password: string; displayName?: string }) =>
    request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  me: (token: string) => request<User>("/auth/me", {}, token),

  cabinet: (token: string) => request<Streamer>("/streamers/me", {}, token),

  addPlatformAccount: (
    token: string,
    body: { platform: Platform; handle: string; displayName?: string },
  ) =>
    request<PlatformAccount>(
      "/streamers/me/platform-accounts",
      {
        method: "POST",
        body: JSON.stringify(body),
      },
      token,
    ),

  updatePlatformAccount: (
    token: string,
    platformAccountId: string,
    body: { handle?: string; displayName?: string },
  ) =>
    request<PlatformAccount>(
      `/streamers/me/platform-accounts/${platformAccountId}`,
      {
        method: "PATCH",
        body: JSON.stringify(body),
      },
      token,
    ),

  streams: (token: string) => request<LiveStream[]>("/streams", {}, token),

  connectStream: (token: string, platformAccountId: string) =>
    request<LiveStream>(
      "/streams/connect",
      {
        method: "POST",
        body: JSON.stringify({ platformAccountId }),
      },
      token,
    ),

  disconnectStream: (token: string, streamId: string) =>
    request<LiveStream>(
      `/streams/${streamId}/disconnect`,
      {
        method: "POST",
      },
      token,
    ),

  streamState: (token: string, streamId: string) =>
    request<StreamState>(`/streams/${streamId}/state`, {}, token),

  widgets: (token: string) => request<Widget[]>("/widgets", {}, token),

  createWidget: (
    token: string,
    body: { type: WidgetType; name: string; settings?: Record<string, unknown> },
  ) =>
    request<Widget>(
      "/widgets",
      {
        method: "POST",
        body: JSON.stringify(body),
      },
      token,
    ),

  demoWidget: (token: string, widgetId: string) =>
    request<WidgetEvent>(
      `/widgets/${widgetId}/demo`,
      {
        method: "POST",
      },
      token,
    ),

  deleteWidget: (token: string, widgetId: string) =>
    request<Widget>(
      `/widgets/${widgetId}`,
      {
        method: "DELETE",
      },
      token,
    ),

  publicWidget: (publicToken: string) =>
    request<PublicWidget>(`/widgets/public/${publicToken}`),

  demoPublicWidget: (publicToken: string) =>
    request<WidgetEvent>(`/widgets/public/${publicToken}/demo`, {
      method: "POST",
    }),
};
