import { Gift } from "lucide-react";
import type { PublicWidget, WidgetEvent } from "../../../lib/api";
import { readTikTokBestGiftFromPayload } from "../widget-payload";

export function TikTokBestGiftWidget({
  widget,
  latestEvent,
}: {
  widget: PublicWidget;
  latestEvent?: WidgetEvent;
}) {
  const gift =
    latestEvent?.type === "widget.tiktokBestGift.updated"
      ? readTikTokBestGiftFromPayload(latestEvent.payload)
      : widget.currentStream?.bestGift ?? null;
  const viewerName =
    gift?.viewer?.nickname ?? gift?.viewer?.uniqueId ?? "Waiting for gift";
  const giftName = gift?.giftName ?? "Best gift";
  const totalDiamonds = gift?.totalDiamonds ?? 0;

  return (
    <div className="best-gift-widget">
      <div className="best-gift-visual">
        {gift?.giftImageUrl ? (
          <img src={gift.giftImageUrl} alt={giftName} />
        ) : (
          <Gift size={74} strokeWidth={1.8} />
        )}
      </div>
      <strong>{giftName}</strong>
      <span className="best-gift-value">
        {totalDiamonds.toLocaleString()} diamonds
        {gift?.repeatCount ? ` · x${gift.repeatCount}` : ""}
      </span>
      <span className="best-gift-viewer">{viewerName}</span>
    </div>
  );
}
