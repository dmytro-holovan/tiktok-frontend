import type { WidgetType } from "../../lib/api";

export function formatWidgetType(type: WidgetType) {
  return type
    .toLowerCase()
    .split("_")
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
}
