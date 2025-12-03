import { CorsOptions } from "cors";

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",").map(origin => origin.trim()) || [
  "http://localhost:3000",
  "http://localhost:3001",
  "https://soniq-lime.vercel.app",
  "https://soniq-lime.vercel.app/",
];

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, curl, etc.)
    if (!origin) {
      return callback(null, true);
    }

    // Normalize origin (remove trailing slash for comparison)
    const normalizedOrigin = origin.replace(/\/$/, "");

    // Check if origin is in allowed list
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      const normalizedAllowed = allowedOrigin.replace(/\/$/, "");
      return normalizedOrigin === normalizedAllowed;
    });

    if (isAllowed) {
      callback(null, true);
    } else {
      // Log for debugging
      console.warn(`CORS blocked origin: ${origin}. Allowed origins:`, allowedOrigins);
      callback(new Error(`Not allowed by CORS. Origin: ${origin}`));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Cookie",
    "Accept",
    "Origin",
  ],
  exposedHeaders: ["X-Total-Count"],
  maxAge: 86400, // 24 hours
};

