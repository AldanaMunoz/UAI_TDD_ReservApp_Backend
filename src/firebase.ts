import { cert, initializeApp, type ServiceAccount } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import serviceAccount from "./uai-tdp-2025-backend-firebase-adminsdk.json";

initializeApp({
  credential: cert(serviceAccount as ServiceAccount),
});

const admin = {
  auth: getAuth,
};

export default admin;
