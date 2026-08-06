export const SERVICES = {
  auth: {
    name: "Auth Service",
    url: process.env.AUTH_SERVICE_URL!,
    route: "/auth",
    rewrite: "^/auth",
  },

  users: {
    name: "User Service",
    url: process.env.USER_SERVICE_URL!,
    route: "/users",
    rewrite: "^/users",
  },

  providers: {
    name: "Provider Service",
    url: process.env.PROVIDER_SERVICE_URL!,
    route: "/providers",
    rewrite: "^/providers",
  },

  catalog: {
    name: "Catalog Service",
    url: process.env.CATALOG_SERVICE_URL!,
    route: "/catalog",
    rewrite: "^/catalog",
  },

  bookings: {
    name: "Booking Service",
    url: process.env.BOOKING_SERVICE_URL!,
    route: "/bookings",
    rewrite: "^/bookings",
  },

  payments: {
    name: "Payment Service",
    url: process.env.PAYMENT_SERVICE_URL!,
    route: "/payments",
    rewrite: "^/payments",
  },

  reviews: {
    name: "Review Service",
    url: process.env.REVIEW_SERVICE_URL!,
    route: "/reviews",
    rewrite: "^/reviews",
  },

  media: {
    name: "Media Service",
    url: process.env.MEDIA_SERVICE_URL!,
    route: "/media",
    rewrite: "^/media",
  },

  notifications: {
    name: "Notification Service",
    url: process.env.NOTIFICATION_SERVICE_URL!,
    route: "/notifications",
    rewrite: "^/notifications",
  },

  chat: {
    name: "Chat Service",
    url: process.env.CHAT_SERVICE_URL!,
    route: "/chat",
    rewrite: "^/chat",
  },

  realtime: {
    name: "Realtime Service",
    url: process.env.REALTIME_SERVICE_URL!,
    route: "/realtime",
    rewrite: "^/realtime",
  },

  search: {
    name: "Search Service",
    url: process.env.SEARCH_SERVICE_URL!,
    route: "/search",
    rewrite: "^/search",
  },

  recommendations: {
    name: "Recommendation Service",
    url: process.env.RECOMMENDATION_SERVICE_URL!,
    route: "/recommendations",
    rewrite: "^/recommendations",
  },

  fraud: {
    name: "Fraud Service",
    url: process.env.FRAUD_SERVICE_URL!,
    route: "/fraud",
    rewrite: "^/fraud",
  },

  analytics: {
    name: "Analytics Service",
    url: process.env.ANALYTICS_SERVICE_URL!,
    route: "/analytics",
    rewrite: "^/analytics",
  },

  audit: {
    name: "Audit Service",
    url: process.env.AUDIT_SERVICE_URL!,
    route: "/audit",
    rewrite: "^/audit",
  },

  ai: {
    name: "AI Service",
    url: process.env.AI_SERVICE_URL!,
    route: "/ai",
    rewrite: "^/ai",
  },

  admin: {
    name: "Admin Service",
    url: process.env.ADMIN_SERVICE_URL!,
    route: "/admin",
    rewrite: "^/admin",
  },
} as const;
