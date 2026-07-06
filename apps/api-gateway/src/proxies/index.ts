import dotenv from "dotenv";

dotenv.config();

export const config = {
  env: process.env.NODE_ENV || "development",

  port: Number(process.env.PORT) || 4000,

  services: {
    auth: process.env.AUTH_SERVICE_URL!,
    user: process.env.USER_SERVICE_URL!,
    provider: process.env.PROVIDER_SERVICE_URL!,
    catalog: process.env.CATALOG_SERVICE_URL!,
    booking: process.env.BOOKING_SERVICE_URL!,
    payment: process.env.PAYMENT_SERVICE_URL!,
    review: process.env.REVIEW_SERVICE_URL!,
    media: process.env.MEDIA_SERVICE_URL!,
    notification: process.env.NOTIFICATION_SERVICE_URL!,
    chat: process.env.CHAT_SERVICE_URL!,
    realtime: process.env.REALTIME_SERVICE_URL!,
    search: process.env.SEARCH_SERVICE_URL!,
    recommendation: process.env.RECOMMENDATION_SERVICE_URL!,
    fraud: process.env.FRAUD_SERVICE_URL!,
    analytics: process.env.ANALYTICS_SERVICE_URL!,
    audit: process.env.AUDIT_SERVICE_URL!,
    ai: process.env.AI_SERVICE_URL!,
    admin: process.env.ADMIN_SERVICE_URL!,
  },
} as const;

// import dotenv from "dotenv";

// dotenv.config();

// export const config = {
//   env: process.env.NODE_ENV || "development",

//   port: Number(process.env.PORT) || 4000,

//   services: {
//     auth: process.env.AUTH_SERVICE_URL!,
//     user: process.env.USER_SERVICE_URL!,
//     provider: process.env.PROVIDER_SERVICE_URL!,
//     booking: process.env.BOOKING_SERVICE_URL!,
//     payment: process.env.PAYMENT_SERVICE_URL!,
//   },
// };
