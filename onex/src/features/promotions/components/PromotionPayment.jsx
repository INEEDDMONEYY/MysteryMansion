import { useState } from "react";
import { ShieldCheck, Copy, CheckCircle } from "lucide-react";

export default function PromotionPayment() {
  const cashTag = "$MysteryyyMansion";
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(cashTag);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  return (
    <section className="w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12">
      <div className="max-w-2xl w-full mx-auto bg-white border border-gray-200 rounded-2xl shadow-lg p-5 sm:p-6 lg:p-8 text-center">
        {/* Header */}
        <div className="flex flex-col items-center mb-5 sm:mb-6">
          <ShieldCheck className="w-10 h-10 sm:w-12 sm:h-12 text-green-600 mb-3" />
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Secure Promotion Payment
          </h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base max-w-xl">
            We currently accept payments through Cash App while our platform
            grows. Payments are securely processed through Cash App while we finlize automated payments.
          </p>
        </div>

        {/* Trust Notice */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 sm:p-5 mb-5 sm:mb-6 text-left">
          <h2 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">
            Why Cash App?
          </h2>
          <ul className="text-sm sm:text-base text-gray-600 space-y-2">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 mt-0.5 text-green-600 shrink-0" />
              Payments are processed directly through Cash App — a trusted
              payment service.
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 mt-0.5 text-green-600 shrink-0" />
              Your promotion or verification is activated after payment is
              confirmed.
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 mt-0.5 text-green-600 shrink-0" />
              This method helps us operate securely while we scale to more
              users.
            </li>
          </ul>
        </div>

        {/* Payment Box */}
        <div className="border border-blue-200 bg-blue-50 rounded-xl p-4 sm:p-6 mb-5 sm:mb-6">
          <p className="text-sm sm:text-base text-gray-700 mb-3">
            Send your payment to the Cash App tag below:
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 bg-white border border-gray-300 rounded-lg px-4 py-3">
            <span className="text-base sm:text-lg font-semibold text-gray-900 break-all">
              {cashTag}
            </span>

            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-black text-white rounded-lg hover:bg-gray-800 transition w-full sm:w-auto justify-center"
            >
              <Copy className="w-4 h-4" />
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="text-left mb-6">
          <h2 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base">
            Payment Instructions
          </h2>

          <ol className="text-sm sm:text-base text-gray-600 space-y-2 list-decimal list-inside">
            <li>Open your Cash App.</li>
            <li>Send the correct payment amount for your selected promotion.</li>
            <li>Include your username & promotion tier in the payment note.</li>
            <li>
                <span className="font-semibold">Optional:</span> After sending payment, send a screenshot of the confirmation to our support email:{" "}
                <a
                  href="mailto:support.mysterymansion@gmail.com"
                  className="font-medium text-blue-600 underline underline-offset-2 hover:text-blue-700"
                >
                  support.mysterymansion@gmail.com
                </a>
                . Please allow up to 3-5 minutes for processing after we receive your payment confirmation.
            </li>
          </ol>
        </div>

        {/* Footer Notice */}
        <div className="text-xs sm:text-sm text-gray-500 border-t pt-4 mt-6">
          <p>
            We are actively working to integrate automated payment processing.
            Cash App payments are temporary while our platform grows to 500+
            users.
          </p>
        </div>
      </div>
    </section>
  );
}
