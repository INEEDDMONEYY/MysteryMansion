import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { useUser } from "@/context/useUser";

export default function DeleteAccountSettings() {
  const { deleteAccount } = useUser();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleDelete = async () => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-gray-700">
          Are you sure you want to permanently delete your account?
        </p>

        <div className="flex gap-2 justify-end">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="text-sm px-3 py-1 rounded border border-gray-300 hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            onClick={async () => {
              toast.dismiss(t.id);
              setLoading(true);
              setMessage("");

              try {
                await deleteAccount();
                setMessage("Account deleted successfully.");
                setTimeout(() => navigate("/signin"), 800);
              } catch (err) {
                setMessage(err.message || "Failed to delete account.");
              } finally {
                setLoading(false);
              }
            }}
            className="text-sm px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700"
          >
            Yes, Delete
          </button>
        </div>
      </div>
    ));
  };

  return (
    <div className="space-y-4">

      {/* Description */}
      <p className="text-sm text-gray-500">
        Deleting your account is permanent and cannot be undone. All profile
        information, messages, and activity associated with your account will
        be permanently removed.
      </p>

      {/* Warning Box */}
      <div className="border border-red-200 bg-red-50 rounded-md p-3">
        <p className="text-sm text-red-700">
          This action is irreversible. Please make sure you truly want to delete
          your account before continuing.
        </p>
      </div>

      {/* Delete Button */}
      <button
        type="button"
        onClick={handleDelete}
        disabled={loading}
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-white transition ${
          loading
            ? "bg-red-400 cursor-not-allowed"
            : "bg-red-600 hover:bg-red-700"
        }`}
      >
        {loading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <Trash2 size={16} />
        )}

        {loading ? "Deleting..." : "Delete My Account"}
      </button>

      {/* Message */}
      {message && (
        <p
          className={`text-sm ${
            message.toLowerCase().includes("success")
              ? "text-green-600"
              : "text-red-600"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}