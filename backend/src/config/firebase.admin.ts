import admin from "firebase-admin";
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import envConfig from "./index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin
let firebaseAdmin: admin.app.App;

try {
  let serviceAccount: any;
  const envValue = envConfig.firebase.serviceAccount;

  if (envValue && envValue.trim().startsWith("{")) {
    // It's a JSON string
    serviceAccount = JSON.parse(envValue);
  } else {
    // It's either a filename or missing, use file fallback
    const fileName = envValue || envConfig.firebase.fallbackFile;
    const serviceAccountPath = path.join(__dirname, "../../", fileName);
    serviceAccount = JSON.parse(readFileSync(serviceAccountPath, "utf8"));
  }

  firebaseAdmin = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });

  console.log("Firebase Admin initialized successfully using " + (process.env.FIREBASE_SERVICE_ACCOUNT ? "environment variable" : "service account file"));
} catch (error) {
  console.error("Error initializing Firebase Admin:", error);
  process.exit(1);
}

export { firebaseAdmin };
