import { useState, useEffect } from "react";

export default function OnboardingGuide({ steps, onFinish }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [show, setShow] = useState(false);

  // ✅ Show guide only once per session
  useEffect(() => {
    const hasSeenGuide = sessionStorage.getItem("hasSeenOnboarding");
    if (!hasSeenGuide) {
      setShow(true);
      sessionStorage.setItem("hasSeenOnboarding", "true");
    }
  }, []);

  if (!steps || steps.length === 0 || !show) return null;

  const step = steps[currentStep];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleFinish();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = () => {
    setShow(false);
    onFinish?.();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 sm:p-6">
      <div className="bg-white p-4 sm:p-6 md:p-8 rounded-xl max-w-md sm:max-w-lg md:max-w-xl w-full text-center shadow-lg relative">
        {/* Title */}
        {step?.title && (
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-3 md:mb-4">
            {step.title}
          </h2>
        )}

        {/* Description */}
        {step?.description && (
          <p className="text-sm sm:text-base md:text-lg text-gray-700 mb-4 sm:mb-5 md:mb-6">
            {step.description}
          </p>
        )}

        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row justify-between mt-4 gap-2 sm:gap-4">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="px-4 py-2 sm:px-5 sm:py-2.5 bg-gray-300 rounded disabled:opacity-50 w-full sm:w-auto text-sm sm:text-base"
          >
            Previous
          </button>
          <button
            onClick={handleNext}
            className="px-4 py-2 sm:px-5 sm:py-2.5 bg-pink-500 text-white rounded w-full sm:w-auto text-sm sm:text-base"
          >
            {currentStep === steps.length - 1 ? "Finish" : "Next"}
          </button>
        </div>

        {/* Close Button */}
        <button
          onClick={handleFinish}
          className="absolute top-2 sm:top-3 right-2 sm:right-3 text-gray-500 hover:text-gray-700 text-lg sm:text-xl"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
