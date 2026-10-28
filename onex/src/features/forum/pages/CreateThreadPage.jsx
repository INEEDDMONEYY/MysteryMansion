import { useContext, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import { UserContext } from "@/context/UserContext";
import { setSEO } from "@/shared/utils/seo";

import useForum from "../hooks/useForum";
import useMembership from "@/features/membership/hooks/useMembership";
import { MEMBERSHIP_UPDATED_EVENT } from "@/features/membership/context/MembershipContext";
import { createForumThread } from "../services/forumThreadService";
import { createForumCategory } from "../services/forumService";
import AttachmentPicker from "@/shared/components/attachments/AttachmentPicker";
import ForumBorderPicker from "../components/ForumBorderPicker";

const inputClass =
  "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 disabled:opacity-60";

export default function CreateThreadPage() {
  const { user } = useContext(UserContext) || {};
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { categories, loading: categoriesLoading, refresh: refreshCategories } = useForum();
  const { membership } = useMembership();
  const perks = membership.perks;

  const [newCategory, setNewCategory] = useState(null);
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [categoryError, setCategoryError] = useState("");

  const [categoryId, setCategoryId] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tagText, setTagText] = useState("");
  const [files, setFiles] = useState([]);
  // undefined until the member picks one; the saved choice is used meanwhile and stays for the next thread.
  const [pickedBorder, setPickedBorder] = useState(undefined);
  const borderColor = pickedBorder ?? membership.forumBorderColor ?? "";
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setSEO("Start a Discussion | Mystery Mansion Forum", "", {
      robots: "noindex, nofollow",
    });
  }, []);

  // Preselect ?category=<slug> once categories load.
  useEffect(() => {
    if (categoryId || categories.length === 0) return;

    const preset = categories.find((c) => c.slug === params.get("category"));
    if (preset) setCategoryId(preset.id);
  }, [categories, categoryId, params]);

  if (!user?._id) {
    return (
      <main className="flex min-h-[60vh] flex-col items-center justify-center bg-gray-50 px-6 text-center">
        <h1 className="text-2xl font-black text-gray-950">Sign in to start a discussion</h1>
        <p className="mt-2 text-sm text-gray-500">You need an account to post in the forum.</p>
        <Link
          to="/signin"
          className="mt-6 inline-flex min-h-11 items-center rounded-xl bg-black px-5 text-sm font-semibold text-white transition hover:bg-pink-600"
        >
          Sign in
        </Link>
      </main>
    );
  }

  const handleCreateCategory = async () => {
    setCreatingCategory(true);
    setCategoryError("");

    try {
      const created = await createForumCategory(newCategory);
      await refreshCategories();
      setCategoryId(created.id);
      setNewCategory(null);
    } catch (err) {
      setCategoryError(err instanceof Error ? err.message : "Unable to create the category.");
    } finally {
      setCreatingCategory(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!categoryId) {
      setError("Choose a category.");
      return;
    }

    setSubmitting(true);

    try {
      const thread = await createForumThread({
        title,
        content,
        categoryId,
        tags: tagText.split(",").map((t) => t.trim()).filter(Boolean),
        attachments: files,
        borderColor: perks.forumBorderColor ? borderColor : undefined,
      });

      if (perks.forumBorderColor) window.dispatchEvent(new Event(MEMBERSHIP_UPDATED_EVENT));

      navigate(`/forum/thread/${thread.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create the discussion.");
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="mx-auto max-w-3xl">
        <Link to="/forum/discussions" className="text-sm text-gray-500 transition hover:text-pink-600">
          &larr; Back to discussions
        </Link>

        <h1 className="mt-4 text-3xl font-black tracking-tight text-gray-950 sm:text-4xl">
          Start a discussion
        </h1>
        <p className="mt-2 text-sm leading-7 text-gray-600">
          Ask a question or share something useful. Please follow the{" "}
          <Link to="/community-guidelines" className="font-semibold text-pink-600 underline underline-offset-4">
            community guidelines
          </Link>
          .
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-8"
        >
          <div>
            <label htmlFor="thread-category" className="mb-2 block text-sm font-semibold text-gray-800">
              Category
            </label>
            <select
              id="thread-category"
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
              disabled={submitting || categoriesLoading}
              required
              className={inputClass}
            >
              <option value="">{categoriesLoading ? "Loading categories..." : "Select a category"}</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            {perks.createForumCategories && !newCategory && (
              <button
                type="button"
                onClick={() => setNewCategory({ name: "", description: "" })}
                className="mt-2 text-xs font-semibold text-pink-600 underline underline-offset-4"
              >
                + Create a new category
              </button>
            )}

            {newCategory && (
              <div className="mt-3 space-y-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
                <input
                  value={newCategory.name}
                  onChange={(event) => setNewCategory({ ...newCategory, name: event.target.value })}
                  maxLength={60}
                  placeholder="Category name"
                  aria-label="New category name"
                  disabled={creatingCategory}
                  className={inputClass}
                />
                <input
                  value={newCategory.description}
                  onChange={(event) => setNewCategory({ ...newCategory, description: event.target.value })}
                  maxLength={300}
                  placeholder="Short description (optional)"
                  aria-label="New category description"
                  disabled={creatingCategory}
                  className={inputClass}
                />

                {categoryError && (
                  <p role="alert" className="text-sm text-red-600">
                    {categoryError}
                  </p>
                )}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleCreateCategory}
                    disabled={creatingCategory || newCategory.name.trim().length < 3}
                    className="min-h-10 rounded-lg bg-black px-4 text-sm font-semibold text-white transition hover:bg-pink-600 disabled:opacity-50"
                  >
                    {creatingCategory ? "Creating..." : "Create category"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNewCategory(null);
                      setCategoryError("");
                    }}
                    disabled={creatingCategory}
                    className="min-h-10 rounded-lg border border-gray-200 px-4 text-sm font-semibold text-gray-600 hover:bg-white"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {!perks.createForumCategories && (
              <p className="mt-2 text-xs text-gray-500">
                Creating categories is an Elite membership perk.{" "}
                <Link to="/membership" className="font-semibold text-pink-600 underline underline-offset-4">
                  See membership
                </Link>
              </p>
            )}
          </div>

          <div>
            <label htmlFor="thread-title" className="mb-2 block text-sm font-semibold text-gray-800">
              Title
            </label>
            <input
              id="thread-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={160}
              required
              disabled={submitting}
              placeholder="What do you want to discuss?"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="thread-content" className="mb-2 block text-sm font-semibold text-gray-800">
              Details
            </label>
            <textarea
              id="thread-content"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              maxLength={10000}
              rows={10}
              required
              disabled={submitting}
              placeholder="Add context so others can respond helpfully."
              className={`${inputClass} resize-y leading-7`}
            />
            <p className="mt-1 text-right text-xs text-gray-400">{content.length}/10000</p>
          </div>

          <div>
            <label htmlFor="thread-tags" className="mb-2 block text-sm font-semibold text-gray-800">
              Tags <span className="font-normal text-gray-400">(optional, up to 5, comma separated)</span>
            </label>
            <input
              id="thread-tags"
              value={tagText}
              onChange={(event) => setTagText(event.target.value)}
              disabled={submitting}
              placeholder="advice, safety, tips"
              className={inputClass}
            />
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold text-gray-800">
              Images <span className="font-normal text-gray-400">(optional, JPG/PNG/WebP/GIF up to 5 MB)</span>
            </p>
            {perks.forumUploads ? (
              <AttachmentPicker files={files} onChange={setFiles} disabled={submitting} />
            ) : (
              <p className="text-xs text-gray-500">
                Image and GIF uploads are an Elite membership perk.{" "}
                <Link to="/membership" className="font-semibold text-pink-600 underline underline-offset-4">
                  See membership
                </Link>
              </p>
            )}
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold text-gray-800">
              Border colour <span className="font-normal text-gray-400">(optional, remembered for your next discussions)</span>
            </p>
            {perks.forumBorderColor ? (
              <ForumBorderPicker value={borderColor} onChange={setPickedBorder} disabled={submitting} />
            ) : (
              <p className="text-xs text-gray-500">
                Forum card border customization is an Elite membership perk.{" "}
                <Link to="/membership" className="font-semibold text-pink-600 underline underline-offset-4">
                  See membership
                </Link>
              </p>
            )}
          </div>

          {error && (
            <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Link
              to="/forum/discussions"
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-gray-200 px-5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="min-h-11 rounded-xl bg-black px-6 text-sm font-semibold text-white transition hover:bg-pink-600 disabled:opacity-60"
            >
              {submitting ? "Publishing..." : "Publish discussion"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
