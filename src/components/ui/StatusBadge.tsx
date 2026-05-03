import type { StreamState } from "../../lib/api";

export function StatusBadge({ status }: { status: StreamState["status"] }) {
  return <span className={`status-badge ${status.toLowerCase()}`}>{status}</span>;
}
