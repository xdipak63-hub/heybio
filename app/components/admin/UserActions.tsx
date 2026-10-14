
import { useState } from "react";
import {
  Ban,
  RotateCcw,
  Trash2
} from "lucide-react";

import AdminConfirmDialog from "./AdminConfirmDialog";

type UserAction =
  | "suspend"
  | "restore"
  | "delete_request";

type Props = {
  userId: string;
  username?: string | null;
  status: "active" | "suspended" | "pending" | "deleted";
  busy?: boolean;
  error?: string | null;
  onAction: (
    action: UserAction,
    userId: string
  ) => Promise<void>;
};

export default function UserActions({
  userId,
  username,
  status,
  busy = false,
  error,
  onAction
}: Props) {
  const [selectedAction, setSelectedAction] =
    useState<UserAction | null>(null);

  const [localBusy, setLocalBusy] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const working = busy || localBusy;

  async function confirmAction() {
    if (!selectedAction || working) return;

    setLocalBusy(true);
    setLocalError(null);

    try {
      await onAction(selectedAction, userId);
      setSelectedAction(null);
    } catch {
      setLocalError(
        "Action could not be completed. Please try again."
      );
    } finally {
      setLocalBusy(false);
    }
  }

  const isDelete = selectedAction === "delete_request";

  return (
    <div className="hb-admin-user-actions">
      {status === "active" && (
        <button
          type="button"
          className="hb-admin-button hb-admin-button--secondary"
          disabled={working}
          onClick={() => setSelectedAction("suspend")}
        >
          <Ban size={16} aria-hidden="true" />
          Suspend
        </button>
      )}

      {status === "suspended" && (
        <button
          type="button"
          className="hb-admin-button hb-admin-button--secondary"
          disabled={working}
          onClick={() => setSelectedAction("restore")}
        >
          <RotateCcw size={16} aria-hidden="true" />
          Restore
        </button>
      )}

      {status !== "deleted" && (
        <button
          type="button"
          className="hb-admin-button hb-admin-button--danger-outline"
          disabled={working}
          onClick={() => setSelectedAction("delete_request")}
        >
          <Trash2 size={16} aria-hidden="true" />
          Request deletion
        </button>
      )}

      <AdminConfirmDialog
        open={selectedAction !== null}
        title={
          selectedAction === "suspend"
            ? "Suspend this account?"
            : selectedAction === "restore"
              ? "Restore this account?"
              : "Request account deletion?"
        }
        description={
          isDelete
            ? "This submits a deletion request for server-side processing. It does not immediately erase account data."
            : `Confirm this account action for ${
                username ? `@${username}` : "the selected user"
              }.`
        }
        confirmLabel={
          isDelete
            ? "Request deletion"
            : selectedAction === "suspend"
              ? "Suspend account"
              : "Restore account"
        }
        destructive={
          selectedAction === "suspend" || isDelete
        }
        requireText={isDelete ? "DELETE" : undefined}
        busy={working}
        error={localError || error}
        onConfirm={confirmAction}
        onClose={() => {
          setSelectedAction(null);
          setLocalError(null);
        }}
      />
    </div>
  );
}
