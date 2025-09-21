// src/controllers/UserController.ts
import { Request, Response } from "express";
import axios from "axios";
import UserModel from "../models/UserModel";
import { IUser } from "../interfaces/UserInterface";
import admin from "../firebase"; // inicialización de Firebase Admin (admin.auth())

/* ===========================================================
   CRUD
   =========================================================== */

/** GET /users */
export async function getAllUsers(_req: Request, res: Response) {
  try {
    const users = await UserModel.find();
    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching users", error });
  }
}

/** GET /users/:id */
export async function getUserById(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const user = await UserModel.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching user", error });
  }
}

/** POST /users */
export async function createUser(req: Request, res: Response) {
  try {
    const { email, password, activo = 1, firebaseUID } = req.body as Partial<IUser>;
    if (!email || !password) {
      return res.status(400).json({ message: "email and password are required" });
    }

    // El Model hashea la password y crea el registro
    const user = await UserModel.create({
      email,
      password,
      activo: Number(activo) ? 1 : 0,
      firebaseUID,
    } as IUser);

    return res.status(201).json({ message: "User created", user });
  } catch (e: any) {
    if (e?.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "Email o firebaseUID ya existe" });
    }
    return res.status(500).json({ message: "Error creating user", error: e?.message || e });
  }
}

/** PATCH /users/:id */
export async function updateUser(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);

    // Pasamos el body tal cual; el Model filtra campos válidos y hashea password si viene
    const user = await UserModel.updatePartial(id, req.body as Partial<IUser>);

    if (!user) return res.status(404).json({ message: "User not found or no changes" });
    return res.status(200).json({ message: "User updated", user });
  } catch (e: any) {
    if (e?.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "Email o firebaseUID ya existe" });
    }
    return res.status(500).json({ message: "Error updating user", error: e?.message || e });
  }
}

/** DELETE /users/:id */
export async function hardDeleteUser(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const ok = await UserModel.hardDelete(id);
    if (!ok) return res.status(404).json({ message: "User not found" });
    return res.status(200).json({ message: "User hard deleted" });
  } catch (error) {
    return res.status(500).json({ message: "Error hard deleting user", error });
  }
}

/** PATCH /users/:id/activo  (soft delete / reactivar) */
export async function softDeleteUser(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const { activo } = req.body as { activo?: 0 | 1 };

    if (activo !== 0 && activo !== 1) {
      return res.status(400).json({ message: "activo must be 0 or 1" });
    }

    const user = await UserModel.setActivo(id, activo);
    if (!user) return res.status(404).json({ message: "User not found" });

    return res.status(200).json({ message: "User soft deleted", user });
  } catch (error) {
    return res.status(500).json({ message: "Error soft deleting user", error });
  }
}

/* ===========================================================
   AUTH: Login doble (LOCAL + FIREBASE) y Logout Firebase
   =========================================================== */

/**
 * POST /auth/login
 * Doble verificación:
 * 1) LOCAL: valida email/password contra tu DB (bcrypt en el Model).
 * 2) FIREBASE: valida credenciales contra Firebase con la API REST.
 * 3) Si el usuario local no tiene firebaseUID aún, se vincula automáticamente.
 * 4) Si hay mismatch de firebaseUID (local vs Firebase), retorna 409.
 */
export async function loginLocalFirebase(req: Request, res: Response) {
  try {
    const { email, password } = req.body as { email?: string; password?: string };
    if (!email || !password) {
      return res.status(400).json({ message: "email and password are required" });
    }

    // 1) Verificación LOCAL
    const localUser = await UserModel.findOneByEmail(email);
    if (!localUser) {
      return res.status(401).json({ message: "Invalid credentials (local)" });
    }
    if (localUser.activo !== 1) {
      return res.status(403).json({ message: "User is inactive" });
    }
    const okLocal = await UserModel.comparePassword(password, localUser.password);
    if (!okLocal) {
      return res.status(401).json({ message: "Invalid credentials (local)" });
    }

    // 2) Verificación FIREBASE (REST)
    const apiKey = process.env.FIREBASE_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ message: "FIREBASE_API_KEY is not configured" });
    }
    const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`;
    const fbResp = await axios.post(url, { email, password, returnSecureToken: true });
    const firebaseLocalId: string = fbResp.data.localId; // UID de Firebase

    // 3) Consistencia entre local y Firebase
    if (localUser.firebaseUID && localUser.firebaseUID !== firebaseLocalId) {
      return res.status(409).json({
        message: "firebaseUID mismatch between local DB and Firebase",
        details: { localFirebaseUID: localUser.firebaseUID, firebaseLocalId },
      });
    }

    // Vincular firebaseUID si aún no lo tiene (migraciones/primer login)
    if (!localUser.firebaseUID) {
      await UserModel.updatePartial(localUser.id!, { firebaseUID: firebaseLocalId });
    }

    // 4) Éxito: doble validación superada
    return res.status(200).json({
      message: "Login OK (local + firebase)",
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
    // Si falla Firebase, devolvemos el detalle de su error cuando esté presente
    const fbError = error?.response?.data;
    if (fbError) {
      return res.status(401).json({
        message: "Invalid credentials (firebase)",
        error: fbError,
      });
    }
    return res.status(500).json({ message: "Error during login", error: error?.message || error });
  }
}

/**
 * POST /auth/logout
 * Revoca los refresh tokens del usuario en Firebase (server-side).
 * Requiere `firebaseUID` en el body.
 */
export async function logoutFirebase(req: Request, res: Response) {
  try {
    const { firebaseUID } = req.body as { firebaseUID?: string };
    if (!firebaseUID) {
      return res.status(400).json({ message: "firebaseUID is required" });
    }

    await admin.auth().revokeRefreshTokens(firebaseUID);

    return res.status(200).json({ message: "User logged out successfully (firebase tokens revoked)" });
  } catch (error: any) {
    return res.status(500).json({ message: "Error while logging out", error: error?.message || error });
  }
}

/* ===========================================================
   Export agrupado (opcional)
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
