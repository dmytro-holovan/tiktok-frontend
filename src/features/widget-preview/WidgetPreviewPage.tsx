import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Wand2 } from "lucide-react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import { useTransparentWidgetPage } from "../../hooks/useTransparentWidgetPage";
import { api, LIVE_URL } from "../../lib/api";
import type { WidgetEvent } from "../../lib/api";
import { WidgetRenderer } from "./renderers/WidgetRenderer";
import { WidgetFrame } from "./WidgetFrame";

export function WidgetPreviewPage() {
  const { publicToken = "" } = useParams();
  const [events, setEvents] = useState<WidgetEvent[]>([]);

  const widgetQuery = useQuery({
    queryKey: ["public-widget", publicToken],
    queryFn: () => api.publicWidget(publicToken),
    enabled: Boolean(publicToken),
  });

  const demoMutation = useMutation({
    mutationFn: () => api.demoPublicWidget(publicToken),
    onSuccess: (event) => setEvents((current) => [event, ...current].slice(0, 10)),
  });

  useEffect(() => {
    if (!publicToken) {
      return;
    }

    const socket = io(LIVE_URL, {
      transports: ["websocket", "polling"],
    });

    socket.emit("widget.join", { publicToken });
    socket.on("widget.event", (event: WidgetEvent) => {
      setEvents((current) => [event, ...current].slice(0, 10));
    });

    return () => {
      socket.emit("widget.leave", { publicToken });
      socket.disconnect();
    };
  }, [publicToken]);

  const isTransparentWidget = widgetQuery.data?.type === "TIKTOK_BEST_GIFT";
  useTransparentWidgetPage(Boolean(isTransparentWidget));

  if (widgetQuery.isLoading) {
    return <WidgetFrame title="Loading" />;
  }

  if (widgetQuery.error || !widgetQuery.data) {
    return <WidgetFrame title="Widget unavailable" />;
  }

  return (
    <WidgetFrame
      title={widgetQuery.data.name}
      widget={widgetQuery.data}
      transparent={isTransparentWidget}
    >
      <WidgetRenderer widget={widgetQuery.data} events={events} />
      {!isTransparentWidget && (
        <button
          className="icon-button preview-demo"
          type="button"
          onClick={() => demoMutation.mutate()}
          disabled={demoMutation.isPending}
        >
          <Wand2 size={16} />
          Demo
        </button>
      )}
    </WidgetFrame>
  );
}
