import express from "express";
import RolePermissionController from "../controllers/RolePermissionController";
import validationMiddleware from "../middleware/ValidatorMiddleware";
import {
  createRolePermissionValidationSchema,
  updateRolePermissionValidationSchema,
} from "../validators/RolePermissionValidation";

const RolePermissionRoutes = express.Router();

/**
 * @openapi
 * /role-permissions:
 *   get:
 *     summary: Listar roles_permisos (join)
 *     tags: [RolePermissions]
 *     responses:
 *       200: { description: OK }
 */
RolePermissionRoutes.get("/", RolePermissionController.getAllRolePermissions);

/**
 * @openapi
 * /role-permissions/by-role/{roleId}:
 *   get:
 *     summary: Listar permisos por rol
 *     tags: [RolePermissions]
 *     parameters:
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: OK }
 */
RolePermissionRoutes.get(
  "/by-role/:roleId",
  RolePermissionController.getRolePermissionsByRoleId
);

/**
 * @openapi
 * /role-permissions/{id}:
 *   get:
 *     summary: Obtener role-permission por ID
 *     tags: [RolePermissions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: OK }
 *       404: { description: Not found }
 */
RolePermissionRoutes.get(
  "/:id",
  RolePermissionController.getRolePermissionById
);

/**
 * @openapi
 * /role-permissions:
 *   post:
 *     summary: Asignar permiso a rol
 *     tags: [RolePermissions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [roleId, permissionId]
 *             properties:
 *               roleId: { type: integer }
 *               permissionId: { type: integer }
 *     responses:
 *       201: { description: Created }
 *       400: { description: Validation error }
 *       409: { description: Duplicate / FK }
 */
RolePermissionRoutes.post(
  "/",
  validationMiddleware(createRolePermissionValidationSchema),
  RolePermissionController.createRolePermission
);

/**
 * @openapi
 * /role-permissions/{id}:
 *   patch:
 *     summary: Actualizar asignación rol-permiso
 *     tags: [RolePermissions]
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
 *               roleId: { type: integer }
 *               permissionId: { type: integer }
 *     responses:
 *       200: { description: OK }
 *       400: { description: Validation error }
 *       404: { description: Not found }
 *       409: { description: Duplicate / FK }
 */
RolePermissionRoutes.patch(
  "/:id",
  validationMiddleware(updateRolePermissionValidationSchema),
  RolePermissionController.updateRolePermission
);

/**
 * @openapi
 * /role-permissions/hard/by-pair/{roleId}/{permissionId}:
 *   delete:
 *     summary: Hard delete por par (roleId + permissionId)
 *     tags: [RolePermissions]
 *     parameters:
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema: { type: integer }
 *       - in: path
 *         name: permissionId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Deleted }
 *       404: { description: Not found }
 */
RolePermissionRoutes.delete(
  "/hard/by-pair/:roleId/:permissionId",
  RolePermissionController.hardDeleteRolePermissionByPair
);

/**
 * @openapi
 * /role-permissions/hard/{id}:
 *   delete:
 *     summary: Hard delete por ID
 *     tags: [RolePermissions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Deleted }
 *       404: { description: Not found }
 */
RolePermissionRoutes.delete(
  "/hard/:id",
  RolePermissionController.hardDeleteRolePermission
);

export default RolePermissionRoutes;
