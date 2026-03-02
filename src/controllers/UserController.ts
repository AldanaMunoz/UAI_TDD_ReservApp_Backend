// src/controllers/UserController.ts
import type { Request, Response } from "express";
import axios from "axios";
import UserModel from "../models/UserModel";
import type { IUser } from "../interfaces/UserInterface";
import admin from "../firebase";
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
        password,
        activo: Number(activo) ? 1 : 0,
        firebaseUID: userRecord.uid,
      } as IUser);

      return res.status(201).json({
        message: "Usuario registrado (Firebase + local)",
        firebaseUser: { uid: userRecord.uid, email: userRecord.email },
        user,
      });
    } catch (dbErr: any) {
      // Rollback si falla la DB local
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

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado o sin cambios" });
    }

    return res.status(200).json({ message: "Usuario actualizado", user });
  } catch (e: any) {
    if (e?.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "Email o firebaseUID ya existe" });
    }

    return res.status(500).json({
      message: "Error al actualizar usuario",
      error: e?.message || e,
    });
  }
}

/** DELETE /users/hard/:id */
export async function hardDeleteUser(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);

    const user = await UserModel.findById(id);
    if (!user) return res.status(404).json({ message: "Usuario no encontrado (local)" });

    if (user.firebaseUID) {
      try {
        await admin.auth().deleteUser(user.firebaseUID);
      } catch (fbErr: any) {
        const code = fbErr?.errorInfo?.code || fbErr?.code;
        if (code !== "auth/user-not-found") {
          // opcional: loguear error
        }
      }
    }

    const ok = await UserModel.hardDelete(id);
    if (!ok) return res.status(404).json({ message: "Usuario no encontrado (local)" });

    return res.status(200).json({
      message: "Usuario eliminado permanentemente (Firebase + local)",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error al eliminar permanentemente usuario",
      error,
    });
  }
}

/** PATCH /users/:id/activo */
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
   AUTH: Login doble (LOCAL + FIREBASE) y Logout con doble validación
   =========================================================== */

/**
 * POST /auth/login
 * 1) Valida email/password en DB local
 * 2) Valida contra Firebase REST
 * 3) Vincula firebaseUID si faltaba
 * 4) Registra session_logs
 * 5) Devuelve sessionToken
 */
export async function loginLocalFirebase(req: Request, res: Response) {
  try {
    const { email, password } = req.body as { email?: string; password?: string };

    if (!email || !password) {
      return res.status(400).json({ message: "email y contraseña son obligatorios" });
    }

    // 1) Verificación LOCAL
    const localUser = await UserModel.findOneByEmail(email);
    if (!localUser) {
      return res.status(401).json({ message: "Credenciales inválidas (local)" });
    }

    if (localUser.activo !== 1) {
      return res.status(403).json({ message: "Usuario inactivo" });
    }

    const okLocal = await UserModel.comparePassword(password, localUser.password);
    if (!okLocal) {
      return res.status(401).json({ message: "Credenciales inválidas (local)" });
    }

    // 2) Verificación FIREBASE (REST)
    const apiKey = process.env.FIREBASE_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ message: "FIREBASE_API_KEY no está configurada" });
    }

    const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`;
    const fbResp = await axios.post(url, {
      email,
      password,
      returnSecureToken: true,
    });

    const firebaseLocalId: string = fbResp.data.localId;

    // 3) Consistencia entre local y Firebase
    if (localUser.firebaseUID && localUser.firebaseUID !== firebaseLocalId) {
      return res.status(409).json({
        message: "Inconsistencia de firebaseUID entre DB local y Firebase",
        details: {
          localFirebaseUID: localUser.firebaseUID,
          firebaseLocalId,
        },
      });
    }

    // Vincular firebaseUID si aún no lo tiene
    if (!localUser.firebaseUID) {
      await UserModel.updatePartial(localUser.id!, { firebaseUID: firebaseLocalId });
    }

    // 4) Registrar sesión obligatoriamente
    const sessionToken = SessionLogService.generateSessionToken();

    try {
      await SessionLogService.logLoginSuccess({
        userId: localUser.id!,
        firebaseUID: localUser.firebaseUID || firebaseLocalId,
        sessionToken,
        req,
      });
    } catch (logError: any) {
      return res.status(500).json({
        message: "Login correcto, pero falló el registro de la sesión",
        error: logError?.message || logError,
      });
    }

    return res.status(200).json({
      message: "Inicio de sesión OK (local + firebase)",
      sessionToken,
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
        localId: fbResp.data.localId,
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
 * Doble validación:
 * 1) valida que el sessionToken exista en session_logs y esté abierto
 * 2) revoca refresh tokens del firebaseUID asociado a ESA sesión
 * 3) cierra la sesión en session_logs
 *
 * Body:
 * {
 *   "sessionToken": "...",
 *   "firebaseUID": "..." // opcional, solo para validar consistencia
 * }
 */
export async function logoutFirebase(req: Request, res: Response) {
  const { sessionToken, firebaseUID } = req.body as {
    sessionToken?: string;
    firebaseUID?: string;
  };

  if (!sessionToken) {
    return res.status(400).json({ message: "sessionToken es requerido" });
  }

  try {
    // 1) Buscar sesión por token
    const session = await SessionLogService.findBySessionToken(sessionToken);

    if (!session) {
      return res.status(404).json({
        message: "sessionToken inválido o inexistente",
      });
    }

    // 2) Validar que no esté ya cerrada
    if (session.logoutAt) {
      return res.status(200).json({
        message: "La sesión ya estaba cerrada",
        sessionToken,
      });
    }

    // 3) Si viene firebaseUID en body, validar que coincida con la sesión
    if (firebaseUID && session.firebaseUID && firebaseUID !== session.firebaseUID) {
      return res.status(409).json({
        message: "firebaseUID no coincide con la sesión",
        details: {
          firebaseUIDBody: firebaseUID,
          firebaseUIDSession: session.firebaseUID,
        },
      });
    }

    const uidToRevoke = session.firebaseUID;

    if (!uidToRevoke) {
      await SessionLogService.logLogout({
        sessionToken,
        success: false,
        errorMessage: "La sesión no tiene firebaseUID asociado",
      });

      return res.status(500).json({
        message: "La sesión encontrada no tiene firebaseUID asociado",
      });
    }

    // 4) Revocar refresh tokens del UID asociado a la sesión
    await admin.auth().revokeRefreshTokens(uidToRevoke);

    // 5) Cerrar sesión en DB
    const closed = await SessionLogService.logLogout({
      sessionToken,
      success: true,
      errorMessage: null,
    });

    if (!closed) {
      return res.status(409).json({
        message: "No se pudo cerrar la sesión en session_logs",
      });
    }

    return res.status(200).json({
      message: "Usuario desconectado correctamente (Firebase + session_logs)",
      sessionToken,
    });
  } catch (error: any) {
    // Si algo falla, intentamos marcar logout fallido en DB
    try {
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
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  hardDeleteUser,
  softDeleteUser,
  loginLocalFirebase,
  logoutFirebase,
};