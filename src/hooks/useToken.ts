import { useState } from "react";

const TOKEN_KEY = "tiktok-live-token";

export function useToken() {
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
