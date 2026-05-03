import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PlugZap } from "lucide-react";
import { api } from "../../lib/api";

export function AccountForm({ token }: { token: string }) {
  const queryClient = useQueryClient();
  const [handle, setHandle] = useState("");
  const [displayName, setDisplayName] = useState("");

  const mutation = useMutation({
    mutationFn: () =>
      api.addPlatformAccount(token, {
        platform: "TIKTOK",
        handle,
        displayName: displayName || undefined,
      }),
    onSuccess: () => {
      setHandle("");
      setDisplayName("");
      void queryClient.invalidateQueries({ queryKey: ["cabinet"] });
    },
  });

  return (
    <form
      className="inline-form"
      onSubmit={(event) => {
        event.preventDefault();
        mutation.mutate();
      }}
    >
      <label>
        <span>TikTok handle</span>
        <input
          value={handle}
          onChange={(event) => setHandle(event.target.value)}
          placeholder="@username"
          required
        />
      </label>
      <label>
        <span>Name</span>
        <input
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          placeholder="Main channel"
        />
      </label>
      <button
        className="icon-button command-button"
        type="submit"
        disabled={mutation.isPending}
      >
        <PlugZap size={17} />
        Add
      </button>
      {mutation.error && (
        <p className="form-error wide">{mutation.error.message}</p>
      )}
    </form>
  );
}
