import { useEffect } from 'react';
import ForgotPassword from '../components/ForgotPassForm'
import Logo from '@/assets/Logo.png'
import { setSEO } from '@/shared/utils/seo';

export default function ForgotPasswordPage() {
    useEffect(() => {
        setSEO('Forgot Password | Mystery Mansion', '', { robots: 'noindex, nofollow' });
    }, []);

    return(
        <>
        <div className="signin-bg flex min-h-screen items-center justify-center px-4 py-10">
            <div className="bg-gray-300 text-center rounded-lg w-full max-w-sm p-4 mx-auto form-bg">
                <div className="flex place-items-center justify-center text-center">
                    <h1 className="text-black text-2xl sm:text-[2rem] text-center">Mystery Mansion</h1>
                    <img src={Logo} alt="" className="signin-logo" />
                </div>
                <h3 className="text-red-700 text-xl sm:text-[1.5rem]">Forgot Password?</h3>
                <p className="text-black text-base sm:text-[1.2rem]">We all do at times, reset password &amp; get back to promoting your sex lifestyle!</p>
                <div className="w-full">
                    <ForgotPassword />
                </div>
            </div>
        </div>
        </>
    )
}