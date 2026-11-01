
import api from "@/shared/utils/api";

const MEDIA_ENDPOINT = "/users/me/media";

export const getUserMedia = async () => {
  const response = await api.get(MEDIA_ENDPOINT);
  return response.data;
};

export const uploadUserMedia = async (file, showOnProfile = true) => {
  const formData = new FormData();

  formData.append("file", file);
  formData.append("showOnProfile", String(showOnProfile));

  const response = await api.post(MEDIA_ENDPOINT, formData);

  return response.data;
};

export const updateUserMediaVisibility = async (
  mediaId,
  showOnProfile,
) => {
  const response = await api.patch(
    `${MEDIA_ENDPOINT}/${mediaId}/visibility`,
    { showOnProfile },
  );

  return response.data;
};

export const deleteUserMedia = async (mediaId) => {
  const response = await api.delete(
    `${MEDIA_ENDPOINT}/${mediaId}`,
  );

  return response.data;
};
