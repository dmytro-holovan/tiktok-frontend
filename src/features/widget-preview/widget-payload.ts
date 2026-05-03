import type { TikTokBestGift } from "../../lib/api";

export function readTikTokBestGiftFromPayload(
  payload: Record<string, unknown>,
): TikTokBestGift | null {
  const totalDiamonds = readNumber(payload.totalDiamonds);
  const giftName = readString(payload.giftName);
  const giftImageUrl = readString(payload.giftImageUrl);
  const viewer = readRecord(payload.viewer);

  if (!giftName && !giftImageUrl && totalDiamonds === undefined) {
    return null;
  }

  return {
    streamId: readString(payload.streamId) ?? "",
    giftId: readString(payload.giftId),
    giftName,
    giftImageUrl,
    repeatCount: readNumber(payload.repeatCount) ?? 1,
    diamondCount: readNumber(payload.diamondCount),
    totalDiamonds: totalDiamonds ?? 0,
    eventTs: readString(payload.eventTs),
    createdAt: readString(payload.createdAt),
    viewer: viewer
      ? {
          id: readString(viewer.id),
          uniqueId: readString(viewer.uniqueId),
          nickname: readString(viewer.nickname),
          avatarUrl: readString(viewer.avatarUrl),
        }
      : null,
  };
}

function readRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function readString(value: unknown) {
  return typeof value === "string" && value.trim() ? value : undefined;
}

function readNumber(value: unknown) {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : undefined;
}
