import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

import { milestonesPageData } from "../data/milestonesPageData";

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 30,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

function MilestoneTrack({ track }) {
  const TrackIcon = track.icon;

  return (
    <motion.div
      variants={itemVariants}
      className="rounded-3xl border border-gray-200 bg-white p-7 shadow-sm transition-all duration-300 hover:border-pink-200 hover:shadow-xl hover:shadow-pink-100/50 sm:p-9"
    >
      <div className="flex items-start justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-pink-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-pink-600">
            <TrackIcon className="h-4 w-4" />
            {track.label}
          </div>

          <h3 className="mt-5 text-3xl font-black tracking-tight text-gray-950">
            {track.title}
          </h3>

          <p className="mt-3 max-w-xl text-sm leading-7 text-gray-600">
            {track.description}
          </p>
        </div>
      </div>

      <div className="mt-8 space-y-4">
        {track.milestones.map(
          (milestone, index) => {
            const Icon = milestone.icon;

            return (
              <motion.div
                key={milestone.title}
                whileHover={{ x: 4 }}
                className="group flex gap-4 rounded-2xl border border-gray-100 bg-gray-50 p-5 transition-all duration-200 hover:border-pink-100 hover:bg-pink-50/40"
              >
                <div className="relative flex shrink-0 flex-col items-center">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-pink-600 shadow-sm transition-colors group-hover:bg-pink-600 group-hover:text-white">
                    <Icon className="h-5 w-5" />
                  </div>

                  {index < track.milestones.length - 1 && (
                    <div className="mt-2 h-full min-h-6 w-px bg-gray-200" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                        Milestone {index + 1}
                      </span>

                      <h4 className="mt-1 text-lg font-bold text-gray-950">
                        {milestone.title}
                      </h4>
                    </div>

                    <ArrowRight className="mt-1 h-5 w-5 shrink-0 text-gray-300 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-pink-500" />
                  </div>

                  <p className="mt-2 text-sm leading-7 text-gray-600">
                    {milestone.description}
                  </p>
                </div>
              </motion.div>
            );
          }
        )}
      </div>
    </motion.div>
  );
}

export default function MilestoneTracks() {
  const { tracks } = milestonesPageData;

  return (
    <section
      id="milestones"
      className="bg-gray-50 px-6 py-24 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl"
        >
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-pink-600">
            {tracks.eyebrow}
          </p>

          <h2 className="mt-4 text-4xl font-black tracking-tight text-gray-950 sm:text-5xl">
            {tracks.title}
          </h2>

          <p className="mt-5 text-lg leading-8 text-gray-600">
            {tracks.description}
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="mt-14 grid gap-7 lg:grid-cols-2"
        >
          <MilestoneTrack track={tracks.provider} />
          <MilestoneTrack track={tracks.client} />
        </motion.div>
      </div>
    </section>
  );
}