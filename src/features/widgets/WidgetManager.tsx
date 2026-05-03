import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Copy, Settings, Trash2, Wand2 } from "lucide-react";
import { EmptyState } from "../../components/ui/EmptyState";
import { api } from "../../lib/api";
import type { Widget, WidgetType } from "../../lib/api";
import { formatWidgetType } from "./widget-format";
import { copyWidgetUrl } from "./widget-url";

export function WidgetManager({
  token,
  widgets,
}: {
  token: string;
  widgets: Widget[];
}) {
  const queryClient = useQueryClient();
  const [name, setName] = useState("Main like goal");
  const [type, setType] = useState<WidgetType>("LIKE_GOAL");
  const [likeTarget, setLikeTarget] = useState(1000);

  const createMutation = useMutation({
    mutationFn: () =>
      api.createWidget(token, {
        type,
        name,
        settings:
          type === "LIKE_GOAL"
            ? { likeTarget, demoLikes: 250, demoLikeDelta: 25 }
            : undefined,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["widgets"] });
    },
  });

  const demoMutation = useMutation({
    mutationFn: (widgetId: string) => api.demoWidget(token, widgetId),
  });

  const deleteMutation = useMutation({
    mutationFn: (widgetId: string) => api.deleteWidget(token, widgetId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["widgets"] });
      void queryClient.invalidateQueries({ queryKey: ["public-widget"] });
    },
  });

  const deleteWidget = (widget: Widget) => {
    const confirmed = window.confirm(
      `Delete widget "${widget.name}"? This will also remove its public widget URL and saved widget events.`,
    );

    if (confirmed) {
      deleteMutation.mutate(widget.id);
    }
  };

  return (
    <div className="widgets-layout">
      <form
        className="widget-form"
        onSubmit={(event) => {
          event.preventDefault();
          createMutation.mutate();
        }}
      >
        <label>
          <span>Name</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </label>
        <label>
          <span>Type</span>
          <select
            value={type}
            onChange={(event) => setType(event.target.value as WidgetType)}
          >
            <option value="LIKE_GOAL">Like goal</option>
            <option value="GIFT_TRIGGER">Gift trigger</option>
            <option value="EVENT_FEED">Event feed</option>
            <option value="TIKTOK_BEST_GIFT">TikTok best gift</option>
          </select>
        </label>
        <label>
          <span>Likes</span>
          <input
            type="number"
            min={1}
            value={likeTarget}
            onChange={(event) => setLikeTarget(Number(event.target.value))}
            disabled={type !== "LIKE_GOAL"}
          />
        </label>
        <button
          className="icon-button command-button"
          type="submit"
          disabled={createMutation.isPending}
        >
          <Settings size={17} />
          Create
        </button>
      </form>

      <div className="widget-grid">
        {widgets.map((widget) => (
          <article className="widget-card" key={widget.id}>
            <div>
              <span className="widget-type">{formatWidgetType(widget.type)}</span>
              <h3>{widget.name}</h3>
              <p>{widget.publicToken}</p>
            </div>
            <div className="widget-actions">
              <button
                className="icon-only"
                type="button"
                aria-label="Copy widget URL"
                title="Copy widget URL"
                onClick={() => copyWidgetUrl(widget.publicToken)}
              >
                <Copy size={16} />
              </button>
              <button
                className="icon-button command-button"
                type="button"
                onClick={() => demoMutation.mutate(widget.id)}
                disabled={demoMutation.isPending || deleteMutation.isPending}
              >
                <Wand2 size={16} />
                Demo
              </button>
              <button
                className="icon-button danger-button"
                type="button"
                onClick={() => deleteWidget(widget)}
                disabled={deleteMutation.isPending || demoMutation.isPending}
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </article>
        ))}

        {!widgets.length && (
          <EmptyState icon={<Wand2 size={22} />} label="No widgets" />
        )}
      </div>
      {deleteMutation.error && (
        <p className="form-error">{deleteMutation.error.message}</p>
      )}
    </div>
  );
}
