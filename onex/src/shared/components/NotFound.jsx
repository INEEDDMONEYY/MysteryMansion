/**
 * NotFound
 * Shared 404 component — displayed when a route doesn't match.
 *
 * Props:
 *   message — optional override text (default: "Page not found")
 */
import { Link, useNavigate } from 'react-router-dom';
import { Ghost, Home, ArrowLeft } from 'lucide-react';

export default function NotFound({ message = "Page not found" }) {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden bg-neutral-950 text-white min-h-[80vh] flex items-center">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-40 -top-40 h-[28rem] w-[28rem] rounded-full bg-pink-500/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-[28rem] w-[28rem] rounded-full bg-yellow-400/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-2xl px-6 py-24 text-center lg:px-8">
        <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-pink-400/30 bg-pink-500/10 px-4 py-2 text-sm font-medium text-pink-300">
          <Ghost className="h-4 w-4" />
          Lost in the mansion
        </div>

        <h1 className="mt-7 text-7xl font-black tracking-tight sm:text-8xl">
          <span className="bg-gradient-to-r from-pink-400 via-pink-500 to-yellow-400 bg-clip-text text-transparent">
            404
          </span>
        </h1>

        <p className="mt-5 text-2xl font-bold text-white">{message}</p>
        <p className="mx-auto mt-3 max-w-md text-gray-400">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="mt-9 flex flex-wrap justify-center gap-4">
          <Link
            to="/"
            className="group inline-flex items-center gap-2 rounded-xl bg-pink-600 px-7 py-3.5 font-semibold text-white shadow-lg shadow-pink-600/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-pink-500 hover:shadow-xl hover:shadow-pink-600/30"
          >
            <Home className="h-5 w-5" />
            Return Home
          </Link>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-7 py-3.5 font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/10"
          >
            <ArrowLeft className="h-5 w-5" />
            Go Back
          </button>
        </div>
      </div>
    </section>
  );
}
