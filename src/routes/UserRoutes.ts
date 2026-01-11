import express from "express";
import controllers from "../controllers/UserController";
import validationMiddleware from "../middleware/ValidatorMiddleware";
import { 
    createUserValidationSchema,
    updateUserValidationSchema, 
    softDeleteValidationSchema
} from "../validators/UserValidation";

const UserRoutes = express.Router();

/**
 * @openapi
 * /users:
 *   get:
 *     summary: Listar todos los usuarios
 *     tags:
 *       - Users
 *     responses:
 *       200:
 *         description: Lista de usuarios
 *       500:
 *         description: Error interno al obtener usuarios
 */
UserRoutes.get(
    "/",
    controllers.getAllUsers
);

/**
 * @openapi
 * /users/{id}:
 *   get:
 *     summary: Obtener un usuario por ID
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Usuario encontrado
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error interno al obtener usuario
 */
UserRoutes.get(
    "/:id",
    controllers.getUserById
);

/**
 * @openapi
 * /users:
 *   post:
 *     summary: Crear un usuario (Firebase + DB local)
 *     description: >
 *       Crea el usuario en Firebase y luego en la base de datos local.
 *       Si falla la creación en DB, revierte el alta en Firebase.
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               activo:
 *                 type: integer
 *                 enum: [0, 1]
 *                 description: Estado del usuario (1 = activo, 0 = inactivo)
 *             required:
 *               - email
 *               - password
 *     responses:
 *       201:
 *         description: Usuario registrado en Firebase y DB local
 *       400:
 *         description: email y password son requeridos
 *       409:
 *         description: El email o firebaseUID ya existe en la DB local
 *       500:
 *         description: Error interno al registrar usuario (Firebase o DB)
 */
UserRoutes.post(
    "/",
    validationMiddleware(createUserValidationSchema),
    controllers.createUser
);

/**
 * @openapi
 * /users/{id}:
 *   patch:
 *     summary: Actualizar parcialmente un usuario
 *     description: >
 *       Actualiza campos del usuario local. Puede producir conflicto
 *       si el email o firebaseUID ya existen en otro usuario.
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               activo:
 *                 type: integer
 *                 enum: [0, 1]
 *               firebaseUID:
 *                 type: string
 *     responses:
 *       200:
 *         description: Usuario actualizado correctamente
 *       404:
 *         description: Usuario no encontrado o sin cambios
 *       409:
 *         description: Email o firebaseUID ya existe
 *       500:
 *         description: Error interno al actualizar usuario
 */
UserRoutes.patch(
    "/:id",
    validationMiddleware(updateUserValidationSchema),
    controllers.updateUser
);

/**
 * @openapi
 * /users/{id}/activo:
 *   patch:
 *     summary: Activar o desactivar un usuario (soft delete)
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               activo:
 *                 type: integer
 *                 enum: [0, 1]
 *                 description: 1 para activar, 0 para desactivar
 *             required:
 *               - activo
 *     responses:
 *       200:
 *         description: Estado del usuario actualizado (soft delete)
 *       400:
 *         description: activo debe ser 0 o 1
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error interno al actualizar estado del usuario
 */
UserRoutes.patch(
    "/:id/activo",
    validationMiddleware(softDeleteValidationSchema),
    controllers.softDeleteUser
);

/**
 * @openapi
 * /users/{id}:
 *   delete:
 *     summary: Eliminación física de un usuario (hard delete)
 *     description: >
 *       Borra el usuario en Firebase (si tiene firebaseUID)
 *       y luego lo elimina de la DB local.
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Usuario eliminado en Firebase y DB local
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error interno al eliminar usuario
 */
UserRoutes.delete(
    "/:id",
    controllers.hardDeleteUser
);

export default UserRoutes;
