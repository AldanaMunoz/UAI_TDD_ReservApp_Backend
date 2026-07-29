import express from "express";
import WeeklyPlanningController from "../controllers/WeeklyPlanningController";
import validationMiddleware from "../middleware/ValidatorMiddleware";
import {
  createWeeklyPlanningValidationSchema,
  updateWeeklyPlanningValidationSchema,
} from "../validators/WeeklyPlanningValidation";

const WeeklyPlanningRoutes = express.Router();

/**
 * @openapi
 * /weekly-plannings:
 *   get:
 *     summary: Listar planificaciones semanales
 *     tags:
 *       - WeeklyPlannings
 *     responses:
 *       200:
 *         description: OK
 */
WeeklyPlanningRoutes.get("/", WeeklyPlanningController.getAllWeeklyPlannings);

WeeklyPlanningRoutes.get("/by-season/:seasonId", WeeklyPlanningController.getWeeklyPlanningsBySeason);
WeeklyPlanningRoutes.post("/generate", WeeklyPlanningController.generateWeeklyPlannings);
WeeklyPlanningRoutes.get(
  "/meal-assignments/:seasonId/:weekNumber",
  WeeklyPlanningController.getMealAssignments
);
WeeklyPlanningRoutes.post("/meal-assignments", WeeklyPlanningController.saveMealAssignments);

/**
 * @openapi
 * /weekly-plannings/{id}:
 *   get:
 *     summary: Obtener planificación semanal por ID
 *     tags:
 *       - WeeklyPlannings
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
WeeklyPlanningRoutes.get("/:id", WeeklyPlanningController.getWeeklyPlanningById);

/**
 * @openapi
 * /weekly-plannings:
 *   post:
 *     summary: Crear planificación semanal
 *     tags:
 *       - WeeklyPlannings
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [seasonId, weekNumber, weekDay, date]
 *             properties:
 *               seasonId: { type: integer }
 *               weekNumber: { type: integer }
 *               weekDay: { type: integer }
 *               date: { type: string }
 *     responses:
 *       201:
 *         description: Created
 *       400:
 *         description: Validation error
 *       409:
 *         description: Duplicate / FK
 */
WeeklyPlanningRoutes.post("/", validationMiddleware(createWeeklyPlanningValidationSchema), WeeklyPlanningController.createWeeklyPlanning);

/**
 * @openapi
 * /weekly-plannings/{id}:
 *   patch:
 *     summary: Actualizar parcialmente planificación semanal
 *     tags:
 *       - WeeklyPlannings
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
 *               seasonId: { type: integer }
 *               weekNumber: { type: integer }
 *               weekDay: { type: integer }
 *               date: { type: string }
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
WeeklyPlanningRoutes.patch("/:id", validationMiddleware(updateWeeklyPlanningValidationSchema), WeeklyPlanningController.updateWeeklyPlanning);

/**
 * @openapi
 * /weekly-plannings/hard/{id}:
 *   delete:
 *     summary: Hard delete de planificación semanal
 *     tags:
 *       - WeeklyPlannings
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
WeeklyPlanningRoutes.delete("/hard/:id", WeeklyPlanningController.hardDeleteWeeklyPlanning);

export default WeeklyPlanningRoutes;
