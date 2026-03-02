import crypto from "crypto";
import type { Request } from "express";
import SessionLogModel from "../models/SessionLogModel";

function getClientIp(req: Request): string | null {
  const xf = req.headers["x-forwarded-for"];
  if (typeof xf === "string" && xf.length) {
    return xf.split(",")[0].trim();
  }

  return req.ip || null;
}

const SessionLogService = {
  generateSessionToken(): string {
    return crypto.randomBytes(32).toString("hex");
  },

  async findBySessionToken(sessionToken: string) {
    return SessionLogModel.findBySessionToken(sessionToken);
  },

  async logLoginSuccess(params: {
    userId: number;
    firebaseUID: string | null;
    sessionToken: string;
    req: Request;
  }) {
    return SessionLogModel.create({
      userId: params.userId,
      firebaseUID: params.firebaseUID,
      sessionToken: params.sessionToken,
      loginSuccess: 1,
      ipAddress: getClientIp(params.req),
      userAgent: String(params.req.headers["user-agent"] || ""),
      authProvider: "local_firebase",
      errorMessage: null,
    });
  },

  async logLogout(params: {
    sessionToken: string;
    success: boolean;
    errorMessage?: string | null;
  }) {
    return SessionLogModel.closeBySessionToken(
      params.sessionToken,
      params.success ? 1 : 0,
      params.errorMessage ?? null
    );
  },
};

export default SessionLogService;