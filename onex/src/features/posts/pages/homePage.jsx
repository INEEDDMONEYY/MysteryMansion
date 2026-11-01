import { useEffect, useState } from "react";
import HomeHero from "@/features/posts/components/Home/components/HomeHero";
import HomeContent from "@/features/posts/components/Home/components/HomeContent";
import PolicyToast from "@/shared/components/Toasts/HomeToasts/PolicyToast.jsx";
import AgeRequirementToast from "@/shared/components/Toasts/HomeToasts/AgeRequirementToast.jsx";

export default function HomePage() {
  const [user, setUser] = useState(null);
  const [showPolicyToast, setShowPolicyToast] = useState(false);
  const [showAgeToast, setShowAgeToast] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        setUser(null);
      }
    }

    setShowPolicyToast(true);
  }, []);

  const handlePolicyOk = () => {
    setShowPolicyToast(false);

    setTimeout(() => {
      setShowAgeToast(true);
    }, 500);
  };

  const handleAgeOk = () => {
    setShowAgeToast(false);
  };

  return (
    <>
      {/* <HomeHero /> */}

      <HomeContent user={user} />

      {showPolicyToast && (
        <PolicyToast onOk={handlePolicyOk} />
      )}

      {showAgeToast && (
        <AgeRequirementToast onOk={handleAgeOk} />
      )}
    </>
  );
}
