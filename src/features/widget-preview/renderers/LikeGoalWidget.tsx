import { Heart } from "lucide-react";
import type { PublicWidget, WidgetEvent } from "../../../lib/api";

export function LikeGoalWidget({
  widget,
  latestEvent,
}: {
  widget: PublicWidget;
  latestEvent?: WidgetEvent;
}) {
  const payload = latestEvent?.payload ?? {};
  const currentLikes = Number(
    payload.currentLikes ?? widget.currentStream?.totalLikes ?? 0,
  );
  const targetLikes = Number(payload.targetLikes ?? widget.settings?.likeTarget ?? 1000);
  const progress = Math.min(Math.round((currentLikes / targetLikes) * 100), 100);

  return (
    <div className="like-widget">
      <Heart size={28} />
      <div>
        <strong>
          {currentLikes.toLocaleString()} / {targetLikes.toLocaleString()}
        </strong>
        <div className="progress">
          <span style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  );
}
