import { StrictMode, Suspense, lazy, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { X } from "lucide-react";

import "./index.css";

import { UserProvider } from "@/context/UserContext";
import { DevMessageProvider } from "@/context/DevMessageContext";
import { ServerReadyProvider, useServerReady } from "@/context/ServerReadyContext";
import { startAnalyticsTracking } from "@/shared/utils/analyticsTracker";
import ProtectedRoute from "@/shared/components/ProtectedRoute";

// ── Layouts ──────────────────────────────────────────────────────────────────
import MainLayout  from "@/layouts/MainLayout";
import AuthLayout  from "@/layouts/AuthLayout";
import UserLayout  from "@/layouts/UserLayout";
import AdminLayout from "@/layouts/AdminLayout";

// ── Public pages ─────────────────────────────────────────────────────────────
const Home            = lazy(() => import("@/features/posts/pages/homePage"));
const PostDetail      = lazy(() => import("@/features/posts/components/PostDetail"));
const PostPage        = lazy(() => import("@/features/posts/pages/postPage"));
const UserProfileView = lazy(() => import("@/features/users/pages/UserProfileViewPage"));
const PromoteAccount  = lazy(() => import("@/features/promotions/pages/promoteAccount"));
const ReviewsPage     = lazy(() => import("@/features/reviews/pages/ReviewsPage"));
const PlatformUpdates = lazy(() => import("@/features/updates/pages/PlatformUpdatesPage"));
const FAQPage         = lazy(() => import("@/features/admin/pages/FAQPage"));
const ContactPage     = lazy(() => import("@/features/admin/pages/ContactPage"));
const TermsOfUsePage  = lazy(() => import("@/features/admin/pages/policies/TermsOfUsePage"));
const PrivacyPolicy   = lazy(() => import("@/features/admin/pages/policies/PrivacyPolicyPage"));

// ── Auth pages ────────────────────────────────────────────────────────────────
const SignIn       = lazy(() => import("@/features/auth/pages/SignInPage"));
const SignUp       = lazy(() => import("@/features/auth/pages/signUpPage"));
const ForgotPass   = lazy(() => import("@/features/auth/pages/forgotPassPage"));
const ResetPassword= lazy(() => import("@/features/auth/pages/resetPasswordPage"));
const Signout      = lazy(() => import("@/features/auth/pages/SignoutPage"));

// ── User pages ────────────────────────────────────────────────────────────────
const UserDashboard      = lazy(() => import("@/features/users/pages/dashboard"));
const SavedPostsPage     = lazy(() => import("@/features/users/pages/SavedPostsPage"));
const UserProfileSettings= lazy(() => import("@/features/users/pages/UserProfileSettings"));
const UserMessages       = lazy(() => import("@/features/users/pages/UserMessages"));
const ProfilePage        = lazy(() => import("@/features/users/pages/ProfilePage"));
const UserActivity       = lazy(() => import("@/features/users/pages/UserActivity"));

// ── Admin pages ───────────────────────────────────────────────────────────────
const AdminDashboard      = lazy(() => import("@/features/admin/pages/dashboard"));
const AdminAnalytics      = lazy(() => import("@/features/admin/pages/AdminAnalytics"));
const AdminUserManagement = lazy(() => import("@/features/admin/pages/AdminUserManagement"));
const AdminMessages       = lazy(() => import("@/features/admin/pages/AdminMessages"));
const AdminSettings       = lazy(() => import("@/features/admin/pages/AdminSettings"));
const AdminCreateUserForm = lazy(() => import("@/features/admin/pages/AdminCreateUserForm"));
const AdminNotifications  = lazy(() => import("@/features/admin/pages/AdminNotificationsPage"));
const AdminBanners        = lazy(() => import("@/features/admin/pages/AdminBannersPage"));
const AdminDiscounts      = lazy(() => import("@/features/admin/pages/AdminDiscountsPage"));
const AdminEmailUsers     = lazy(() => import("@/features/admin/pages/AdminEmailUsersPage"));
const UserNotifications   = lazy(() => import("@/features/users/pages/UserNotificationsPage"));

// ── Shared pages ──────────────────────────────────────────────────────────────
const NotFoundPage = lazy(() => import("@/shared/pages/NotFoundPage"));

// ── Router ────────────────────────────────────────────────────────────────────
const router = createBrowserRouter([
  // ── Public routes — wrapped in MainLayout (Navbar + Footer) ──────────────
  {
    element: <MainLayout />,
    children: [
      { path: "/",                    element: <Home /> },
      { path: "/home",                element: <Navigate to="/" replace /> },
      { path: "/post",                element: <PostPage /> },
      { path: "/posts/:postId",       element: <PostDetail /> },
      { path: "/user/:userId",        element: <UserProfileView /> },
      { path: "/profile/:username",   element: <ProfilePage /> },
      { path: "/promote",             element: <PromoteAccount /> },
      { path: "/reviews/:userId",     element: <ReviewsPage /> },
      { path: "/platform-updates",    element: <PlatformUpdates /> },
      { path: "/faq",                 element: <FAQPage /> },
      { path: "/contact",             element: <ContactPage /> },
      { path: "/terms-policy",        element: <TermsOfUsePage /> },
      { path: "/privacy-policy",      element: <PrivacyPolicy /> },
    ],
  },

  // ── Auth routes — wrapped in AuthLayout (centered, no nav) ───────────────
  {
    element: <AuthLayout />,
    children: [
      { path: "/signin",                  element: <SignIn /> },
      { path: "/signup",                  element: <SignUp /> },
      { path: "/forgotpass",              element: <ForgotPass /> },
      { path: "/reset-password/:token",   element: <ResetPassword /> },
      { path: "/signout",                 element: <Signout /> },
    ],
  },

  // ── User routes — ProtectedRoute → UserLayout ─────────────────────────────
  {
    element: <ProtectedRoute role="user" />,
    children: [
      {
        element: <UserLayout />,
        children: [
          { path: "/user/dashboard",       element: <UserDashboard /> },
          { path: "/user/saved-posts",      element: <SavedPostsPage /> },
          { path: "/user/profile",          element: <UserProfileSettings /> },
          { path: "/user/messages",         element: <UserMessages /> },
          { path: "/user/profilepage",      element: <ProfilePage /> },
          { path: "/user/activity",         element: <UserActivity /> },
          { path: "/user/notifications",    element: <UserNotifications /> },
        ],
      },
    ],
  },

  // ── Admin routes — ProtectedRoute → AdminLayout ───────────────────────────
  {
    element: <ProtectedRoute role="admin" />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { path: "/admin",                element: <AdminDashboard /> },
          { path: "/admin/analytics",       element: <AdminAnalytics /> },
          { path: "/admin/users",           element: <AdminUserManagement /> },
          { path: "/admin/messages",        element: <AdminMessages /> },
          { path: "/admin/settings",        element: <AdminSettings /> },
          { path: "/admin/create-user",     element: <AdminCreateUserForm /> },
          { path: "/admin/notifications",   element: <AdminNotifications /> },
          { path: "/admin/banners",          element: <AdminBanners /> },
          { path: "/admin/discounts",        element: <AdminDiscounts /> },
          { path: "/admin/email-users",      element: <AdminEmailUsers /> },
        ],
      },
    ],
  },

  // ── 404 catch-all ─────────────────────────────────────────────────────────
  {
    element: <MainLayout />,
    children: [
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);


export function AppGate() {
  const serverReady = useServerReady();
  const [bannerDismissed, setBannerDismissed]           = useState(false);
  const [emailBannerDismissed, setEmailBannerDismissed] = useState(false);
  const [issueDismissed, setIssueDismissed]             = useState(false);
  const [countdown, setCountdown]                       = useState(80);
  const [emailEnabled, setEmailEnabled]                 = useState(true);

  // Fetch email enabled state from public settings (no auth needed)
  useEffect(() => {
    fetch('/api/public/settings/flags')
      .then(r => r.json())
      .then(d => setEmailEnabled(d.emailEnabled !== false))
      .catch(() => setEmailEnabled(true));
  }, [serverReady]);

  // Admin can permanently suppress the server-issue banner via localStorage
  const [issueDisabled] = useState(
    () => localStorage.getItem('mm_server_issue_disabled') === 'true'
  );

  useEffect(() => {
    const stop = startAnalyticsTracking();
    return () => stop();
  }, []);

  useEffect(() => {
    if (serverReady || bannerDismissed) return;
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [serverReady, bannerDismissed, countdown]);

  // Server-issue: countdown expired but server still not ready
  const showServerIssue =
    !serverReady && countdown <= 0 && !issueDisabled && !issueDismissed;

  // Warming-up: counting down, server not yet ready
  const showWarmup =
    !serverReady && countdown > 0 && !bannerDismissed;

  return (
    <>
      {/* ── Warming-up banner ── */}
      {showWarmup && (
        <div className="border-b border-amber-200 bg-amber-50 px-4 py-3 text-amber-950 shadow-sm">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 text-sm">
            <p className="pr-2">
              Server is waking up — ready in approximately{" "}
              <span className="font-semibold">{Math.max(countdown, 0)}s</span>.
              Platform content and authentication services will be available once the server is online.
            </p>
            <button
              type="button"
              onClick={() => setBannerDismissed(true)}
              aria-label="Dismiss notice"
              className="shrink-0 rounded p-1 text-amber-900 transition hover:bg-amber-100"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {/* ── Server issue banner (fires after 80s with no response) ── */}
      {showServerIssue && (
        <div className="border-b border-red-700 bg-red-950 px-4 py-3 text-red-100 shadow-sm">
          <div className="mx-auto flex max-w-6xl items-start justify-between gap-3 text-sm">
            <div className="flex flex-col gap-1 pr-2">
              <p className="font-semibold">⚠️ Server issue detected</p>
              <p className="text-red-300 text-xs">
                The server has not responded after 80 seconds. We may be experiencing an outage.
                Some platform features — including login, posts, and messaging — may be unavailable.
                Please try refreshing or check back shortly.
              </p>
            </div>
            <div className="flex flex-col gap-1 shrink-0">
              <button
                type="button"
                onClick={() => setIssueDismissed(true)}
                aria-label="Dismiss"
                className="rounded p-1 text-red-300 transition hover:bg-red-800"
              >
                <X size={16} />
              </button>
              <button
                type="button"
                onClick={() => {
                  localStorage.setItem('mm_server_issue_disabled', 'true');
                  setIssueDismissed(true);
                }}
                className="text-[10px] text-red-500 hover:text-red-300 transition whitespace-nowrap"
                title="Disable this warning permanently (admin only)"
              >
                Don't show
              </button>
            </div>
          </div>
        </div>
      )}
      {serverReady && !emailEnabled && !emailBannerDismissed && (
        <div className="border-b border-red-500 bg-gradient-to-r from-red-50 to-red-100 px-4 py-3 text-red-950 shadow-sm">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 text-sm">
            <p className="pr-2">
              <strong>Note:</strong> Email functionality is temporarily paused due to a security incident. No user data has been impacted.
During this time, users will not receive automated emails such as welcome messages, password reset emails, or platform updates. We are actively working on restoring email services and implementing additional security measures to help prevent this from happening again.
            </p>
            <button
              type="button"
              onClick={() => setEmailBannerDismissed(true)}
              aria-label="Dismiss notice"
              className="shrink-0 rounded p-1 text-red-900 transition hover:bg-red-200"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}
      <Toaster position="top-right" toastOptions={{ duration: 6000 }} />
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-screen text-lg">
            Loading...
          </div>
        }
      >
        <RouterProvider router={router} />
      </Suspense>
    </>
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <UserProvider>
      <DevMessageProvider>
        <ServerReadyProvider>
          <AppGate />
        </ServerReadyProvider>
      </DevMessageProvider>
    </UserProvider>
  </StrictMode>
);