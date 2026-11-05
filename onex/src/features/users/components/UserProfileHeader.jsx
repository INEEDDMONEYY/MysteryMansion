import BrandLoader from "@/shared/components/Loaders/BrandLoader";
import { useEffect, useState, useContext, useRef } from "react";
import { UserContext } from "@/context/UserContext";
import {
  Camera,
  Pencil,
  CheckCircle2,
  Star,
  MapPin,
  Phone,
  Mail,
  UserRound,
  Share2,
  Copy,
  Check,
  MessageCircle,
} from "lucide-react";
import api from "@/shared/utils/api";
import { hasPermanentProviderBadge } from "@/features/users/services/providerBadgeEligibility.js";
import { FEATURE_FLAGS } from "@/config/featureFlags";
import useAccountRank from "@/features/account-ranking/hooks/useAccountRank";
import useMembership from "@/features/membership/hooks/useMembership";
import FlagButton from "@/features/flagging/components/FlagButton";
import {
  ContactRevealNotice,
  ContactValue,
  useContactReveal,
} from "@/shared/components/Contact/ContactReveal";
import { FLAG_TARGET_TYPES } from "@/features/flagging/utils/flagTargets";
import ProfileFollowButton from "./profile-shared/ProfileFollowButton";
import { fetchProgression } from "@/features/users/services/progressionService";
import { PROGRESSION_COLORS, progressionRingBackground } from "@/features/users/utils/progressionColors";

// Stable reference — not connected to real criterion data yet, so the score
// preview always reflects a fresh/unranked account until the backend lands.
const EMPTY_CRITERION_SCORES = {};

export default function UserProfileHeader({
  propUser = null,
  userId: propUserId = null,
}) {
  const { user: ctxUser, updateProfile } =
    useContext(UserContext);
  const { membership } = useMembership();

  const displayUserId =
    propUser?._id ||
    propUser?.id ||
    propUserId ||
    null;

  const [progression, setProgression] = useState(null);
  const [ringPickerOpen, setRingPickerOpen] = useState(false);
  const [ringSaving, setRingSaving] = useState(false);
  const [ringError, setRingError] = useState("");
  const unlockedRingColors = membership?.perks?.progressionColors ?? [];

  async function chooseRingColor(colorId) {
    if (ringSaving) return;
    setRingSaving(true);
    setRingError("");
    try {
      await api.patch("/membership/progression-color", { colorId });
      setProgression((prev) => (prev ? { ...prev, progressionColor: colorId || null } : prev));
      setRingPickerOpen(false);
    } catch (err) {
      setRingError(err?.response?.data?.error || "Could not save ring color.");
    } finally {
      setRingSaving(false);
    }
  }

  useEffect(() => {
    if (!displayUserId) return undefined;
    const controller = new AbortController();
    fetchProgression(displayUserId, controller.signal)
      .then(setProgression)
      .catch((err) => {
        if (err?.name === "CanceledError" || err?.name === "AbortError") return;
        setProgression(null);
      });
    return () => controller.abort();
  }, [displayUserId]);

  const [user, setUser] = useState({
    username: "",
    role: "",
    accountType: "",
    bio: "",
    age: null,
    createdAt: null,
    location: "",
    gender: "",
    phoneMasked: "",
    emailMasked: "",
    profilePic: null,
    bannerPic: null,
    activePromoExpiry: null,
    badgeType: "",
    membershipTier: "",
  });

  const [banner, setBanner] = useState(null);
  const [loading, setLoading] = useState(false);

  const [editingBio, setEditingBio] =
    useState(false);

  const [editingLocation, setEditingLocation] =
    useState(false);

  const [bioInput, setBioInput] =
    useState("");

  const [locationInput, setLocationInput] =
    useState("");

  const [savingBanner, setSavingBanner] =
    useState(false);

  const [savingBio, setSavingBio] =
    useState(false);

  const [savingLocation, setSavingLocation] =
    useState(false);

  const [shareMenuOpen, setShareMenuOpen] =
    useState(false);

  const [shareCopied, setShareCopied] =
    useState(false);

  const [shareError, setShareError] =
    useState("");

  const fileInputRef = useRef(null);
  const shareRef = useRef(null);

  const isOwner = Boolean(
    ctxUser?._id &&
      displayUserId &&
      String(ctxUser._id) ===
        String(displayUserId)
  );

  const { rank: accountRank } = useAccountRank({
    role: user.accountType === "client" ? "client" : "provider",
    criterionScores: EMPTY_CRITERION_SCORES,
  });

  const profileShareUrl =
    typeof window !== "undefined"
      ? user.username
        ? `${window.location.origin}/profile/${encodeURIComponent(user.username)}`
        : window.location.href
      : "";

  const profileShareText = user.username
    ? `Check out ${user.username}'s profile on Mystery Mansion.`
    : "Check out this profile on Mystery Mansion.";

  const encodedShareUrl = encodeURIComponent(profileShareUrl);
  const encodedShareText = encodeURIComponent(
    `${profileShareText} ${profileShareUrl}`
  );

  // ─────────────────────────────────────────────────────────────
  // PROFILE SHARING
  // ─────────────────────────────────────────────────────────────

  const handleNativeShare = async () => {
    if (!navigator.share) return;

    try {
      await navigator.share({
        title: `${user.username || "User"} | Mystery Mansion`,
        text: profileShareText,
        url: profileShareUrl,
      });

      setShareMenuOpen(false);
      setShareError("");
    } catch (err) {
      if (err.name !== "AbortError") {
        setShareError("Unable to open your device's share menu.");
      }
    }
  };

  const handleCopyProfileLink = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(profileShareUrl);
      } else {
        const textArea = document.createElement("textarea");

        textArea.value = profileShareUrl;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";

        document.body.appendChild(textArea);
        textArea.select();

        const copied = document.execCommand("copy");

        document.body.removeChild(textArea);

        if (!copied) {
          throw new Error("Copy failed.");
        }
      }

      setShareCopied(true);
      setShareError("");

      window.setTimeout(() => {
        setShareCopied(false);
      }, 2000);
    } catch {
      setShareError(
        "Unable to copy the link. You can select and copy it manually."
      );
    }
  };

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        shareRef.current &&
        !shareRef.current.contains(event.target)
      ) {
        setShareMenuOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setShareMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  // ─────────────────────────────────────────────────────────────
  // STORAGE
  // ─────────────────────────────────────────────────────────────

  const readProfileFromStorage = (id) => {
    if (!id) return null;

    const key = `userProfile_${id}`;
    const raw = localStorage.getItem(key);

    if (!raw) return null;

    try {
      return JSON.parse(raw);
    } catch (err) {
      console.error(
        `Failed to parse profile for key ${key}:`,
        err
      );

      return null;
    }
  };

  const readBannerFromStorage = (id) => {
    if (!id) return null;

    const key = `userBanner_${id}`;

    return localStorage.getItem(key);
  };

  // ─────────────────────────────────────────────────────────────
  // LOAD PROFILE
  // ─────────────────────────────────────────────────────────────

  useEffect(() => {
    let cancelled = false;

    const applyProfile = (profileData) => {
      if (!profileData || cancelled) return;

      setUser({
        username: profileData.username || "",
        role: profileData.role || "",
        accountType: profileData.accountType || "provider",
        bio: profileData.bio || "",
        age: profileData.age ?? null,
        createdAt:
          profileData.createdAt || null,
        location:
          profileData.location || "",
        gender:
          profileData.gender || "",
        // Public profiles only carry masked contact details.
        phoneMasked:
          profileData.phoneMasked || "",
        emailMasked:
          profileData.emailMasked || "",
        profilePic:
          profileData.profilePic || null,
        bannerPic:
          profileData.bannerPic || null,
        activePromoExpiry:
          profileData.activePromoExpiry ||
          null,
        badgeType:
          profileData.badgeType || "",
        membershipTier:
          profileData.membershipTier || "",
      });

      setBioInput(
        profileData.bio || ""
      );

      setLocationInput(
        profileData.location || ""
      );

      if (profileData.bannerPic) {
        setBanner(
          profileData.bannerPic
        );
      }
    };

    if (propUser) {
      applyProfile(propUser);
      return;
    }

    if (!displayUserId) {
      if (ctxUser) {
        applyProfile(ctxUser);
      }

      return;
    }

    // Owner
    if (isOwner) {
      const cached =
        readProfileFromStorage(
          displayUserId
        );

      applyProfile(
        cached || ctxUser
      );

      if (
        !(cached || ctxUser)?.bannerPic
      ) {
        const savedBanner =
          readBannerFromStorage(
            displayUserId
          );

        if (savedBanner) {
          setBanner(savedBanner);
        }
      }

      return;
    }

    // Non-owner viewer
    const cached =
      readProfileFromStorage(
        displayUserId
      );

    if (cached) {
      applyProfile(cached);
    }

    setLoading(true);

    api
      .get(
        `/public/users/id/${displayUserId}`
      )
      .then((res) => {
        if (cancelled) return;

        const data = res.data;

        applyProfile(data);

        localStorage.setItem(
          `userProfile_${displayUserId}`,
          JSON.stringify(data)
        );
      })
      .catch((err) => {
        console.error(
          "Failed to fetch profile for user",
          displayUserId,
          err
        );
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [
    propUser,
    displayUserId,
    ctxUser,
    isOwner,
  ]);

  // ─────────────────────────────────────────────────────────────
  // BANNER
  // ─────────────────────────────────────────────────────────────

  const handleBannerClick = () => {
    if (!isOwner) return;

    fileInputRef.current?.click();
  };

  const handleBannerChange = async (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!isOwner) {
      alert(
        "You can only update your own banner."
      );

      return;
    }

    setSavingBanner(true);

    try {
      const formData = new FormData();

      formData.append(
        "bannerPic",
        file
      );

      const updatedUser =
        await updateProfile(
          formData,
          null,
          true
        );

      const updatedBanner =
        updatedUser?.bannerPic ||
        null;

      if (updatedBanner) {
        setBanner(updatedBanner);
      }

      setUser((prev) => ({
        ...prev,
        ...updatedUser,
      }));

      alert("Banner updated.");
    } catch (err) {
      alert(
        err.message ||
          "Failed to update banner"
      );
    } finally {
      setSavingBanner(false);

      if (fileInputRef.current) {
        fileInputRef.current.value =
          "";
      }
    }
  };

  // ─────────────────────────────────────────────────────────────
  // BIO
  // ─────────────────────────────────────────────────────────────

  const handleBioSave = async () => {
    if (!isOwner) {
      alert(
        "You can only update your own bio."
      );

      return;
    }

    setSavingBio(true);

    try {
      const updatedUser =
        await updateProfile({
          bio: bioInput,
        });

      setUser((prev) => ({
        ...prev,
        ...updatedUser,
      }));

      setEditingBio(false);
    } catch (err) {
      alert(
        err.message ||
          "Failed to update bio"
      );
    } finally {
      setSavingBio(false);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // LOCATION
  // ─────────────────────────────────────────────────────────────

  const handleLocationSave = async () => {
    if (!isOwner) {
      alert(
        "You can only update your own location."
      );

      return;
    }

    setSavingLocation(true);

    try {
      const updatedUser =
        await updateProfile({
          location:
            locationInput,
        });

      setUser((prev) => ({
        ...prev,
        ...updatedUser,
      }));

      setEditingLocation(false);
    } catch (err) {
      alert(
        err.message ||
          "Failed to update location"
      );
    } finally {
      setSavingLocation(false);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // PROFILE DATA
  // ─────────────────────────────────────────────────────────────

  const isPermanentProvider =
    hasPermanentProviderBadge(
      user?.createdAt
    );

  const isAdmin =
    user?.role === "admin";

  const isClient =
    !isAdmin && user?.accountType === "client";

  // The owner's own plan comes from the membership context; visitors get it with the public profile.
  const badgeTier = isOwner
    ? (membership.active && membership.perks?.profileBadge ? membership.tier : "")
    : user?.membershipTier || "";

  // Viewing your own profile (or the signed-in dashboard view) shows your
  // details in full; everyone else sees masked values until they reveal them.
  const isSelfView =
    isOwner || (!displayUserId && Boolean(ctxUser));

  const ownContact = isSelfView
    ? {
        phoneNumber: ctxUser?.phoneNumber || "",
        email: ctxUser?.email || "",
      }
    : null;

  const contactState = useContactReveal(
    displayUserId,
    ownContact
  );

  const hasPhoneValue = Boolean(
    user?.phoneMasked || ownContact?.phoneNumber
  );

  const hasEmailValue = Boolean(
    user?.emailMasked || ownContact?.email
  );

  const usernameLength =
    (user?.username || "")
      .trim()
      .length;

  const usernameSizeClass =
    usernameLength >= 20
      ? "text-sm sm:text-base"
      : "text-xl sm:text-2xl lg:text-3xl";

  const hasPhoneNumber =
    !isAdmin && !isClient && hasPhoneValue;

  const hasEmail =
    !isAdmin && !isClient && hasEmailValue;

  // ─────────────────────────────────────────────────────────────
  // LOADING
  // ─────────────────────────────────────────────────────────────

  if (
    loading &&
    !user.username
  ) {
    return (
      <BrandLoader size="md" className="min-h-[380px]" />
    );
  }

  // ─────────────────────────────────────────────────────────────
  // PAGE
  // ─────────────────────────────────────────────────────────────

  const avatarContent = user.profilePic ? (
    <img
      src={user.profilePic}
      alt={
        user.username ||
        "Profile"
      }
      className="h-28 w-28 rounded-full border-4 border-black object-cover shadow-2xl sm:h-36 sm:w-36 lg:h-44 lg:w-44"
    />
  ) : (
    <div className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-black bg-gray-700 text-sm font-medium text-gray-300 shadow-2xl sm:h-36 sm:w-36 lg:h-44 lg:w-44">
      No Photo
    </div>
  );

  return (
    <div className="w-full">

      {/* FULL-WIDTH COVER */}

      <div
        className="relative h-56 w-full overflow-hidden bg-gradient-to-r from-pink-500 via-red-500 to-yellow-400 sm:h-64 lg:h-80"
        style={
          banner
            ? {
                backgroundImage: `url(${banner})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : {}
        }
      >

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

        {isOwner && (
          <button
            type="button"
            onClick={handleBannerClick}
            disabled={savingBanner}
            className="absolute right-4 top-4 z-10 inline-flex items-center gap-2 rounded-lg border border-white/20 bg-black/60 px-3 py-2 text-sm font-semibold text-white shadow-lg backdrop-blur-sm transition-all hover:bg-black/80 disabled:opacity-60 sm:right-6 sm:top-6 lg:right-8"
          >
            <Camera size={17} />

            <span className="hidden sm:inline">
              {savingBanner
                ? "Uploading..."
                : "Edit banner"}
            </span>
          </button>
        )}

        {!isOwner && displayUserId && (
          <FlagButton
            targetType={FLAG_TARGET_TYPES.USER}
            targetId={displayUserId}
            label="Report user"
            showLabel
            className="absolute right-4 top-4 z-10 rounded-lg border border-white/20 bg-black/60 text-white shadow-lg backdrop-blur-sm hover:bg-black/80 sm:right-6 sm:top-6 lg:right-8"
          />
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleBannerChange}
        />
      </div>

      {/* PROFILE IDENTITY */}

      <div className="relative w-full bg-black">

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          <div className="relative pb-7 sm:pb-8">

            {/* PROFILE IMAGE */}

            <div className="absolute -top-16 left-4 sm:-top-20 sm:left-6 lg:-top-24 lg:left-8">

              <div
                className="relative rounded-full p-1 shadow-2xl"
                style={{
                  background: progressionRingBackground(progression?.progressionColor, progression?.levelProgress ?? 0),
                }}
                role="progressbar"
                aria-label={`Progress to next level: ${Math.round((progression?.levelProgress ?? 0) * 100)}%`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round((progression?.levelProgress ?? 0) * 100)}
              >

                {isOwner ? (
                  <button
                    type="button"
                    onClick={() => setRingPickerOpen((open) => !open)}
                    className="cursor-pointer rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
                    aria-label="Change progression ring color"
                    aria-expanded={ringPickerOpen}
                    title="Change progression ring color"
                  >
                    {avatarContent}
                  </button>
                ) : (
                  avatarContent
                )}

                <div className="absolute bottom-1 right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-black bg-violet-600 text-xs font-bold text-white sm:h-9 sm:w-9"
                  aria-label={`Level ${progression?.level ?? 1} of ${progression?.maxLevel ?? 50}`}
                  title={`Level ${progression?.level ?? 1} / ${progression?.maxLevel ?? 50} — ${(progression?.rp ?? 0).toLocaleString()} RP`}>
                  {progression?.level ?? 1}
                </div>

                {isOwner && ringPickerOpen && (
                  <div
                    role="dialog"
                    aria-label="Progression ring color"
                    className="absolute left-0 top-full z-50 mt-3 w-72 max-w-[85vw] rounded-xl border border-gray-700 bg-gray-900 p-4 text-left shadow-2xl"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-white">Progression ring color</h3>
                      <button
                        type="button"
                        onClick={() => setRingPickerOpen(false)}
                        className="text-xs text-gray-400 hover:text-white"
                      >
                        Close
                      </button>
                    </div>

                    {["solid", "gradient"].map((kind) => (
                      <div key={kind} className="mb-3">
                        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400">
                          {kind === "solid" ? "Solid" : "Gradient"}
                        </p>
                        <div className="grid grid-cols-4 gap-3">
                          {PROGRESSION_COLORS.filter((color) => color.kind === kind).map((color) => {
                            const unlocked = unlockedRingColors.includes(color.id);
                            const selected = progression?.progressionColor === color.id;
                            const background = color.stops.length > 1
                              ? `linear-gradient(135deg, ${color.stops.join(", ")})`
                              : color.stops[0];
                            return (
                              <button
                                key={color.id}
                                type="button"
                                disabled={ringSaving || !unlocked}
                                onClick={() => chooseRingColor(color.id)}
                                aria-label={unlocked ? color.label : `${color.label} (membership upgrade required)`}
                                aria-pressed={selected}
                                title={unlocked ? color.label : `${color.label} — upgrade your membership to unlock`}
                                className={`flex flex-col items-center gap-1 rounded-lg p-1 text-[10px] text-gray-300 ${
                                  unlocked ? "cursor-pointer hover:bg-gray-800" : "cursor-not-allowed opacity-40"
                                }`}
                              >
                                <span
                                  className={`h-9 w-9 rounded-full border-2 ${selected ? "border-white" : "border-black"}`}
                                  style={{ background }}
                                />
                                <span className="truncate">{color.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      disabled={ringSaving}
                      onClick={() => chooseRingColor("")}
                      className="mt-1 w-full rounded-lg border border-gray-700 px-3 py-2 text-xs font-medium text-gray-200 hover:bg-gray-800 disabled:opacity-50"
                    >
                      Use default purple
                    </button>

                    {unlockedRingColors.length < PROGRESSION_COLORS.length && (
                      <p className="mt-3 text-xs text-gray-400">
                        Locked colors unlock with a membership upgrade.
                      </p>
                    )}
                    {ringError && <p className="mt-2 text-xs text-red-400">{ringError}</p>}
                  </div>
                )}

              </div>
            </div>

            {/* PROFILE CONTENT */}

            <div className="pt-20 sm:pl-44 sm:pt-6 lg:pl-56 lg:pt-8">

              {/* NAME + BADGES + SHARE */}

              <div className="flex flex-wrap items-start justify-between gap-3">

                <div className="flex min-w-0 flex-wrap items-center gap-2">

                  <h1
                    className={`${usernameSizeClass} font-bold leading-tight text-white`}
                  >
                    {user.username ||
                      "Unnamed User"}
                  </h1>
                  <span className="rounded-full bg-violet-500/20 px-2 py-1 text-xs font-semibold text-violet-200" title={`Maximum level: ${progression?.maxLevel ?? 50}`}>
                    Level {progression?.level ?? 1}
                  </span>

                  {/* ADMIN BADGES */}

                  {isAdmin ? (
                    <>
                      <span
                        className="inline-flex items-center gap-1 rounded-full bg-blue-600 px-2 py-1 text-[10px] font-semibold leading-none text-white sm:text-xs"
                        aria-label="Verified"
                        title="Verified Admin"
                      >
                        <CheckCircle2 size={13} />
                        Verified
                      </span>

                      <span
                        className="relative inline-flex overflow-hidden rounded-full p-[1px]"
                        aria-label="Developer"
                        title="Developer"
                      >
                        <span
                          aria-hidden="true"
                          className="pointer-events-none absolute inset-0 animate-[spin_8s_linear_infinite] rounded-full bg-[conic-gradient(from_180deg_at_50%_50%,#fbbf24_0deg,#f59e0b_90deg,#d97706_180deg,#fef3c7_270deg,#fbbf24_360deg)]"
                        />

                        <span className="relative inline-flex rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 px-2 py-1 text-[9px] font-bold text-white sm:text-[10px]">
                          DEV
                        </span>
                      </span>
                    </>
                  ) : !isClient ? (
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold leading-none sm:text-xs ${
                        user.badgeType === "blue"
                          ? "bg-blue-600 text-white"
                          : user.badgeType === "pink"
                            ? "bg-pink-500 text-white"
                            : "bg-gray-700 text-gray-400"
                      }`}
                      aria-label={
                        user.badgeType === "blue"
                          ? "Verified"
                          : user.badgeType === "pink"
                            ? "Promo Badge"
                            : "Unverified"
                      }
                    >
                      <CheckCircle2 size={13} />

                      {user.badgeType === "blue" && "Verified"}
                      {user.badgeType === "pink" && "Promo"}

                      {user.badgeType !== "blue" &&
                        user.badgeType !== "pink" &&
                        "Unverified"}
                    </span>
                  ) : null}

                  {/* MEMBERSHIP */}

                  {badgeTier && (
                    <span
                      className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-fuchsia-600 to-pink-600 px-2 py-1 text-[10px] font-semibold leading-none text-white sm:text-xs"
                      aria-label={`${badgeTier} member`}
                      title={`${badgeTier} member`}
                    >
                      <Star
                        size={12}
                        className="fill-current text-yellow-300"
                      />
                      {badgeTier} Member
                    </span>
                  )}

                  {/* FOUNDING PROVIDER */}

                  {isPermanentProvider && (
                    <span
                      className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2 py-1 text-[10px] font-semibold leading-none text-white sm:text-xs"
                      aria-label="Founding Provider"
                      title="Founding Provider"
                    >
                      <Star size={12} className="fill-current" />
                      Founding Provider
                    </span>
                  )}

                  {/* ACCOUNT SCORE */}

                  {FEATURE_FLAGS.ENABLE_ACCOUNT_SCORE && accountRank && (
                    <span
                      className="inline-flex items-center gap-1 rounded-full bg-neutral-800 px-2 py-1 text-[10px] font-semibold leading-none text-white sm:text-xs"
                      aria-label="Account Score"
                      title={`Account Score: ${Math.round(accountRank.score)} — ${accountRank.rank?.name || "Unranked"}`}
                    >
                      <Star
                        size={12}
                        className="fill-current text-yellow-400"
                      />
                      {accountRank.rank?.name || "Unranked"} · {Math.round(accountRank.score)}
                    </span>
                  )}

                </div>

                {/* SHARE PROFILE */}

                <div className="flex flex-wrap items-start gap-2">
                  <ProfileFollowButton key={`${displayUserId}:${ctxUser?._id || ctxUser?.id || ""}`} userId={displayUserId} />
                <div className="relative shrink-0" ref={shareRef}>
                  <button
                    type="button"
                    onClick={() => {
                      setShareMenuOpen((open) => !open);
                      setShareError("");
                    }}
                    aria-expanded={shareMenuOpen}
                    aria-haspopup="true"
                    className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-white transition hover:border-pink-500/50 hover:bg-pink-500/10 sm:text-sm"
                  >
                    <Share2 size={16} className="text-pink-400" />
                    Share Profile
                  </button>

                  {shareMenuOpen && (
                    <div className="fixed left-1/2 top-1/2 z-40 w-72 max-w-[calc(100vw-2rem)] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-white/10 bg-gray-950 p-4 shadow-2xl sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-2 sm:translate-x-0 sm:translate-y-0">
                      <div className="mb-3">
                        <h3 className="text-sm font-semibold text-white">
                          Share Profile
                        </h3>
                        <p className="mt-1 text-xs text-gray-400">
                          Share this profile with others.
                        </p>
                      </div>

                      {typeof navigator !== "undefined" &&
                        typeof navigator.share === "function" && (
                          <button
                            type="button"
                            onClick={handleNativeShare}
                            className="mb-3 flex w-full items-center justify-center gap-2 rounded-lg bg-pink-600 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-pink-500"
                          >
                            <Share2 size={16} />
                            Share with apps on your device
                          </button>
                        )}

                      <div className="grid grid-cols-2 gap-2">
                        <a
                          href={`https://www.facebook.com/sharer/sharer.php?u=${encodedShareUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => setShareMenuOpen(false)}
                          className="rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-center text-xs font-medium text-gray-200 transition hover:bg-white/10 hover:text-white"
                        >
                          Facebook
                        </a>

                        <a
                          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(profileShareText)}&url=${encodedShareUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => setShareMenuOpen(false)}
                          className="rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-center text-xs font-medium text-gray-200 transition hover:bg-white/10 hover:text-white"
                        >
                          X
                        </a>

                        <a
                          href={`https://wa.me/?text=${encodedShareText}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => setShareMenuOpen(false)}
                          className="flex items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-xs font-medium text-gray-200 transition hover:bg-white/10 hover:text-white"
                        >
                          <MessageCircle size={14} />
                          WhatsApp
                        </a>

                        <a
                          href={`https://t.me/share/url?url=${encodedShareUrl}&text=${encodeURIComponent(profileShareText)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => setShareMenuOpen(false)}
                          className="rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-center text-xs font-medium text-gray-200 transition hover:bg-white/10 hover:text-white"
                        >
                          Telegram
                        </a>

                        <a
                          href={`sms:?body=${encodedShareText}`}
                          onClick={() => setShareMenuOpen(false)}
                          className="rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-center text-xs font-medium text-gray-200 transition hover:bg-white/10 hover:text-white"
                        >
                          SMS Message
                        </a>

                        <a
                          href={`mailto:?subject=${encodeURIComponent(`Check out ${user.username || "this profile"} on Mystery Mansion`)}&body=${encodedShareText}`}
                          onClick={() => setShareMenuOpen(false)}
                          className="flex items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-xs font-medium text-gray-200 transition hover:bg-white/10 hover:text-white"
                        >
                          <Mail size={14} />
                          Email
                        </a>
                      </div>

                      <div className="mt-3 border-t border-white/10 pt-3">
                        <button
                          type="button"
                          onClick={handleCopyProfileLink}
                          className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-xs font-semibold text-white transition hover:bg-white/10"
                        >
                          {shareCopied ? (
                            <Check size={15} className="text-green-400" />
                          ) : (
                            <Copy size={15} className="text-gray-300" />
                          )}

                          {shareCopied ? "Link Copied" : "Copy Profile Link"}
                        </button>

                        {shareError && (
                          <p
                            role="alert"
                            className="mt-2 text-center text-xs text-red-400"
                          >
                            {shareError}
                          </p>
                        )}

                        {shareCopied && (
                          <p
                            aria-live="polite"
                            className="mt-2 text-center text-xs text-gray-400"
                          >
                            Your profile link is ready to share.
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                </div>

              </div>

              {/* ROLE */}

              {user.role && (
                <p className="mt-1 text-xs font-medium uppercase tracking-wider text-gray-400">
                  {user.role}
                </p>
              )}

              {/* BIO */}

              <div className="mt-4 max-w-3xl">

                {!editingBio ? (
                  <div className="flex items-start gap-2">

                    <p className="flex-1 text-sm leading-6 text-gray-300 sm:text-base">
                      {user.bio ||
                        "No bio available."}
                    </p>

                    {isOwner && (
                      <button
                        type="button"
                        onClick={() =>
                          setEditingBio(
                            true
                          )
                        }
                        className="rounded-lg p-2 text-gray-400 transition hover:bg-white/10 hover:text-pink-400"
                        aria-label="Edit bio"
                      >
                        <Pencil
                          size={16}
                        />
                      </button>
                    )}

                  </div>
                ) : (
                  <div className="space-y-2">

                    <textarea
                      value={bioInput}
                      onChange={(e) =>
                        setBioInput(
                          e.target.value
                        )
                      }
                      className="w-full rounded-lg border border-gray-700 bg-gray-900 p-3 text-sm text-white outline-none transition focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20"
                      rows={3}
                    />

                    <div className="flex gap-2">

                      <button
                        type="button"
                        onClick={
                          handleBioSave
                        }
                        disabled={
                          savingBio
                        }
                        className="rounded-lg bg-pink-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-pink-500 disabled:opacity-60"
                      >
                        {savingBio
                          ? "Saving..."
                          : "Save"}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setEditingBio(
                            false
                          );
                          setBioInput(
                            user.bio ||
                              ""
                          );
                        }}
                        className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold text-gray-300 transition hover:bg-white/20"
                      >
                        Cancel
                      </button>

                    </div>
                  </div>
                )}

              </div>

              {/* PROFILE META */}

              <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-gray-400">

                {Number.isFinite(
                  Number(user.age)
                ) &&
                  Number(user.age) >
                    0 && (
                    <div className="flex items-center gap-2">
                      <UserRound
                        size={15}
                        className="text-pink-400"
                      />

                      <span>
                        Age {user.age}
                      </span>
                    </div>
                  )}

                {user.gender && (
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-yellow-400" />

                    <span>
                      {user.gender}
                    </span>
                  </div>
                )}

                {!editingLocation ? (
                  <div className="flex items-center gap-2">

                    <MapPin
                      size={15}
                      className="text-pink-400"
                    />

                    <span>
                      {user.location ||
                        "No location set."}
                    </span>

                    {isOwner && (
                      <button
                        type="button"
                        onClick={() =>
                          setEditingLocation(
                            true
                          )
                        }
                        className="rounded p-1 text-gray-500 transition hover:text-pink-400"
                        aria-label="Edit location"
                      >
                        <Pencil
                          size={13}
                        />
                      </button>
                    )}

                  </div>
                ) : (
                  <div className="flex w-full flex-col gap-2 sm:max-w-md">

                    <input
                      type="text"
                      value={
                        locationInput
                      }
                      onChange={(e) =>
                        setLocationInput(
                          e.target.value
                        )
                      }
                      className="rounded-lg border border-gray-700 bg-gray-900 p-2 text-sm text-white outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20"
                      placeholder="Enter your location"
                    />

                    <div className="flex gap-2">

                      <button
                        type="button"
                        onClick={
                          handleLocationSave
                        }
                        disabled={
                          savingLocation
                        }
                        className="rounded-lg bg-pink-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-pink-500 disabled:opacity-60"
                      >
                        {savingLocation
                          ? "Saving..."
                          : "Save"}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setEditingLocation(
                            false
                          );
                          setLocationInput(
                            user.location ||
                              ""
                          );
                        }}
                        className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold text-gray-300 hover:bg-white/20"
                      >
                        Cancel
                      </button>

                    </div>
                  </div>
                )}

              </div>

              {/* CONTACT INFORMATION */}

              {(hasPhoneNumber || hasEmail) && (
                <div className="mt-5 flex flex-wrap gap-3">

                  {hasPhoneNumber && (
                    <div className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs transition hover:border-pink-500/50 hover:bg-pink-500/10">
                      <Phone
                        size={14}
                        className="shrink-0 text-pink-400"
                      />

                      <ContactValue
                        field="phone"
                        masked={user?.phoneMasked}
                        state={contactState}
                        variant="dark"
                      />
                    </div>
                  )}

                  {hasEmail && (
                    <div className="inline-flex max-w-full items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs transition hover:border-pink-500/50 hover:bg-pink-500/10">
                      <Mail
                        size={14}
                        className="shrink-0 text-pink-400"
                      />

                      <ContactValue
                        field="email"
                        masked={user?.emailMasked}
                        state={contactState}
                        variant="dark"
                      />
                    </div>
                  )}

                  <div className="w-full">
                    <ContactRevealNotice
                      state={contactState}
                      variant="dark"
                    />
                  </div>

                </div>
              )}

            </div>
          </div>
        </div>
      </div>

    </div>
  );
}