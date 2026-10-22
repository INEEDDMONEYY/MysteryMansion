import { CheckCircle2 } from "lucide-react";

const FlagConfirmation = ({ onClose }) => {
  return (
    <div className="py-6 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-neutral-800">
        <CheckCircle2
          size={28}
          className="text-white"
          strokeWidth={1.8}
        />
      </div>

      <h3 className="mt-5 text-lg font-semibold text-white">
        Flag submitted
      </h3>

      <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-neutral-400">
        Thank you for helping keep the community safe. Your report has been
        recorded for review.
      </p>

      <button
        type="button"
        onClick={onClose}
        className="mt-6 rounded-lg bg-white px-5 py-2.5 text-sm font-medium text-black transition hover:bg-neutral-200"
      >
        Done
      </button>
    </div>
  );
};

export default FlagConfirmation;