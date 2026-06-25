import { useState, useEffect } from "react";
import {
    ChevronDown,
    ShieldCheck,
    LockKeyhole,
    CircleCheck,
    Users,
    MessageSquare,
    FileLock2,
    Database,
    HelpCircle,
    Search,
} from "lucide-react";
import { setSEO } from "@/shared/utils/seo";
import api from "@/shared/utils/api";

// ── Static fallback items (shown if API returns empty or fails) ───────────────
const FALLBACK_FAQS = [
    {
        _id: 'f1',
        question: "How do I create my first post?",
        answer: "Sign in, click Post, complete your details, add at least one image or video, and submit. Your post will appear in the feed based on your selected categories and location.",
    },
    {
        _id: 'f2',
        question: "Do I need an account to comment?",
        answer: "Yes. You must be signed in to add comments. Signed-in users can edit or delete their own comments.",
    },
    {
        _id: 'f3',
        question: "How does promoted status work?",
        answer: "Promoted status gives additional visibility on the platform for a limited time. When active, your account can appear in the promoted section and include promotion indicators.",
    },
    {
        _id: 'f4',
        question: "How can I contact support?",
        answer: "Use the in-app messaging feature to contact the admin/support team. For urgent policy concerns, report details clearly so the team can review quickly.",
    },
    {
        _id: 'f5',
        question: "Can I update or remove my content later?",
        answer: "Yes. You can manage your own posts and account details from your dashboard settings. Admin moderation tools may also remove content that violates policies.",
    },
    {
        _id: 'f6',
        question: "What we do with your data?",
        answer: "We respect your privacy. We do not sell, share, or distribute your photos, email, or any personal information to other platforms or third parties. Your information is securely stored and protected at all times.",
    },
    {
        _id: 'f7',
        question: "Is this a sister company of other platforms?",
        answer: "No. We do not participate in the operations or business dealings of any other company or platform. Mystery Mansion is owned and monitored solely by Fantome Technologies.",
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

function FAQItem({ item, isOpen, onToggle, index }) {
    return (
        <div
            className={`group rounded-2xl border transition-all duration-200 overflow-hidden ${
                isOpen
                    ? 'border-pink-300 bg-gradient-to-br from-pink-50 to-rose-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-pink-200 hover:shadow-sm'
            }`}
        >
            <button
                type="button"
                onClick={onToggle}
                className="w-full flex items-center gap-4 px-5 py-4 text-left"
            >
                {/* Number badge */}
                <span className={`shrink-0 h-7 w-7 rounded-xl flex items-center justify-center text-xs font-bold transition-colors ${
                    isOpen ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-500 group-hover:bg-pink-100 group-hover:text-pink-600'
                }`}>
                    {String(index + 1).padStart(2, '0')}
                </span>
                <span className={`flex-1 text-sm sm:text-base font-semibold transition-colors ${
                    isOpen ? 'text-pink-700' : 'text-gray-800'
                }`}>
                    {item.question}
                </span>
                <ChevronDown
                    size={18}
                    className={`shrink-0 transition-all duration-300 ${
                        isOpen ? 'rotate-180 text-pink-500' : 'text-gray-400 group-hover:text-pink-400'
                    }`}
                />
            </button>
            {isOpen && (
                <div className="px-5 pb-5">
                    <div className="ml-11 pl-0 border-l-2 border-pink-200 pl-4">
                        <p className="text-sm text-gray-600 leading-relaxed">{item.answer}</p>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function FAQPage() {
    const [openIndex, setOpenIndex] = useState(0);
    const [faqs, setFaqs]           = useState([]);
    const [loading, setLoading]     = useState(true);
    const [search, setSearch]       = useState('');

    useEffect(() => {
        setSEO(
            "FAQ | Mystery Mansion Escort Platform Help Center",
            "Read frequently asked questions about Mystery Mansion, an escort and sex work advertising platform, including safety, content, and account support.",
            { robots: "index, follow", canonicalPath: "/faq" }
        );
        api.get('/faqs')
            .then((res) => {
                const data = Array.isArray(res.data) && res.data.length > 0 ? res.data : FALLBACK_FAQS;
                setFaqs(data);
            })
            .catch(() => setFaqs(FALLBACK_FAQS))
            .finally(() => setLoading(false));
    }, []);

    const filtered = search.trim()
        ? faqs.filter(
              (f) =>
                  f.question.toLowerCase().includes(search.toLowerCase()) ||
                  f.answer.toLowerCase().includes(search.toLowerCase())
          )
        : faqs;

    return (
        <div className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-pink-50 flex flex-col">
            <main className="flex-1 px-4 sm:px-6 lg:px-8 py-10">
                <div className="max-w-6xl mx-auto">

                    {/* Hero */}
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center gap-2 rounded-full border border-pink-200 bg-white/90 px-3 py-1 text-xs font-semibold text-pink-700 shadow-sm mb-3">
                            <ShieldCheck size={14} />
                            Help Center
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Frequently Asked Questions</h1>
                        <p className="mt-3 text-sm sm:text-base text-gray-500 max-w-2xl mx-auto">
                            Answers to common questions about our platform. Updated regularly as we grow.
                        </p>

                        {/* Search */}
                        <div className="mt-6 max-w-md mx-auto relative">
                            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => { setSearch(e.target.value); setOpenIndex(-1); }}
                                placeholder="Search questions…"
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 shadow-sm"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

                        {/* FAQ accordion */}
                        <div className="lg:col-span-2 space-y-3">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <div key={i} className="h-14 rounded-2xl bg-gray-200 animate-pulse" />
                                ))
                            ) : filtered.length === 0 ? (
                                <div className="flex flex-col items-center gap-3 py-16 text-gray-400">
                                    <HelpCircle size={36} className="opacity-30" />
                                    <p className="text-sm">No results for "{search}"</p>
                                </div>
                            ) : (
                                filtered.map((item, index) => (
                                    <FAQItem
                                        key={item._id || item.question}
                                        item={item}
                                        index={index}
                                        isOpen={openIndex === index}
                                        onToggle={() => setOpenIndex((prev) => (prev === index ? -1 : index))}
                                    />
                                ))
                            )}
                        </div>

                        {/* Sidebar */}
                        <aside className="space-y-4 lg:sticky lg:top-6">
                            <div className="rounded-2xl border border-pink-100 bg-gradient-to-br from-white to-rose-50 p-5 shadow-sm">
                                <h2 className="text-base font-bold text-gray-900 mb-3">Quick Notes</h2>
                                <ul className="space-y-2 text-sm text-gray-600">
                                    <li className="flex items-start gap-2">
                                        <CircleCheck size={14} className="mt-0.5 shrink-0 text-pink-500" />
                                        Check back regularly for updates.
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CircleCheck size={14} className="mt-0.5 shrink-0 text-pink-500" />
                                        Contact our support team for any inquiries.
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CircleCheck size={14} className="mt-0.5 shrink-0 text-pink-500" />
                                        Review our Terms and Privacy Policy for more information.
                                    </li>
                                </ul>
                            </div>
                            <div className="rounded-2xl border border-pink-100 bg-gradient-to-br from-pink-50 to-rose-100 p-5 shadow-sm text-center">
                                <p className="text-sm font-semibold text-gray-800 mb-1">Still have questions?</p>
                                <p className="text-xs text-gray-500 mb-3">Our support team is here to help.</p>
                                <a
                                    href="/contact"
                                    className="inline-block rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-semibold px-4 py-2 transition-colors"
                                >
                                    Contact Support
                                </a>
                            </div>
                        </aside>
                    </div>

                    {/* Trust + Security cards */}
                    <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="rounded-2xl border border-pink-100 bg-gradient-to-br from-white via-pink-50/40 to-rose-100/40 p-6 shadow-sm">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Why Trust Us</h2>
                            <div className="space-y-4">
                                {TRUST_ITEMS.map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <div key={item.title} className="flex items-start gap-3">
                                            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white border border-pink-200 text-pink-600 shadow-sm">
                                                <Icon size={16} />
                                            </span>
                                            <div>
                                                <h3 className="text-sm font-semibold text-gray-800">{item.title}</h3>
                                                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{item.text}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="rounded-2xl border border-pink-100 bg-gradient-to-br from-white via-amber-50/30 to-pink-50 p-6 shadow-sm">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Information Security</h2>
                            <div className="space-y-4">
                                {SECURITY_ITEMS.map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <div key={item.title} className="flex items-start gap-3">
                                            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white border border-pink-200 text-pink-600 shadow-sm">
                                                <Icon size={16} />
                                            </span>
                                            <div>
                                                <h3 className="text-sm font-semibold text-gray-800">{item.title}</h3>
                                                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{item.text}</p>
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

