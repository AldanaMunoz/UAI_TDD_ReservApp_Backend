import express from "express";
import WeeklyPlanningFoodController from "../controllers/WeeklyPlanningFoodController";
import validationMiddleware from "../middleware/ValidatorMiddleware";
import { createWeeklyPlanningFoodValidationSchema, updateWeeklyPlanningFoodValidationSchema } from "../validators/WeeklyPlanningFoodValidation";

const WeeklyPlanningFoodRoutes = express.Router();

/**
 * @openapi
 * /weekly-planning-foods:
 *   get:
 *     summary: Listar comidas por planificación semanal (detalle menú)
 *     tags:
 *       - WeeklyPlanningFoods
 *     responses:
 *       200:
 *         description: OK
 */
WeeklyPlanningFoodRoutes.get("/", WeeklyPlanningFoodController.getAllWeeklyPlanningFoods);

/**
 * @openapi
 * /weekly-planning-foods/by-weekly-planning/{weeklyPlanningId}:
 *   get:
 *     summary: Obtener menú por weeklyPlanningId (1 registro)
 *     tags:
 *       - WeeklyPlanningFoods
 *     parameters:
 *       - in: path
 *         name: weeklyPlanningId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: OK
 *       404:
 *         description: Not found
 */
WeeklyPlanningFoodRoutes.get(
  "/by-weekly-planning/:weeklyPlanningId",
  WeeklyPlanningFoodController.getWeeklyPlanningFoodByWeeklyPlanningId
);

/**
 * @openapi
 * /weekly-planning-foods/{id}:
 *   get:
 *     summary: Obtener menú por ID
 *     tags:
 *       - WeeklyPlanningFoods
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: OK
 *       404:
 *         description: Not found
 */
WeeklyPlanningFoodRoutes.get("/:id", WeeklyPlanningFoodController.getWeeklyPlanningFoodById);

/**
 * @openapi
 * /weekly-planning-foods:
 *   post:
 *     summary: Crear menú para una planificación (1 registro por weeklyPlanningId)
 *     tags:
 *       - WeeklyPlanningFoods
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [weeklyPlanningId]
 *             properties:
 *               weeklyPlanningId: { type: integer }
 *               entryFoodId: { type: integer, nullable: true }
 *               mainFoodId: { type: integer, nullable: true }
 *               altFoodId: { type: integer, nullable: true }
 *               vegFoodId: { type: integer, nullable: true }
 *     responses:
 *       201:
 *         description: Created
 *       400:
 *         description: Validation error
 *       409:
 *         description: Duplicate / FK
 */
WeeklyPlanningFoodRoutes.post(
  "/",
  validationMiddleware(createWeeklyPlanningFoodValidationSchema),
  WeeklyPlanningFoodController.createWeeklyPlanningFood
);

/**
 * @openapi
 * /weekly-planning-foods/{id}:
 *   patch:
 *     summary: Actualizar parcialmente menú
 *     tags:
 *       - WeeklyPlanningFoods
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
 *               weeklyPlanningId: { type: integer }
 *               entryFoodId: { type: integer, nullable: true }
 *               mainFoodId: { type: integer, nullable: true }
 *               altFoodId: { type: integer, nullable: true }
 *               vegFoodId: { type: integer, nullable: true }
 *     responses:
 *       200:
 *         description: OK
 *       400:
 *         description: Validation error
 *       404:
 *         description: Not found
 *       409:
 *         description: Duplicate / FK
 */
WeeklyPlanningFoodRoutes.patch(
  "/:id",
  validationMiddleware(updateWeeklyPlanningFoodValidationSchema),
  WeeklyPlanningFoodController.updateWeeklyPlanningFood
);

/**
 * @openapi
 * /weekly-planning-foods/hard/{id}:
 *   delete:
 *     summary: Hard delete de menú
 *     tags:
 *       - WeeklyPlanningFoods
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Deleted
 *       404:
 *         description: Not found
 */
WeeklyPlanningFoodRoutes.delete("/hard/:id", WeeklyPlanningFoodController.hardDeleteWeeklyPlanningFood);

export default WeeklyPlanningFoodRoutes;
