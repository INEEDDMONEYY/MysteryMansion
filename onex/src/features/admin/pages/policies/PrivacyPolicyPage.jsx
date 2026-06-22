import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import PrivacyPolicy from '@/shared/components/policy/PrivacyPolicy';

import { setSEO } from '@/shared/utils/seo';

export default function PrivacyPolicyPage() {
  const navigate = useNavigate();

  useEffect(() => {
    setSEO(
      'Privacy Policy | Mystery Mansion',
      'Learn how Mystery Mansion handles your personal data on our escort and sex work advertising platform. We do not sell or share your information with third parties.',
      { robots: 'index, follow', canonicalPath: '/privacy-policy' }
    );
  }, []);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-purple-500 via-pink-400 to-black text-white flex flex-col justify-between">
      <div className="max-w-5xl mx-auto py-10 px-6">
        <PrivacyPolicy />
      </div>

      {/* Return Home Button */}
      <div className="w-full text-center py-6">
        <button
          onClick={() => navigate('/home')}
          className="inline-flex items-center gap-2 bg-white text-black font-semibold px-6 py-2 rounded hover:bg-gray-200 transition duration-200"
        >
          <ArrowLeft size={18} />
          Return Home
        </button>
      </div>
    </div>
  );
}
