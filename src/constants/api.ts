import { API_CONFIG as ENV_API_CONFIG } from "../config/environment";

// API Configuration (imported from environment)
export const API_CONFIG = ENV_API_CONFIG;

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  GENERATE_OTP: "/generate_otp/",
  VERIFY_OTP: "/verify_otp/",
  GENERATE_OTP_EMAIL: "/generate_otp_using_email/",
  REGISTER: "/register/",
  LOGIN: "/login/",
  SUPERUSER_LOGIN: "/superuser_login_api/",
  FORGOT_PASSWORD: "/forgot_password_api/",
  RESET_PASSWORD: "/reset_password_api/",

  // User Profile
  GET_USER_PROFILE: "/get_user_profile/",
  UPDATE_USER_PROFILE: "/update_user_profile/",
  GET_SIGNAL_PROVIDER_PROFILE: "/get_signal_provider_profile/",
  UPDATE_SIGNAL_PROVIDER_PROFILE: "/update_signal_provider_profile/",

  // Assets
  CREATE_ASSET: "/create_asset/",
  GET_ASSET: "/list_asset_api/",
  UPDATE_ASSET: "/udpate_asset/", // Note: keeping the typo as it exists in the API

  // Follow System
  FOLLOW_REQUEST: "/follow_request_api/",
  UNFOLLOW: "/unfollow_api/",
  USER_FOLLOWING: "/user_following_api/",
  USER_BLOCKED_AGENT: "/block_user_api/",
  USER_REPORT_SIGNAL_PROVIDER: "/user_and_signal_provider_report_api/",
  SIGNAL_PROVIDER_REPORT_USER: "/report_signal_provider_user_report_api_view/",
  SIGNAL_PROVIDER_FOLLOWERS: "/signal_provider_followers/",
  SIGNAL_PROVIDER_LIST_SEARCH: "/get_all_signal_providers_api/",
  AGENT_BLOCKED_USERS: "/get_blocked_users_api/",
  USER_LIST_SEARCH: "/get_all_users_api/",
  REPORT_SIGNAL_PROVIDER_POST: "/report_signal_provider_post_api/",

  // Signal Posts
  CREATE_SIGNAL_POST: "/create_signal_provider_post_api/",
  GET_ALL_SIGNAL_POSTS: "/get_signal_provider_post_api/",
  ASSET_BASED_SIGNAL_POSTS: "/asset_based_signal_provider_post_api/",
  GET_SIGNAL_OWN_POSTS: "/signal_provider_post_list_api/",

  // Likes and Comments
  LIKE_POST: "/like_post/",
  DISLIKE_POST: "/dislike_post/",
  GET_LIKES: "/get_like/",
  COMMENT_POST: "/comment_signal_provider_post/",
  GET_COMMENTS: "/get_comment_signal_provider_post/",
  LIKE_COMMENT: "/create_like_comment_api/",
  GET_COMMENT_LIKES: "/get_like_comment_api/",
  GET_MAIN_COMMENT: "/get_signal_provider_post_list_api/",
  GET_REPLY_COMMENT_MESSAGE: "/comment_reply_api/",
  DELETE_COMMENT: "/delete_comment_api/",

  // Subscription Plans
  GET_PLAN_TYPES: "/get_plan_type/",
  GET_SUBSCRIPTION_PLANS: "/get_subscription_plan/",
  GET_SUBSCRIPTION_PLAN_DETAIL: "/detail_subscription_plan_api/",
  CREATE_SUBSCRIPTION_PAYMENT: "/payment_create_api/",
  GET_USER_SUBSCRIPTION: "/user_subscriptions/",
  CREATE_SUBSCRIPTION_API: "/create_subscription_api/",
  CANCEL_SUBSCRIPTION: "/cancel_subscription_api/",

  // Analytics
  SIGNAL_SUCCESS_RATE: "/signal_success_rate_api/",
  MONTHLY_PROFIT_ANALYSIS: "/monthly_profit_analysis_api/",

  // Notifications
  NOTIFICATIONS: "/notification_api/",
  NOTIFICATION_COUNT: "/count_notification_api/",
};

// User Types
export const USER_TYPES = {
  USER: "USER",
  SIGNAL_PROVIDER: "SIGNAL_PROVIDER",
} as const;

// Signal Types
export const SIGNAL_TYPES = {
  SCALPING: "Scalping",
  SWING: "Swing",
  DAY_TRADING: "Day Trading",
} as const;

// Direction Types
export const DIRECTION_TYPES = {
  BUY: "BUY",
  SELL: "SELL",
} as const;

// Gender Types
export const GENDER_TYPES = {
  MALE: "Male",
  FEMALE: "Female",
  OTHERS: "Others",
} as const;

export type UserType = (typeof USER_TYPES)[keyof typeof USER_TYPES];
export type SignalType = (typeof SIGNAL_TYPES)[keyof typeof SIGNAL_TYPES];
export type DirectionType =
  (typeof DIRECTION_TYPES)[keyof typeof DIRECTION_TYPES];
export type GenderType = (typeof GENDER_TYPES)[keyof typeof GENDER_TYPES];
