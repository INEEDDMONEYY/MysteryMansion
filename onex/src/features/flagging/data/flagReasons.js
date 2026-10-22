import { FLAG_TARGET_TYPES } from "../utils/flagTargets";

export const FLAG_REASONS = Object.freeze({
  [FLAG_TARGET_TYPES.POST]: [
    {
      id: "spam",
      label: "Spam",
      description: "The post appears to be unwanted or repetitive content.",
    },
    {
      id: "scam",
      label: "Scam or fraud",
      description: "The post appears to involve deceptive or fraudulent activity.",
    },
    {
      id: "fake",
      label: "Fake content",
      description: "The post contains content that is false or misleading.",
    },
    {
      id: "misleading",
      label: "Misleading information",
      description: "The post contains information that appears intentionally misleading.",
    },
    {
      id: "other",
      label: "Other",
      description: "The reason for reporting this post is not listed above.",
    },
  ],

  [FLAG_TARGET_TYPES.USER]: [
    {
      id: "fake-profile",
      label: "Fake profile",
      description: "The profile appears to be impersonating someone or using false information.",
    },
    {
      id: "spam",
      label: "Spam",
      description: "The user appears to be using the platform for unwanted or repetitive activity.",
    },
    {
      id: "scam",
      label: "Scam or fraud",
      description: "The user appears to be involved in deceptive or fraudulent activity.",
    },
    {
      id: "harassment",
      label: "Harassment",
      description: "The user appears to be engaging in harassment or abusive behavior.",
    },
    {
      id: "inappropriate",
      label: "Inappropriate behavior",
      description: "The user's behavior appears to violate community standards.",
    },
    {
      id: "other",
      label: "Other",
      description: "The reason for reporting this user is not listed above.",
    },
  ],
});

export const getFlagReasons = (targetType) =>
  FLAG_REASONS[targetType] || [];

export const getFlagReasonLabel = (targetType, reasonId) =>
  getFlagReasons(targetType).find((reason) => reason.id === reasonId)?.label ||
  reasonId;