import type { Request, Response } from "express";
import axios from "axios";
import UserModel from "../models/UserModel";
import SessionLogService from "../services/SessionLogService";

export async function loginLocalFirebase(req: Request, res: Response) {
  // { Nodo 1: Inicio y preparación de datos }
  try {
    const { email, password } = req.body as {
      email?: string;
      password?: string;
    };

    // { Nodo 2: Primera parte del OR }
    if (
      !email ||
      // { Nodo 3: Segunda parte del OR }
      !password
    ) {
      // { Nodo 4: Return temprano }
      return res
        .status(400)
        .json({ message: "email y contraseña son obligatorios" });
    }

    // { Nodo 5: Lógica secuencial hasta el próximo if }
    // 1) Verificación LOCAL
    const localUser = await UserModel.findOneByEmail(email);

    // { Nodo 6: Decisión }
    if (!localUser) {
      // { Nodo 7: Return temprano }
      return res
        .status(401)
        .json({ message: "Credenciales inválidas (local)" });
    }

    // { Nodo 8: Decisión }
    if (localUser.activo !== 1) {
      // { Nodo 9: Return temprano }
      return res.status(403).json({ message: "Usuario inactivo" });
    }

    // { Nodo 10: Decisión (incluye la ejecución de comparePassword) }
    const okLocal = await UserModel.comparePassword(
      password,
      localUser.password,
    );
    if (!okLocal) {
      // { Nodo 11: Return temprano }
      return res
        .status(401)
        .json({ message: "Credenciales inválidas (local)" });
    }

    // { Nodo 12: Decisión (incluye asignación de apiKey) }
    // 2) Verificación FIREBASE (REST)
    const apiKey = process.env.FIREBASE_API_KEY;
    if (!apiKey) {
      // { Nodo 13: Return temprano }
      return res
        .status(500)
        .json({ message: "FIREBASE_API_KEY no está configurada" });
    }

    // { Nodo 14: Lógica secuencial y petición externa que puede fallar }
    const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`;
    const fbResp = await axios.post(url, {
      email,
      password,
      returnSecureToken: true,
    });
    const firebaseLocalId: string = fbResp.data.localId;

    // { Nodo 15: Primera parte del AND }
    // 3) Consistencia entre local y Firebase
    if (
      localUser.firebaseUID &&
      // { Nodo 16: Segunda parte del AND }
      localUser.firebaseUID !== firebaseLocalId
    ) {
      // { Nodo 17: Return temprano }
      return res.status(409).json({
        message: "Inconsistencia de firebaseUID entre DB local y Firebase",
        details: { localFirebaseUID: localUser.firebaseUID, firebaseLocalId },
      });
    }

    // { Nodo 18: Decisión }
    // Vincular firebaseUID si aún no lo tiene
    if (!localUser.firebaseUID) {
      // { Nodo 19: Acción condicional }
      await UserModel.updatePartial(localUser.id!, {
        firebaseUID: firebaseLocalId,
      });
    }

    // { Nodo 20: Preparación e intento de registro (Try interno) }
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
      // { Nodo 22: Catch interno (falla la sesión) } // Nota: El 21 es el éxito final
      return res.status(500).json({
        message: "Login correcto, pero falló el registro de la sesión",
        error: logError?.message || logError,
      });
    }

    // { Nodo 21: Éxito total de la función }
    return res.status(200).json({
      message: "Inicio de sesión OK (local + firebase)",
      sessionToken,
      user: {
        /* ... */
      },
      firebase: {
        /* ... */
      },
    });
  } catch (error: any) {
    // { Nodo 23: Catch principal (falla Axios o algo superior) }
    const fbError = error?.response?.data;

    // { Nodo 24: Decisión dentro del catch }
    if (fbError) {
      // { Nodo 25: Return de error de Firebase }
      return res.status(401).json({
        message: "Credenciales inválidas (firebase)",
        error: fbError,
      });
    }

    // { Nodo 26: Return de error general }
    return res.status(500).json({
      message: "Error durante el inicio de sesión",
      error: error?.message || error,
    });
  }
  // { Nodo 27: Fin de la función (Salida implícita donde convergen todos los returns) }
}
