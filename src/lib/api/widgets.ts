import { request } from "./client";
import type { PublicWidget, Widget, WidgetEvent, WidgetType } from "./types";

export const widgetsApi = {
  widgets: (token: string) => request<Widget[]>("/widgets", {}, token),

  createWidget: (
    token: string,
    body: { type: WidgetType; name: string; settings?: Record<string, unknown> },
  ) =>
    request<Widget>(
      "/widgets",
      {
        method: "POST",
        body: JSON.stringify(body),
      },
      token,
    ),

  demoWidget: (token: string, widgetId: string) =>
    request<WidgetEvent>(
      `/widgets/${widgetId}/demo`,
      {
        method: "POST",
      },
      token,
    ),

  deleteWidget: (token: string, widgetId: string) =>
    request<Widget>(
      `/widgets/${widgetId}`,
      {
        method: "DELETE",
      },
      token,
    ),

  publicWidget: (publicToken: string) =>
    request<PublicWidget>(`/widgets/public/${publicToken}`),

  demoPublicWidget: (publicToken: string) =>
    request<WidgetEvent>(`/widgets/public/${publicToken}/demo`, {
      method: "POST",
    }),
};
