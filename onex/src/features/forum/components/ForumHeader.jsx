import { motion } from "framer-motion";
import {
  ArrowRight,
  MessageSquareText,
  Sparkles,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function ForumHeader({
  createThreadHref,
}) {
  return (
    <section className="relative overflow-hidden bg-black text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-pink-500/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-yellow-400/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 py-20 sm:py-24 lg:px-8 lg:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-[1.2fr_0.8fr]">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: "easeOut" }}
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-pink-400/30 bg-pink-500/10 px-4 py-2 text-sm font-medium text-pink-300">
              <MessageSquareText className="h-4 w-4" />
              Mystery Mansion Community
            </div>

            <h1 className="max-w-4xl text-5xl font-black leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
              Good conversations.
              <span className="block bg-gradient-to-r from-pink-400 via-pink-500 to-yellow-400 bg-clip-text text-transparent">
                Better connections.
              </span>
            </h1>

            <p className="mt-7 max-w-2xl text-lg leading-8 text-gray-300 sm:text-xl">
              Ask questions, exchange experiences, share knowledge, and
              connect with the Mystery Mansion community through meaningful
              discussions.
            </p>

            {createThreadHref && (
              <div className="mt-9">
                <Link
                  to={createThreadHref}
                  className="group inline-flex items-center gap-2 rounded-xl bg-pink-600 px-6 py-3.5 font-semibold text-white shadow-lg shadow-pink-600/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-pink-500 hover:shadow-xl hover:shadow-pink-600/30"
                >
                  Start a Discussion
                  <ArrowRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 35 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              delay: 0.15,
              duration: 0.7,
              ease: "easeOut",
            }}
            className="relative"
          >
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4 shadow-2xl shadow-pink-900/20 sm:p-6">
              <div className="rounded-2xl bg-gradient-to-br from-pink-600 via-pink-500 to-yellow-400 p-[1px]">
                <div className="rounded-2xl bg-black p-7 sm:p-9">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-pink-500/10 text-pink-400">
                    <Sparkles className="h-7 w-7" />
                  </div>

                  <h2 className="mt-6 text-2xl font-bold sm:text-3xl">
                    Your voice belongs here.
                  </h2>

                  <p className="mt-3 text-sm leading-7 text-gray-400">
                    Every useful question, thoughtful answer, and respectful
                    discussion can help someone else in the community.
                  </p>

                  <div className="mt-8 space-y-3">
                    <div className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.04] p-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-pink-500/10 text-pink-400">
                        <MessageSquareText className="h-5 w-5" />
                      </div>

                      <div>
                        <p className="font-semibold text-white">
                          Start conversations
                        </p>
                        <p className="mt-1 text-xs text-gray-400">
                          Ask, discuss, and exchange ideas.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.04] p-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-pink-500/10 text-pink-400">
                        <Users className="h-5 w-5" />
                      </div>

                      <div>
                        <p className="font-semibold text-white">
                          Learn from the community
                        </p>
                        <p className="mt-1 text-xs text-gray-400">
                          Discover different experiences and perspectives.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}