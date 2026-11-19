export const PREMIUM_PRICE_CENTS = 999;
export const FREE_PLAN_ACTIVE_LIMIT = 3;

// Premium only counts while it has not expired
export function isPremiumUser(user) {
  if (!user || user.subscriptionPlan !== "premium") return false;
  if (!user.subscriptionExpiresAt) return true;
  return new Date(user.subscriptionExpiresAt) > new Date();
}