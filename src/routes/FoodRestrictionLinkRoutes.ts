// src/routes/FoodRestrictionLinkRoutes.ts
import express from "express";
import FoodRestrictionLinkController from "../controllers/FoodRestrictionLinkController";
import validationMiddleware from "../middleware/ValidatorMiddleware";
import {
  createFoodRestrictionLinkValidationSchema,
  updateFoodRestrictionLinkValidationSchema,
} from "../validators/FoodRestrictionLinkValidation";

const FoodRestrictionLinkRoutes = express.Router();

/* ===========================================================
   CRUD (PROTEGIDAS POR AUTH EN ROUTER PRINCIPAL)
   =========================================================== */

/**
 * @openapi
 * /food-restriction-links:
 *   get:
 *     summary: Listar todos los links comida ↔ restricción (con join)
 *     tags:
 *       - FoodRestrictionLinks
 *     responses:
 *       200:
 *         description: Lista de links
 */
FoodRestrictionLinkRoutes.get(
  "/",
  FoodRestrictionLinkController.getAllFoodRestrictionLinks
);

/**
 * @openapi
 * /food-restriction-links/by-food/{foodId}:
 *   get:
 *     summary: Listar restricciones asociadas a una comida (por foodId)
 *     tags:
 *       - FoodRestrictionLinks
 *     parameters:
 *       - in: path
 *         name: foodId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de restricciones de la comida
 */
FoodRestrictionLinkRoutes.get(
  "/by-food/:foodId",
  FoodRestrictionLinkController.getFoodRestrictionLinksByFoodId
);

/**
 * @openapi
 * /food-restriction-links/{id}:
 *   get:
 *     summary: Obtener un link por ID (con join)
 *     tags:
 *       - FoodRestrictionLinks
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Link encontrado
 *       404:
 *         description: Link no encontrado
 */
FoodRestrictionLinkRoutes.get(
  "/:id",
  FoodRestrictionLinkController.getFoodRestrictionLinkById
);

/**
 * @openapi
 * /food-restriction-links:
 *   post:
 *     summary: Crear link comida ↔ restricción
 *     tags:
 *       - FoodRestrictionLinks
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               foodId:
 *                 type: integer
 *                 description: FK a comidas.id
 *               restrictionId:
 *                 type: integer
 *                 description: FK a comidas_restricciones.id
 *             required:
 *               - foodId
 *               - restrictionId
 *     responses:
 *       201:
 *         description: Link creado correctamente
 *       400:
 *         description: Error de validación
 *       409:
 *         description: Conflicto (ya existe el par foodId+restrictionId)
 */
FoodRestrictionLinkRoutes.post(
  "/",
  validationMiddleware(createFoodRestrictionLinkValidationSchema),
  FoodRestrictionLinkController.createFoodRestrictionLink
);

/**
 * @openapi
 * /food-restriction-links/{id}:
 *   patch:
 *     summary: Actualizar parcialmente un link (cambiar foodId y/o restrictionId)
 *     tags:
 *       - FoodRestrictionLinks
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
 *               foodId:
 *                 type: integer
 *               restrictionId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Link actualizado correctamente
 *       400:
 *         description: Error de validación
 *       404:
 *         description: Link no encontrado
 *       409:
 *         description: Conflicto (el par ya existe)
 */
FoodRestrictionLinkRoutes.patch(
  "/:id",
  validationMiddleware(updateFoodRestrictionLinkValidationSchema),
  FoodRestrictionLinkController.updateFoodRestrictionLink
);

/**
 * @openapi
 * /food-restriction-links/hard/by-pair/{foodId}/{restrictionId}:
 *   delete:
 *     summary: Eliminación física del link por par (foodId + restrictionId)
 *     tags:
 *       - FoodRestrictionLinks
 *     parameters:
 *       - in: path
 *         name: foodId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: restrictionId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Link eliminado
 *       404:
 *         description: Link no encontrado
 */
FoodRestrictionLinkRoutes.delete(
  "/hard/by-pair/:foodId/:restrictionId",
  FoodRestrictionLinkController.hardDeleteFoodRestrictionLinkByPair
);

/**
 * @openapi
 * /food-restriction-links/hard/{id}:
 *   delete:
 *     summary: Eliminación física del link por ID (hard delete)
 *     tags:
 *       - FoodRestrictionLinks
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Link eliminado
 *       404:
 *         description: Link no encontrado
 */
FoodRestrictionLinkRoutes.delete(
  "/hard/:id",
  FoodRestrictionLinkController.hardDeleteFoodRestrictionLink
);

export default FoodRestrictionLinkRoutes;
