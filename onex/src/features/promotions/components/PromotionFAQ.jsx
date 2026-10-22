import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function PromotionFAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "Can I stack promotion duration time?",
      answer:
        "Yes, promotion duration can be stacked. If you have enough credits in your account you can stack multiple promotion duration periods.",
    },
    {
      question: "After promoting account, how long will it take for the promotion to take effect?",
      answer:
        "After promoting an account, the promotion will take effect immediately. If it does not, please contact support.",
    },
    {
      question: "When account is promoted, will it be shown in forums?",
      answer:
        "No, promoted accounts will not be shown in forums. Promotions only affect the visibility of your account within the main feed and relevant sections. However if your account is verified, it may receive additional visibility benefits within the forums page.",
    },
    {
      question: "If I get the Blue Badge Verification, will the coins be deducted from my account monthly?",
      answer:
        "Yes, if you get the Blue Badge Verification, the coins will be deducted from your account on a monthly basis to keep your verified status active. If there is not enough credits in account to cover the monthly fee, your verified status will be deactivated until sufficient credits are available.",
    },
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="px-6 py-10 max-w-5xl mx-auto">
      {/* 🖤 Title */}
      <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold text-center text-black mb-6 sm:mb-8 max-w-3xl mx-auto leading-snug">
        FAQ's are where all questions about the promotion system are answered
      </h2>

      {/* ❓ FAQ List */}
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="bg-white/80 backdrop-blur-md border border-pink-200 rounded-xl shadow-md p-4 transition"
          >
            <button
              onClick={() => toggleFAQ(index)}
              className="w-full flex items-center justify-between text-left"
            >
              <span className="text-pink-700 font-semibold text-lg">{faq.question}</span>
              {openIndex === index ? (
                <ChevronUp size={20} className="text-pink-500" />
              ) : (
                <ChevronDown size={20} className="text-pink-500" />
              )}
            </button>
            {openIndex === index && (
              <p className="mt-3 text-gray-600 text-sm leading-relaxed">{faq.answer}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
