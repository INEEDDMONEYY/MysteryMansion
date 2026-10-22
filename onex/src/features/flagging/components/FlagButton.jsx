import { useContext, useRef, useState } from "react";
import { Flag } from "lucide-react";

import { UserContext } from "@/context/UserContext";
import FlagModal from "./FlagModal";
import FlagDropdown from "./FlagDropdown";
import { isValidFlagTargetType } from "../utils/flagTargets";

const FlagButton = ({
  targetType,
  targetId,
  label = "Flag",
  showLabel = false,
  className = "",
  disabled = false,
  variant = "modal",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef(null);
  const currentUser = useContext(UserContext)?.user;

  const isValidTarget = isValidFlagTargetType(targetType);

  // Only signed-in users can flag content.
  if (!currentUser?._id) {
    return null;
  }

  const handleOpen = () => {
    if (!disabled && isValidTarget && targetId) {
      setIsOpen(true);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={handleOpen}
        disabled={disabled || !isValidTarget || !targetId}
        aria-label={label}
        title={label}
        className={`inline-flex items-center justify-center gap-2 rounded-lg p-2 text-neutral-400 transition hover:bg-neutral-900 hover:text-white disabled:cursor-not-allowed disabled:opacity-40 ${
          showLabel ? "px-3" : ""
        } ${className}`}
      >
        <Flag size={17} strokeWidth={1.8} />

        {showLabel && (
          <span className="text-sm font-medium">
            {label}
          </span>
        )}
      </button>

      {variant === "dropdown" ? (
        <FlagDropdown
          isOpen={isOpen}
          onClose={handleClose}
          anchorRef={buttonRef}
          targetType={targetType}
          targetId={targetId}
        />
      ) : (
        <FlagModal
          isOpen={isOpen}
          onClose={handleClose}
          targetType={targetType}
          targetId={targetId}
        />
      )}
    </>
  );
};

export default FlagButton;