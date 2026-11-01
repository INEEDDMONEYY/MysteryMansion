import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Headset,
  Mail,
  Clock,
  ShieldCheck,
  Bug,
  Megaphone,
  MessageCircle,
  Scale,
  Send,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { setSEO } from "@/shared/utils/seo";
import api from "@/shared/utils/api";
import { useUser } from "@/context/useUser";

const CONTACT_IMAGE = "/mm-hero.png";
const SUPPORT_EMAIL = "support.mysterymansion@gmail.com";

const inquiryOptions = [
  {
    value: "Membership/Account Help",
    label: "Membership/Account Help",
    description: "Account access, membership, or account-related questions.",
    icon: ShieldCheck,
  },
  {
    value: "Report a Bug",
    label: "Report a Bug",
    description: "Report technical problems, errors, or unexpected behavior.",
    icon: Bug,
  },
  {
    value: "Advertisement",
    label: "Advertisement",
    description: "Advertising opportunities and promotional inquiries.",
    icon: Megaphone,
  },
  {
    value: "General Questions/Concerns",
    label: "General Questions/Concerns",
    description: "General platform questions, feedback, or concerns.",
    icon: MessageCircle,
  },
  {
    value: "Legal Inquiry",
    label: "Legal Inquiry",
    description: "Legal matters, privacy questions, or formal requests.",
    icon: Scale,
  },
];

const initialForm = {
  name: "",
  email: "",
  topic: "",
  subject: "",
  message: "",
};

export default function ContactPage() {
  const { user } = useUser();
  const [formData, setFormData] = useState(initialForm);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  // Honeypot — hidden from people, filled in by most spam bots.
  const [website, setWebsite] = useState("");

  // Prefill name/email for signed-in users without overwriting typed values.
  useEffect(() => {
    if (!user) return;
    setFormData((current) => ({
      ...current,
      name: current.name || user.username || "",
      email: current.email || user.email || "",
    }));
  }, [user]);

  useEffect(() => {
    setSEO(
      "Contact Support | Mystery Mansion",
      "Contact Mystery Mansion for membership and account help, technical support, advertising opportunities, general questions, and legal inquiries.",
      {
        robots: "index, follow",
        canonicalPath: "/contact",
      }
    );
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    setFeedback("");
    setError("");
    setFieldErrors((current) => {
      if (!current[name]) return current;
      const next = { ...current };
      delete next[name];
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    setFeedback("");
    setError("");
    setFieldErrors({});

    try {
      await api.post("/contact", { ...formData, website });
      setFormData({
        ...initialForm,
        name: user?.username || "",
        email: user?.email || "",
      });
      setFeedback(
        "Thanks! Your inquiry has been sent. Our support team will reply to the email you provided."
      );
    } catch (err) {
      const data = err?.response?.data || {};
      setFieldErrors(data.fields || {});
      setError(
        data.error ||
          `We couldn't send your inquiry right now. Please try again or email ${SUPPORT_EMAIL}.`
      );
    } finally {
      setSubmitting(false);
    }
  };

  const fieldError = (name) =>
    fieldErrors[name] ? (
      <p id={`contact-${name}-error`} className="mt-1.5 text-xs text-red-400">
        {fieldErrors[name]}
      </p>
    ) : null;

  return (
    <div className="relative min-h-screen overflow-hidden bg-neutral-950 text-white">
      {/* Background Effects */}
      <div className="pointer-events-none absolute -left-40 top-20 h-96 w-96 rounded-full bg-fuchsia-600/10 blur-[130px]" />
      <div className="pointer-events-none absolute -right-40 top-96 h-96 w-96 rounded-full bg-pink-600/10 blur-[130px]" />

      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        {/* Page Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-12 max-w-3xl text-center"
        >
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-pink-500/20 bg-pink-500/10 px-4 py-2">
            <Headset size={16} className="text-pink-400" />

            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-pink-300">
              We're Here to Help
            </span>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl">
            Let's Start a{" "}
            <span className="bg-gradient-to-r from-pink-400 via-fuchsia-400 to-pink-300 bg-clip-text text-transparent">
              Conversation.
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-gray-400 sm:text-base">
            Have a question, need assistance, or want to discuss an
            opportunity? Choose an inquiry category and tell us how
            we can help.
          </p>
        </motion.div>

        {/* Main Content */}
        <div className="grid items-start gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-12">
          {/* Left Column */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-6"
          >
            {/* Contact Image */}
            {CONTACT_IMAGE && (
              <div className="group relative h-56 overflow-hidden rounded-2xl border border-white/10 bg-neutral-900 sm:h-64">
                <img
                  src={CONTACT_IMAGE}
                  alt="Mystery Mansion customer support"
                  className="absolute inset-0 h-full w-full scale-105 object-cover blur-sm transition duration-700 group-hover:scale-110"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/20" />

                <div className="absolute bottom-5 left-5 right-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-pink-400">
                    Mystery Mansion Support
                  </p>

                  <h2 className="mt-2 text-xl font-bold text-white sm:text-2xl">
                    Your experience matters.
                  </h2>

                  <p className="mt-1 text-sm text-gray-300">
                    We're committed to listening, improving, and
                    supporting our community.
                  </p>
                </div>
              </div>
            )}

            {/* Support Information */}
            <div className="rounded-2xl border border-white/10 bg-neutral-900/80 p-5 sm:p-6">
              <h2 className="text-lg font-bold text-white">
                Contact Information
              </h2>

              <p className="mt-2 text-sm leading-relaxed text-gray-400">
                You can reach our support team directly through email
                or submit an inquiry using the form.
              </p>

              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="mt-5 flex items-center gap-3 rounded-xl border border-white/10 bg-black/50 p-4 transition hover:border-pink-500/40 hover:bg-pink-500/5"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-pink-500/10">
                  <Mail size={20} className="text-pink-400" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-gray-500">
                    Support Email
                  </p>

                  <p className="break-all text-sm font-semibold text-white">
                    {SUPPORT_EMAIL}
                  </p>
                </div>

                <ArrowUpRight
                  size={17}
                  className="shrink-0 text-gray-500"
                />
              </a>

              <div className="mt-5 flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-yellow-400/10">
                  <Clock size={19} className="text-yellow-400" />
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-white">
                    Response Times
                  </h3>

                  <p className="mt-1 text-xs leading-relaxed text-gray-400">
                    We aim to respond within 24 hours. Promotion
                    account issues typically receive a response
                    within 15 minutes.
                  </p>
                </div>
              </div>
            </div>

            {/* Inquiry Categories */}
            <div className="rounded-2xl border border-white/10 bg-neutral-900/80 p-5 sm:p-6">
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-300">
                What Can We Help With?
              </h2>

              <div className="mt-4 space-y-3">
                {inquiryOptions.map((option) => {
                  const Icon = option.icon;

                  return (
                    <div
                      key={option.value}
                      className="flex items-center gap-3"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/5">
                        <Icon size={17} className="text-pink-400" />
                      </div>

                      <div>
                        <p className="text-sm font-medium text-gray-200">
                          {option.label}
                        </p>

                        <p className="text-xs text-gray-500">
                          {option.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Right Column - Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="rounded-2xl border border-white/10 bg-neutral-900 p-5 shadow-2xl shadow-black/30 sm:p-8"
          >
            <div className="mb-7">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-fuchsia-700 shadow-lg shadow-pink-900/20">
                <MessageCircle size={23} className="text-white" />
              </div>

              <h2 className="mt-5 text-2xl font-bold text-white">
                Send Us a Message
              </h2>

              <p className="mt-2 text-sm leading-relaxed text-gray-400">
                Complete the form below and provide as much detail
                as possible so we can direct your inquiry appropriately.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
                <label htmlFor="contact-website">Website</label>
                <input
                  id="contact-website"
                  type="text"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
              </div>

              {/* Name */}
              <div>
                <label
                  htmlFor="contact-name"
                  className="mb-2 block text-sm font-medium text-gray-300"
                >
                  Full Name
                </label>

                <input
                  id="contact-name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  autoComplete="name"
                  maxLength={100}
                  required
                  aria-invalid={Boolean(fieldErrors.name)}
                  className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20"
                />
                {fieldError("name")}
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="contact-email"
                  className="mb-2 block text-sm font-medium text-gray-300"
                >
                  Email Address
                </label>

                <input
                  id="contact-email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  autoComplete="email"
                  maxLength={254}
                  required
                  aria-invalid={Boolean(fieldErrors.email)}
                  className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20"
                />
                {fieldError("email")}
              </div>

              {/* Inquiry Type */}
              <div>
                <label
                  htmlFor="contact-topic"
                  className="mb-2 block text-sm font-medium text-gray-300"
                >
                  Inquiry Type
                </label>

                <select
                  id="contact-topic"
                  name="topic"
                  value={formData.topic}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-white outline-none transition focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20"
                >
                  <option value="" disabled>
                    Select an inquiry type
                  </option>

                  {inquiryOptions.map((option) => (
                    <option
                      key={option.value}
                      value={option.value}
                      className="bg-neutral-900 text-white"
                    >
                      {option.label}
                    </option>
                  ))}
                </select>

                {fieldError("topic")}
                <p className="mt-2 text-xs text-gray-500">
                  Select the category that best describes your inquiry.
                </p>
              </div>

              {/* Subject */}
              <div>
                <label
                  htmlFor="contact-subject"
                  className="mb-2 block text-sm font-medium text-gray-300"
                >
                  Subject
                </label>

                <input
                  id="contact-subject"
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="What is your inquiry about?"
                  maxLength={150}
                  required
                  aria-invalid={Boolean(fieldErrors.subject)}
                  className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20"
                />
                {fieldError("subject")}
              </div>

              {/* Message */}
              <div>
                <label
                  htmlFor="contact-message"
                  className="mb-2 block text-sm font-medium text-gray-300"
                >
                  Message
                </label>

                <textarea
                  id="contact-message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us how we can help..."
                  rows={6}
                  minLength={10}
                  maxLength={5000}
                  required
                  aria-invalid={Boolean(fieldErrors.message)}
                  className="w-full resize-y rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-sm leading-relaxed text-white outline-none transition placeholder:text-gray-600 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20"
                />

                <p className="mt-1 text-right text-xs text-gray-600">
                  {formData.message.length}/5000
                </p>
                {fieldError("message")}
              </div>

              {/* Feedback */}
              {feedback && (
                <div
                  role="status"
                  className="flex items-start gap-2 rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-300"
                >
                  <CheckCircle2
                    size={17}
                    className="mt-0.5 shrink-0"
                  />

                  {feedback}
                </div>
              )}

              {error && (
                <div
                  role="alert"
                  className="flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300"
                >
                  <AlertCircle size={17} className="mt-0.5 shrink-0" />
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-600 to-fuchsia-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-pink-900/20 transition-all hover:-translate-y-0.5 hover:from-pink-500 hover:to-fuchsia-500 hover:shadow-pink-900/40 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {submitting ? (
                  <Loader2 size={17} className="animate-spin" />
                ) : (
                  <Send
                    size={17}
                    className="transition-transform group-hover:translate-x-1"
                  />
                )}

                {submitting ? "Sending..." : "Send Inquiry"}
              </button>

              <p className="text-center text-xs leading-relaxed text-gray-500">
                By submitting this inquiry, you are contacting
                Mystery Mansion support regarding your selected topic.
              </p>
            </form>
          </motion.div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-12 rounded-2xl border border-pink-500/15 bg-gradient-to-r from-pink-950/40 via-neutral-900 to-fuchsia-950/30 p-6 text-center sm:p-8"
        >
          <h2 className="text-lg font-bold text-white sm:text-xl">
            Your Feedback Helps Us Improve.
          </h2>

          <p className="mx-auto mt-2 max-w-2xl text-sm leading-relaxed text-gray-400">
            Mystery Mansion continues to grow through user feedback,
            ongoing development, and a commitment to improving the
            platform experience.
          </p>

          <div className="mt-4 flex items-center justify-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-pink-500" />

            <span className="text-xs font-semibold uppercase tracking-widest text-pink-300">
              Built. Improving. Growing.
            </span>

            <span className="h-1.5 w-1.5 rounded-full bg-yellow-400" />
          </div>
        </motion.div>
      </div>
    </div>
  );
}