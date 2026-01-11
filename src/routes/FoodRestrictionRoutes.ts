// src/routes/FoodRestrictionRoutes.ts
import express from "express";
import FoodRestrictionController from "../controllers/FoodRestrictionController";
import validationMiddleware from "../middleware/ValidatorMiddleware";
import {
  createFoodRestrictionValidationSchema,
  updateFoodRestrictionValidationSchema,
} from "../validators/FoodRestrictionValidation";

const FoodRestrictionRoutes = express.Router();

/* ===========================================================
   CRUD (PROTEGIDAS POR AUTH EN ROUTER PRINCIPAL)
   =========================================================== */

/**
 * @openapi
 * /food-restrictions:
 *   get:
 *     summary: Listar todas las restricciones de comida
 *     tags:
 *       - FoodRestrictions
 *     responses:
 *       200:
 *         description: Lista de restricciones
 */
FoodRestrictionRoutes.get(
  "/",
  FoodRestrictionController.getAllFoodRestrictions
);

/**
 * @openapi
 * /food-restrictions/{id}:
 *   get:
 *     summary: Obtener una restricción por ID
 *     tags:
 *       - FoodRestrictions
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Restricción encontrada
 *       404:
 *         description: Restricción no encontrada
 */
FoodRestrictionRoutes.get(
  "/:id",
  FoodRestrictionController.getFoodRestrictionById
);

/**
 * @openapi
 * /food-restrictions:
 *   post:
 *     summary: Crear una nueva restricción
 *     tags:
 *       - FoodRestrictions
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nombre de la restricción (único)
 *               description:
 *                 type: string
 *                 nullable: true
 *             required:
 *               - name
 *     responses:
 *       201:
 *         description: Restricción creada correctamente
 *       400:
 *         description: Error de validación
 *       409:
 *         description: Conflicto (nombre duplicado)
 */
FoodRestrictionRoutes.post(
  "/",
  validationMiddleware(createFoodRestrictionValidationSchema),
  FoodRestrictionController.createFoodRestriction
);

/**
 * @openapi
 * /food-restrictions/{id}:
 *   patch:
 *     summary: Actualizar parcialmente una restricción
 *     tags:
 *       - FoodRestrictions
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
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Restricción actualizada correctamente
 *       400:
 *         description: Error de validación
 *       404:
 *         description: Restricción no encontrada
 *       409:
 *         description: Conflicto (nombre duplicado)
 */
FoodRestrictionRoutes.patch(
  "/:id",
  validationMiddleware(updateFoodRestrictionValidationSchema),
  FoodRestrictionController.updateFoodRestriction
);

/**
 * @openapi
 * /food-restrictions/hard/{id}:
 *   delete:
 *     summary: Eliminación física de una restricción (hard delete)
 *     tags:
 *       - FoodRestrictions
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Restricción eliminada
 *       404:
 *         description: Restricción no encontrada
 *       409:
 *         description: Conflicto por FK (si está en uso)
 */
FoodRestrictionRoutes.delete(
  "/hard/:id",
  FoodRestrictionController.hardDeleteFoodRestriction
);

export default FoodRestrictionRoutes;
