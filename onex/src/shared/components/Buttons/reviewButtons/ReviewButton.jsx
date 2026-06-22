export default function ReviewButton({ onClick, disabled = false }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full sm:w-auto px-4 py-2 rounded-lg text-white font-semibold transition-colors ${
        disabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-pink-600 hover:bg-pink-700'
      }`}
    >
      Escort Reviews
    </button>
  );
}