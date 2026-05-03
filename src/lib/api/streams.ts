import { request } from "./client";
import type { LiveStream, StreamState } from "./types";

export const streamsApi = {
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
};
