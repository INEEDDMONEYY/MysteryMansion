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
} from "lucide-react";
import api from "@/shared/utils/api";
import { hasPermanentProviderBadge } from "@/features/users/services/providerBadgeEligibility.js";

export default function UserProfileHeader({
  propUser = null,
  userId: propUserId = null,
}) {
  const { user: ctxUser, updateProfile } =
    useContext(UserContext);

  const displayUserId =
    propUser?._id ||
    propUser?.id ||
    propUserId ||
    null;

  const [user, setUser] = useState({
    username: "",
    role: "",
    bio: "",
    age: null,
    createdAt: null,
    location: "",
    gender: "",
    phoneNumber: "",
    email: "",
    profilePic: null,
    bannerPic: null,
    activePromoExpiry: null,
    badgeType: "",
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

  const fileInputRef = useRef(null);

  const isOwner = Boolean(
    ctxUser?._id &&
      displayUserId &&
      String(ctxUser._id) ===
        String(displayUserId)
  );

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
        bio: profileData.bio || "",
        age: profileData.age ?? null,
        createdAt:
          profileData.createdAt || null,
        location:
          profileData.location || "",
        gender:
          profileData.gender || "",
        phoneNumber:
          profileData.phoneNumber || "",
        email:
          profileData.email || "",
        profilePic:
          profileData.profilePic || null,
        bannerPic:
          profileData.bannerPic || null,
        activePromoExpiry:
          profileData.activePromoExpiry ||
          null,
        badgeType:
          profileData.badgeType || "",
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

  const displayPhoneNumber =
    user?.phoneNumber || "";

  const displayEmail =
    user?.email || "";

  const usernameLength =
    (user?.username || "")
      .trim()
      .length;

  const usernameSizeClass =
    usernameLength >= 20
      ? "text-sm sm:text-base"
      : "text-xl sm:text-2xl lg:text-3xl";

  const hasPhoneNumber =
    Boolean(displayPhoneNumber);

  const hasEmail =
    Boolean(displayEmail);

  // ─────────────────────────────────────────────────────────────
  // LOADING
  // ─────────────────────────────────────────────────────────────

  if (
    loading &&
    !user.username
  ) {
    return (
      <div className="w-full animate-pulse">

        <div className="h-52 bg-gray-200 sm:h-64 lg:h-80" />

        <div className="bg-black">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="h-8 w-48 rounded bg-gray-700" />
            <div className="mt-3 h-4 w-72 rounded bg-gray-800" />
          </div>
        </div>

      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // PAGE
  // ─────────────────────────────────────────────────────────────

  return (
    <div className="w-full">

      {/* ═══════════════════════════════════════════════════════
          FULL-WIDTH COVER
      ═══════════════════════════════════════════════════════ */}

      <div
        className="relative h-56 w-full overflow-hidden bg-gradient-to-r from-pink-500 via-red-500 to-yellow-400 sm:h-64 lg:h-80"
        style={
          banner
            ? {
                backgroundImage: `url(${banner})`,
                backgroundSize:
                  "cover",
                backgroundPosition:
                  "center",
              }
            : {}
        }
      >

        {/* Overlay */}

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

        {/* Banner edit */}

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

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleBannerChange}
        />
      </div>

      {/* ═══════════════════════════════════════════════════════
          PROFILE IDENTITY
      ═══════════════════════════════════════════════════════ */}

      <div className="relative w-full bg-black">

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          <div className="relative pb-7 sm:pb-8">

            {/* PROFILE IMAGE */}

            <div className="absolute -top-16 left-4 sm:-top-20 sm:left-6 lg:-top-24 lg:left-8">

              <div className="relative">

                {user.profilePic ? (
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
                )}

                {/* Online/profile indicator */}

                <div className="absolute bottom-2 right-2 flex h-6 w-6 items-center justify-center rounded-full border-2 border-black bg-pink-500 sm:h-7 sm:w-7">
                  <UserRound
                    size={13}
                    className="text-white"
                  />
                </div>

              </div>
            </div>

            {/* PROFILE CONTENT */}

            <div className="pt-20 sm:pl-44 sm:pt-6 lg:pl-56 lg:pt-8">

              {/* NAME + BADGES */}

              <div className="flex flex-wrap items-center gap-2">

                <h1
                  className={`${usernameSizeClass} font-bold leading-tight text-white`}
                >
                  {user.username ||
                    "Unnamed User"}
                </h1>

                {/* ADMIN BADGES */}

                {isAdmin ? (
                  <>
                    <span
                      className="inline-flex items-center gap-1 rounded-full bg-blue-600 px-2 py-1 text-[10px] font-semibold leading-none text-white sm:text-xs"
                      aria-label="Verified"
                      title="Verified Admin"
                    >
                      <CheckCircle2
                        size={13}
                      />

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
                ) : (
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold leading-none sm:text-xs ${
                      user.badgeType ===
                      "blue"
                        ? "bg-blue-600 text-white"
                        : user.badgeType ===
                          "pink"
                        ? "bg-pink-500 text-white"
                        : "bg-gray-700 text-gray-400"
                    }`}
                    aria-label={
                      user.badgeType ===
                      "blue"
                        ? "Verified"
                        : user.badgeType ===
                          "pink"
                        ? "Promo Badge"
                        : "Unverified"
                    }
                  >
                    <CheckCircle2
                      size={13}
                    />

                    {user.badgeType ===
                      "blue" &&
                      "Verified"}

                    {user.badgeType ===
                      "pink" &&
                      "Promo"}

                    {user.badgeType !==
                      "blue" &&
                      user.badgeType !==
                        "pink" &&
                      "Unverified"}
                  </span>
                )}

                {/* FOUNDING PROVIDER */}

                {isPermanentProvider && (
                  <span
                    className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2 py-1 text-[10px] font-semibold leading-none text-white sm:text-xs"
                    aria-label="Founding Provider"
                    title="Founding Provider"
                  >
                    <Star
                      size={12}
                      className="fill-current"
                    />

                    Founding Provider
                  </span>
                )}

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

                {/* Age */}

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

                {/* Gender */}

                {user.gender && (
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-yellow-400" />

                    <span>
                      {user.gender}
                    </span>
                  </div>
                )}

                {/* Location */}

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

              <div className="mt-5 flex flex-wrap gap-3">

                {hasPhoneNumber && (
                  <a
                    href={`tel:${String(
                      displayPhoneNumber
                    ).replace(
                      /\D/g,
                      ""
                    )}`}
                    className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-gray-300 transition hover:border-pink-500/50 hover:bg-pink-500/10 hover:text-white"
                  >
                    <Phone
                      size={14}
                      className="text-pink-400"
                    />

                    {displayPhoneNumber}
                  </a>
                )}

                {hasEmail && (
                  <a
                    href={`mailto:${displayEmail}`}
                    className="inline-flex max-w-full items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-gray-300 transition hover:border-pink-500/50 hover:bg-pink-500/10 hover:text-white"
                  >
                    <Mail
                      size={14}
                      className="shrink-0 text-pink-400"
                    />

                    <span className="break-all">
                      {displayEmail}
                    </span>
                  </a>
                )}

              </div>

            </div>
          </div>
        </div>
      </div>

    </div>
  );
}