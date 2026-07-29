import admin, { firebaseProjectId } from "../firebase";
import type { Request, Response, NextFunction } from "express";
import UserModel from "../models/UserModel";

/**
 * Valida el ID Token de Firebase
 * - Requiere header Authorization: Bearer <token>
 * - Decodifica y adjunta los claims en req.firebase
 */
export async function authenticateFirebase(req: Request, res: Response, next: NextFunction) {
    const auth = req.headers.authorization;
    if (!auth?.startsWith("Bearer ")) {
        console.error("Token no proporcionado:", {
            path: req.originalUrl,
            hasAuthorizationHeader: Boolean(auth),
        });
        return res.status(401).json({ message: "Token no proporcionado" });
    }

    const token = auth.split(" ")[1];

    try {
        const decoded = await admin.auth().verifyIdToken(token, true); // true => chequea revocación si la usas
        (req as any).firebase = decoded;
        next();
    } catch (err: any) {
        console.error("Token Firebase invalido:", {
            projectId: firebaseProjectId,
            error: err?.message || err,
            code: err?.code,
        });
        return res.status(401).json({ message: "Token Firebase inválido", error: err?.message || err });
    }
}

/**
 * Resuelve el usuario local usando el uid/email de Firebase
 * - Busca por firebaseUID (primario) o email (fallback)
 * - Verifica que el usuario local esté activo
 * - Vincula firebaseUID si faltaba
 * - Adjunta req.user con datos locales
 */
export async function attachLocalUser(req: Request, res: Response, next: NextFunction) {
    try {
        const firebase = (req as any).firebase as { uid?: string; email?: string } | undefined;
        if (!firebase?.uid) {
            return res.status(401).json({ message: "Firebase UID no presente en el token" });
        }

        const localUser = (await UserModel.findOneByFirebaseUID(firebase.uid)) || (firebase.email ? await UserModel.findOneByEmail(firebase.email) : undefined);

        if (!localUser) return res.status(403).json({ message: "Usuario local no encontrado" });
        if (localUser.activo !== 1) return res.status(403).json({ message: "Usuario local inactivo" });

        const profile = await UserModel.findProfileById(localUser.id!);
        (req as any).user = profile || {
            id: localUser.id,
            email: localUser.email,
            firebaseUID: localUser.firebaseUID,
            activo: localUser.activo,
            roles: [],
        };

        // Vincular firebaseUID si aún no lo tenía
        if (!localUser.firebaseUID) {
            await UserModel.updatePartial(localUser.id!, { firebaseUID: firebase.uid });
            (req as any).user.firebaseUID = firebase.uid;
        }

        next();
    } catch (err: any) {
        return res.status(500).json({ message: "Error: ", error: err?.message || err });
    }
}

export function requireRole(...allowedRoles: string[]) {
    return (req: Request, res: Response, next: NextFunction) => {
        const roles = ((req as any).user?.roles || []) as string[];
        if (!allowedRoles.some((role) => roles.includes(role))) {
            return res.status(403).json({ message: "No tienes permisos para realizar esta acción" });
        }
        return next();
    };
}
