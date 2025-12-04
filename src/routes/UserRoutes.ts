import express from "express";
import controllers from "../controllers/UserController";
import { authenticateFirebase, attachLocalUser } from "../middleware/AuthMiddleware";
import validationMiddleware from "../middleware/ValidatorMiddleware";
import { 
    createUserValidationSchema,
    updateUserValidationSchema, 
    softDeleteValidationSchema
} from "../validators/UserValidation";

const UserRoutes = express.Router();

/* ===========================================================
   CRUD (PROTEGIDAS CON AUTH HÍBRIDO)
   =========================================================== */

/**
 * POST /users
 * Crear usuario (requiere auth)
 */
UserRoutes.post(
    "/",
    authenticateFirebase,
    attachLocalUser,
    validationMiddleware(createUserValidationSchema),
    controllers.createUser
);

/**
 * GET /users
 * Listar todos los usuarios
 */
UserRoutes.get(
    "/",
    authenticateFirebase,
    attachLocalUser,
    controllers.getAllUsers
);

/**
 * GET /users/:id
 * Obtener usuario por ID
 */
UserRoutes.get(
    "/:id",
    authenticateFirebase,
    attachLocalUser,
    controllers.getUserById
);

/**
 * PATCH /users/:id
 * Update parcial
 */
UserRoutes.patch(
    "/:id",
    authenticateFirebase,
    attachLocalUser,
    validationMiddleware(updateUserValidationSchema),
    controllers.updateUser
);

/**
 * PATCH /users/:id/activo
 * Soft delete (toggle activo)
 */
UserRoutes.patch(
    "/:id/activo",
    authenticateFirebase,
    attachLocalUser,
    validationMiddleware(softDeleteValidationSchema),
    controllers.softDeleteUser
);

/**
 * DELETE /users/:id
 * Hard delete (eliminación física)
 */
UserRoutes.delete(
    "/:id",
    authenticateFirebase,
    attachLocalUser,
    controllers.hardDeleteUser
);

export default UserRoutes;
