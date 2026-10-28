import { processMembershipRenewals } from '../../modules/membership/membershipService.js';

const JOB_INTERVAL_MS = 15 * 60 * 1000;

/** Renews memberships, retries failed renewals during the grace period and expires lapsed ones. */
export function startMembershipRenewalJob() {
  if (process.env.NODE_ENV === 'test') {
    return () => {};
  }

  let running = false;

  const run = async () => {
    if (running) return;
    running = true;

    try {
      await processMembershipRenewals();
    } catch (err) {
      console.error('❌ Membership renewal job failed:', err);
    } finally {
      running = false;
    }
  };

  run();
  const id = setInterval(run, JOB_INTERVAL_MS);

  return () => clearInterval(id);
}
