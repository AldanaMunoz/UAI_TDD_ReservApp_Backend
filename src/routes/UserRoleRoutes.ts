import express from "express";
import UserRoleController from "../controllers/UserRoleController";
import validationMiddleware from "../middleware/ValidatorMiddleware";
import {
  createUserRoleValidationSchema,
  updateUserRoleValidationSchema,
} from "../validators/UserRoleValidation";

const UserRoleRoutes = express.Router();

/**
 * @openapi
 * /user-roles:
 *   get:
 *     summary: Listar usuarios_roles (join)
 *     tags: [UserRoles]
 *     responses:
 *       200: { description: OK }
 */
UserRoleRoutes.get("/", UserRoleController.getAllUserRoles);

/**
 * @openapi
 * /user-roles/by-user/{userId}:
 *   get:
 *     summary: Listar roles por usuario
 *     tags: [UserRoles]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: OK }
 */
UserRoleRoutes.get("/by-user/:userId", UserRoleController.getUserRolesByUserId);

/**
 * @openapi
 * /user-roles/{id}:
 *   get:
 *     summary: Obtener user-role por ID
 *     tags: [UserRoles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: OK }
 *       404: { description: Not found }
 */
UserRoleRoutes.get("/:id", UserRoleController.getUserRoleById);

/**
 * @openapi
 * /user-roles:
 *   post:
 *     summary: Asignar rol a usuario
 *     tags: [UserRoles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId, roleId]
 *             properties:
 *               userId: { type: integer }
 *               roleId: { type: integer }
 *     responses:
 *       201: { description: Created }
 *       400: { description: Validation error }
 *       409: { description: Duplicate / FK }
 */
UserRoleRoutes.post(
  "/",
  validationMiddleware(createUserRoleValidationSchema),
  UserRoleController.createUserRole
);

/**
 * @openapi
 * /user-roles/{id}:
 *   patch:
 *     summary: Actualizar asignación usuario-rol
 *     tags: [UserRoles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId: { type: integer }
 *               roleId: { type: integer }
 *     responses:
 *       200: { description: OK }
 *       400: { description: Validation error }
 *       404: { description: Not found }
 *       409: { description: Duplicate / FK }
 */
UserRoleRoutes.patch(
  "/:id",
  validationMiddleware(updateUserRoleValidationSchema),
  UserRoleController.updateUserRole
);

/**
 * @openapi
 * /user-roles/hard/by-pair/{userId}/{roleId}:
 *   delete:
 *     summary: Hard delete por par (userId + roleId)
 *     tags: [UserRoles]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: integer }
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Deleted }
 *       404: { description: Not found }
 */
UserRoleRoutes.delete(
  "/hard/by-pair/:userId/:roleId",
  UserRoleController.hardDeleteUserRoleByPair
);

/**
 * @openapi
 * /user-roles/hard/{id}:
 *   delete:
 *     summary: Hard delete por ID
 *     tags: [UserRoles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Deleted }
 *       404: { description: Not found }
 */
UserRoleRoutes.delete("/hard/:id", UserRoleController.hardDeleteUserRole);

export default UserRoleRoutes;
