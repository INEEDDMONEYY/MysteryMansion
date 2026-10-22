import calculateClientRank from "../utils/calculateClientRank";
import calculateProviderRank from "../utils/calculateProviderRank";

/**
 * Calculates an account rank from normalized criterion scores.
 *
 * This service is intentionally kept as the boundary between the
 * ranking feature and the rest of the application.
 *
 * Future backend integration can replace or extend these calculations
 * without requiring changes to the components or hook.
 */

const calculateAccountRank = ({
  role,
  criterionScores = {},
} = {}) => {
  if (role === "provider") {
    return calculateProviderRank({
      criterionScores,
    });
  }

  if (role === "client") {
    return calculateClientRank({
      criterionScores,
    });
  }

  throw new Error(`Unsupported account rank role: ${role}`);
};

export const getAccountRank = async ({
  role,
  criterionScores = {},
} = {}) => {
  if (!role) {
    throw new Error("An account role is required.");
  }

  /*
   * Current implementation:
   * Calculate the rank locally from normalized criterion scores.
   *
   * Future implementation:
   * Fetch the authoritative rank from the backend instead.
   *
   * Example future flow:
   *
   * const response = await api.get(`/account-ranking/${role}`);
   * return response.data;
   */

  return calculateAccountRank({
    role,
    criterionScores,
  });
};

export default getAccountRank;