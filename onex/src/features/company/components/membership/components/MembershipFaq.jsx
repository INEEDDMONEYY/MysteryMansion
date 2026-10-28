import { motion } from "framer-motion";
import { ChevronDown, CircleHelp } from "lucide-react";
import { membershipPageData } from "../data/membershipPageData";

export default function MembershipFaq() {
  const { faqs } = membershipPageData;

  return (
    <section className="bg-neutral-950 px-4 py-20 text-white sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.55 }}
          className="mb-12 text-center"
        >
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-300">
            <CircleHelp size={25} />
          </div>

          <h2 className="mt-5 text-3xl font-black sm:text-4xl">
            Membership questions, answered.
          </h2>

          <p className="mt-4 leading-7 text-neutral-400">
            Understand billing, renewals, and the membership process before
            subscribing.
          </p>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <motion.details
              key={faq.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{
                duration: 0.4,
                delay: Math.min(index * 0.05, 0.2),
              }}
              className="group rounded-2xl border border-white/[0.08] bg-black open:border-fuchsia-500/35"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-5 p-5 sm:p-6">
                <span className="font-bold text-white">{faq.question}</span>

                <ChevronDown
                  size={20}
                  className="shrink-0 text-fuchsia-300 transition-transform group-open:rotate-180"
                />
              </summary>

              <div className="px-5 pb-6 sm:px-6">
                <p className="border-t border-white/[0.08] pt-4 text-sm leading-7 text-neutral-400">
                  {faq.answer}
                </p>
              </div>
            </motion.details>
          ))}
        </div>
      </div>
    </section>
  );
}