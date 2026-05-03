import type { ReactNode } from "react";

export function EmptyState({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <div className="empty-state">
      {icon}
      <span>{label}</span>
    </div>
  );
}
