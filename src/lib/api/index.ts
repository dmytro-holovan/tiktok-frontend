export { API_URL, ApiError, LIVE_URL, request } from "./client";
export type {
  AuthResponse,
  LiveStream,
  Platform,
  PlatformAccount,
  PublicWidget,
  Streamer,
  StreamState,
  StreamStatus,
  TikTokBestGift,
  User,
  Widget,
  WidgetEvent,
  WidgetType,
} from "./types";

import { authApi } from "./auth";
import { streamerApi } from "./streamers";
import { streamsApi } from "./streams";
import { widgetsApi } from "./widgets";

export const api = {
  ...authApi,
  ...streamerApi,
  ...streamsApi,
  ...widgetsApi,
};
