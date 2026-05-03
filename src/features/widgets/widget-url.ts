export function copyWidgetUrl(publicToken: string) {
  const url = `${window.location.origin}/widget/${publicToken}`;
  void navigator.clipboard.writeText(url);
}
