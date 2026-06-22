import { useEffect, useMemo, useState } from "react";
import { Globe, Instagram, Twitter, Link as LinkIcon, Youtube, Pencil, Save, X } from "lucide-react";
import api from "@/shared/utils/api";
import { useUser } from "@/context/useUser";

const SOCIAL_FIELDS = [
  {
    key: "website",
    label: "Website",
    placeholder: "https://yourwebsite.com",
  },
  {
    key: "instagram",
    label: "Instagram",
    placeholder: "https://instagram.com/yourhandle",
  },
  {
    key: "x",
    label: "X (Twitter)",
    placeholder: "https://x.com/yourhandle",
  },
  {
    key: "onlyfans",
    label: "OnlyFans",
    placeholder: "https://onlyfans.com/yourhandle",
  },
  {
    key: "youtube",
    label: "YouTube",
    placeholder: "https://youtube.com/@yourchannel",
  },
];

const renderSocialIcon = (key, size, className) => {
  if (key === "website") return <Globe size={size} className={className} />;
  if (key === "instagram") return <Instagram size={size} className={className} />;
  if (key === "x") return <Twitter size={size} className={className} />;
  if (key === "onlyfans") return <LinkIcon size={size} className={className} />;
  if (key === "youtube") return <Youtube size={size} className={className} />;
  return <LinkIcon size={size} className={className} />;
};

const sanitizeLinks = (raw) => {
  const source = raw && typeof raw === "object" ? raw : {};
  return SOCIAL_FIELDS.reduce((acc, field) => {
    acc[field.key] = typeof source[field.key] === "string" ? source[field.key].trim() : "";
    return acc;
  }, {});
};

const normalizeUrl = (value = "") => {
  const trimmed = String(value || "").trim();
  if (!trimmed) return "";
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
};

export default function ReferencesLinks({ userId = null, user = null, editable = false }) {
  const { user: ctxUser, updateProfile } = useUser();
  const resolvedUserId = userId || user?._id || user?.id || ctxUser?._id || ctxUser?.id || null;
  const ownerId = ctxUser?._id || ctxUser?.id || null;
  const isOwner = Boolean(ownerId && resolvedUserId && String(ownerId) === String(resolvedUserId));
  const canEdit = Boolean(editable || isOwner);

  const [links, setLinks] = useState(() => sanitizeLinks(user?.socialLinks || ctxUser?.socialLinks));
  const [draft, setDraft] = useState(() => sanitizeLinks(user?.socialLinks || ctxUser?.socialLinks));
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const visibleLinks = useMemo(
    () =>
      SOCIAL_FIELDS
        .map((field) => ({ ...field, value: links[field.key] || "" }))
        .filter((field) => Boolean(field.value)),
    [links]
  );

  useEffect(() => {
    if (canEdit && isOwner) {
      const next = sanitizeLinks(user?.socialLinks || ctxUser?.socialLinks);
      setLinks(next);
      setDraft(next);
      return;
    }

    if (user?.socialLinks) {
      const next = sanitizeLinks(user.socialLinks);
      setLinks(next);
      setDraft(next);
      return;
    }

    if (!resolvedUserId) {
      const empty = sanitizeLinks({});
      setLinks(empty);
      setDraft(empty);
      return;
    }

    let cancelled = false;
    setLoading(true);
    api
      .get(`/public/users/id/${resolvedUserId}`)
      .then((res) => {
        if (cancelled) return;
        const next = sanitizeLinks(res.data?.socialLinks || {});
        setLinks(next);
        setDraft(next);
      })
      .catch((err) => {
        console.error("Failed to fetch public social links:", err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [canEdit, isOwner, user?.socialLinks, ctxUser?.socialLinks, resolvedUserId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = sanitizeLinks(draft);
      const updatedUser = await updateProfile({ socialLinks: payload });
      const next = sanitizeLinks(updatedUser?.socialLinks || payload);
      setLinks(next);
      setDraft(next);
      setIsEditing(false);
      window.dispatchEvent(
        new CustomEvent("app-toast", {
          detail: { type: "success", message: "Social links updated." },
        })
      );
    } catch (err) {
      window.dispatchEvent(
        new CustomEvent("app-toast", {
          detail: {
            type: "error",
            message: err?.message || "Failed to save social links.",
          },
        })
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setDraft(links);
    setIsEditing(false);
  };

  return (
    <section className="w-full rounded-xl border border-pink-100 bg-white p-4 sm:p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base sm:text-lg font-semibold text-gray-800">Verified Links</h2>
        {canEdit && !isEditing && (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-1 rounded-md border border-gray-300 px-3 py-1.5 text-xs sm:text-sm text-gray-700 hover:bg-gray-50"
          >
            <Pencil size={14} />
            Edit links
          </button>
        )}
      </div>

      <p className="mt-2 text-xs sm:text-sm text-gray-500">
        Check out where else your provider post !
      </p>

      {canEdit && isEditing ? (
        <div className="mt-4 space-y-3">
          {SOCIAL_FIELDS.map(({ key, label, placeholder }) => (
            <label key={key} className="block">
              <span className="mb-1 inline-flex items-center gap-2 text-xs sm:text-sm text-gray-700">
                {renderSocialIcon(key, 14, "text-pink-500")}
                {label}
              </span>
              <input
                type="text"
                value={draft[key] || ""}
                onChange={(e) =>
                  setDraft((prev) => ({
                    ...prev,
                    [key]: e.target.value,
                  }))
                }
                placeholder={placeholder}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
            </label>
          ))}

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-1 rounded-md bg-pink-600 px-3 py-1.5 text-xs sm:text-sm text-white hover:bg-pink-700 disabled:opacity-60"
            >
              <Save size={14} />
              {saving ? "Saving..." : "Save links"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={saving}
              className="inline-flex items-center gap-1 rounded-md border border-gray-300 px-3 py-1.5 text-xs sm:text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-60"
            >
              <X size={14} />
              Cancel
            </button>
          </div>
        </div>
      ) : loading ? (
        <p className="mt-4 text-sm text-gray-500">Loading links...</p>
      ) : visibleLinks.length > 0 ? (
        <ul className="mt-4 space-y-2">
          {visibleLinks.map(({ key, label, value }) => (
            <li key={key}>
              <a
                href={normalizeUrl(value)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center gap-2 rounded-md border border-gray-100 bg-gray-50 px-3 py-2 text-sm text-gray-700 hover:border-pink-200 hover:text-pink-700"
              >
                {renderSocialIcon(key, 15, "text-pink-500")}
                <span className="font-medium">{label}:</span>
                <span className="truncate">{value}</span>
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-gray-500">No social links added yet.</p>
      )}
    </section>
  );
}