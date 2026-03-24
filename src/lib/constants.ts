export const APP_NAME = "Fairway For Good";

export const SUBSCRIPTION_CONFIG = {
  monthlyPrice: 49,
  yearlyPrice: 499,
  minimumCharityPercent: 10,
  defaultCharityPercent: 12,
  prizePoolPercent: 0.5,
} as const;

export const DRAW_CONFIG = {
  scoreMin: 1,
  scoreMax: 45,
  requiredScoreCount: 5,
  drawNumbersCount: 5,
  tierSplit: {
    five: 0.4,
    four: 0.35,
    three: 0.25,
  },
} as const;

export const ROUTES = {
  home: "/",
  login: "/login",
  register: "/register",
  dashboard: "/dashboard",
  dashboardScores: "/dashboard/scores",
  dashboardCharity: "/dashboard/charity",
  dashboardSubscription: "/dashboard/subscription",
  dashboardWinnings: "/dashboard/winnings",
  admin: "/admin",
  adminDraws: "/admin/draws",
  adminCharities: "/admin/charities",
  adminUsers: "/admin/users",
  adminWinners: "/admin/winners",
} as const;

export const SESSION_COOKIE = "dh_session";
