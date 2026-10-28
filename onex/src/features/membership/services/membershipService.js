import api from "@/shared/utils/api";

const request = async (config) => {
  try {
    const response = await api.request(config);
    return response.data;
  } catch (error) {
    const failure = new Error(
      error?.response?.data?.error || error?.message || "Request failed."
    );
    failure.status = error?.response?.status;
    failure.data = error?.response?.data?.data;
    throw failure;
  }
};

export const fetchMembershipPlans = () =>
  request({ method: "get", url: "/membership/plans" });

export const fetchMyMembership = async () =>
  (await request({ method: "get", url: "/membership/me" })).data;

const post = async (url, data) =>
  (await request({ method: "post", url, data })).data;

export const subscribeToPlan = (tierId) => post("/membership/subscribe", { tierId });
export const upgradeToPlan = (tierId) => post("/membership/upgrade", { tierId });
export const cancelMembershipRenewal = () => post("/membership/cancel");
export const resumeMembershipRenewal = () => post("/membership/resume");
export const renewMembershipNow = () => post("/membership/renew");
