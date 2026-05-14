import admin from "firebase-admin";
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin
let firebaseAdmin: admin.app.App;

try {
  let serviceAccount: any;

  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    // If it's a JSON string in the environment variable
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } else {
    // Fallback to file for local development if env is not set
    const serviceAccountPath = path.join(__dirname, "../../vibecue-14ec6-firebase-adminsdk-fbsvc-6f95f31557.json");
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
