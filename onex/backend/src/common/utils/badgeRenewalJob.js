import { processBadgeRenewals } from "../../modules/promotions/promotionService.js";

const JOB_INTERVAL_MS = 60 * 60 * 1000;

/**
 * Monthly Blue Badge renewals (credit deduction) and expiry of credit-purchased badges.
 * Same setInterval pattern as promoExpiryReminderJob.js.
 */
export function startBadgeRenewalJob() {
  if (process.env.NODE_ENV === "test") {
    return () => {};
  }

  let running = false;

  const run = async () => {
    if (running) return;
    running = true;

    try {
      await processBadgeRenewals();
    } catch (err) {
      console.error("❌ Badge renewal job failed:", err);
    } finally {
      running = false;
    }
  };

  run();
  const id = setInterval(run, JOB_INTERVAL_MS);

  return () => clearInterval(id);
}
