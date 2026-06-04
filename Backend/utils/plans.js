export const PLAN_TIERS = ['free', 'basico', 'pro', 'master'];

export const PLAN_RANK = {
  free: 0,
  basico: 1,
  pro: 2,
  master: 3,
};

export const canAccessPlan = (userPlanTier, contentPlanTier) => {
  const contentRank = PLAN_RANK[contentPlanTier] ?? PLAN_RANK.free;
  if (contentRank === PLAN_RANK.free) return true;
  if (!userPlanTier) return false;
  const userRank = PLAN_RANK[userPlanTier] ?? 0;
  return userRank >= contentRank;
};
