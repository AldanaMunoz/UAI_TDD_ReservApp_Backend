// src/controllers/UserController.ts
import type { Request, Response } from "express";
import axios from "axios";
import UserModel from "../models/UserModel";
import type { IUser } from "../interfaces/UserInterface";
import admin from "../firebase"; // inicialización de Firebase Admin (admin.auth())
import SessionLogService from "../services/SessionLogService";

/* ===========================================================
   CRUD
   =========================================================== */

/** GET /users */
export async function getAllUsers(_req: Request, res: Response) {
  try {
    const users = await UserModel.find();
    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ message: "Error al obtener usuarios", error });
  }
}

/** GET /users/:id */
export async function getUserById(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const user = await UserModel.findById(id);
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ message: "Error al obtener usuario", error });
  }
}

/** POST /users */
export async function createUser(req: Request, res: Response) {
  try {
    const { email, password, activo = 1 } = req.body as Partial<IUser>;
    if (!email || !password) {
      return res.status(400).json({ message: "email y contraseña son obligatorios" });
    }

    // 1) Crear usuario en Firebase
    const userRecord = await admin.auth().createUser({ email, password });

    try {
      // 2) Crear usuario local con el firebaseUID
      const user = await UserModel.create({
        email,
        password, // el Model hace el hash
        activo: Number(activo) ? 1 : 0,
        firebaseUID: userRecord.uid,
      } as IUser);

      // 3) OK
      return res.status(201).json({
        message: "Usuario registrado (Firebase + local)",
        firebaseUser: { uid: userRecord.uid, email: userRecord.email },
        user,
      });
    } catch (dbErr: any) {
      // 4) Rollback si falla la DB
      await admin.auth().deleteUser(userRecord.uid);
      if (dbErr?.code === "ER_DUP_ENTRY") {
        return res.status(409).json({ message: "Email o firebaseUID ya existe (DB)" });
      }
      return res.status(500).json({
        message: "Error al registrar usuario (db)",
        error: dbErr?.message || dbErr,
      });
    }
  } catch (fbErr: any) {
    return res.status(500).json({
      message: "Error al crear usuario en Firebase",
      error: fbErr?.errorInfo || fbErr?.message || fbErr,
    });
  }
}

/** PATCH /users/:id */
export async function updateUser(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const user = await UserModel.updatePartial(id, req.body as Partial<IUser>);
    if (!user) return res.status(404).json({ message: "Usuario no encontrado o sin cambios" });
    return res.status(200).json({ message: "Usuario actualizado", user });
  } catch (e: any) {
    if (e?.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "Email o firebaseUID ya existe" });
    }
    return res.status(500).json({ message: "Error al actualizar usuario", error: e?.message || e });
  }
}

/** DELETE /users/hard/:id  -> borra en Firebase + DB local */
export async function hardDeleteUser(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);

    // 1) Buscar usuario local
    const user = await UserModel.findById(id);
    if (!user) return res.status(404).json({ message: "Usuario no encontrado (local)" });

    // 2) Si tiene firebaseUID, borrar en Firebase (si no existe, continuamos)
    if (user.firebaseUID) {
      try {
        await admin.auth().deleteUser(user.firebaseUID);
      } catch (fbErr: any) {
        const code = fbErr?.errorInfo?.code || fbErr?.code;
        if (code !== "auth/user-not-found") {
          // Podés loguear este error si querés
        }
      }
    }

    // 3) Borrar localmente
    const ok = await UserModel.hardDelete(id);
    if (!ok) return res.status(404).json({ message: "Usuario no encontrado (local)" });

    return res.status(200).json({ message: "Usuario eliminado permanentemente (Firebase + local)" });
  } catch (error) {
    return res.status(500).json({ message: "Error al eliminar permanentemente usuario", error });
  }
}

/** PATCH /users/:id/activo  (soft delete / reactivar) */
export async function softDeleteUser(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const { activo } = req.body as { activo?: 0 | 1 };
    if (activo !== 0 && activo !== 1) {
      return res.status(400).json({ message: "activo debe ser 0 o 1" });
    }
    const user = await UserModel.setActivo(id, activo);
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
    return res.status(200).json({ message: "Usuario desactivado", user });
  } catch (error) {
    return res.status(500).json({ message: "Error al desactivar usuario", error });
  }
}

/* ===========================================================
   AUTH: Login doble (LOCAL + FIREBASE) y Logout Firebase (+ session_logs)
   =========================================================== */

/**
 * POST /auth/login
 * Doble verificación:
 * 1) LOCAL: valida email/password en DB.
 * 2) FIREBASE: valida con REST API y devuelve idToken/refreshToken.
 * 3) Vincula firebaseUID si faltaba.
 * 4) Registra session_logs y devuelve sessionToken.
 */
export async function loginLocalFirebase(req: Request, res: Response) {
  try {
    const { email, password } = req.body as { email?: string; password?: string };
    if (!email || !password) {
      return res.status(400).json({ message: "email y contraseña son obligatorios" });
    }

    // 1) Verificación LOCAL
    const localUser = await UserModel.findOneByEmail(email);
    if (!localUser) return res.status(401).json({ message: "Credenciales inválidas (local)" });
    if (localUser.activo !== 1) return res.status(403).json({ message: "Usuario inactivo" });

    const okLocal = await UserModel.comparePassword(password, localUser.password);
    if (!okLocal) return res.status(401).json({ message: "Credenciales inválidas (local)" });

    // 2) Verificación FIREBASE (REST)
    const apiKey = process.env.FIREBASE_API_KEY;
    if (!apiKey) return res.status(500).json({ message: "FIREBASE_API_KEY no está configurada" });

    const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`;
    const fbResp = await axios.post(url, { email, password, returnSecureToken: true });
    const firebaseLocalId: string = fbResp.data.localId; // UID de Firebase

    // 3) Consistencia entre local y Firebase
    if (localUser.firebaseUID && localUser.firebaseUID !== firebaseLocalId) {
      return res.status(409).json({
        message: "Inconsistencia de firebaseUID entre DB local y Firebase",
        details: { localFirebaseUID: localUser.firebaseUID, firebaseLocalId },
      });
    }

    // Vincular firebaseUID si aún no lo tiene
    if (!localUser.firebaseUID) {
      await UserModel.updatePartial(localUser.id!, { firebaseUID: firebaseLocalId });
    }

    // 4) Registrar sesión (session_logs)
    const sessionToken = SessionLogService.generateSessionToken();
    try {
      await SessionLogService.logLoginSuccess({
        userId: localUser.id!,
        firebaseUID: localUser.firebaseUID || firebaseLocalId,
        sessionToken,
        req,
      });
    } catch (_e) {
      // No frenamos el login si falla el log (pero podrías decidir lo contrario)
    }

    return res.status(200).json({
      message: "Inicio de sesión OK (local + firebase)",
      sessionToken, // <-- NUEVO: usarlo luego en /auth/logout
      user: {
        id: localUser.id,
        email: localUser.email,
        activo: localUser.activo,
        firebaseUID: localUser.firebaseUID || firebaseLocalId,
      },
      firebase: {
        idToken: fbResp.data.idToken,
        refreshToken: fbResp.data.refreshToken,
        expiresIn: fbResp.data.expiresIn,
        localId: fbResp.data.localId, // UID
      },
    });
  } catch (error: any) {
    const fbError = error?.response?.data;
    if (fbError) {
      return res.status(401).json({
        message: "Credenciales inválidas (firebase)",
        error: fbError,
      });
    }
    return res.status(500).json({
      message: "Error durante el inicio de sesión",
      error: error?.message || error,
    });
  }
}

/**
 * POST /auth/logout
 * Revoca los refresh tokens del usuario en Firebase (server-side).
 * Requiere `firebaseUID` y `sessionToken` en el body.
 */
export async function logoutFirebase(req: Request, res: Response) {
  try {
    const { firebaseUID, sessionToken } = req.body as {
      firebaseUID?: string;
      sessionToken?: string;
    };

    if (!firebaseUID) return res.status(400).json({ message: "firebaseUID es requerido" });
    if (!sessionToken) return res.status(400).json({ message: "sessionToken es requerido" });

    await admin.auth().revokeRefreshTokens(firebaseUID);

    try {
      await SessionLogService.logLogout({
        sessionToken,
        success: true,
        errorMessage: null,
      });
    } catch (_e) {
      // No frenamos el logout si falla el log
    }

    return res
      .status(200)
      .json({ message: "Usuario desconectado correctamente (tokens de Firebase revocados)" });
  } catch (error: any) {
    // Intentar cerrar log como fallido si se puede
    try {
      const { sessionToken } = req.body as { sessionToken?: string };
      if (sessionToken) {
        await SessionLogService.logLogout({
          sessionToken,
          success: false,
          errorMessage: error?.message || "Error revokeRefreshTokens",
        });
      }
    } catch (_e) {
      // ignore
    }

    return res.status(500).json({
      message: "Error al cerrar sesión",
      error: error?.message || error,
    });
  }
}

/* ===========================================================
   Export agrupado
   =========================================================== */
export default {
  // CRUD
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  hardDeleteUser,
  softDeleteUser,
  // AUTH
  loginLocalFirebase,
  logoutFirebase,
};