import { Gift } from "lucide-react";
import type { WidgetEvent } from "../../../lib/api";

export function GiftTriggerWidget({
  latestEvent,
}: {
  latestEvent?: WidgetEvent;
}) {
  const payload = latestEvent?.payload ?? {};

  return (
    <div className="gift-widget">
      <Gift size={28} />
      <strong>{String(payload.giftName ?? "Waiting")}</strong>
      <span>x{String(payload.repeatCount ?? 0)}</span>
    </div>
  );
}
