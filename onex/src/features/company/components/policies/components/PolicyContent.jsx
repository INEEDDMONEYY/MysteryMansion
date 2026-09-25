import { motion } from "framer-motion";
import { Mail } from "lucide-react";
import { Link } from "react-router-dom";

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: "easeOut",
    },
  },
};

function renderItem(item) {
  if (typeof item === "string") {
    return (
      <li className="leading-7 text-gray-600">
        {item}
      </li>
    );
  }

  return (
    <li className="leading-7 text-gray-600">
      {item.text}

      {Array.isArray(item.items) &&
        item.items.length > 0 && (
          <ul className="mt-2 list-disc space-y-2 pl-6">
            {item.items.map((subItem) => (
              <li
                key={subItem}
                className="text-gray-600"
              >
                {subItem}
              </li>
            ))}
          </ul>
        )}
    </li>
  );
}

function renderContentBlock(block) {
  if (block.type === "paragraph") {
    return (
      <p className="text-base leading-8 text-gray-600">
        {block.text}
      </p>
    );
  }

  if (block.type === "list") {
    return (
      <ul className="list-disc space-y-3 pl-6">
        {block.items.map((item, index) => (
          <span key={`${item?.text || item}-${index}`}>
            {renderItem(item)}
          </span>
        ))}
      </ul>
    );
  }

  if (block.type === "privacyLink") {
    return (
      <p className="text-base leading-8 text-gray-600">
        {block.before}
        <Link
          to="/privacy-policy"
          className="font-semibold text-pink-600 underline decoration-pink-300 underline-offset-2 transition hover:text-pink-700"
        >
          Privacy Policy
        </Link>
        {block.after}
      </p>
    );
  }

  if (block.type === "email") {
    return (
      <p className="flex flex-wrap items-center gap-2 text-base leading-8 text-gray-600">
        <span>{block.before}</span>

        <a
          href={`mailto:${block.email}`}
          className="inline-flex items-center gap-2 font-semibold text-pink-600 underline decoration-pink-300 underline-offset-2 transition hover:text-pink-700"
        >
          <Mail className="h-4 w-4" />
          {block.email}
        </a>

        {block.after && <span>{block.after}</span>}
      </p>
    );
  }

  return null;
}

export default function PolicyContent({
  introduction,
  sections = [],
}) {
  return (
    <section className="bg-white px-6 py-20 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-5xl">
        {introduction && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{
              once: true,
              amount: 0.2,
            }}
            transition={{ duration: 0.55 }}
            className="mb-14 rounded-3xl border border-pink-100 bg-pink-50/60 p-7 sm:p-9"
          >
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-pink-600">
              {introduction.eyebrow}
            </p>

            <h2 className="mt-3 text-2xl font-black tracking-tight text-gray-950 sm:text-3xl">
              {introduction.title}
            </h2>

            <p className="mt-4 text-base leading-8 text-gray-600">
              {introduction.description}
            </p>
          </motion.div>
        )}

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{
            once: true,
            amount: 0.05,
          }}
          className="space-y-6"
        >
          {sections.map((section) => (
            <motion.article
              key={section.number}
              variants={itemVariants}
              className="rounded-3xl border border-gray-200 bg-white p-7 shadow-sm transition-shadow duration-300 hover:shadow-lg hover:shadow-pink-100/50 sm:p-9"
            >
              <div className="flex items-start gap-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-pink-50 text-sm font-black text-pink-600">
                  {section.number}
                </div>

                <div className="min-w-0 flex-1">
                  <h2 className="text-xl font-black tracking-tight text-gray-950 sm:text-2xl">
                    {section.title}
                  </h2>

                  <div className="mt-5 space-y-5">
                    {section.content.map(
                      (block, index) => (
                        <div key={index}>
                          {renderContentBlock(block)}
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}