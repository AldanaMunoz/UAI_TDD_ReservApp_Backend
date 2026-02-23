import db from "../db/db";
import type { ResultSetHeader } from "mysql2";
import type { ISessionLog } from "../interfaces/SessionLogInterface";

const TABLE = "session_logs";

const SessionLogModel = {
  async find(exec: any = db): Promise<ISessionLog[]> {
    const [rows] = await exec.execute(
      `SELECT
        id,
        user_id       AS userId,
        firebase_uid  AS firebaseUID,
        session_token AS sessionToken,
        login_at      AS loginAt,
        logout_at     AS logoutAt,
        login_success AS loginSuccess,
        logout_success AS logoutSuccess,
        ip_address    AS ipAddress,
        user_agent    AS userAgent,
        auth_provider AS authProvider,
        error_message AS errorMessage
       FROM ${TABLE}
       ORDER BY login_at DESC, id DESC`
    );

    return rows as unknown as ISessionLog[];
  },

  async findById(id: number | string, exec: any = db): Promise<ISessionLog | undefined> {
    const [rows] = await exec.execute(
      `SELECT
        id,
        user_id       AS userId,
        firebase_uid  AS firebaseUID,
        session_token AS sessionToken,
        login_at      AS loginAt,
        logout_at     AS logoutAt,
        login_success AS loginSuccess,
        logout_success AS logoutSuccess,
        ip_address    AS ipAddress,
        user_agent    AS userAgent,
        auth_provider AS authProvider,
        error_message AS errorMessage
       FROM ${TABLE}
       WHERE id = :id`,
      { id: Number(id) }
    );

    const list = rows as ISessionLog[];
    return list.length ? list[0] : undefined;
  },

  async create(log: ISessionLog, exec: any = db): Promise<ISessionLog | undefined> {
    const [res] = await exec.execute(
      `INSERT INTO ${TABLE}
        (user_id, firebase_uid, session_token, login_success, ip_address, user_agent, auth_provider, error_message)
       VALUES
        (:userId, :firebaseUID, :sessionToken, :loginSuccess, :ipAddress, :userAgent, :authProvider, :errorMessage)`,
      {
        userId: log.userId,
        firebaseUID: log.firebaseUID ?? null,
        sessionToken: log.sessionToken,
        loginSuccess: log.loginSuccess ?? 1,
        ipAddress: log.ipAddress ?? null,
        userAgent: log.userAgent ?? null,
        authProvider: log.authProvider ?? "local_firebase",
        errorMessage: log.errorMessage ?? null,
      }
    );

    const insertId = (res as ResultSetHeader).insertId;
    return this.findById(insertId, exec);
  },

  async closeBySessionToken(
    sessionToken: string,
    logoutSuccess: number,
    errorMessage: string | null,
    exec: any = db
  ): Promise<boolean> {
    const [res] = await exec.execute(
      `UPDATE ${TABLE}
       SET logout_at = NOW(),
           logout_success = :logoutSuccess,
           error_message = :errorMessage
       WHERE session_token = :sessionToken
         AND logout_at IS NULL
       LIMIT 1`,
      { sessionToken, logoutSuccess, errorMessage }
    );

    return (res as ResultSetHeader).affectedRows > 0;
  },
};

export default SessionLogModel;