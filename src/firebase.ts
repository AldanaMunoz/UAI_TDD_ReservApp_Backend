import admin from "firebase-admin";
import serviceAccount from "./uai-tdp-2025-backend-firebase-adminsdk.json";

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    });

export default admin;