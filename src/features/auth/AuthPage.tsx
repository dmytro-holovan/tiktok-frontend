import { useState } from "react";
import type { FormEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import { ArrowRight, Radio } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { api } from "../../lib/api";

export function AuthPage({ onToken }: { onToken: (token: string) => void }) {
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
              autoComplete={
                mode === "login" ? "current-password" : "new-password"
              }
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

          <button
            className="primary-button"
            type="submit"
            disabled={authMutation.isPending}
          >
            <ArrowRight size={18} />
            {authMutation.isPending
              ? "Working"
              : mode === "login"
                ? "Sign in"
                : "Create"}
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
