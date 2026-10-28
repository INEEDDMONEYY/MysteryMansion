import { useContext } from "react";

import { MembershipContext } from "../context/MembershipContext";

/** { membership, refresh } — membership.perks is always safe to read, even when signed out. */
export default function useMembership() {
  return useContext(MembershipContext);
}
