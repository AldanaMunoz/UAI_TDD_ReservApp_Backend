import express from "express";
import RoleController from "../controllers/RoleController";
import validationMiddleware from "../middleware/ValidatorMiddleware";
import {
  createRoleValidationSchema,
  updateRoleValidationSchema,
} from "../validators/RoleValidation";

const RoleRoutes = express.Router();

/**
 * @openapi
 * /roles:
 *   get:
 *     summary: Listar roles
 *     tags: [Roles]
 *     responses:
 *       200: { description: OK }
 */
RoleRoutes.get("/", RoleController.getAllRoles);

/**
 * @openapi
 * /roles/{id}:
 *   get:
 *     summary: Obtener rol por ID
 *     tags: [Roles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: OK }
 *       404: { description: Not found }
 */
RoleRoutes.get("/:id", RoleController.getRoleById);

/**
 * @openapi
 * /roles:
 *   post:
 *     summary: Crear rol
 *     tags: [Roles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string }
 *     responses:
 *       201: { description: Created }
 *       400: { description: Validation error }
 *       409: { description: Duplicate }
 */
RoleRoutes.post(
  "/",
  validationMiddleware(createRoleValidationSchema),
  RoleController.createRole
);

/**
 * @openapi
 * /roles/{id}:
 *   patch:
 *     summary: Actualizar parcialmente rol
 *     tags: [Roles]
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
 *               name: { type: string }
 *     responses:
 *       200: { description: OK }
 *       400: { description: Validation error }
 *       404: { description: Not found }
 *       409: { description: Duplicate }
 */
RoleRoutes.patch(
  "/:id",
  validationMiddleware(updateRoleValidationSchema),
  RoleController.updateRole
);

/**
 * @openapi
 * /roles/hard/{id}:
 *   delete:
 *     summary: Hard delete de rol
 *     tags: [Roles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Deleted }
 *       404: { description: Not found }
 *       409: { description: FK conflict }
 */
RoleRoutes.delete("/hard/:id", RoleController.hardDeleteRole);

export default RoleRoutes;
