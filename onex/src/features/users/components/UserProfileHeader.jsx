import { useEffect, useState, useContext, useRef } from "react";
import { UserContext } from "@/context/UserContext";
import { Camera, Pencil, CheckCircle2, Star } from "lucide-react";
import api from "@/shared/utils/api";
import { hasPermanentProviderBadge } from '@/features/users/services/providerBadgeEligibility.js';



/*
  UserProfileHeader
*/

export default function UserProfileHeader({
  propUser = null,
  userId: propUserId = null,
}) {
  const { user: ctxUser, updateProfile } = useContext(UserContext);

  const displayUserId = propUser?._id || propUser?.id || propUserId || null;

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
  });

  const [banner, setBanner] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editingBio, setEditingBio] = useState(false);
  const [editingLocation, setEditingLocation] = useState(false);
  const [bioInput, setBioInput] = useState("");
  const [locationInput, setLocationInput] = useState("");
  const [savingBanner, setSavingBanner] = useState(false);
  const [savingBio, setSavingBio] = useState(false);
  const [savingLocation, setSavingLocation] = useState(false);

  const fileInputRef = useRef(null);
  const isOwner = Boolean(ctxUser?._id && displayUserId && String(ctxUser._id) === String(displayUserId));

  const readProfileFromStorage = (id) => {
    if (!id) return null;
    const key = `userProfile_${id}`;
    const raw = localStorage.getItem(key);
    if (!raw) return null;

    try {
      return JSON.parse(raw);
    } catch (err) {
      console.error(`Failed to parse profile for key ${key}:`, err);
      return null;
    }
  };

  const readBannerFromStorage = (id) => {
    if (!id) return null;
    const key = `userBanner_${id}`;
    return localStorage.getItem(key);
  };



  useEffect(() => {
    let cancelled = false;

    const applyProfile = (profileData) => {
      if (!profileData || cancelled) return;
      setUser({
        username: profileData.username || "",
        role: profileData.role || "",
        bio: profileData.bio || "",
        age: profileData.age ?? null,
        createdAt: profileData.createdAt || null,
        location: profileData.location || "",
        gender: profileData.gender || "",
        phoneNumber: profileData.phoneNumber || "",
        email: profileData.email || "",
        profilePic: profileData.profilePic || null,
        bannerPic: profileData.bannerPic || null,
        activePromoExpiry: profileData.activePromoExpiry || null,
        badgeType: profileData.badgeType || "",
      });
      setBioInput(profileData.bio || "");
      setLocationInput(profileData.location || "");
      if (profileData.bannerPic) setBanner(profileData.bannerPic);
    };

    if (propUser) {
      applyProfile(propUser);
      return;
    }

    if (!displayUserId) {
      if (ctxUser) applyProfile(ctxUser);
      return;
    }

    

    // Owner: use context + localStorage for optimistic updates
    if (isOwner) {
      const cached = readProfileFromStorage(displayUserId);
      applyProfile(cached || ctxUser);
      if (!(cached || ctxUser)?.bannerPic) {
        const savedBanner = readBannerFromStorage(displayUserId);
        if (savedBanner) setBanner(savedBanner);
      }
      return;
    }

    // Non-owner viewer: always fetch from backend
    const cached = readProfileFromStorage(displayUserId);
    if (cached) applyProfile(cached); // show cached instantly, then refresh below

    setLoading(true);
    api
      .get(`/public/users/id/${displayUserId}`)
      .then((res) => {
        if (cancelled) return;
        const data = res.data;
        applyProfile(data);
        localStorage.setItem(`userProfile_${displayUserId}`, JSON.stringify(data));
      })
      .catch((err) => {
        console.error('Failed to fetch profile for user', displayUserId, err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [propUser, displayUserId, ctxUser, isOwner]);

  const handleBannerClick = () => {
    if (!isOwner) return;
    fileInputRef.current?.click();
  };

  const handleBannerChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isOwner) {
      alert("You can only update your own banner.");
      return;
    }

    setSavingBanner(true);

    try {
      const formData = new FormData();
      formData.append("bannerPic", file);
      const updatedUser = await updateProfile(formData, null, true);
      const updatedBanner = updatedUser?.bannerPic || null;

      if (updatedBanner) {
        setBanner(updatedBanner);
      }

      setUser((prev) => ({
        ...prev,
        ...updatedUser,
      }));

      alert("Banner updated.");
    } catch (err) {
      alert(err.message || "Failed to update banner");
    } finally {
      setSavingBanner(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  

  const handleBioSave = async () => {
    if (!isOwner) {
      alert("You can only update your own bio.");
      return;
    }

    setSavingBio(true);

    try {
      const updatedUser = await updateProfile({ bio: bioInput });
      setUser((prev) => ({
        ...prev,
        ...updatedUser,
      }));
      setEditingBio(false);
    } catch (err) {
      alert(err.message || "Failed to update bio");
    } finally {
      setSavingBio(false);
    }
  };

  const handleLocationSave = async () => {
    if (!isOwner) {
      alert("You can only update your own location.");
      return;
    }

    setSavingLocation(true);

    try {
      const updatedUser = await updateProfile({ location: locationInput });
      setUser((prev) => ({
        ...prev,
        ...updatedUser,
      }));
      setEditingLocation(false);
    } catch (err) {
      alert(err.message || "Failed to update location");
    } finally {
      setSavingLocation(false);
    }
  };


  // BADGE LOGIC (NEW): Use badgeType from backend
  // badgeType: "blue" (monthly), "pink" (promo), "" (none)
  const isPermanentProvider = hasPermanentProviderBadge(user?.createdAt);
  const isAdmin = user?.role === "admin";
  const displayPhoneNumber = user?.phoneNumber || "";
  const displayEmail = user?.email || "";
  const usernameLength = (user?.username || "").trim().length;
  const usernameSizeClass =
    usernameLength >= 20
      ? "text-xs sm:text-xs md:text-xs"
      : "text-sm sm:text-base md:text-lg";
  const usernameStyle = usernameLength >= 20 ? { fontSize: "10px" } : {};
  const hasPhoneNumber = Boolean(displayPhoneNumber);
  const hasEmail = Boolean(displayEmail);

  if (loading && !user.username) {
    return (
      <div className="w-full max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
        <div className="h-36 md:h-44 bg-gray-200" />
        <div className="px-6 pb-6 pt-16">
          <div className="h-6 w-40 bg-gray-200 rounded mb-3" />
          <div className="h-4 w-64 bg-gray-100 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">

      {/* Banner */}
      <div
        className="relative h-36 md:h-44 bg-gradient-to-r from-pink-500 via-red-500 to-yellow-400"
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

        {/* Edit Banner Button */}
        {isOwner && (
          <button
            onClick={handleBannerClick}
            disabled={savingBanner}
            className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full backdrop-blur transition disabled:opacity-60"
          >
            <Camera size={18} />
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

      {/* Profile Section */}
      <div className="px-6 pb-6 relative">

        {/* Profile Image */}
        <div className="absolute -top-14 left-6">
          {user.profilePic ? (
            <img
              src={user.profilePic}
              alt={user.username || "Profile"}
              className="w-24 h-24 md:w-28 md:h-28 rounded-full object-cover border-4 border-white shadow"
            />
          ) : (
            <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-gray-300 border-4 border-white shadow flex items-center justify-center text-gray-600 text-sm">
              No Photo
            </div>
          )}
        </div>

        {/* Username + Bio */}
        <div className="pt-16 md:pt-20">

          <h1 className={`${usernameSizeClass} font-bold text-gray-900 inline-flex items-center gap-2 break-words leading-tight`} style={usernameStyle}>
            <span>{user.username || "Unnamed User"}</span>
            {/* BADGE LOGIC: Show blue verified and DEV badge for admins */}
            {isAdmin ? (
              <>
                {/* Blue Verified Badge for Admin */}
                <span
                  className="inline-flex items-center gap-1 rounded-full bg-blue-600 text-white font-semibold px-1.5 sm:px-2 py-0.5 whitespace-nowrap leading-none"
                  aria-label="Verified"
                  title="Verified Admin"
                  style={{ fontSize: '11px' }}
                >
                  <CheckCircle2 size={14} className="text-white" />
                  Verified
                </span>
                {/* Gold Dev Badge */}
                <span
                  className="relative inline-flex rounded-full p-[1px] overflow-hidden"
                  aria-label="Developer"
                  title="Developer"
                >
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 rounded-full bg-[conic-gradient(from_180deg_at_50%_50%,#fbbf24_0deg,#f59e0b_90deg,#d97706_180deg,#fef3c7_270deg,#fbbf24_360deg)] animate-[spin_8s_linear_infinite]"
                  />
                  <div className="relative inline-flex items-center gap-1 bg-gradient-to-r from-amber-500/90 via-yellow-400/90 to-amber-500/90 text-white text-[9px] sm:text-[10px] md:text-xs font-bold px-1.5 sm:px-2 py-0.5 rounded-full">
                    DEV
                  </div>
                </span>
              </>
            ) : (
              <>
                {/* BADGE LOGIC (SHOW CHECK MARK FOR NON-ADMINS) */}
                <span
                  className={`inline-flex items-center gap-1 rounded-full font-semibold px-1.5 sm:px-2 py-0.5 whitespace-nowrap leading-none
                    ${user.badgeType === 'blue' ? 'bg-blue-600 text-white' : user.badgeType === 'pink' ? 'bg-pink-500 text-white' : 'bg-gray-200 text-gray-400'}`}
                  aria-label={user.badgeType === 'blue' ? 'Verified' : user.badgeType === 'pink' ? 'Promo Badge' : 'Unverified'}
                  title={user.badgeType === 'blue' ? 'Verified (Monthly Badge)' : user.badgeType === 'pink' ? 'Promotional Badge' : 'Unverified'}
                  style={{ fontSize: '11px' }}
                >
                  <CheckCircle2 size={14} className={user.badgeType === 'blue' || user.badgeType === 'pink' ? 'text-white' : 'text-gray-400'} />
                  {user.badgeType === 'blue' && 'Verified'}
                  {user.badgeType === 'pink' && 'Promo'}
                </span>
              </>
            )}
            {isPermanentProvider && (
              <span
                className="inline-flex items-center gap-1 rounded-full bg-emerald-600 text-white text-[9px] sm:text-[10px] md:text-xs font-semibold px-1.5 sm:px-2 py-0.5 whitespace-nowrap leading-none"
                aria-label="Founding Provider"
                title="Founding Provider"
              >
                <Star size={10} className="fill-current" />
                Founding Provider
              </span>
            )}
          </h1>

          {/* Bio Section */}
          <div className="mt-3 max-w-xl">
            {!editingBio ? (
              <div className="flex items-start gap-2">
                <p className="text-gray-600 text-sm md:text-base flex-1">
                  {user.bio || "No bio available."}
                </p>

                {isOwner && (
                  <button
                    onClick={() => setEditingBio(true)}
                    className="text-gray-500 hover:text-pink-600 transition"
                  >
                    <Pencil size={16} />
                  </button>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <textarea
                  value={bioInput}
                  onChange={(e) => setBioInput(e.target.value)}
                  className="border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                  rows={3}
                />

                <div className="flex gap-2">
                  <button
                    onClick={handleBioSave}
                    disabled={savingBio}
                    className="bg-pink-600 text-white text-xs px-3 py-1 rounded hover:bg-pink-700 transition disabled:opacity-60"
                  >
                    {savingBio ? "Saving..." : "Save"}
                  </button>

                  <button
                    onClick={() => {
                      setEditingBio(false);
                      setBioInput(user.bio);
                    }}
                    className="bg-gray-200 text-gray-700 text-xs px-3 py-1 rounded hover:bg-gray-300 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="mt-3 space-y-2">
              {Number.isFinite(Number(user.age)) && Number(user.age) > 0 && (
                <p className="text-gray-700 text-sm md:text-base">
                  Age: {user.age}
                </p>
              )}

              <p className="text-gray-700 text-sm md:text-base break-all">
                Phone:{" "}
                {hasPhoneNumber ? (
                  <a
                    href={`tel:${String(displayPhoneNumber).replace(/\D/g, "")}`}
                    className="text-pink-600 underline decoration-pink-400 underline-offset-2 hover:text-pink-700"
                  >
                    {displayPhoneNumber}
                  </a>
                ) : (
                  <span className="italic text-gray-400">Not provided</span>
                )}
              </p>

              <p className="text-gray-700 text-sm md:text-base break-all">
                Email:{" "}
                {hasEmail ? (
                  <a
                    href={`mailto:${displayEmail}`}
                    className="text-pink-600 underline decoration-pink-400 underline-offset-2 hover:text-pink-700"
                  >
                    {displayEmail}
                  </a>
                ) : (
                  <span className="italic text-gray-400">Not provided</span>
                )}
              </p>

              {!editingLocation ? (
                <div className="flex items-start gap-2">
                  <p className="text-gray-700 text-sm md:text-base flex-1">
                    Location: {user.location || "No location set."}
                  </p>

                  {isOwner && (
                    <button
                      onClick={() => setEditingLocation(true)}
                      className="text-gray-500 hover:text-pink-600 transition"
                      aria-label="Edit location"
                      title="Edit location"
                    >
                      <Pencil size={16} />
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <input
                    type="text"
                    value={locationInput}
                    onChange={(e) => setLocationInput(e.target.value)}
                    className="border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="Enter your location"
                  />

                  <div className="flex gap-2">
                    <button
                      onClick={handleLocationSave}
                      disabled={savingLocation}
                      className="bg-pink-600 text-white text-xs px-3 py-1 rounded hover:bg-pink-700 transition disabled:opacity-60"
                    >
                      {savingLocation ? "Saving..." : "Save"}
                    </button>

                    <button
                      onClick={() => {
                        setEditingLocation(false);
                        setLocationInput(user.location || "");
                      }}
                      className="bg-gray-200 text-gray-700 text-xs px-3 py-1 rounded hover:bg-gray-300 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {user.gender && (
                <p className="text-gray-700 text-sm md:text-base">
                  Gender: {user.gender}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}