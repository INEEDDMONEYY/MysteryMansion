import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Flag, X } from "lucide-react";

import FlagReasonList from "./FlagReasonList";
import FlagConfirmation from "./FlagConfirmation";
import { getFlagReasons } from "../data/flagReasons";
import { isValidFlagTargetType } from "../utils/flagTargets";
import useFlag from "../hooks/useFlag";

const DROPDOWN_WIDTH = 320;

// Anchored, portaled popover variant of FlagModal — escapes any card/overflow
// ancestors instead of rendering as a centered full-screen dialog.
const FlagDropdown = ({
  isOpen,
  onClose,
  anchorRef,
  targetType,
  targetId,
}) => {
  const panelRef = useRef(null);
  const [position, setPosition] = useState(null);
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
      return undefined;
    }

    const updatePosition = () => {
      const anchor = anchorRef?.current;

      if (!anchor) {
        return;
      }

      const rect = anchor.getBoundingClientRect();

      const left = Math.min(
        Math.max(rect.right - DROPDOWN_WIDTH, 12),
        window.innerWidth - DROPDOWN_WIDTH - 12
      );

      setPosition({
        top: rect.bottom + 8,
        left,
      });
    };

    updatePosition();

    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [isOpen, reset, anchorRef]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handlePointerDown = (event) => {
      if (isSubmitting) {
        return;
      }

      const anchor = anchorRef?.current;
      const panel = panelRef.current;

      if (
        panel &&
        !panel.contains(event.target) &&
        anchor &&
        !anchor.contains(event.target)
      ) {
        onClose();
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !isSubmitting) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, isSubmitting, onClose, anchorRef]);

  if (!isOpen || !position) {
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

  return createPortal(
    <div
      ref={panelRef}
      role="dialog"
      aria-modal="false"
      aria-labelledby="flag-dropdown-title"
      style={{
        position: "fixed",
        top: position.top,
        left: position.left,
        width: DROPDOWN_WIDTH,
      }}
      className="z-[60] max-h-[80vh] overflow-y-auto rounded-xl border border-neutral-800 bg-neutral-950 shadow-2xl"
    >
      <div className="flex items-center justify-between border-b border-neutral-800 px-4 py-3">
        <div className="flex items-center gap-2">
          <Flag size={15} className="text-white" />

          <h2
            id="flag-dropdown-title"
            className="text-sm font-semibold text-white"
          >
            Flag content
          </h2>
        </div>

        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          aria-label="Close flag dropdown"
          className="rounded-lg p-1.5 text-neutral-400 transition hover:bg-neutral-900 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          <X size={16} />
        </button>
      </div>

      <div className="p-4">
        {!isValidTarget ? (
          <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-3 text-xs text-neutral-400">
            This content cannot currently be flagged.
          </div>
        ) : isSuccess ? (
          <FlagConfirmation onClose={onClose} />
        ) : (
          <form onSubmit={handleSubmit}>
            <p className="text-xs leading-relaxed text-neutral-500">
              Select the reason that best describes the issue.
            </p>

            <div className="mt-3">
              <FlagReasonList
                reasons={reasons}
                selectedReason={selectedReason}
                onSelect={setSelectedReason}
                disabled={isSubmitting}
              />
            </div>

            <div className="mt-4">
              <label
                htmlFor="flag-dropdown-details"
                className="block text-xs font-medium text-white"
              >
                Additional details
                <span className="ml-1 font-normal text-neutral-500">
                  (optional)
                </span>
              </label>

              <textarea
                id="flag-dropdown-details"
                value={details}
                onChange={(event) => setDetails(event.target.value)}
                disabled={isSubmitting}
                rows={3}
                maxLength={1000}
                placeholder="Provide any additional information."
                className="mt-2 w-full resize-none rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-xs text-white outline-none placeholder:text-neutral-600 focus:border-neutral-600 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>

            {isError && (
              <div
                role="alert"
                className="mt-3 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-xs text-neutral-300"
              >
                {error || "Something went wrong while submitting the flag."}
              </div>
            )}

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="rounded-lg border border-neutral-800 px-3 py-2 text-xs font-medium text-neutral-300 transition hover:bg-neutral-900 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={!selectedReason || isSubmitting}
                className="rounded-lg bg-white px-3 py-2 text-xs font-medium text-black transition hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isSubmitting ? "Submitting..." : "Submit flag"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>,
    document.body
  );
};

export default FlagDropdown;
