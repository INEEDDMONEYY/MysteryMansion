import { useContext, useEffect } from "react";
import {
  User,
  Mail,
  Trash2,
  Settings,
} from "lucide-react";
import { UserContext } from "@/context/UserContext";
import { setSEO } from "@/shared/utils/seo";
import UpdateProfileSettings from "@/shared/components/user/settings/UpdateProfileSettings";
import EmailSettings from "@/shared/components/user/settings/EmailSettings";
import DeleteAccountSettings from "@/shared/components/user/settings/DeleteAccountSettings";
import { FEATURE_FLAGS } from "@/config/featureFlags";

export default function ClientProfilePage() {
  const { user } = useContext(UserContext);

  useEffect(() => {
    setSEO("My Profile | Mystery Mansion", "", {
      robots: "noindex, nofollow",
    });
  }, []);

  return (
    <div className="min-h-full -m-4 space-y-6 bg-gray-100 p-4 text-gray-900 md:-m-6 md:p-6">

      {/* Page Header */}
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white shadow-sm">
          <Settings size={22} className="text-black" />
        </div>

        <div>
          <h1 className="text-2xl font-bold tracking-tight text-black">
            My Profile
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage your profile information, email preferences, and account settings.
          </p>
        </div>
      </div>

      <div className="max-w-3xl space-y-6">

        {/* Profile Settings */}
        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center gap-3 border-b border-gray-200 px-5 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
              <User size={19} className="text-black" />
            </div>

            <div>
              <h2 className="text-base font-bold text-black">
                Profile Settings
              </h2>

              <p className="mt-0.5 text-xs text-gray-500">
                Update your personal and profile information.
              </p>
            </div>
          </div>

          <div className="p-5">
            <UpdateProfileSettings user={user} />
          </div>
        </section>

        {/* Email Settings */}
        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center gap-3 border-b border-gray-200 px-5 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
              <Mail size={19} className="text-black" />
            </div>

            <div>
              <h2 className="text-base font-bold text-black">
                Email Settings
              </h2>

              <p className="mt-0.5 text-xs text-gray-500">
                Manage your email address and related settings.
              </p>
            </div>
          </div>

          <div className="p-5">
            <EmailSettings user={user} />
          </div>
        </section>

        {/* Delete Account Settings */}
        {FEATURE_FLAGS.DELETE_ACCOUNT_SETTINGS && (
          <section className="overflow-hidden rounded-2xl border border-gray-300 bg-white shadow-sm">
            <div className="flex items-center gap-3 border-b border-gray-200 px-5 py-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-200">
                <Trash2 size={19} className="text-black" />
              </div>

              <div>
                <h2 className="text-base font-bold text-black">
                  Account Management
                </h2>

                <p className="mt-0.5 text-xs text-gray-500">
                  Manage your account deletion settings.
                </p>
              </div>
            </div>

            <div className="p-5">
              <DeleteAccountSettings />
            </div>
          </section>
        )}

      </div>
    </div>
  );
}