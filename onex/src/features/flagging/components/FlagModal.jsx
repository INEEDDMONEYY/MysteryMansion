import { useEffect, useMemo, useState } from "react";
import { X, Flag } from "lucide-react";

import FlagReasonList from "./FlagReasonList";
import FlagConfirmation from "./FlagConfirmation";
import { getFlagReasons } from "../data/flagReasons";
import { isValidFlagTargetType } from "../utils/flagTargets";
import useFlag from "../hooks/useFlag";

const FlagModal = ({
  isOpen,
  onClose,
  targetType,
  targetId,
}) => {
  const [selectedReason, setSelectedReason] = useState("");
  const [details, setDetails] = useState("");

  const {
    flag,
    reset,
    isSubmitting,
    isSuccess,
    isError,
    error,
  } = useFlag();

  const reasons = useMemo(
    () => getFlagReasons(targetType),
    [targetType]
  );

  useEffect(() => {
    if (!isOpen) {
      setSelectedReason("");
      setDetails("");
      reset();
    }
  }, [isOpen, reset]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !isSubmitting) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) {
    return null;
  }

  const isValidTarget = isValidFlagTargetType(targetType);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!isValidTarget || !targetId || !selectedReason || isSubmitting) {
      return;
    }

    try {
      await flag({
        targetType,
        targetId,
        reason: selectedReason,
        details: details.trim(),
      });
    } catch {
      // Error state is handled by useFlag.
    }
  };

  const handleClose = () => {
    if (isSubmitting) {
      return;
    }

    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSubmitting) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="flag-modal-title"
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-neutral-800 bg-neutral-950 shadow-2xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-neutral-800 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-900">
              <Flag size={17} className="text-white" />
            </div>

            <div>
              <h2
                id="flag-modal-title"
                className="text-base font-semibold text-white"
              >
                Flag content
              </h2>

              <p className="text-xs text-neutral-500">
                Help us understand the issue.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            aria-label="Close flag dialog"
            className="rounded-lg p-2 text-neutral-400 transition hover:bg-neutral-900 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5">
          {!isValidTarget ? (
            <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4 text-sm text-neutral-400">
              This content cannot currently be flagged.
            </div>
          ) : isSuccess ? (
            <FlagConfirmation onClose={onClose} />
          ) : (
            <form onSubmit={handleSubmit}>
              <div>
                <p className="text-sm font-medium text-white">
                  Why are you flagging this?
                </p>

                <p className="mt-1 text-xs leading-relaxed text-neutral-500">
                  Select the reason that best describes the issue.
                </p>
              </div>

              <div className="mt-4">
                <FlagReasonList
                  reasons={reasons}
                  selectedReason={selectedReason}
                  onSelect={setSelectedReason}
                  disabled={isSubmitting}
                />
              </div>

              <div className="mt-5">
                <label
                  htmlFor="flag-details"
                  className="block text-sm font-medium text-white"
                >
                  Additional details
                  <span className="ml-1 font-normal text-neutral-500">
                    (optional)
                  </span>
                </label>

                <textarea
                  id="flag-details"
                  value={details}
                  onChange={(event) => setDetails(event.target.value)}
                  disabled={isSubmitting}
                  rows={4}
                  maxLength={1000}
                  placeholder="Provide any additional information that may help with the review."
                  className="mt-2 w-full resize-none rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2.5 text-sm text-white outline-none placeholder:text-neutral-600 focus:border-neutral-600 disabled:cursor-not-allowed disabled:opacity-60"
                />

                <div className="mt-1 text-right text-xs text-neutral-600">
                  {details.length}/1000
                </div>
              </div>

              {isError && (
                <div
                  role="alert"
                  className="mt-4 rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-3 text-sm text-neutral-300"
                >
                  {error || "Something went wrong while submitting the flag."}
                </div>
              )}

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="rounded-lg border border-neutral-800 px-4 py-2.5 text-sm font-medium text-neutral-300 transition hover:bg-neutral-900 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={!selectedReason || isSubmitting}
                  className="rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-black transition hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {isSubmitting ? "Submitting..." : "Submit flag"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default FlagModal;