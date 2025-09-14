// API Configuration
export const API_CONFIG = {
  // External API URLs - update these to point to your external server
  EXTERNAL_API_URLS: {
    LOGIN:
      process.env.EXTERNAL_LOGIN_URL ||
      "http://localhost:8000/api/v1/auth/login",
    SIGNUP:
      process.env.EXTERNAL_SIGNUP_URL ||
      "http://localhost:8000/api/v1/auth/signup",
    GOOGLE_AUTH: process.env.EXTERNAL_GOOGLE_AUTH_URL!, // ✅ new

    CHAT:
      process.env.EXTERNAL_CHAT_URL || "http://localhost:8000/api/v1/chat/send",
    PDF_UPLOAD:
      process.env.EXTERNAL_PDF_UPLOAD_URL ||
      "http://localhost:8000/api/v1/upload-pdf/sessions",
  },

  // API endpoints
  ENDPOINTS: {
    LOGIN: "/api/login",
    SIGNUP: "/api/signup",
    CHAT: "/api/send-chat",
  },
};

// Environment variables that need to be set:
// EXTERNAL_LOGIN_URL - URL of your external login API server
// EXTERNAL_SIGNUP_URL - URL of your external signup API server
// EXTERNAL_CHAT_URL - URL of your external chat API server
