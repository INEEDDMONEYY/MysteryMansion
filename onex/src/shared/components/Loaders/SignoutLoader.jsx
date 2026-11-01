import BrandLoader from "./BrandLoader";

export default function SignoutLoader() {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center text-center">
      <BrandLoader size="lg" className="!py-0" />
      <h2 className="mt-4 text-xl font-semibold text-pink-700">Signing you out...</h2>
      <p className="mt-2 max-w-md text-sm text-gray-600">
        Please wait while we securely log you out and clear your session.
      </p>
    </div>
  );
}
