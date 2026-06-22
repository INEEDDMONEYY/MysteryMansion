import { useEffect } from 'react';
import SignupForm from "../components/SignUpForm"
import Logo from '@/assets/Logo.png'
import { setSEO } from '@/shared/utils/seo';

export default function SignupPage() {
    useEffect(() => {
        setSEO('Sign Up | Mystery Mansion', '', { robots: 'noindex, nofollow' });
    }, []);

    return(
        <>
        <div className="signup-bg flex min-h-screen items-center justify-center px-4 py-10">
            <div className="bg-gray-300 text-center rounded-lg w-full max-w-sm p-4 mx-auto form-bg">
                <div className="flex place-items-center justify-center text-center">
                    <h1 className="text-black text-2xl sm:text-[2rem] text-center">Mystery Mansion</h1>
                    <img src={Logo} alt="" className="signin-logo" />
                </div>
                <h3 className="text-black text-2xl sm:text-[2rem]">Sign Up</h3>
                <p className="text-black text-base sm:text-[1.2rem]">Signup for an account please, pleasure, promote your sex lifestyle!</p>
                <div className="w-full">
                    <SignupForm/>
                </div>
            </div>
        </div>
        </>
    )
}