import express from "express";
import controllers from "../controllers/UserController";
import { authenticateFirebase, attachLocalUser } from "../middleware/AuthMiddleware";
import validationMiddleware from "../middleware/ValidatorMiddleware";
import { createUserValidationSchema, updateUserValidationSchema, softDeleteValidationSchema, loginValidationSchema } from "../validators/UserValidation";

const UserRoutes = express.Router();

/* ===========================================================
   AUTH (PÚBLICAS)
   =========================================================== */

/**
 * POST /users/login
 * Login doble (LOCAL + FIREBASE):
 * 1. Valida email/password contra tu DB local.
 * 2. Luego valida credenciales en Firebase (REST API).
 * 3. Si ambos OK → devuelve tokens y sincroniza firebaseUID.
 */
UserRoutes.post("/login", validationMiddleware(loginValidationSchema), controllers.loginLocalFirebase);

/**
 * POST /users/logout
 * Revoca tokens de Firebase (logout server-side).
 * Protegida con Firebase Auth + validación local.
 */
UserRoutes.post("/logout", authenticateFirebase, attachLocalUser, controllers.logoutFirebase);

/**
 * POST /users/register
 * Alta de usuario (LOCAL + Firebase):
 * - Crea el usuario en Firebase Auth.
 * - Luego lo registra en la base de datos local.
 */
UserRoutes.post("/register", validationMiddleware(createUserValidationSchema), controllers.createUser);

/* ===========================================================
   CRUD (PROTEGIDAS CON AUTH HÍBRIDO)
   =========================================================== */

/**
 * POST /users
 * Crear usuario (requiere token Firebase válido y usuario local activo).
 */
UserRoutes.post("/", authenticateFirebase, attachLocalUser, validationMiddleware(createUserValidationSchema), controllers.createUser);

/**
 * GET /users
 * Listar todos los usuarios (solo accesible con auth válida).
 */
UserRoutes.get("/", authenticateFirebase, attachLocalUser, controllers.getAllUsers);

/**
 * GET /users/:id
 * Obtener un usuario por ID.
 */
UserRoutes.get("/:id", authenticateFirebase, attachLocalUser, controllers.getUserById);

/**
 * PATCH /users/:id
 * Actualización parcial (PATCH).
 * - Permite modificar uno o varios campos (email, password, activo, firebaseUID).
 * - Password se hashea automáticamente en el modelo.
 */
UserRoutes.patch("/:id", authenticateFirebase, attachLocalUser, validationMiddleware(updateUserValidationSchema), controllers.updateUser);

/**
 * PATCH /users/:id/activo
 * Soft delete / toggle activo.
 * Cambia el campo `activo` entre 0 (inactivo) y 1 (activo).
 */
UserRoutes.patch("/:id/activo", authenticateFirebase, attachLocalUser, validationMiddleware(softDeleteValidationSchema), controllers.softDeleteUser);

/**
 * DELETE /users/hard/:id
 * Eliminación física del usuario (hard delete).
 * Elimina el registro definitivamente de la base de datos local.
 */
UserRoutes.delete("/hard/:id", authenticateFirebase, attachLocalUser, controllers.hardDeleteUser);

/* ===========================================================
   EXPORT
   =========================================================== */
export default UserRoutes;
