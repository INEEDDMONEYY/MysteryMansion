import api from "@/shared/utils/api";
import {
  createFlagTarget,
  isValidFlagTargetType,
} from "../utils/flagTargets";

const toError = (error, fallback) =>
  new Error(error?.response?.data?.error || error?.message || fallback);

export const submitFlag = async ({
  targetType,
  targetId,
  reason,
  details = "",
}) => {
  if (!isValidFlagTargetType(targetType)) {
    throw new Error(`Unsupported flag target type: ${targetType}`);
  }

  if (!targetId) {
    throw new Error("A target ID is required.");
  }

  if (!reason) {
    throw new Error("A flag reason is required.");
  }

  const target = createFlagTarget(targetType, targetId);

  try {
    const { data } = await api.post("/flags", {
      ...target,
      reason,
      details,
    });

    return data;
  } catch (error) {
    throw toError(error, "Something went wrong while submitting the flag.");
  }
};

export const fetchMyFlags = async () => {
  try {
    const { data } = await api.get("/flags/mine");
    return Array.isArray(data) ? data : [];
  } catch (error) {
    throw toError(error, "Failed to load your reports.");
  }
};

export const fetchReportsAgainstMe = async () => {
  try {
    const { data } = await api.get("/flags/against-me");
    return Array.isArray(data) ? data : [];
  } catch (error) {
    throw toError(error, "Failed to load reports about you.");
  }
};

export const fetchAdminFlags = async (params = {}) => {
  try {
    const { data } = await api.get("/admin/flags", { params });
    return Array.isArray(data) ? data : [];
  } catch (error) {
    throw toError(error, "Failed to load reported flags.");
  }
};

export const updateAdminFlag = async (flagId, { status, message }) => {
  try {
    const { data } = await api.patch(`/admin/flags/${flagId}`, {
      status,
      message,
    });
    return data;
  } catch (error) {
    throw toError(error, "Failed to update the flag.");
  }
};