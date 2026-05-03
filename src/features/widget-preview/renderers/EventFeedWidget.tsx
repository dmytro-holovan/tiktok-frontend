import { MessageSquare } from "lucide-react";
import type { WidgetEvent } from "../../../lib/api";

export function EventFeedWidget({ events }: { events: WidgetEvent[] }) {
  return (
    <div className="feed-widget">
      <MessageSquare size={24} />
      <div className="feed-list">
        {events.slice(0, 5).map((event) => (
          <p key={event.id}>
            <strong>{event.type}</strong>
            <span>{JSON.stringify(event.payload)}</span>
          </p>
        ))}
      </div>
    </div>
  );
}
