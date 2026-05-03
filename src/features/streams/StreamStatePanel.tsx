import { useMutation } from "@tanstack/react-query";
import { Radio, RotateCw, Square } from "lucide-react";
import { EmptyState } from "../../components/ui/EmptyState";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { api } from "../../lib/api";
import type { StreamState } from "../../lib/api";
import { formatDate } from "../../lib/date";

export function StreamStatePanel({
  token,
  state,
  loading,
  onDisconnected,
}: {
  token: string;
  state?: StreamState;
  loading: boolean;
  onDisconnected: () => void;
}) {
  const mutation = useMutation({
    mutationFn: (streamId: string) => api.disconnectStream(token, streamId),
    onSuccess: onDisconnected,
  });

  if (!state) {
    return <EmptyState icon={<Radio size={22} />} label="No selected stream" />;
  }

  return (
    <div className="state-box">
      <div className="state-row">
        <StatusBadge status={state.status} />
        {loading && <RotateCw className="spin" size={16} />}
      </div>

      <dl className="state-grid">
        <div>
          <dt>Handle</dt>
          <dd>@{state.handle}</dd>
        </div>
        <div>
          <dt>Runtime</dt>
          <dd>{state.connectedInProcess ? "Connected" : "Detached"}</dd>
        </div>
        <div>
          <dt>Retries</dt>
          <dd>
            {state.reconnectAttempts}/{state.maxReconnectAttempts}
          </dd>
        </div>
        <div>
          <dt>Total likes</dt>
          <dd>{state.totalLikes.toLocaleString()}</dd>
        </div>
        <div>
          <dt>Last like</dt>
          <dd>{formatDate(state.lastLikeEventAt)}</dd>
        </div>
        <div>
          <dt>Next retry</dt>
          <dd>{formatDate(state.nextReconnectAt)}</dd>
        </div>
      </dl>

      {state.errorMessage && <p className="callout">{state.errorMessage}</p>}

      <button
        className="icon-button danger-button"
        type="button"
        onClick={() => mutation.mutate(state.streamId)}
        disabled={mutation.isPending}
      >
        <Square size={16} />
        Disconnect
      </button>
    </div>
  );
}
