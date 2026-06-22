import { useState, useEffect } from 'react';
import SignInForm from '../components/SignInForm';
import SigninLogo from '@/assets/Logo.png';
import SigninLoader from '@/shared/components/Loaders/SigninLoader';
import { setSEO } from '@/shared/utils/seo';

export default function SignIn() {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setSEO('Sign In | Mystery Mansion', '', { robots: 'noindex, nofollow' });
  }, []);

  return (
    <>
      {loading ? (
        <SigninLoader />
      ) : (
        <div className="signin-bg flex min-h-screen items-center justify-center px-4 py-10">
          <div className="bg-gray-300 text-center rounded-lg w-full max-w-sm p-4 mx-auto form-bg">
            <div className="flex place-items-center justify-center align-center text-center">
              <h1 className="text-black text-2xl sm:text-[2rem] text-center">Mystery Mansion</h1>
              <img src={SigninLogo} alt="" className="signin-logo" />
            </div>
            <h3 className="text-black text-2xl sm:text-[2rem]">Sign In</h3>
            <p className="text-black text-base sm:text-[1.2rem]">
              Sign into your account to continue to please, pleasure, promote your sex lifestyle!
            </p>
            <div className="w-full">
              <SignInForm setLoading={setLoading} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
