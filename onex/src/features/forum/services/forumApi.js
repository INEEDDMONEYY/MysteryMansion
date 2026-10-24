import api from "@/shared/utils/api";

/** Plain object, or multipart FormData when image files are attached (field name "images"). */
export const toRequestData = (fields, files = []) => {
  if (!files.length) return fields;

  const form = new FormData();

  Object.entries(fields).forEach(([key, value]) => {
    if (value === null || value === undefined) return;
    form.append(key, Array.isArray(value) ? JSON.stringify(value) : value);
  });
  files.forEach((file) => form.append("images", file));

  return form;
};

/** Runs an API call and rethrows failures as Error(message) using the server's error text. */
export const forumRequest = async (config) => {
  try {
    const response = await api.request(config);
    return response.data;
  } catch (error) {
    throw new Error(
      error?.response?.data?.error ||
        error?.message ||
        "Request failed."
    );
  }
};
