// ✅ UserProfileSettings.jsx (integrated with Availability + Meetup display + per-user persistence)
import { useContext, useState, useEffect, useMemo } from "react";
import { UserContext } from "@/context/UserContext";
import AgeSettings from "@/shared/components/user/settings/AgeSettings";
import AvailabilitySettings from "@/shared/components/user/settings/AvailabilitySettings";
import UpdateProfileSettings from "@/shared/components/user/settings/UpdateProfileSettings";
import RedeemPromoSettings from "@/shared/components/user/settings/RedeemPromoSettings.jsx";
import PhoneNumberSettings from "@/shared/components/user/settings/PhoneNumberSettings.jsx";
import EmailSettings from "@/shared/components/user/settings/EmailSettings.jsx";
import DeleteAccountSettings from "@/shared/components/user/settings/DeleteAccountSettings.jsx";
import ReferencesLinks from "@/shared/components/References/ReferencesLinks.jsx";
import GenderSettings from "@/shared/components/user/settings/GenderSettings.jsx"
import { FEATURE_FLAGS } from "@/config/featureFlags";
import { DollarSign, Cake, Phone, Mail, Trash2, Users } from "lucide-react";

export default function UserProfileSettings({ onProfileUpdate }) {
  const { user } = useContext(UserContext);

  const normalizeAvailability = (raw) => {
    if (!raw) return { status: "" };
    if (typeof raw === "string") return { status: raw };
    if (typeof raw === "object") return { status: raw.status || "" };
    return { status: "" };
  };

  // ✅ Stable userId for namespacing localStorage keys
  const userId = useMemo(() => user?._id || user?.id || null, [user]);

  // ✅ Per-user keys
  const incallKey = useMemo(
    () => (userId ? `incallPrice_${userId}` : null),
    [userId],
  );
  const outcallKey = useMemo(
    () => (userId ? `outcallPrice_${userId}` : null),
    [userId],
  );
  const availabilityKey = useMemo(
    () => (userId ? `availability_${userId}` : null),
    [userId],
  );

  // ✅ Lifted state with per-user persistence (hydrate by user)
  const [incallPrice, setIncallPrice] = useState(() => {
    if (!incallKey) return "";
    const saved = localStorage.getItem(incallKey);
    return saved ?? "";
  });

  const [outcallPrice, setOutcallPrice] = useState(() => {
    if (!outcallKey) return "";
    const saved = localStorage.getItem(outcallKey);
    return saved ?? "";
  });

  const [availability, setAvailability] = useState(() => {
    if (!availabilityKey) return { status: "" };
    const saved = localStorage.getItem(availabilityKey);
    if (!saved) return { status: "" };
    try {
      return normalizeAvailability(JSON.parse(saved));
    } catch {
      return normalizeAvailability(saved);
    }
  });

  // ✅ Rehydrate when the user changes (avoid cross-user bleed)
  useEffect(() => {
    if (!userId || !incallKey || !outcallKey || !availabilityKey) {
      setIncallPrice("");
      setOutcallPrice("");
      setAvailability({ status: "" });
      return;
    }

    const savedIncall = localStorage.getItem(incallKey);
    setIncallPrice(savedIncall ?? "");

    const savedOutcall = localStorage.getItem(outcallKey);
    setOutcallPrice(savedOutcall ?? "");

    const savedAvailability = localStorage.getItem(availabilityKey);
    if (!savedAvailability) {
      setAvailability({ status: "" });
    } else {
      try {
        setAvailability(normalizeAvailability(JSON.parse(savedAvailability)));
      } catch {
        setAvailability(normalizeAvailability(savedAvailability));
      }
    }
  }, [userId, incallKey, outcallKey, availabilityKey]);

  // ✅ Persist per-user availability changes
  useEffect(() => {
    if (!availabilityKey) return;
    try {
      localStorage.setItem(availabilityKey, JSON.stringify(availability));
    } catch (err) {
      console.error("Failed to persist availability", err);
    }
  }, [availability, availabilityKey]);

  // ✅ Persist per-user prices
  useEffect(() => {
    if (!incallKey) return;
    try {
      localStorage.setItem(incallKey, incallPrice ?? "");
    } catch (err) {
      console.error("Failed to persist incall price", err);
    }
  }, [incallPrice, incallKey]);

  useEffect(() => {
    if (!outcallKey) return;
    try {
      localStorage.setItem(outcallKey, outcallPrice ?? "");
    } catch (err) {
      console.error("Failed to persist outcall price", err);
    }
  }, [outcallPrice, outcallKey]);

  return (
    <div className="relative w-full max-w-2xl mx-auto space-y-10 p-4 sm:p-6">
      <h1 className="text-2xl font-bold text-pink-700 text-center">
        Profile Settings
      </h1>

      {/* ✅ Profile Update */}
      <UpdateProfileSettings onProfileUpdate={onProfileUpdate} user={user} />

      {/* =====================================================================================
    GENDER SETTINGS
   ===================================================================================== */}
      <section className="space-y-3">
        <h2 className="flex items-center gap-2 font-medium text-gray-700">
          <Users size={18} className="text-pink-600" />
          Gender Settings
        </h2>

        <div className="border border-pink-100 rounded-lg p-4 bg-white shadow-sm">
          <GenderSettings user={user} />
        </div>
      </section>

      <section className="space-y-3">
        <ReferencesLinks editable user={user} />
      </section>

      {/* =====================================================================================
          AVAILABILITY SETTINGS — controlled by FEATURE_FLAGS.AVAILABILITY_SETTINGS
         ===================================================================================== */}
      {FEATURE_FLAGS.AVAILABILITY_SETTINGS && (
        <section className="space-y-3">
          <h2 className="flex items-center gap-2 font-medium text-gray-700">
            <span className="text-pink-600">📅</span> Availability Settings
          </h2>
          <div className="border border-pink-100 rounded-lg p-4 bg-white shadow-sm">
            <AvailabilitySettings
              availability={availability}
              setAvailability={setAvailability}
              userId={userId} // pass userId to namespace storage
            />
          </div>
        </section>
      )}

      {/* =====================================================================================
    AGE SETTINGS — controlled by FEATURE_FLAGS.AGE_SETTINGS
   ===================================================================================== */}
      {FEATURE_FLAGS.AGE_SETTINGS && (
        <section className="space-y-3">
          <h2 className="flex items-center gap-2 font-medium text-gray-700">
            <Cake size={18} className="text-pink-600" />
            Age Settings
          </h2>

          <div className="border border-pink-100 rounded-lg p-4 bg-white shadow-sm">
            <AgeSettings userId={userId} user={user} />
          </div>
        </section>
      )}


      {/* =====================================================================================
    PHONE NUMBER SETTINGS — controlled by FEATURE_FLAGS.PHONE_NUMBER_SETTINGS
   ===================================================================================== */}
      {FEATURE_FLAGS.PHONE_NUMBER_SETTINGS && (
        <section className="space-y-3">
          <h2 className="flex items-center gap-2 font-medium text-gray-700">
            <Phone size={18} className="text-pink-600" />
            Phone Number Settings
          </h2>

          <div className="border border-pink-100 rounded-lg p-4 bg-white shadow-sm">
            <PhoneNumberSettings userId={userId} user={user} />
          </div>
        </section>
      )}

      <section className="space-y-3">
        <h2 className="flex items-center gap-2 font-medium text-gray-700">
          <Mail size={18} className="text-pink-600" />
          Email Settings
        </h2>

        <div className="border border-pink-100 rounded-lg p-4 bg-white shadow-sm">
          <EmailSettings user={user} />
        </div>
      </section>

      {/* =====================================================================================
    PROMO CODE SETTINGS
   ===================================================================================== */}
      {FEATURE_FLAGS.PROMO_REDEMPTION && (
        <section className="space-y-3">
          <div className="border border-pink-100 rounded-lg p-4 bg-white shadow-sm">
            <RedeemPromoSettings userId={userId} />
          </div>
        </section>
      )}

      {/* =====================================================================================
    DELETE ACCOUNT SETTINGS — controlled by FEATURE_FLAGS.DELETE_ACCOUNT_SETTINGS
   ===================================================================================== */}
      {FEATURE_FLAGS.DELETE_ACCOUNT_SETTINGS && (
        <section className="space-y-3 pt-6 border-t border-gray-200">
          <h2 className="flex items-center gap-2 font-medium text-red-600">
            <Trash2 size={18} className="text-red-600" />
            Danger Zone
          </h2>

          <div className="border border-red-200 rounded-lg p-4 bg-white shadow-sm">
            <DeleteAccountSettings />
          </div>
        </section>
      )}
    </div>
  );
}
