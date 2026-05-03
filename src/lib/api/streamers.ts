import { request } from "./client";
import type { Platform, PlatformAccount, Streamer } from "./types";

export const streamerApi = {
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
};
