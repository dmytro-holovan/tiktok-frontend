import { useEffect } from "react";

export function useTransparentWidgetPage(enabled: boolean) {
  useEffect(() => {
    document.documentElement.classList.toggle(
      "transparent-widget-page",
      enabled,
    );
    document.body.classList.toggle("transparent-widget-page", enabled);

    return () => {
      document.documentElement.classList.remove("transparent-widget-page");
      document.body.classList.remove("transparent-widget-page");
    };
  }, [enabled]);
}
