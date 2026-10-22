import getAccountRank from "../../../../account-ranking/services/accountRankService";
import { normalizeAdminRank } from "../utils/adminRankUtils";

/**
 * Admin ranking service.
 *
 * This is the administrative boundary for account-ranking data.
 *
 * The current implementation consumes the same local ranking
 * calculation used by the public feature.
 *
 * Future backend integration should move authoritative ranking
 * retrieval into this service without requiring changes to the
 * admin components or hook.
 */

export const getAdminAccountRank = async ({
  role,
  criterionScores = {},
} = {}) => {
  if (!role) {
    throw new Error("An account role is required.");
  }

  const rank = await getAccountRank({
    role,
    criterionScores,
  });

  return normalizeAdminRank(rank);
};

export const getAdminRankHistory = async ({
  accountId,
} = {}) => {
  if (!accountId) {
    throw new Error("An account ID is required.");
  }

  /*
   * Future backend integration:
   *
   * const response = await api.get(
   *   `/admin/account-ranking/${accountId}/history`
   * );
   *
   * return response.data;
   *
   * No endpoint is assumed yet because the backend contract
   * has not been established.
   */

  return [];
};

export default getAdminAccountRank;