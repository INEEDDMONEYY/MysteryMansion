import { useState, useEffect, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Loader2, CheckCircle, XCircle, ArrowLeft, ShieldAlert } from "lucide-react";
import CategoryList from "./Categories/categoryList";
import api, { getAuthToken } from "@/shared/utils/api";
import { UserContext } from "@/context/UserContext";

export default function PostForm({ onSuccess, embedded = false }) {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [maxRedeemTooltip, setMaxRedeemTooltip] = useState("");
  const [hasActivePromo, setHasActivePromo] = useState(false);
  const [promoExpiryAt, setPromoExpiryAt] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    city: "",
    state: "",
    country: "",
    gender: "",
    categories: ["uncategorized"],
    pictures: [],
    videos: [],
    visibility: "",
    promoCode: "",
  });

  const [acknowledged, setAcknowledged] = useState(false);

  // Ensure user is logged in
  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      setToast({ type: "error", msg: "You must be logged in to create a post." });
      navigate("/signin");
    }
  }, [navigate]);

  // Check for active promo redemption
  useEffect(() => {
    if (user?.activePromoExpiry) {
      const expiryDate = new Date(user.activePromoExpiry);
      const now = new Date();
      if (now < expiryDate) {
        setHasActivePromo(true);
        setPromoExpiryAt(user.activePromoExpiry);
      } else {
        setHasActivePromo(false);
        setPromoExpiryAt("");
      }
    } else {
      setHasActivePromo(false);
      setPromoExpiryAt("");
    }
  }, [user]);

  // ----------------------- Handlers -----------------------
  const handleCategorySelect = (category) => {
    const normalized = String(category || "").trim().toLowerCase();

    setFormData((prev) => {
      const existing = Array.isArray(prev.categories) ? prev.categories : [];
      const cleanedExisting = existing.filter(
        (item) => String(item || "").trim().toLowerCase() !== "uncategorized"
      );

      const alreadySelected = cleanedExisting.some(
        (item) => String(item || "").trim().toLowerCase() === normalized
      );

      const nextCategories = alreadySelected
        ? cleanedExisting.filter(
            (item) => String(item || "").trim().toLowerCase() !== normalized
          )
        : [...cleanedExisting, category];

      return {
        ...prev,
        categories: nextCategories.length > 0 ? nextCategories : ["uncategorized"],
      };
    });
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files && files.length > 0) {
      const selectedFiles = Array.from(files);
      if (name === "pictures") {
        const invalid = selectedFiles.filter((file) => !String(file?.type || "").startsWith("image/"));
        if (invalid.length > 0) {
          setToast({ type: "error", msg: "Only image files are allowed in the image upload." });
          return;
        }
        setFormData((prev) => ({ ...prev, pictures: selectedFiles }));
        return;
      }
      if (name === "videos") {
        const invalid = selectedFiles.filter((file) => !String(file?.type || "").startsWith("video/"));
        if (invalid.length > 0) {
          setToast({ type: "error", msg: "Only video files are allowed in the video upload." });
          return;
        }
        setFormData((prev) => ({ ...prev, videos: selectedFiles }));
        return;
      }
      // fallback for other file inputs
      setFormData((prev) => ({ ...prev, [name]: selectedFiles }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setToast(null);
    setMaxRedeemTooltip("");

    const imageCount = Array.isArray(formData.pictures) ? formData.pictures.length : 0;
    const videoCount = Array.isArray(formData.videos) ? formData.videos.length : 0;
    if (imageCount + videoCount === 0) {
      setToast({ type: "error", msg: "Please upload at least one image or video before posting." });
      return;
    }

    if (!acknowledged) {
      setToast({ type: "error", msg: "Please acknowledge the posting terms before submitting." });
      return;
    }

    const token = getAuthToken();
    if (!token) {
      setToast({ type: "error", msg: "No authentication token found. Please log in." });
      return;
    }

    setLoading(true);

    try {
      let effectivePromoExpiry = hasActivePromo ? promoExpiryAt : "";
      const enteredPromoCode = formData.promoCode?.trim();

      if (enteredPromoCode) {
        const { data: redeemData } = await api.post("/promo-codes/redeem", {
          code: enteredPromoCode,
        });

        effectivePromoExpiry =
          redeemData?.data?.expiresAt ||
          redeemData?.user?.activePromoExpiry ||
          effectivePromoExpiry;

        if (effectivePromoExpiry) {
          setHasActivePromo(true);
          setPromoExpiryAt(effectivePromoExpiry);
        }
      }

      const fd = new FormData();
      const selectedCategories = Array.isArray(formData.categories)
        ? formData.categories.map((value) => String(value || "").trim()).filter(Boolean)
        : [];
      const effectiveCategories = selectedCategories.length
        ? selectedCategories
        : ["uncategorized"];
      const primaryCategory = effectiveCategories[0];
      const payload = {
        ...formData,
        categories: effectiveCategories,
        // Keep legacy category in sync so old views/queries still work.
        category: primaryCategory,
      };

      Object.entries(payload).forEach(([key, value]) => {
        if (value !== null) {
          if (key === "pictures") {
            value.forEach((file) => fd.append("pictures", file));
          } else if (key === "videos") {
            value.forEach((file) => fd.append("videos", file));
          } else if (key === "categories") {
            value.forEach((selectedCategory) => fd.append("categories", selectedCategory));
          } else if (key === "promoCode") {
            // promo code is handled by redeem endpoint and is not part of post payload
          } else {
            fd.append(key, value);
          }
        }
      });

      // Add promo status only when promo is active/redeemed.
      if (effectivePromoExpiry) {
        fd.append("isPromo", "true");
        fd.append("promoExpiresAt", effectivePromoExpiry);
      }

      console.log("[PostForm] Sending FormData:");
      for (let pair of fd.entries()) console.log(pair[0], pair[1]);

      await api.post("/posts", fd, { headers: { Authorization: `Bearer ${token}` } });

      console.log("[PostForm] Post created successfully");
      setToast({ type: "success", msg: "Post created successfully!" });
      if (onSuccess) onSuccess();

      // reset form
      const category = primaryCategory;
      setFormData({
        title: "",
        description: "",
        city: "",
        state: "",
        country: "",
        gender: "",
        categories: ["uncategorized"],
        pictures: [],
        videos: [],
        visibility: "",
        promoCode: "",
      });
      setAcknowledged(false);

      if (!embedded) {
        setTimeout(() => {
          navigate(
            category && category.toLowerCase() !== "uncategorized"
              ? `/category/${category}`
              : "/home",
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

      setToast({
        type: "error",
        msg: backendMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  // ----------------------- Render -----------------------
  return (
    <div
      className={`w-full ${
        embedded ? "bg-transparent shadow-none" : "bg-white shadow-md"
      } rounded-2xl p-4 sm:p-6 md:p-8 max-w-3xl mx-auto`}
    >
      {!embedded && (
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 text-center">
          Create New Post
        </h1>
      )}

      <div className="mb-4">
        <label className="block mb-2 font-semibold text-sm sm:text-base md:text-lg">
          Choose Categories:
        </label>
        <div className="overflow-x-auto">
          <CategoryList
            onSelect={handleCategorySelect}
            selectedCategories={formData.categories}
            multiple
          />
        </div>
        <p className="text-xs sm:text-sm text-gray-500 mt-2 text-center sm:text-center">
          Select one or more categories. If none are selected, your post is automatically
          placed in uncategorized.
        </p>
        {Array.isArray(formData.categories) && formData.categories.length > 0 && (
          <p className="text-xs sm:text-sm md:text-base text-gray-600 mt-1 text-center sm:text-center">
            Selected:{" "}
            <span className="font-medium text-gray-800">
              {formData.categories.join(", ")}
            </span>
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:gap-4 md:gap-5">
        <input
          type="text"
          name="title"
          placeholder="Title"
          value={formData.title}
          onChange={handleChange}
          required
          className="w-full border border-gray-300 p-2 sm:p-3 md:p-4 rounded-lg focus:ring-2 focus:ring-pink-400 focus:outline-none text-sm sm:text-base md:text-lg"
        />
        <textarea
          name="description"
          placeholder="What's on your mind?"
          value={formData.description}
          onChange={handleChange}
          required
          rows={4}
          className="w-full border border-gray-300 p-2 sm:p-3 md:p-4 rounded-lg focus:ring-2 focus:ring-pink-400 focus:outline-none text-sm sm:text-base md:text-lg resize-none"
        />

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            name="city"
            placeholder="City"
            value={formData.city}
            onChange={handleChange}
            className="flex-1 border border-gray-300 p-2 sm:p-3 md:p-4 rounded-lg focus:ring-2 focus:ring-pink-400 focus:outline-none text-sm sm:text-base md:text-lg"
          />
          <input
            type="text"
            name="state"
            placeholder="State"
            value={formData.state}
            onChange={handleChange}
            className="flex-1 border border-gray-300 p-2 sm:p-3 md:p-4 rounded-lg focus:ring-2 focus:ring-pink-400 focus:outline-none text-sm sm:text-base md:text-lg"
          />
        </div>

        {/* Gender selector */}
        <div>
          <p className="text-xs font-medium text-gray-500 mb-1.5">Provider gender <span className="text-gray-400">(helps clients filter)</span></p>
          <div className="flex gap-2">
            {[{ value: 'female', label: '♀ Female' }, { value: 'male', label: '♂ Male' }, { value: 'ts', label: '⚧ TS' }].map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, gender: prev.gender === value ? '' : value }))}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  formData.gender === value
                    ? 'bg-pink-600 border-pink-600 text-white'
                    : 'border-gray-300 text-gray-600 hover:border-pink-400 hover:text-pink-600'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <input
          type="text"
          name="country"
          placeholder="Country"
          value={formData.country}
          onChange={handleChange}
          className="flex-1 border border-gray-300 p-2 sm:p-3 md:p-4 rounded-lg focus:ring-2 focus:ring-pink-400 focus:outline-none text-sm sm:text-base md:text-lg"
        />

        <input
          type="text"
          name="promoCode"
          placeholder="Promo code (optional)"
          value={formData.promoCode}
          onChange={(e) => {
            handleChange(e);
            if (maxRedeemTooltip) setMaxRedeemTooltip("");
          }}
          className="w-full border border-gray-300 p-2 sm:p-3 md:p-4 rounded-lg focus:ring-2 focus:ring-pink-400 focus:outline-none text-sm sm:text-base md:text-lg"
        />

        {maxRedeemTooltip && (
          <div className="relative rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 shadow-sm">
            <span
              aria-hidden="true"
              className="absolute -top-1.5 left-6 h-3 w-3 rotate-45 border-l border-t border-amber-300 bg-amber-50"
            />
            <p className="inline-flex items-start gap-2">
              <ShieldAlert size={16} className="mt-0.5 shrink-0 text-amber-700" />
              <span>{maxRedeemTooltip}</span>
            </p>
          </div>
        )}

        {/* Image Upload */}
       
        <input
          type="file"
          name="pictures"
          accept="image/*"
          multiple
          onChange={handleChange}
          className="w-full border border-gray-300 p-2 sm:p-3 md:p-4 rounded-lg text-sm sm:text-base md:text-lg"
        />

        {/* Video Upload */}
        <input
          type="file"
          name="videos"
          accept="video/*"
          multiple
          onChange={handleChange}
          className="w-full border border-gray-300 p-2 sm:p-3 md:p-4 rounded-lg text-sm sm:text-base md:text-lg"
        />
        <div className="mt-2 text-xs text-gray-500">
          <strong>Note:</strong> There are no limits on the number or size of images/videos you can upload. However, extremely large files or many uploads may be limited by your internet connection, server, or Cloudinary plan.
        </div>
        
        <select
          name="visibility"
          value={formData.visibility}
          onChange={handleChange}
          required
          className="w-full border border-gray-300 p-2 sm:p-3 md:p-4 rounded-lg text-gray-700 focus:ring-2 focus:ring-pink-400 focus:outline-none text-sm sm:text-base md:text-lg"
        >
          <option value="" disabled>
            See's Only
          </option>
          <option value="Men">Men</option>
          <option value="Women">Women</option>
          <option value="Both">Both</option>
        </select>

        <label className="flex items-start gap-2 mt-1 text-xs sm:text-sm md:text-base text-gray-700">
          <input
            type="checkbox"
            checked={acknowledged}
            onChange={(e) => setAcknowledged(e.target.checked)}
            className="mt-1 w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-pink-500 border-gray-300 rounded focus:ring-pink-400"
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
          className={`w-full py-2 sm:py-3 md:py-4 rounded-lg text-sm sm:text-base md:text-lg font-semibold flex items-center justify-center gap-2 transition ${
            loading
              ? "bg-gray-300 text-gray-600 cursor-not-allowed"
              : "bg-gradient-to-r from-pink-500 to-yellow-400 text-white hover:opacity-90"
          }`}
        >
          {loading ? (
            <Loader2 className="animate-spin" />
          ) : (
            "Post"
          )}
        </button>

        <button
          type="button"
          onClick={() => navigate("/home")}
          className="w-full flex items-center justify-center gap-2 py-2 sm:py-3 md:py-4 mt-2 rounded-lg border border-pink-400 text-pink-600 hover:bg-pink-50 transition text-sm sm:text-base md:text-lg font-medium"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" /> Return Home
        </button>
      </form>

      {toast && (
        <div
          className={`mt-4 flex items-center gap-2 p-3 rounded-lg text-sm sm:text-base md:text-lg ${
            toast.type === "success"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {toast.type === "success" ? <CheckCircle /> : <XCircle />}{" "}
          <span>{toast.msg}</span>
        </div>
      )}
    </div>
  );
}
