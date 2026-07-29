import fs from "node:fs";
import path from "node:path";
import {
  applicationDefault,
  cert,
  getApps,
  initializeApp,
  type ServiceAccount,
} from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

function initializeFirebase() {
  if (getApps().length) return;

  let projectId = process.env.FIREBASE_PROJECT_ID || "reservapp-local";
  if (process.env.FIREBASE_AUTH_EMULATOR_HOST) {
    initializeApp({ projectId });
    return;
  }

  const configuredPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  const legacyPath = path.resolve(
    "src/uai-tdp-2025-backend-firebase-adminsdk.json",
  );
  const credentialPath = configuredPath
    ? path.resolve(configuredPath)
    : legacyPath;

  if (fs.existsSync(credentialPath)) {
    const serviceAccount = JSON.parse(
      fs.readFileSync(credentialPath, "utf8"),
    ) as ServiceAccount;
    projectId =
      process.env.FIREBASE_PROJECT_ID ||
      serviceAccount.projectId ||
      (serviceAccount as ServiceAccount & { project_id?: string }).project_id ||
      projectId;
    initializeApp({ credential: cert(serviceAccount), projectId });
    return;
  }

  initializeApp({ credential: applicationDefault(), projectId });
}

initializeFirebase();

export const firebaseProjectId = getApps()[0]?.options.projectId;

const admin = { auth: getAuth };

export default admin;
