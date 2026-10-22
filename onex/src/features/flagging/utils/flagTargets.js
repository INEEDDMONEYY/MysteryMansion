export const FLAG_TARGET_TYPES = Object.freeze({
  POST: "post",
  USER: "user",
});

export const isValidFlagTargetType = (targetType) =>
  Object.values(FLAG_TARGET_TYPES).includes(targetType);

export const createFlagTarget = (targetType, targetId) => {
  if (!isValidFlagTargetType(targetType)) {
    throw new Error(`Unsupported flag target type: ${targetType}`);
  }

  if (!targetId) {
    throw new Error("A target ID is required to create a flag target.");
  }

  return {
    targetType,
    targetId,
  };
};