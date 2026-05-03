import type { ReactNode } from "react";
import type { PublicWidget } from "../../lib/api";
import { formatWidgetType } from "../widgets/widget-format";

export function WidgetFrame({
  title,
  widget,
  children,
  transparent = false,
}: {
  title: string;
  widget?: PublicWidget;
  children?: ReactNode;
  transparent?: boolean;
}) {
  return (
    <main
      className={`widget-preview ${transparent ? "widget-preview-transparent" : ""}`}
    >
      <section
        className={`overlay-widget ${transparent ? "overlay-widget-transparent" : ""}`}
      >
        {!transparent && (
          <div className="overlay-head">
            <span>{widget ? formatWidgetType(widget.type) : "Widget"}</span>
            <strong>{title}</strong>
          </div>
        )}
        {children}
      </section>
    </main>
  );
}
