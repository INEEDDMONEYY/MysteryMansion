// To use your own hero image, either:
//   1. put the file in onex/public/forum/ and set `image` to "/forum/your-file.jpg", or
//   2. put it in onex/src/assets/forum/, import it at the top of this file, and set `image` to the import.
// Leave `image` empty to keep the default dark gradient background.

export const FORUM_PAGE_CONFIG = Object.freeze({
  allDiscussions: {
    image: "",
    imagePosition: "center",
    // 0 (no tint) to 1 (solid black); raise it if text is hard to read on your image.
    overlay: 0.6,
    eyebrow: "All Discussions",
    title: "Every conversation,",
    highlight: "all in one place.",
    description:
      "Search every discussion, filter by category, and jump into the topics the community is talking about.",
  },
  category: {
    image: "",
    imagePosition: "center",
    overlay: 0.6,
    eyebrow: "Forum Category",
  },
});

export const getForumPageConfig = (key) =>
  FORUM_PAGE_CONFIG[key] || FORUM_PAGE_CONFIG.allDiscussions;
