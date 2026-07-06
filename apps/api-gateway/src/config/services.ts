export const SERVICES = {
  auth: {
    name: "Auth Service",
    url: process.env.AUTH_SERVICE_URL!,
    route: "/auth",
    rewrite: "^/api/v1/auth",
  },

  users: {
    name: "User Service",
    url: process.env.USER_SERVICE_URL!,
    route: "/users",
    rewrite: "^/api/v1/users",
  },

  providers: {
    name: "Provider Service",
    url: process.env.PROVIDER_SERVICE_URL!,
    route: "/providers",
    rewrite: "^/api/v1/providers",
  },

  catalog: {
    name: "Catalog Service",
    url: process.env.CATALOG_SERVICE_URL!,
    route: "/catalog",
    rewrite: "^/api/v1/catalog",
  },

  bookings: {
    name: "Booking Service",
    url: process.env.BOOKING_SERVICE_URL!,
    route: "/bookings",
    rewrite: "^/api/v1/bookings",
  },

  payments: {
    name: "Payment Service",
    url: process.env.PAYMENT_SERVICE_URL!,
    route: "/payments",
    rewrite: "^/api/v1/payments",
  },

  reviews: {
    name: "Review Service",
    url: process.env.REVIEW_SERVICE_URL!,
    route: "/reviews",
    rewrite: "^/api/v1/reviews",
  },

  media: {
    name: "Media Service",
    url: process.env.MEDIA_SERVICE_URL!,
    route: "/media",
    rewrite: "^/api/v1/media",
  },

  notifications: {
    name: "Notification Service",
    url: process.env.NOTIFICATION_SERVICE_URL!,
    route: "/notifications",
    rewrite: "^/api/v1/notifications",
  },

  chat: {
    name: "Chat Service",
    url: process.env.CHAT_SERVICE_URL!,
    route: "/chat",
    rewrite: "^/api/v1/chat",
  },

  realtime: {
    name: "Realtime Service",
    url: process.env.REALTIME_SERVICE_URL!,
    route: "/realtime",
    rewrite: "^/api/v1/realtime",
  },

  search: {
    name: "Search Service",
    url: process.env.SEARCH_SERVICE_URL!,
    route: "/search",
    rewrite: "^/api/v1/search",
  },

  recommendations: {
    name: "Recommendation Service",
    url: process.env.RECOMMENDATION_SERVICE_URL!,
    route: "/recommendations",
    rewrite: "^/api/v1/recommendations",
  },

  fraud: {
    name: "Fraud Service",
    url: process.env.FRAUD_SERVICE_URL!,
    route: "/fraud",
    rewrite: "^/api/v1/fraud",
  },

  analytics: {
    name: "Analytics Service",
    url: process.env.ANALYTICS_SERVICE_URL!,
    route: "/analytics",
    rewrite: "^/api/v1/analytics",
  },

  audit: {
    name: "Audit Service",
    url: process.env.AUDIT_SERVICE_URL!,
    route: "/audit",
    rewrite: "^/api/v1/audit",
  },

  ai: {
    name: "AI Service",
    url: process.env.AI_SERVICE_URL!,
    route: "/ai",
    rewrite: "^/api/v1/ai",
  },

  admin: {
    name: "Admin Service",
    url: process.env.ADMIN_SERVICE_URL!,
    route: "/admin",
    rewrite: "^/api/v1/admin",
  },
} as const;

// export const SERVICES = {
//   auth: {
//     url: process.env.AUTH_SERVICE_URL!,
//     prefix: "/api/v1/auth",
//   },

//   users: {
//     url: process.env.USER_SERVICE_URL!,
//     prefix: "/api/v1/users",
//   },

//   providers: {
//     url: process.env.PROVIDER_SERVICE_URL!,
//     prefix: "/api/v1/providers",
//   },

//   catalog: {
//     url: process.env.CATALOG_SERVICE_URL!,
//     prefix: "/api/v1/catalog",
//   },

//   bookings: {
//     url: process.env.BOOKING_SERVICE_URL!,
//     prefix: "/api/v1/bookings",
//   },

//   payments: {
//     url: process.env.PAYMENT_SERVICE_URL!,
//     prefix: "/api/v1/payments",
//   },

//   reviews: {
//     url: process.env.REVIEW_SERVICE_URL!,
//     prefix: "/api/v1/reviews",
//   },

//   media: {
//     url: process.env.MEDIA_SERVICE_URL!,
//     prefix: "/api/v1/media",
//   },

//   notifications: {
//     url: process.env.NOTIFICATION_SERVICE_URL!,
//     prefix: "/api/v1/notifications",
//   },

//   chat: {
//     url: process.env.CHAT_SERVICE_URL!,
//     prefix: "/api/v1/chat",
//   },

//   realtime: {
//     url: process.env.REALTIME_SERVICE_URL!,
//     prefix: "/api/v1/realtime",
//   },

//   search: {
//     url: process.env.SEARCH_SERVICE_URL!,
//     prefix: "/api/v1/search",
//   },

//   recommendations: {
//     url: process.env.RECOMMENDATION_SERVICE_URL!,
//     prefix: "/api/v1/recommendations",
//   },

//   fraud: {
//     url: process.env.FRAUD_SERVICE_URL!,
//     prefix: "/api/v1/fraud",
//   },

//   analytics: {
//     url: process.env.ANALYTICS_SERVICE_URL!,
//     prefix: "/api/v1/analytics",
//   },

//   audit: {
//     url: process.env.AUDIT_SERVICE_URL!,
//     prefix: "/api/v1/audit",
//   },

//   ai: {
//     url: process.env.AI_SERVICE_URL!,
//     prefix: "/api/v1/ai",
//   },

//   admin: {
//     url: process.env.ADMIN_SERVICE_URL!,
//     prefix: "/api/v1/admin",
//   },
// } as const;
