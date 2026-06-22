// src/pages/homePage.jsx
import Body from '@/shared/components/Body';
import PolicyToast from '@/shared/components/Toasts/HomeToasts/PolicyToast.jsx';
import AgeRequirementToast from '@/shared/components/Toasts/HomeToasts/AgeRequirementToast.jsx';
import { useEffect, useState } from 'react';
import { setSEO } from '@/shared/utils/seo';

export default function HomePage() {
  const [user, setUser] = useState(null);
  const [showPolicyToast, setShowPolicyToast] = useState(false);
  const [showAgeToast, setShowAgeToast] = useState(false);

  useEffect(() => {
    setSEO(
      'Find Escorts Near You | Search Profiles & Reviews | Mystery Mansion',
      'Mystery Mansion is an escort and sex work advertising platform where users can discover listings, connect with profiles, and browse categorized updates.',
      { robots: 'index, follow', canonicalPath: '/home' }
    );

    // ✅ Load user info from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    // ✅ Show PolicyToast immediately on page load
    setShowPolicyToast(true);
  }, []);

  const handlePolicyOk = () => {
    // ✅ Dismiss PolicyToast
    setShowPolicyToast(false);

    // ✅ Trigger AgeRequirementToast with a short delay
    setTimeout(() => {
      setShowAgeToast(true);
    }, 500); // 500ms delay for smoother transition
  };

  const handleAgeOk = () => {
    // ✅ Dismiss AgeRequirementToast
    setShowAgeToast(false);
  };

  return (
    <>
      <div className="bg-img">
        <Body user={user} />
      </div>

      {/* ✅ Sequential toasts with delay */}
      {showPolicyToast && <PolicyToast onOk={handlePolicyOk} />}
      {showAgeToast && <AgeRequirementToast onOk={handleAgeOk} />}
    </>
  );
}
