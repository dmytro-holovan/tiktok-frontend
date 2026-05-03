import { CircleOff } from "lucide-react";
import { EmptyState } from "../../components/ui/EmptyState";
import type { LiveStream } from "../../lib/api";

export function StreamPicker({
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
