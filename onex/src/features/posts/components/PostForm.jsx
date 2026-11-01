import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle,
  Film,
  ImagePlus,
  LayoutList,
  Loader2,
  MapPin,
  RefreshCw,
  ShieldAlert,
  UserRound,
  X,
  XCircle,
} from "lucide-react";
import CategoryList from "./Categories/categoryList";
import ProfilePostCard from "./ProfilePostCard";
import api, { getAuthToken } from "@/shared/utils/api";
import { UserContext } from "@/context/UserContext";
import { formatLocation } from "../utils/postLocation";

const MAX_FILES = 10;
const MAX_FILE_BYTES = 25 * 1024 * 1024;
const IMAGE_EXT = /\.(jpe?g|png|gif|webp|heic|heif|avif|bmp)$/i;
const VIDEO_EXT = /\.(mp4|mov|m4v|webm|3gp|3g2|mkv|avi|qt)$/i;

const ACCOUNT_GENDER_TO_POST_GENDER = {
  "Woman escort": "female",
  "Man escort": "male",
  "TS escort": "ts",
};

// Some phones report an empty MIME type, so fall back to the extension.
const getMediaKind = (file) => {
  const type = String(file?.type || "").toLowerCase();
  if (type.startsWith("image/")) return "image";
  if (type.startsWith("video/")) return "video";
  if (IMAGE_EXT.test(file?.name || "")) return "image";
  if (VIDEO_EXT.test(file?.name || "")) return "video";
  return null;
};

const inputClass =
  "w-full border border-gray-300 p-2 sm:p-3 rounded-lg focus:ring-2 focus:ring-pink-400 focus:outline-none text-sm sm:text-base";

/**
 * Detects where the member is posting from. Device coordinates are sent to
 * the API, which reverse-geocodes and normalizes them; without permission the
 * API falls back to the location on the member's profile.
 */
function usePostingLocation() {
  const [state, setState] = useState({
    status: "detecting",
    location: null,
    coords: null,
    blocked: false,
  });

  // `fresh` is true when the member taps Re-detect: that click is the user
  // gesture browsers require to show the "Allow location" prompt, and a fresh
  // fix (maximumAge 0) bypasses any cached position.
  const detect = useCallback((fresh = false) => {
    setState((prev) => ({ ...prev, status: "detecting" }));

    const resolve = async (coords, blocked = false) => {
      try {
        const { data } = await api.get("/posts/resolve-location", { params: coords || {} });
        setState({
          status: data?.location ? "ready" : "missing",
          location: data?.location || null,
          coords,
          blocked,
        });
      } catch {
        setState({ status: "missing", location: null, coords, blocked });
      }
    };

    if (!navigator.geolocation || !window.isSecureContext) {
      resolve(null, true);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      (err) => resolve(null, err?.code === err?.PERMISSION_DENIED),
      {
        enableHighAccuracy: fresh,
        timeout: 15000,
        maximumAge: fresh ? 0 : 10 * 60 * 1000,
      }
    );
  }, []);

  useEffect(() => {
    detect();
  }, [detect]);

  return { ...state, detect };
}

export default function PostForm({ onSuccess, embedded = false }) {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const postingLocation = usePostingLocation();

  const [mode, setMode] = useState("listing");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [maxRedeemTooltip, setMaxRedeemTooltip] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categories, setCategories] = useState(["uncategorized"]);
  const [media, setMedia] = useState([]); // [{ id, file, kind, previewUrl }]
  const [gender, setGender] = useState("");
  const [promoCode, setPromoCode] = useState("");

  const profileGender = ACCOUNT_GENDER_TO_POST_GENDER[user?.gender] || "";

  const promoExpiryAt = useMemo(() => {
    const expiry = user?.activePromoExpiry ? new Date(user.activePromoExpiry) : null;
    return expiry && !Number.isNaN(expiry.getTime()) && expiry > new Date()
      ? user.activePromoExpiry
      : "";
  }, [user?.activePromoExpiry]);
  const [redeemedPromoExpiry, setRedeemedPromoExpiry] = useState("");
  const hasActivePromo = Boolean(redeemedPromoExpiry || promoExpiryAt);

  useEffect(() => {
    if (!getAuthToken()) {
      setToast({ type: "error", msg: "You must be logged in to create a post." });
      navigate("/signin");
    }
  }, [navigate]);

  // Release preview object URLs on unmount (removals revoke individually).
  const mediaRef = useRef(media);
  mediaRef.current = media;
  useEffect(
    () => () => mediaRef.current.forEach((item) => URL.revokeObjectURL(item.previewUrl)),
    []
  );

  // ----------------------- Handlers -----------------------
  const handleCategorySelect = (category) => {
    const normalized = String(category || "").trim().toLowerCase();

    setCategories((prev) => {
      const existing = prev.filter(
        (item) => String(item || "").trim().toLowerCase() !== "uncategorized"
      );
      const alreadySelected = existing.some(
        (item) => String(item || "").trim().toLowerCase() === normalized
      );
      const next = alreadySelected
        ? existing.filter((item) => String(item || "").trim().toLowerCase() !== normalized)
        : [...existing, category];
      return next.length > 0 ? next : ["uncategorized"];
    });
  };

  const handleMediaPick = (event) => {
    const picked = Array.from(event.target.files || []);
    event.target.value = ""; // allow re-picking the same file
    if (!picked.length) return;

    const errors = [];
    const accepted = [];

    for (const file of picked) {
      const kind = getMediaKind(file);
      if (!kind) {
        errors.push(`${file.name} isn't a photo or video.`);
      } else if (file.size > MAX_FILE_BYTES) {
        errors.push(`${file.name} is larger than 25 MB.`);
      } else {
        accepted.push({
          id: `${file.name}-${file.size}-${file.lastModified}-${Math.random()}`,
          file,
          kind,
          previewUrl: URL.createObjectURL(file),
        });
      }
    }

    setMedia((prev) => {
      const room = MAX_FILES - prev.length;
      if (accepted.length > room) {
        errors.push(`You can add up to ${MAX_FILES} photos and videos per post.`);
        accepted.slice(room).forEach((item) => URL.revokeObjectURL(item.previewUrl));
      }
      return [...prev, ...accepted.slice(0, Math.max(room, 0))];
    });

    setToast(errors.length ? { type: "error", msg: errors.join(" ") } : null);
  };

  const removeMedia = (id) => {
    setMedia((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((item) => item.id !== id);
    });
  };

  const resetForm = () => {
    media.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    setTitle("");
    setDescription("");
    setCategories(["uncategorized"]);
    setMedia([]);
    setGender("");
    setPromoCode("");
    setAcknowledged(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setToast(null);
    setMaxRedeemTooltip("");

    const isProfile = mode === "profile";

    if (!isProfile && media.length === 0) {
      setToast({ type: "error", msg: "Please add at least one photo or video before posting." });
      return;
    }

    if (!acknowledged) {
      setToast({ type: "error", msg: "Please acknowledge the posting terms before submitting." });
      return;
    }

    if (postingLocation.status === "detecting") {
      setToast({ type: "error", msg: "Still detecting your location — try again in a moment." });
      return;
    }

    setLoading(true);

    try {
      let effectivePromoExpiry = redeemedPromoExpiry || promoExpiryAt;
      const enteredPromoCode = promoCode.trim();

      if (enteredPromoCode) {
        const { data: redeemData } = await api.post("/promo-codes/redeem", { code: enteredPromoCode });
        effectivePromoExpiry =
          redeemData?.data?.expiresAt || redeemData?.user?.activePromoExpiry || effectivePromoExpiry;
        if (effectivePromoExpiry) setRedeemedPromoExpiry(effectivePromoExpiry);
      }

      const selectedCategories = categories
        .map((value) => String(value || "").trim())
        .filter(Boolean);
      const effectiveCategories = selectedCategories.length ? selectedCategories : ["uncategorized"];

      const fd = new FormData();
      fd.append("postType", isProfile ? "profile" : "listing");
      effectiveCategories.forEach((category) => fd.append("categories", category));
      // Legacy single category kept in sync for older views/queries.
      fd.append("category", effectiveCategories[0]);

      const { coords, location } = postingLocation;
      if (coords) {
        fd.append("latitude", String(coords.latitude));
        fd.append("longitude", String(coords.longitude));
      }
      if (location) {
        fd.append("city", location.city || "");
        fd.append("state", location.state || "");
        fd.append("country", location.country || "");
      }

      const effectiveGender = gender || profileGender;
      if (effectiveGender) fd.append("gender", effectiveGender);

      if (!isProfile) {
        fd.append("title", title.trim());
        fd.append("description", description.trim());
        media.forEach((item) => fd.append("media", item.file));
      }

      if (effectivePromoExpiry) {
        fd.append("isPromo", "true");
        fd.append("promoExpiresAt", effectivePromoExpiry);
      }

      const { data } = await api.post("/posts", fd);

      setToast({
        type: "success",
        msg: isProfile
          ? data?.updated
            ? "Your profile post was updated."
            : "Your profile is now posted!"
          : "Post created successfully!",
      });
      if (onSuccess) onSuccess();

      const primaryCategory = effectiveCategories[0];
      resetForm();

      const profileOwnerId = user?._id || user?.id || data?.post?.userId?._id || data?.userId?._id;
      if (isProfile && profileOwnerId) {
        setTimeout(() => navigate(`/user/${profileOwnerId}`), 1200);
      } else if (!embedded) {
        setTimeout(() => {
          navigate(
            primaryCategory && primaryCategory.toLowerCase() !== "uncategorized"
              ? `/category/${primaryCategory}`
              : "/home"
          );
        }, 1200);
      }
    } catch (err) {
      console.error("[PostForm] Error:", err.response?.data || err.message);

      const backendMessage =
        err.response?.data?.error || "Error creating post. Make sure you are logged in.";
      const isMaxRedeemedError =
        err?.response?.status === 409 || /max usage limit/i.test(String(backendMessage));

      if (isMaxRedeemedError) {
        const warningMessage =
          "All codes have been redeemed, look at the homepage dev message, if there isn't a code reach out to support via messages to see if the dev has anymore deals available!";
        setMaxRedeemTooltip(warningMessage);
        setToast({ type: "error", msg: warningMessage });
        return;
      }

      setToast({ type: "error", msg: backendMessage });
    } finally {
      setLoading(false);
    }
  };

  // ----------------------- Render -----------------------
  const locationLabel = formatLocation(postingLocation.location || {});
  const isProfileMode = mode === "profile";

  return (
    <div
      className={`w-full ${
        embedded ? "bg-transparent shadow-none" : "bg-white shadow-md"
      } rounded-2xl p-4 sm:p-6 md:p-8 max-w-3xl mx-auto text-left`}
    >
      {!embedded && (
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 text-center">
          Create New Post
        </h1>
      )}

      {/* Post type */}
      <div className="mb-4 grid grid-cols-2 gap-2 rounded-xl bg-white p-1 shadow-sm" role="tablist" aria-label="Post type">
        {[
          { id: "listing", label: "Create listing", icon: LayoutList },
          { id: "profile", label: "Post profile", icon: UserRound },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={mode === id}
            onClick={() => setMode(id)}
            className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition ${
              mode === id ? "bg-pink-600 text-white shadow" : "text-gray-600 hover:bg-pink-50 hover:text-pink-600"
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      {/* Location (detected automatically) */}
      <div className="mb-4 flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm">
        <MapPin size={16} className="shrink-0 text-pink-500" />
        {postingLocation.status === "detecting" ? (
          <span className="flex items-center gap-2 text-gray-500">
            <Loader2 size={14} className="animate-spin" /> Detecting your location…
          </span>
        ) : locationLabel ? (
          <span className="min-w-0 text-gray-700">
            Posting in <span className="font-semibold text-gray-900">{locationLabel}</span>
            {!postingLocation.coords && <span className="text-gray-400"> (from your profile)</span>}
          </span>
        ) : (
          <span className="min-w-0 text-gray-500">
            Location unavailable — allow location access so local clients can find your post.
          </span>
        )}
        {postingLocation.status !== "detecting" && (
          <button
            type="button"
            onClick={() => postingLocation.detect(true)}
            className="ml-auto inline-flex shrink-0 items-center gap-1 text-xs font-medium text-pink-600 hover:underline"
          >
            <RefreshCw size={12} /> Re-detect
          </button>
        )}
      </div>
      {postingLocation.blocked && postingLocation.status !== "detecting" && (
        <p className="-mt-3 mb-4 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
          Location access is blocked for this site, so your browser won&apos;t show the
          &quot;Allow location&quot; pop-up. Tap the lock or settings icon next to the address bar,
          set Location to <span className="font-semibold">Allow</span>, then tap Re-detect.
        </p>
      )}

      <div className="mb-4">
        <label className="block mb-2 font-semibold text-sm sm:text-base">
          {isProfileMode ? "Show my profile in:" : "Choose categories:"}
        </label>
        <div className="overflow-x-auto">
          <CategoryList onSelect={handleCategorySelect} selectedCategories={categories} multiple />
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          Select one or more categories. If none are selected, your post goes in uncategorized.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:gap-4">
        {isProfileMode ? (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Your profile card shows your profile picture, location and prices. It stays up to date
              with your profile, and posting again just updates its categories and location.
            </p>
            <div className="mx-auto w-full max-w-[240px]">
              <ProfilePostCard
                preview
                author={user || {}}
                post={{ categories, ...(postingLocation.location || {}) }}
              />
            </div>
            {(!user?.profilePic ||
              ![user?.incallPrice, user?.outcallPrice, user?.overnightPrice, user?.flyOutPrice].some(
                (price) => Number(price) > 0
              )) && (
              <p className="text-center text-xs text-gray-500">
                Add a profile picture and prices in{" "}
                <Link to="/user/settings" className="font-medium text-pink-600 underline">
                  settings
                </Link>{" "}
                to make your card stand out.
              </p>
            )}
          </div>
        ) : (
          <>
            <input
              type="text"
              name="title"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={120}
              className={inputClass}
            />
            <textarea
              name="description"
              placeholder="What's on your mind?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
              className={`${inputClass} resize-none`}
            />

            {/* Photos & videos */}
            <div>
              <label
                className={`flex cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed px-4 py-5 text-center transition ${
                  media.length >= MAX_FILES
                    ? "cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400"
                    : "border-pink-300 bg-white text-pink-600 hover:bg-pink-50"
                }`}
              >
                <span className="flex items-center gap-2 font-semibold">
                  <ImagePlus size={18} /> Add photos &amp; videos
                </span>
                <span className="text-xs text-gray-500">
                  Up to {MAX_FILES} files, 25 MB each · {media.length}/{MAX_FILES} added
                </span>
                <input
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  disabled={media.length >= MAX_FILES}
                  onChange={handleMediaPick}
                  className="sr-only"
                />
              </label>

              {media.length > 0 && (
                <ul className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
                  {media.map((item) => (
                    <li key={item.id} className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
                      {item.kind === "video" ? (
                        <>
                          <video src={item.previewUrl} muted playsInline preload="metadata" className="h-full w-full object-cover" />
                          <span className="absolute bottom-1 left-1 rounded bg-black/70 p-0.5 text-white">
                            <Film size={12} />
                          </span>
                        </>
                      ) : (
                        <img src={item.previewUrl} alt={item.file.name} className="h-full w-full object-cover" />
                      )}
                      <button
                        type="button"
                        onClick={() => removeMedia(item.id)}
                        aria-label={`Remove ${item.file.name}`}
                        className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white hover:bg-black/80"
                      >
                        <X size={14} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Only needed when the profile doesn't already say. */}
            {!profileGender && (
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1.5">
                  Provider gender <span className="text-gray-400">(helps clients filter)</span>
                </p>
                <div className="flex gap-2">
                  {[
                    { value: "female", label: "♀ Female" },
                    { value: "male", label: "♂ Male" },
                    { value: "ts", label: "⚧ TS" },
                  ].map(({ value, label }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setGender((prev) => (prev === value ? "" : value))}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                        gender === value
                          ? "bg-pink-600 border-pink-600 text-white"
                          : "border-gray-300 text-gray-600 hover:border-pink-400 hover:text-pink-600"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        <input
          type="text"
          name="promoCode"
          placeholder="Promo code (optional)"
          value={promoCode}
          onChange={(e) => {
            setPromoCode(e.target.value);
            if (maxRedeemTooltip) setMaxRedeemTooltip("");
          }}
          className={inputClass}
        />

        {maxRedeemTooltip && (
          <div className="relative rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 shadow-sm">
            <p className="inline-flex items-start gap-2">
              <ShieldAlert size={16} className="mt-0.5 shrink-0 text-amber-700" />
              <span>{maxRedeemTooltip}</span>
            </p>
          </div>
        )}

        <label className="flex items-start gap-2 mt-1 text-xs sm:text-sm text-gray-700">
          <input
            type="checkbox"
            checked={acknowledged}
            onChange={(e) => setAcknowledged(e.target.checked)}
            className="mt-1 w-4 h-4 sm:w-5 sm:h-5 text-pink-500 border-gray-300 rounded focus:ring-pink-400"
          />
          <span>
            By acknowledging this checkbox, you confirm your post follows platform rules and understand promo codes are optional but required for promoted placement.  For extra exposure on the platform, you will be required to pay. If you have any questions, please look at our{" "}
            <Link to="/terms-policy" className="text-pink-600 underline">policy page</Link>.
          </span>
        </label>

        {hasActivePromo && (
          <div className="mx-auto inline-flex items-center rounded-md border border-green-300 bg-green-50 px-2.5 py-1 text-[11px] sm:text-xs font-medium text-green-700">
            ✓ Promo Post Activated
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 sm:py-3 rounded-lg text-sm sm:text-base font-semibold flex items-center justify-center gap-2 transition ${
            loading
              ? "bg-gray-300 text-gray-600 cursor-not-allowed"
              : "bg-gradient-to-r from-pink-500 to-yellow-400 text-white hover:opacity-90"
          }`}
        >
          {loading ? <Loader2 className="animate-spin" /> : isProfileMode ? "Post my profile" : "Post"}
        </button>

        <button
          type="button"
          onClick={() => navigate("/home")}
          className="w-full flex items-center justify-center gap-2 py-2 sm:py-3 mt-1 rounded-lg border border-pink-400 text-pink-600 hover:bg-pink-50 transition text-sm sm:text-base font-medium"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" /> Return Home
        </button>
      </form>

      {toast && (
        <div
          role="status"
          className={`mt-4 flex items-center gap-2 p-3 rounded-lg text-sm sm:text-base ${
            toast.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}
        >
          {toast.type === "success" ? <CheckCircle /> : <XCircle />} <span>{toast.msg}</span>
        </div>
      )}
    </div>
  );
}
