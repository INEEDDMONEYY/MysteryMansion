import BrandLoader from "@/shared/components/Loaders/BrandLoader";

import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { UserContext } from "@/context/UserContext";
import {
  getUserMedia,
  uploadUserMedia,
  updateUserMediaVisibility,
  deleteUserMedia,
} from "@/features/users/services/userMediaService";

import {
  Image,
  Video,
  Images,
  CloudUpload,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Play,
  RefreshCw,
  X,
  CheckCircle2,
  AlertCircle,
  Film,
  ImagePlus,
} from "lucide-react";

const normalizeMedia = (item) => {
  const mimeType = item?.mimeType || item?.mimetype || "";
  const type =
    item?.mediaType === "video" ||
    item?.type === "video" ||
    mimeType.startsWith("video/")
      ? "video"
      : "image";

  return {
    ...item,
    id: item?._id || item?.id,
    type,
    url: item?.url || item?.secureUrl || item?.fileUrl || "",
    thumbnailUrl:
      item?.thumbnailUrl || item?.thumbnail || item?.posterUrl || "",
    name:
      item?.originalName ||
      item?.filename ||
      item?.name ||
      (type === "video" ? "Uploaded video" : "Uploaded image"),
    mimeType,
    sizeBytes: item?.sizeBytes || item?.size || 0,
    createdAt: item?.createdAt || item?.uploadedAt || null,
    showOnProfile: item?.showOnProfile !== false,
  };
};

const normalizeMediaList = (response) => {
  const items = Array.isArray(response)
    ? response
    : response?.items || response?.media || response?.results || [];

  return items.map(normalizeMedia).filter((item) => item.id && item.url);
};

const formatFileSize = (bytes) => {
  if (!bytes) return "Size unavailable";

  const units = ["Bytes", "KB", "MB", "GB"];
  const index = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );

  return `${(bytes / Math.pow(1024, index)).toFixed(1)} ${units[index]}`;
};

const formatDate = (value) => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export default function UserMediaPage() {
  const { user } = useContext(UserContext);
  const fileInputRef = useRef(null);

  const userId = useMemo(
    () => user?._id || user?.id || null,
    [user],
  );

  const [media, setMedia] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busyMediaId, setBusyMediaId] = useState("");

  const loadMedia = async () => {
    try {
      setError("");
      const response = await getUserMedia();
      setMedia(normalizeMediaList(response));
    } catch (err) {
      console.error("Failed to load user media:", err);
      setError(
        err?.response?.data?.message ||
          "Unable to load your media. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userId) {
      setMedia([]);
      setLoading(false);
      return;
    }

    let active = true;

    const fetchMedia = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await getUserMedia();

        if (active) {
          setMedia(normalizeMediaList(response));
        }
      } catch (err) {
        if (active) {
          console.error("Failed to load user media:", err);
          setError(
            err?.response?.data?.message ||
              "Unable to load your media. Please try again.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchMedia();

    return () => {
      active = false;
    };
  }, [userId]);

  const imageCount = media.filter(
    (item) => item.type === "image",
  ).length;

  const videoCount = media.filter(
    (item) => item.type === "video",
  ).length;

  const visibleMedia =
    filter === "all"
      ? media
      : media.filter((item) => item.type === filter);

  const handleFileSelection = (files) => {
    setError("");
    setSuccess("");

    const acceptedFiles = [];
    const rejectedFiles = [];

    Array.from(files || []).forEach((file) => {
      if (
        file.type.startsWith("image/") ||
        file.type.startsWith("video/")
      ) {
        acceptedFiles.push(file);
      } else {
        rejectedFiles.push(file.name);
      }
    });

    if (rejectedFiles.length) {
      setError(
        `Unsupported file type: ${rejectedFiles.join(", ")}`,
      );
    }

    if (acceptedFiles.length) {
      setSelectedFiles((previous) => {
        const combined = [...previous, ...acceptedFiles];

        return combined.filter(
          (file, index, array) =>
            array.findIndex(
              (item) =>
                item.name === file.name &&
                item.size === file.size &&
                item.lastModified === file.lastModified,
            ) === index,
        );
      });
    }
  };

  const handleInputChange = (event) => {
    handleFileSelection(event.target.files);
    event.target.value = "";
  };

  const handleDrop = (event) => {
    event.preventDefault();
    handleFileSelection(event.dataTransfer.files);
  };

  const removeSelectedFile = (index) => {
    setSelectedFiles((previous) =>
      previous.filter((_, itemIndex) => itemIndex !== index),
    );
  };

  const handleUpload = async () => {
    if (!selectedFiles.length || uploading || !userId) return;

    setUploading(true);
    setError("");
    setSuccess("");

    let completed = 0;
    const failedFiles = [];

    for (const file of selectedFiles) {
      setUploadStatus(
        `Uploading ${completed + 1} of ${selectedFiles.length}: ${file.name}`,
      );

      try {
        await uploadUserMedia(file, true);
        completed += 1;
      } catch (err) {
        console.error(`Failed to upload ${file.name}:`, err);
        failedFiles.push(file.name);
      }
    }

    setSelectedFiles([]);
    setUploadStatus("");

    try {
      await loadMedia();
    } catch {
      setError("Uploads finished, but your media list could not refresh.");
    }

    if (completed > 0) {
      setSuccess(
        `${completed} ${completed === 1 ? "file was" : "files were"} uploaded successfully.`,
      );
    }

    if (failedFiles.length) {
      setError(
        `Could not upload: ${failedFiles.join(", ")}`,
      );
    }

    setUploading(false);
  };

  const handleVisibilityChange = async (item) => {
    if (!item.id || busyMediaId) return;

    const nextVisibility = !item.showOnProfile;

    setBusyMediaId(item.id);
    setError("");
    setSuccess("");

    try {
      await updateUserMediaVisibility(item.id, nextVisibility);

      setMedia((previous) =>
        previous.map((mediaItem) =>
          mediaItem.id === item.id
            ? { ...mediaItem, showOnProfile: nextVisibility }
            : mediaItem,
        ),
      );

      setSuccess(
        nextVisibility
          ? "Media is now visible on your profile."
          : "Media has been hidden from your profile.",
      );
    } catch (err) {
      console.error("Failed to update media visibility:", err);
      setError(
        err?.response?.data?.message ||
          "Unable to update media visibility.",
      );
    } finally {
      setBusyMediaId("");
    }
  };

  const handleDelete = async (item) => {
    if (!item.id || busyMediaId) return;

    const confirmed = window.confirm(
      "Are you sure you want to permanently delete this media?",
    );

    if (!confirmed) return;

    setBusyMediaId(item.id);
    setError("");
    setSuccess("");

    try {
      await deleteUserMedia(item.id);

      setMedia((previous) =>
        previous.filter((mediaItem) => mediaItem.id !== item.id),
      );

      setSuccess("Media deleted successfully.");
    } catch (err) {
      console.error("Failed to delete media:", err);
      setError(
        err?.response?.data?.message ||
          "Unable to delete this media.",
      );
    } finally {
      setBusyMediaId("");
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-7">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-pink-600">
              <Images size={18} />
              Your Library
            </div>

            <h1 className="text-3xl font-black tracking-tight text-gray-900">
              My Media
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500 sm:text-base">
              Upload and organize your images and videos. Choose which
              media appears on your profile and reuse your uploads when
              creating posts.
            </p>
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-600 to-fuchsia-600 px-5 py-3 font-semibold text-white shadow-sm transition hover:brightness-110"
          >
            <Plus size={19} />
            Upload Media
          </button>
        </header>

        <section className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">
                Total Media
              </span>
              <Images className="text-pink-600" size={21} />
            </div>
            <p className="mt-3 text-3xl font-black text-gray-900">
              {media.length}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">
                Images
              </span>
              <Image className="text-fuchsia-600" size={21} />
            </div>
            <p className="mt-3 text-3xl font-black text-gray-900">
              {imageCount}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">
                Videos
              </span>
              <Video className="text-yellow-600" size={21} />
            </div>
            <p className="mt-3 text-3xl font-black text-gray-900">
              {videoCount}
            </p>
          </div>
        </section>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          onChange={handleInputChange}
          className="hidden"
        />

        <section
          onDragOver={(event) => event.preventDefault()}
          onDrop={handleDrop}
          className="rounded-2xl border-2 border-dashed border-pink-200 bg-white px-5 py-9 text-center transition hover:border-pink-400 hover:bg-pink-50/30 sm:px-8"
        >
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-pink-50 text-pink-600">
            <CloudUpload size={28} />
          </div>

          <h2 className="mt-4 text-lg font-bold text-gray-900">
            Add images and videos
          </h2>

          <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-gray-500">
            Drag and drop your media here, or browse your device to select
            multiple files.
          </p>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="mt-5 inline-flex items-center gap-2 rounded-lg border border-pink-200 bg-white px-4 py-2.5 text-sm font-semibold text-pink-700 transition hover:bg-pink-50"
          >
            <ImagePlus size={17} />
            Browse Files
          </button>

          <p className="mt-3 text-xs text-gray-400">
            Supported categories: images and videos. Upload limits are
            enforced by the server.
          </p>
        </section>

        {selectedFiles.length > 0 && (
          <section className="rounded-2xl border border-pink-100 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-bold text-gray-900">
                  Ready to upload
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  {selectedFiles.length} selected{" "}
                  {selectedFiles.length === 1 ? "file" : "files"}
                </p>
              </div>

              <button
                type="button"
                onClick={handleUpload}
                disabled={uploading}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-pink-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-pink-700 disabled:opacity-50"
              >
                <CloudUpload size={17} />
                {uploading ? "Uploading..." : "Upload Selected"}
              </button>
            </div>

            <div className="mt-4 space-y-2">
              {selectedFiles.map((file, index) => (
                <div
                  key={`${file.name}-${file.lastModified}-${index}`}
                  className="flex items-center justify-between gap-3 rounded-lg bg-gray-50 px-3 py-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    {file.type.startsWith("video/") ? (
                      <Film size={19} className="shrink-0 text-fuchsia-600" />
                    ) : (
                      <Image size={19} className="shrink-0 text-pink-600" />
                    )}

                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-gray-800">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={uploading}
                    onClick={() => removeSelectedFile(index)}
                    className="rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                    aria-label={`Remove ${file.name}`}
                  >
                    <X size={17} />
                  </button>
                </div>
              ))}
            </div>

            {uploadStatus && (
              <p className="mt-4 text-sm font-medium text-pink-600">
                {uploadStatus}
              </p>
            )}
          </section>
        )}

        {(success || error) && (
          <div
            role="status"
            className={`flex items-start gap-3 rounded-xl border p-4 text-sm ${
              error
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-emerald-200 bg-emerald-50 text-emerald-700"
            }`}
          >
            {error ? (
              <AlertCircle size={19} className="shrink-0" />
            ) : (
              <CheckCircle2 size={19} className="shrink-0" />
            )}

            <p>{error || success}</p>
          </div>
        )}

        <section className="space-y-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-black text-gray-900">
                Your Collection
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Manage media that can appear on your public profile.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                { id: "all", label: "All Media", icon: Images },
                { id: "image", label: "Images", icon: Image },
                { id: "video", label: "Videos", icon: Video },
              ].map((item) => {
                const Icon = item.icon;
                const active = filter === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setFilter(item.id)}
                    className={`inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-sm font-semibold transition ${
                      active
                        ? "border-pink-600 bg-pink-600 text-white"
                        : "border-gray-200 bg-white text-gray-600 hover:border-pink-200 hover:text-pink-700"
                    }`}
                  >
                    <Icon size={16} />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          {loading ? (
            <BrandLoader size="sm" />
          ) : error && media.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center">
              <AlertCircle className="mx-auto text-red-500" size={30} />

              <p className="mt-3 font-semibold text-gray-800">
                Your media could not be loaded.
              </p>

              <button
                type="button"
                onClick={() => {
                  setLoading(true);
                  loadMedia();
                }}
                className="mt-4 inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                <RefreshCw size={16} />
                Try Again
              </button>
            </div>
          ) : visibleMedia.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-pink-50 text-pink-600">
                <Images size={27} />
              </div>

              <h3 className="mt-5 text-lg font-bold text-gray-900">
                {media.length === 0
                  ? "Your media library is empty."
                  : "No media in this category."}
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                {media.length === 0
                  ? "Upload images and videos to build your profile gallery and make them available for future posts."
                  : "Try another filter or upload more media."}
              </p>

              {media.length === 0 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-5 inline-flex items-center gap-2 rounded-lg bg-pink-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-pink-700"
                >
                  <Plus size={17} />
                  Upload Your First Media
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {visibleMedia.map((item) => (
                <article
                  key={item.id}
                  className="group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="relative aspect-square overflow-hidden bg-gray-100">
                    {item.type === "video" ? (
                      item.thumbnailUrl ? (
                        <div className="relative h-full w-full">
                          <img
                            src={item.thumbnailUrl}
                            alt={item.name}
                            loading="lazy"
                            className="h-full w-full object-cover"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black/60 text-white">
                              <Play size={23} fill="currentColor" />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <video
                          src={item.url}
                          muted
                          playsInline
                          preload="metadata"
                          className="h-full w-full object-cover"
                        />
                      )
                    ) : (
                      <img
                        src={item.url}
                        alt={item.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                    )}

                    <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-md bg-black/70 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                      {item.type === "video" ? (
                        <Video size={12} />
                      ) : (
                        <Image size={12} />
                      )}
                      {item.type}
                    </span>

                    {!item.showOnProfile && (
                      <span className="absolute right-2 top-2 rounded-md bg-black/70 p-1.5 text-white">
                        <EyeOff size={14} />
                      </span>
                    )}
                  </div>

                  <div className="space-y-3 p-3">
                    <div className="min-w-0">
                      <p
                        className="truncate text-xs font-semibold text-gray-800"
                        title={item.name}
                      >
                        {item.name}
                      </p>

                      <p className="mt-1 text-[11px] text-gray-400">
                        {formatFileSize(item.sizeBytes)}
                        {item.createdAt
                          ? ` · ${formatDate(item.createdAt)}`
                          : ""}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={busyMediaId === item.id}
                        onClick={() => handleVisibilityChange(item)}
                        className="inline-flex min-w-0 flex-1 items-center justify-center gap-1 rounded-lg border border-gray-200 px-2 py-2 text-xs font-semibold text-gray-600 transition hover:border-pink-200 hover:bg-pink-50 hover:text-pink-700 disabled:opacity-50"
                      >
                        {item.showOnProfile ? (
                          <>
                            <Eye size={14} />
                            On Profile
                          </>
                        ) : (
                          <>
                            <EyeOff size={14} />
                            Hidden
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        disabled={busyMediaId === item.id}
                        onClick={() => handleDelete(item)}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-gray-200 text-gray-400 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                        aria-label={`Delete ${item.name}`}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-xl border border-pink-100 bg-pink-50/60 p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <Images size={20} className="mt-0.5 shrink-0 text-pink-600" />
            <div>
              <h3 className="font-semibold text-gray-900">
                One media library, multiple uses
              </h3>
              <p className="mt-1 text-sm leading-6 text-gray-600">
                Media uploaded here can be displayed in your profile gallery
                and selected from your library when creating a post. Hiding
                an item from your profile should not automatically remove it
                from posts that already use it.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
