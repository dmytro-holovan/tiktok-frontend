import type { PublicWidget, WidgetEvent } from "../../../lib/api";
import { EventFeedWidget } from "./EventFeedWidget";
import { GiftTriggerWidget } from "./GiftTriggerWidget";
import { LikeGoalWidget } from "./LikeGoalWidget";
import { TikTokBestGiftWidget } from "./TikTokBestGiftWidget";

export function WidgetRenderer({
  widget,
  events,
}: {
  widget: PublicWidget;
  events: WidgetEvent[];
}) {
  const latestEvent = events[0];

  if (widget.type === "LIKE_GOAL") {
    return <LikeGoalWidget widget={widget} latestEvent={latestEvent} />;
  }

  if (widget.type === "GIFT_TRIGGER") {
    return <GiftTriggerWidget latestEvent={latestEvent} />;
  }

  if (widget.type === "TIKTOK_BEST_GIFT") {
    return <TikTokBestGiftWidget widget={widget} latestEvent={latestEvent} />;
  }

  return <EventFeedWidget events={events} />;
}
