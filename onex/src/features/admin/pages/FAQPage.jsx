import { useState } from "react";
import { useEffect } from "react";

import { setSEO } from "@/shared/utils/seo";
import {
    ChevronDown,
    ShieldCheck,
    LockKeyhole,
    CircleCheck,
    Users,
    MessageSquare,
    FileLock2,
    Database,
} from "lucide-react";

const FAQ_ITEMS = [
    {
        question: "How do I create my first post?",
        answer:
            "Sign in, click Post, complete your details, add at least one image or video, and submit. Your post will appear in the feed based on your selected categories and location.",
    },
    {
        question: "Do I need an account to comment?",
        answer:
            "Yes. You must be signed in to add comments. Signed-in users can edit or delete their own comments.",
    },
    {
        question: "How does promoted status work?",
        answer:
            "Promoted status gives additional visibility on the platform for a limited time. When active, your account can appear in the promoted section and include promotion indicators.",
    },
    {
        question: "How can I contact support?",
        answer:
            "Use the in-app messaging feature to contact the admin/support team. For urgent policy concerns, report details clearly so the team can review quickly.",
    },
    {
        question: "Can I update or remove my content later?",
        answer:
            "Yes. You can manage your own posts and account details from your dashboard settings. Admin moderation tools may also remove content that violates policies.",
    },
    {
        question: "What we do with your data?",
        answer:
            "We respect your privacy. We do not sell, share, or distribute your photos, email, or any personal information to other platforms or third parties. Your information is securely stored and protected at all times using industry-standard safeguards.",
    },
    {
        question: "Is this a sister company of other platforms?",
        answer:
            "No. We do not participate in the operations or business dealings of any other company or platform. Mystery Mansion is owned and monitored solely by Fantome Technologies. Any partner logos displayed in the footer represent partnerships or affiliations only and do not indicate shared ownership.",
    },
];

const TRUST_ITEMS = [
    {
        icon: Users,
        title: "Community First",
        text: "We design platform features around safer interactions, verified workflows, and clear accountability.",
    },
    {
        icon: MessageSquare,
        title: "Direct Support Access",
        text: "Users can reach support through platform messaging so issues can be tracked and handled quickly.",
    },
    {
        icon: CircleCheck,
        title: "Transparent Policies",
        text: "Our rules and expectations are clearly documented to keep the experience consistent for everyone.",
    },
];

const SECURITY_ITEMS = [
    {
        icon: LockKeyhole,
        title: "Authenticated Actions",
        text: "Sensitive actions require authenticated sessions to help prevent unauthorized changes.",
    },
    {
        icon: FileLock2,
        title: "Restricted Controls",
        text: "Role-based restrictions help enforce account limits and platform safety controls.",
    },
    {
        icon: Database,
        title: "Data Handling",
        text: "User-facing data is scoped to platform needs and protected by backend validation and access checks.",
    },
];

function FAQAccordionItem({ item, isOpen, onToggle }) {
    return (
        <div className="rounded-xl border border-pink-100 bg-white/90 backdrop-blur-sm shadow-sm overflow-hidden">
            <button
                type="button"
                onClick={onToggle}
                className="w-full flex items-center justify-between gap-4 px-4 py-4 text-left hover:bg-pink-50/60 transition"
            >
                <span className="text-sm sm:text-base font-semibold text-gray-800">{item.question}</span>
                <ChevronDown
                    size={18}
                    className={`shrink-0 text-pink-600 transition-transform ${isOpen ? "rotate-180" : "rotate-0"}`}
                />
            </button>
            {isOpen && (
                <div className="px-4 pb-4">
                    <p className="text-sm text-gray-600 leading-relaxed">{item.answer}</p>
                </div>
            )}
        </div>
    );
}

export default function FAQPage() {
    const [openIndex, setOpenIndex] = useState(0);

    useEffect(() => {
        setSEO(
            "FAQ | Mystery Mansion Escort Platform Help Center",
            "Read frequently asked questions about Mystery Mansion, an escort and sex work advertising platform, including safety, content, and account support.",
            { robots: "index, follow", canonicalPath: "/faq" }
        );
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-pink-50 flex flex-col">
            <main className="flex-1 px-4 sm:px-6 lg:px-8 py-10">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center gap-2 rounded-full border border-pink-200 bg-white/90 px-3 py-1 text-xs font-semibold text-pink-700 shadow-sm">
                            <ShieldCheck size={14} />
                            Help Center
                        </div>
                        <h1 className="mt-3 text-3xl sm:text-4xl font-bold text-gray-900">Frequently Asked Questions</h1>
                        <p className="mt-3 text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
                            Here you can find all the answers to common questions about our platform. This will be updated regularly as we grow and receive more feedback from our users.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                        <div className="lg:col-span-2 space-y-3">
                            {FAQ_ITEMS.map((item, index) => (
                                <FAQAccordionItem
                                    key={item.question}
                                    item={item}
                                    isOpen={openIndex === index}
                                    onToggle={() => setOpenIndex((prev) => (prev === index ? -1 : index))}
                                />
                            ))}
                        </div>

                        <aside className="rounded-2xl border border-pink-100 bg-gradient-to-br from-white to-rose-50 p-5 shadow-sm">
                            <h2 className="text-lg font-bold text-gray-900">Quick Notes</h2>
                            <ul className="mt-3 space-y-2 text-sm text-gray-600">
                                <li>Check back regularly for updates.</li>
                                <li>Contact our support team for any inquiries.</li>
                                <li>Review our Terms and Privacy Policy for more information.</li>
                            </ul>
                        </aside>
                    </div>

                    <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="rounded-2xl border border-pink-100 bg-gradient-to-br from-white via-pink-50/40 to-rose-100/40 p-5 shadow-sm">
                            <h2 className="text-xl font-bold text-gray-900">Why Trust Us</h2>
                            <div className="mt-4 space-y-4">
                                {TRUST_ITEMS.map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <div key={item.title} className="flex items-start gap-3">
                                            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white border border-pink-200 text-pink-600 shadow-sm">
                                                <Icon size={16} />
                                            </span>
                                            <div>
                                                <h3 className="text-sm font-semibold text-gray-800">{item.title}</h3>
                                                <p className="text-sm text-gray-600 mt-1">{item.text}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="rounded-2xl border border-pink-100 bg-gradient-to-br from-white via-amber-50/30 to-pink-50 p-5 shadow-sm">
                            <h2 className="text-xl font-bold text-gray-900">Information Security</h2>
                            <div className="mt-4 space-y-4">
                                {SECURITY_ITEMS.map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <div key={item.title} className="flex items-start gap-3">
                                            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white border border-pink-200 text-pink-600 shadow-sm">
                                                <Icon size={16} />
                                            </span>
                                            <div>
                                                <h3 className="text-sm font-semibold text-gray-800">{item.title}</h3>
                                                <p className="text-sm text-gray-600 mt-1">{item.text}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}