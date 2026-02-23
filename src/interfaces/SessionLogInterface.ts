export interface ISessionLog {
  id?: number;

  userId: number;              // user_id
  firebaseUID?: string | null; // firebase_uid

  sessionToken: string;        // session_token (hex)
  loginAt?: string | Date;     // login_at
  logoutAt?: string | Date | null; // logout_at

  loginSuccess?: number;       // login_success
  logoutSuccess?: number | null; // logout_success

  ipAddress?: string | null;   // ip_address
  userAgent?: string | null;   // user_agent

  authProvider?: "local_firebase";
  errorMessage?: string | null; // error_message
}