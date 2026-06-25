import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import SignupForm from '../components/SignUpForm';
import EmailVerifyStep from '../components/EmailVerifyStep';
import Logo from '@/assets/Logo.png';
import { setSEO } from '@/shared/utils/seo';

// ── Step 1: choose account type ────────────────────────────────────────────
function AccountTypeSelector({ onSelect }) {
  return (
    <div className="signup-bg flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <img src={Logo} alt="Mystery Mansion" className="signin-logo" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-400 via-fuchsia-400 to-pink-300 bg-clip-text text-transparent">Mystery Mansion</h1>
        </div>

        <h2 className="text-xl text-center mb-2 font-semibold bg-gradient-to-r from-pink-400 via-fuchsia-400 to-pink-300 bg-clip-text text-transparent">
          Create your account
        </h2>
        <p className="text-sm text-center mb-8 bg-gradient-to-r from-pink-300 via-fuchsia-300 to-pink-200 bg-clip-text text-transparent">
          Choose how you want to use Mystery Mansion
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Provider card */}
          <button
            onClick={() => onSelect('provider')}
            className="group relative flex flex-col items-center gap-4 rounded-2xl border-2 border-pink-500 bg-white/10 backdrop-blur-sm p-8 text-left hover:bg-pink-500/20 hover:border-pink-400 transition-all cursor-pointer"
          >
            <div className="h-16 w-16 rounded-full bg-pink-500/30 flex items-center justify-center text-4xl group-hover:bg-pink-500/50 transition-colors">
              💃
            </div>
            <div className="text-center">
              <h3 className="text-white text-xl font-bold mb-1">I'm a Provider</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                Create and manage listings, get discovered by clients, and grow your business on Mystery Mansion.
              </p>
            </div>
            <span className="mt-2 inline-block rounded-full bg-pink-500 px-5 py-2 text-sm font-semibold text-white group-hover:bg-pink-400 transition-colors">
              Sign up as Provider →
            </span>
          </button>

          {/* Client card */}
          <button
            onClick={() => onSelect('client')}
            className="group relative flex flex-col items-center gap-4 rounded-2xl border-2 border-purple-500 bg-white/10 backdrop-blur-sm p-8 text-left hover:bg-purple-500/20 hover:border-purple-400 transition-all cursor-pointer"
          >
            <div className="h-16 w-16 rounded-full bg-purple-500/30 flex items-center justify-center text-4xl group-hover:bg-purple-500/50 transition-colors">
              🕵️
            </div>
            <div className="text-center">
              <h3 className="text-white text-xl font-bold mb-1">I'm a Client</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                Browse provider listings, save your favourites, read reviews, and connect with providers.
              </p>
            </div>
            <span className="mt-2 inline-block rounded-full bg-purple-600 px-5 py-2 text-sm font-semibold text-white group-hover:bg-purple-500 transition-colors">
              Sign up as Client →
            </span>
          </button>
        </div>

        <p className="text-gray-400 text-sm text-center mt-8">
          Already have an account?{' '}
          <Link to="/signin" className="text-pink-400 underline hover:text-pink-300">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}

// ── Step 3: registration form ──────────────────────────────────────────────
function SignupFormStep({ accountType, verifiedEmail, verificationToken, onBack }) {
  const label = accountType === 'provider' ? 'Provider' : 'Client';
  const accent = accountType === 'provider' ? 'border-pink-500' : 'border-purple-500';
  const badgeColor = accountType === 'provider'
    ? 'bg-pink-500/20 text-pink-300 border-pink-500/40'
    : 'bg-purple-500/20 text-purple-300 border-purple-500/40';

  return (
    <div className="signup-bg flex min-h-screen items-center justify-center px-4 py-10">
      <div className={`bg-gray-300 text-center rounded-lg w-full max-w-sm p-4 mx-auto form-bg border-t-4 ${accent}`}>
        <div className="flex place-items-center justify-center text-center">
          <h1 className="text-black text-2xl sm:text-[2rem] text-center">Mystery Mansion</h1>
          <img src={Logo} alt="" className="signin-logo" />
        </div>

        {/* Account type badge */}
        <span className={`inline-block mb-3 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${badgeColor}`}>
          {label} Account
        </span>

        <h3 className="text-black text-2xl sm:text-[2rem]">Sign Up</h3>

        <div className="w-full">
          <SignupForm accountType={accountType} verifiedEmail={verifiedEmail} verificationToken={verificationToken} />
        </div>

        <button
          onClick={onBack}
          className="mt-3 text-sm text-gray-600 underline hover:text-gray-900"
        >
          ← Change account type
        </button>
      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function SignupPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const typeParam = searchParams.get('type');
  const [accountType, setAccountType] = useState(
    typeParam === 'provider' || typeParam === 'client' ? typeParam : null
  );
  const [verifiedEmail, setVerifiedEmail]           = useState(null);
  const [verificationToken, setVerificationToken]   = useState(null);

  useEffect(() => {
    setSEO('Sign Up | Mystery Mansion', '', { robots: 'noindex, nofollow' });
  }, []);

  const handleSelect = (type) => {
    setAccountType(type);
    setSearchParams({ type });
    // Reset verification if user changes account type
    setVerifiedEmail(null);
    setVerificationToken(null);
  };

  const handleBack = () => {
    setAccountType(null);
    setSearchParams({});
    setVerifiedEmail(null);
    setVerificationToken(null);
  };

  const handleVerified = ({ email, verificationToken: token }) => {
    setVerifiedEmail(email);
    setVerificationToken(token);
  };

  if (!accountType) {
    return <AccountTypeSelector onSelect={handleSelect} />;
  }

  if (!verifiedEmail) {
    return (
      <EmailVerifyStep
        accountType={accountType}
        onVerified={handleVerified}
        onBack={handleBack}
      />
    );
  }

  return (
    <SignupFormStep
      accountType={accountType}
      verifiedEmail={verifiedEmail}
      verificationToken={verificationToken}
      onBack={() => { setVerifiedEmail(null); setVerificationToken(null); }}
    />
  );
}
