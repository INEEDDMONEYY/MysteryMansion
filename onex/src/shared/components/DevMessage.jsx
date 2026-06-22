/**
 * DevMessage
 * Displays the developer/admin broadcast message from DevMessageContext.
 * Shown as a dismissible banner — typically placed at the top of the app or
 * inside a layout. Style during UI redesign.
 *
 * Props:
 *   dismissible — bool (default true)  — show a close button
 *   className   — string               — extra CSS classes
 */
import { useState } from 'react';
import { X } from 'lucide-react';
import { useDevMessage } from '@/context/DevMessageContext';

export default function DevMessage({ dismissible = true, className = '' }) {
  const { devMessage, loading } = useDevMessage();
  const [dismissed, setDismissed] = useState(false);

  // Nothing to show while loading, after dismiss, or if no message
  if (loading || dismissed || !devMessage) return null;

  return (
    <div
      className={`
        flex items-center justify-between gap-3
        w-full
        bg-amber-500/10 border-b border-amber-500/20
        px-4 py-2.5
        ${className}
      `}
      role="status"
      aria-live="polite"
    >
      <p className="text-sm text-amber-300 leading-snug flex-1 min-w-0">
        {devMessage}
      </p>

      {dismissible && (
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="shrink-0 h-6 w-6 rounded-lg flex items-center justify-center text-amber-400 hover:bg-amber-500/20 transition-colors"
          aria-label="Dismiss message"
        >
          <X size={13} />
        </button>
      )}
    </div>
  );
}
