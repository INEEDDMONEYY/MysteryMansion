import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { UserContext } from "@/context/UserContext";
import { fetchMyMembership } from "../services/membershipService";

export const MEMBERSHIP_UPDATED_EVENT = "membership-updated";

export const NO_PERKS = Object.freeze({
  boostsPerMonth: 0,
  editForumPosts: false,
  maxPinnedThreads: 0,
  forumUploads: false,
  createForumCategories: false,
  forumBorderColor: false,
  profileBadge: false,
  betterSearchFilters: false,
});

const EMPTY = {
  loaded: false,
  isAdmin: false,
  active: false,
  tier: null,
  plan: null,
  status: null,
  autoRenew: null,
  startedAt: null,
  renewsAt: null,
  graceEndsAt: null,
  boostsUsed: 0,
  boostsRemaining: 0,
  perks: NO_PERKS,
  balance: 0,
  forumBorderColor: "",
  history: [],
};

export const MembershipContext = createContext({ membership: EMPTY, refresh: async () => {} });

/** Loads the signed-in member's plan and perks once and shares them app-wide. */
export function MembershipProvider({ children }) {
  const { user } = useContext(UserContext) || {};
  const userId = user?._id;
  const [membership, setMembership] = useState(EMPTY);

  const refresh = useCallback(async () => {
    if (!userId) {
      setMembership(EMPTY);
      return;
    }

    try {
      setMembership({ ...EMPTY, ...(await fetchMyMembership()), loaded: true });
    } catch {
      setMembership({ ...EMPTY, loaded: true });
    }
  }, [userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Other parts of the app announce purchases and boosts with this event.
  useEffect(() => {
    window.addEventListener(MEMBERSHIP_UPDATED_EVENT, refresh);
    return () => window.removeEventListener(MEMBERSHIP_UPDATED_EVENT, refresh);
  }, [refresh]);

  const value = useMemo(() => ({ membership, refresh }), [membership, refresh]);

  return <MembershipContext.Provider value={value}>{children}</MembershipContext.Provider>;
}
