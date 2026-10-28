import api from "@/shared/utils/api";

const get = async (userId, tab, params) => {
  try {
    const response = await api.get(
      `/public/users/id/${encodeURIComponent(userId)}/${tab}`,
      { params }
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error?.response?.data?.error || error?.message || "Request failed."
    );
  }
};

// Each fetcher takes { userId, ...paging } so usePagedProfileData can key on the params.
export const fetchProfileForumActivity = ({ userId, ...params }) =>
  get(userId, "forum-activity", params);

export const fetchProfileLibrary = ({ userId, ...params }) =>
  get(userId, "library", params);

export const fetchProfileReviews = ({ userId, ...params }) =>
  get(userId, "reviews", params);

export const fetchProfileComments = ({ userId, ...params }) =>
  get(userId, "comments", params);
