import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Activity,
  BadgeCheck,
  Bell,
  Cable,
  LogOut,
  Radio,
  ShieldCheck,
  Wand2,
} from "lucide-react";
import { Metric } from "../../components/ui/Metric";
import { PanelHeader } from "../../components/ui/PanelHeader";
import { AccountForm } from "../accounts/AccountForm";
import { AccountList } from "../accounts/AccountList";
import { StreamPicker } from "../streams/StreamPicker";
import { StreamStatePanel } from "../streams/StreamStatePanel";
import { WidgetManager } from "../widgets/WidgetManager";
import { api, API_URL } from "../../lib/api";

export function DashboardPage({
  token,
  onLogout,
}: {
  token: string;
  onLogout: () => void;
}) {
  const queryClient = useQueryClient();
  const [selectedStreamId, setSelectedStreamId] = useState<string | null>(null);

  const meQuery = useQuery({
    queryKey: ["me"],
    queryFn: () => api.me(token),
  });

  const cabinetQuery = useQuery({
    queryKey: ["cabinet"],
    queryFn: () => api.cabinet(token),
  });

  const streamsQuery = useQuery({
    queryKey: ["streams"],
    queryFn: () => api.streams(token),
    refetchInterval: 5_000,
  });

  const currentStreamId = selectedStreamId ?? streamsQuery.data?.[0]?.id ?? null;

  const widgetsQuery = useQuery({
    queryKey: ["widgets"],
    queryFn: () => api.widgets(token),
  });

  const stateQuery = useQuery({
    queryKey: ["stream-state", currentStreamId],
    queryFn: () => api.streamState(token, currentStreamId as string),
    enabled: Boolean(currentStreamId),
    refetchInterval: 2_500,
  });

  const invalidateStreams = () => {
    void queryClient.invalidateQueries({ queryKey: ["streams"] });
    void queryClient.invalidateQueries({ queryKey: ["stream-state"] });
  };

  const displayName =
    cabinetQuery.data?.displayName ??
    meQuery.data?.streamer?.displayName ??
    "Streamer";

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand-row">
          <span className="brand-mark">
            <Radio size={20} />
          </span>
          <span>Stream Console</span>
        </div>

        <nav className="side-nav">
          <a href="#overview">
            <Activity size={18} />
            Overview
          </a>
          <a href="#streams">
            <Cable size={18} />
            Streams
          </a>
          <a href="#widgets">
            <Wand2 size={18} />
            Widgets
          </a>
        </nav>

        <button
          className="ghost-button sidebar-action"
          type="button"
          onClick={onLogout}
        >
          <LogOut size={17} />
          Log out
        </button>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">Cabinet</p>
            <h1>{displayName}</h1>
          </div>
          <div className="runtime-pill">
            <ShieldCheck size={16} />
            {API_URL.replace(/^https?:\/\//, "")}
          </div>
        </header>

        <section id="overview" className="metrics-grid">
          <Metric
            icon={<BadgeCheck size={18} />}
            label="Accounts"
            value={String(cabinetQuery.data?.platformAccounts?.length ?? 0)}
          />
          <Metric
            icon={<Radio size={18} />}
            label="Streams"
            value={String(streamsQuery.data?.length ?? 0)}
          />
          <Metric
            icon={<Wand2 size={18} />}
            label="Widgets"
            value={String(widgetsQuery.data?.length ?? 0)}
          />
          <Metric
            icon={<Bell size={18} />}
            label="Current state"
            value={stateQuery.data?.status ?? "Idle"}
          />
        </section>

        <section className="content-grid">
          <div className="panel" id="streams">
            <PanelHeader icon={<Cable size={18} />} title="TikTok account" />
            <AccountForm token={token} />
            <AccountList
              token={token}
              accounts={cabinetQuery.data?.platformAccounts ?? []}
              onConnect={(stream) => {
                setSelectedStreamId(stream.id);
                invalidateStreams();
              }}
            />
          </div>

          <div className="panel">
            <PanelHeader icon={<Activity size={18} />} title="Stream state" />
            <StreamPicker
              streams={streamsQuery.data ?? []}
              selectedStreamId={currentStreamId}
              onSelect={setSelectedStreamId}
            />
            <StreamStatePanel
              token={token}
              state={stateQuery.data}
              loading={stateQuery.isFetching}
              onDisconnected={invalidateStreams}
            />
          </div>
        </section>

        <section className="panel" id="widgets">
          <PanelHeader icon={<Wand2 size={18} />} title="Widgets" />
          <WidgetManager token={token} widgets={widgetsQuery.data ?? []} />
        </section>
      </section>
    </main>
  );
}
