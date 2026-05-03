import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, Edit3, Play, UserRound, X } from "lucide-react";
import { EmptyState } from "../../components/ui/EmptyState";
import { api } from "../../lib/api";
import type { LiveStream, PlatformAccount } from "../../lib/api";

export function AccountList({
  token,
  accounts,
  onConnect,
}: {
  token: string;
  accounts: PlatformAccount[];
  onConnect: (stream: LiveStream) => void;
}) {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftHandle, setDraftHandle] = useState("");
  const [draftDisplayName, setDraftDisplayName] = useState("");

  const connectMutation = useMutation({
    mutationFn: (platformAccountId: string) =>
      api.connectStream(token, platformAccountId),
    onSuccess: (stream) => {
      onConnect(stream);
      void queryClient.invalidateQueries({ queryKey: ["streams"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (account: PlatformAccount) =>
      api.updatePlatformAccount(token, account.id, {
        handle: draftHandle,
        displayName: draftDisplayName || undefined,
      }),
    onSuccess: () => {
      setEditingId(null);
      void queryClient.invalidateQueries({ queryKey: ["cabinet"] });
      void queryClient.invalidateQueries({ queryKey: ["streams"] });
      void queryClient.invalidateQueries({ queryKey: ["stream-state"] });
    },
  });

  const startEdit = (account: PlatformAccount) => {
    setEditingId(account.id);
    setDraftHandle(account.handle);
    setDraftDisplayName(account.displayName ?? "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraftHandle("");
    setDraftDisplayName("");
  };

  if (!accounts.length) {
    return (
      <EmptyState icon={<UserRound size={22} />} label="No platform accounts" />
    );
  }

  return (
    <div className="list">
      {accounts.map((account) => {
        const isEditing = editingId === account.id;

        return (
          <div className="row-item account-row" key={account.id}>
            {isEditing ? (
              <form
                className="account-edit-form"
                onSubmit={(event) => {
                  event.preventDefault();
                  updateMutation.mutate(account);
                }}
              >
                <label>
                  <span>TikTok handle</span>
                  <input
                    value={draftHandle}
                    onChange={(event) => setDraftHandle(event.target.value)}
                    placeholder="@username"
                    required
                  />
                </label>
                <label>
                  <span>Name</span>
                  <input
                    value={draftDisplayName}
                    onChange={(event) =>
                      setDraftDisplayName(event.target.value)
                    }
                    placeholder="Main channel"
                  />
                </label>
                <div className="account-actions">
                  <button
                    className="icon-button command-button"
                    type="submit"
                    disabled={updateMutation.isPending}
                  >
                    <Check size={17} />
                    Save
                  </button>
                  <button
                    className="ghost-button"
                    type="button"
                    onClick={cancelEdit}
                    disabled={updateMutation.isPending}
                  >
                    <X size={17} />
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div>
                  <strong>@{account.handle}</strong>
                  <span>{account.displayName ?? account.platform}</span>
                </div>
                <div className="account-actions">
                  <button
                    className="ghost-button"
                    type="button"
                    disabled={connectMutation.isPending || updateMutation.isPending}
                    onClick={() => startEdit(account)}
                  >
                    <Edit3 size={17} />
                    Edit
                  </button>
                  <button
                    className="icon-button command-button"
                    type="button"
                    disabled={connectMutation.isPending || updateMutation.isPending}
                    onClick={() => connectMutation.mutate(account.id)}
                  >
                    <Play size={17} />
                    Connect
                  </button>
                </div>
              </>
            )}
          </div>
        );
      })}
      {connectMutation.error && (
        <p className="form-error">{connectMutation.error.message}</p>
      )}
      {updateMutation.error && (
        <p className="form-error">{updateMutation.error.message}</p>
      )}
    </div>
  );
}
