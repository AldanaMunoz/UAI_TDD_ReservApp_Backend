import express from "express";
import PermissionController from "../controllers/PermissionController";
import validationMiddleware from "../middleware/ValidatorMiddleware";
import {
  createPermissionValidationSchema,
  updatePermissionValidationSchema,
} from "../validators/PermissionValidation";

const PermissionRoutes = express.Router();

/**
 * @openapi
 * /permissions:
 *   get:
 *     summary: Listar permisos
 *     tags: [Permissions]
 *     responses:
 *       200: { description: OK }
 */
PermissionRoutes.get("/", PermissionController.getAllPermissions);

/**
 * @openapi
 * /permissions/{id}:
 *   get:
 *     summary: Obtener permiso por ID
 *     tags: [Permissions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: OK }
 *       404: { description: Not found }
 */
PermissionRoutes.get("/:id", PermissionController.getPermissionById);

/**
 * @openapi
 * /permissions:
 *   post:
 *     summary: Crear permiso
 *     tags: [Permissions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, endpointPath]
 *             properties:
 *               name: { type: string }
 *               endpointPath: { type: string }
 *     responses:
 *       201: { description: Created }
 *       400: { description: Validation error }
 *       409: { description: Duplicate }
 */
PermissionRoutes.post(
  "/",
  validationMiddleware(createPermissionValidationSchema),
  PermissionController.createPermission
);

/**
 * @openapi
 * /permissions/{id}:
 *   patch:
 *     summary: Actualizar parcialmente permiso
 *     tags: [Permissions]
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
 *               endpointPath: { type: string }
 *     responses:
 *       200: { description: OK }
 *       400: { description: Validation error }
 *       404: { description: Not found }
 *       409: { description: Duplicate }
 */
PermissionRoutes.patch(
  "/:id",
  validationMiddleware(updatePermissionValidationSchema),
  PermissionController.updatePermission
);

/**
 * @openapi
 * /permissions/hard/{id}:
 *   delete:
 *     summary: Hard delete de permiso
 *     tags: [Permissions]
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
PermissionRoutes.delete("/hard/:id", PermissionController.hardDeletePermission);

export default PermissionRoutes;
