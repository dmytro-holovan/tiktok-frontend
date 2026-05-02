import { useEffect, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import {
  Navigate,
  Route,
  Routes,
  useNavigate,
  useParams,
} from "react-router-dom";
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  Bell,
  Cable,
  CircleOff,
  Copy,
  Check,
  Edit3,
  Gift,
  Heart,
  LogOut,
  MessageSquare,
  Play,
  PlugZap,
  Radio,
  RotateCw,
  Settings,
  ShieldCheck,
  Square,
  Trash2,
  X,
  UserRound,
  Wand2,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { io } from "socket.io-client";
import {
  api,
  API_URL,
  LIVE_URL,
} from "./lib/api";
import type {
  LiveStream,
  PlatformAccount,
  PublicWidget,
  StreamState,
  Widget,
  WidgetEvent,
  WidgetType,
} from "./lib/api";
import "./App.css";

const TOKEN_KEY = "tiktok-live-token";

function useToken() {
  const [token, setTokenState] = useState(() => localStorage.getItem(TOKEN_KEY));

  const setToken = (value: string | null) => {
    if (value) {
      localStorage.setItem(TOKEN_KEY, value);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }

    setTokenState(value);
  };

  return { token, setToken };
}

function App() {
  const { token, setToken } = useToken();

  return (
    <Routes>
      <Route path="/widget/:publicToken" element={<WidgetPreviewPage />} />
      <Route
        path="/login"
        element={
          token ? <Navigate to="/dashboard" replace /> : <AuthPage onToken={setToken} />
        }
      />
      <Route
        path="/dashboard"
        element={
          token ? (
            <DashboardPage token={token} onLogout={() => setToken(null)} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route path="*" element={<Navigate to={token ? "/dashboard" : "/login"} replace />} />
    </Routes>
  );
}

function AuthPage({ onToken }: { onToken: (token: string) => void }) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const navigate = useNavigate();

  const authMutation = useMutation({
    mutationFn: () =>
      mode === "login"
        ? api.login({ email, password })
        : api.register({ email, password, displayName }),
    onSuccess: (result) => {
      onToken(result.accessToken);
      navigate("/dashboard", { replace: true });
    },
  });

  const submit = (event: FormEvent) => {
    event.preventDefault();
    authMutation.mutate();
  };

  return (
    <main className="auth-shell">
      <section className="auth-panel">
        <div className="brand-row">
          <span className="brand-mark">
            <Radio size={20} />
          </span>
          <span>Stream Console</span>
        </div>

        <div className="auth-heading">
          <h1>{mode === "login" ? "Sign in" : "Create account"}</h1>
          <p>Live streams, widgets, and realtime events.</p>
        </div>

        <form className="stack" onSubmit={submit}>
          <label>
            <span>Email</span>
            <input
              autoComplete="email"
              inputMode="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              required
            />
          </label>

          {mode === "register" && (
            <label>
              <span>Display name</span>
              <input
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                type="text"
                required
              />
            </label>
          )}

          <label>
            <span>Password</span>
            <input
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              minLength={8}
              required
            />
          </label>

          {authMutation.error && (
            <p className="form-error">{authMutation.error.message}</p>
          )}

          <button className="primary-button" type="submit" disabled={authMutation.isPending}>
            <ArrowRight size={18} />
            {authMutation.isPending ? "Working" : mode === "login" ? "Sign in" : "Create"}
          </button>
        </form>

        <button
          className="text-button"
          type="button"
          onClick={() => setMode(mode === "login" ? "register" : "login")}
        >
          {mode === "login" ? "Create new account" : "Use existing account"}
        </button>
      </section>
    </main>
  );
}

function DashboardPage({
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
    cabinetQuery.data?.displayName ?? meQuery.data?.streamer?.displayName ?? "Streamer";

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

        <button className="ghost-button sidebar-action" type="button" onClick={onLogout}>
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

function Metric({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="metric">
      <span className="metric-icon">{icon}</span>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function PanelHeader({ icon, title }: { icon: ReactNode; title: string }) {
  return (
    <div className="panel-header">
      <span>{icon}</span>
      <h2>{title}</h2>
    </div>
  );
}

function AccountForm({ token }: { token: string }) {
  const queryClient = useQueryClient();
  const [handle, setHandle] = useState("");
  const [displayName, setDisplayName] = useState("");

  const mutation = useMutation({
    mutationFn: () =>
      api.addPlatformAccount(token, {
        platform: "TIKTOK",
        handle,
        displayName: displayName || undefined,
      }),
    onSuccess: () => {
      setHandle("");
      setDisplayName("");
      void queryClient.invalidateQueries({ queryKey: ["cabinet"] });
    },
  });

  return (
    <form className="inline-form" onSubmit={(event) => {
      event.preventDefault();
      mutation.mutate();
    }}>
      <label>
        <span>TikTok handle</span>
        <input
          value={handle}
          onChange={(event) => setHandle(event.target.value)}
          placeholder="@username"
          required
        />
      </label>
      <label>
        <span>Name</span>
        <input
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          placeholder="Main channel"
        />
      </label>
      <button className="icon-button command-button" type="submit" disabled={mutation.isPending}>
        <PlugZap size={17} />
        Add
      </button>
      {mutation.error && <p className="form-error wide">{mutation.error.message}</p>}
    </form>
  );
}

function AccountList({
  token,
  accounts,
  onConnect,
}: {
  token: string;
  accounts: PlatformAccount[];
  onConnect: (stream: LiveStream) => void;
}) {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftHandle, setDraftHandle] = useState("");
  const [draftDisplayName, setDraftDisplayName] = useState("");

  const connectMutation = useMutation({
    mutationFn: (platformAccountId: string) => api.connectStream(token, platformAccountId),
    onSuccess: (stream) => {
      onConnect(stream);
      void queryClient.invalidateQueries({ queryKey: ["streams"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (account: PlatformAccount) =>
      api.updatePlatformAccount(token, account.id, {
        handle: draftHandle,
        displayName: draftDisplayName || undefined,
      }),
    onSuccess: () => {
      setEditingId(null);
      void queryClient.invalidateQueries({ queryKey: ["cabinet"] });
      void queryClient.invalidateQueries({ queryKey: ["streams"] });
      void queryClient.invalidateQueries({ queryKey: ["stream-state"] });
    },
  });

  const startEdit = (account: PlatformAccount) => {
    setEditingId(account.id);
    setDraftHandle(account.handle);
    setDraftDisplayName(account.displayName ?? "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraftHandle("");
    setDraftDisplayName("");
  };

  if (!accounts.length) {
    return <EmptyState icon={<UserRound size={22} />} label="No platform accounts" />;
  }

  return (
    <div className="list">
      {accounts.map((account) => {
        const isEditing = editingId === account.id;

        return (
          <div className="row-item account-row" key={account.id}>
            {isEditing ? (
              <form
                className="account-edit-form"
                onSubmit={(event) => {
                  event.preventDefault();
                  updateMutation.mutate(account);
                }}
              >
                <label>
                  <span>TikTok handle</span>
                  <input
                    value={draftHandle}
                    onChange={(event) => setDraftHandle(event.target.value)}
                    placeholder="@username"
                    required
                  />
                </label>
                <label>
                  <span>Name</span>
                  <input
                    value={draftDisplayName}
                    onChange={(event) => setDraftDisplayName(event.target.value)}
                    placeholder="Main channel"
                  />
                </label>
                <div className="account-actions">
                  <button
                    className="icon-button command-button"
                    type="submit"
                    disabled={updateMutation.isPending}
                  >
                    <Check size={17} />
                    Save
                  </button>
                  <button
                    className="ghost-button"
                    type="button"
                    onClick={cancelEdit}
                    disabled={updateMutation.isPending}
                  >
                    <X size={17} />
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div>
                  <strong>@{account.handle}</strong>
                  <span>{account.displayName ?? account.platform}</span>
                </div>
                <div className="account-actions">
                  <button
                    className="ghost-button"
                    type="button"
                    disabled={connectMutation.isPending || updateMutation.isPending}
                    onClick={() => startEdit(account)}
                  >
                    <Edit3 size={17} />
                    Edit
                  </button>
                  <button
                    className="icon-button command-button"
                    type="button"
                    disabled={connectMutation.isPending || updateMutation.isPending}
                    onClick={() => connectMutation.mutate(account.id)}
                  >
                    <Play size={17} />
                    Connect
                  </button>
                </div>
              </>
            )}
          </div>
        );
      })}
      {connectMutation.error && <p className="form-error">{connectMutation.error.message}</p>}
      {updateMutation.error && <p className="form-error">{updateMutation.error.message}</p>}
    </div>
  );
}

function StreamPicker({
  streams,
  selectedStreamId,
  onSelect,
}: {
  streams: LiveStream[];
  selectedStreamId: string | null;
  onSelect: (streamId: string) => void;
}) {
  if (!streams.length) {
    return <EmptyState icon={<CircleOff size={22} />} label="No stream sessions" />;
  }

  return (
    <select
      className="select"
      value={selectedStreamId ?? ""}
      onChange={(event) => onSelect(event.target.value)}
    >
      {streams.map((stream) => (
        <option key={stream.id} value={stream.id}>
          {stream.platformAccount?.handle ?? stream.platform} · {stream.status}
        </option>
      ))}
    </select>
  );
}

function StreamStatePanel({
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

function WidgetManager({ token, widgets }: { token: string; widgets: Widget[] }) {
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
      <form className="widget-form" onSubmit={(event) => {
        event.preventDefault();
        createMutation.mutate();
      }}>
        <label>
          <span>Name</span>
          <input value={name} onChange={(event) => setName(event.target.value)} required />
        </label>
        <label>
          <span>Type</span>
          <select value={type} onChange={(event) => setType(event.target.value as WidgetType)}>
            <option value="LIKE_GOAL">Like goal</option>
            <option value="GIFT_TRIGGER">Gift trigger</option>
            <option value="EVENT_FEED">Event feed</option>
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
        <button className="icon-button command-button" type="submit" disabled={createMutation.isPending}>
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

        {!widgets.length && <EmptyState icon={<Wand2 size={22} />} label="No widgets" />}
      </div>
      {deleteMutation.error && <p className="form-error">{deleteMutation.error.message}</p>}
    </div>
  );
}

function WidgetPreviewPage() {
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

  if (widgetQuery.isLoading) {
    return <WidgetFrame title="Loading" />;
  }

  if (widgetQuery.error || !widgetQuery.data) {
    return <WidgetFrame title="Widget unavailable" />;
  }

  return (
    <WidgetFrame title={widgetQuery.data.name} widget={widgetQuery.data}>
      <WidgetRenderer widget={widgetQuery.data} events={events} />
      <button
        className="icon-button preview-demo"
        type="button"
        onClick={() => demoMutation.mutate()}
        disabled={demoMutation.isPending}
      >
        <Wand2 size={16} />
        Demo
      </button>
    </WidgetFrame>
  );
}

function WidgetFrame({
  title,
  widget,
  children,
}: {
  title: string;
  widget?: PublicWidget;
  children?: ReactNode;
}) {
  return (
    <main className="widget-preview">
      <section className="overlay-widget">
        <div className="overlay-head">
          <span>{widget ? formatWidgetType(widget.type) : "Widget"}</span>
          <strong>{title}</strong>
        </div>
        {children}
      </section>
    </main>
  );
}

function WidgetRenderer({
  widget,
  events,
}: {
  widget: PublicWidget;
  events: WidgetEvent[];
}) {
  const latestEvent = events[0];

  if (widget.type === "LIKE_GOAL") {
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

  if (widget.type === "GIFT_TRIGGER") {
    const payload = latestEvent?.payload ?? {};
    return (
      <div className="gift-widget">
        <Gift size={28} />
        <strong>{String(payload.giftName ?? "Waiting")}</strong>
        <span>x{String(payload.repeatCount ?? 0)}</span>
      </div>
    );
  }

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

function StatusBadge({ status }: { status: StreamState["status"] }) {
  return <span className={`status-badge ${status.toLowerCase()}`}>{status}</span>;
}

function EmptyState({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <div className="empty-state">
      {icon}
      <span>{label}</span>
    </div>
  );
}

function formatDate(value?: string | null) {
  if (!value) {
    return "None";
  }

  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(value));
}

function formatWidgetType(type: WidgetType) {
  return type
    .toLowerCase()
    .split("_")
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
}

function copyWidgetUrl(publicToken: string) {
  const url = `${window.location.origin}/widget/${publicToken}`;
  void navigator.clipboard.writeText(url);
}

export default App;
