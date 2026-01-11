import express from "express";
import PriceHistoryController from "../controllers/PriceHistoryController";
import validationMiddleware from "../middleware/ValidatorMiddleware";
import {
  createPriceHistoryValidationSchema,
  updatePriceHistoryValidationSchema,
} from "../validators/PriceHistoryValidation";

const PriceHistoryRoutes = express.Router();

/**
 * @openapi
 * /price-history:
 *   get:
 *     summary: Listar históricos de precios
 *     tags:
 *       - PriceHistory
 *     responses:
 *       200:
 *         description: OK
 */
PriceHistoryRoutes.get("/", PriceHistoryController.getAllPriceHistory);

/**
 * @openapi
 * /price-history/{id}:
 *   get:
 *     summary: Obtener histórico de precio por ID
 *     tags:
 *       - PriceHistory
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
PriceHistoryRoutes.get("/:id", PriceHistoryController.getPriceHistoryById);

/**
 * @openapi
 * /price-history:
 *   post:
 *     summary: Crear histórico de precio
 *     tags:
 *       - PriceHistory
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [price, startDate]
 *             properties:
 *               price: { type: number }
 *               startDate: { type: string }
 *               fromDate: { type: string, nullable: true }
 *     responses:
 *       201:
 *         description: Created
 *       400:
 *         description: Validation error
 */
PriceHistoryRoutes.post("/", validationMiddleware(createPriceHistoryValidationSchema), PriceHistoryController.createPriceHistory);

/**
 * @openapi
 * /price-history/{id}:
 *   patch:
 *     summary: Actualizar parcialmente histórico de precio
 *     tags:
 *       - PriceHistory
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
 *               price: { type: number }
 *               startDate: { type: string }
 *               fromDate: { type: string, nullable: true }
 *     responses:
 *       200:
 *         description: OK
 *       400:
 *         description: Validation error
 *       404:
 *         description: Not found
 */
PriceHistoryRoutes.patch("/:id", validationMiddleware(updatePriceHistoryValidationSchema), PriceHistoryController.updatePriceHistory);

/**
 * @openapi
 * /price-history/hard/{id}:
 *   delete:
 *     summary: Hard delete de histórico de precio
 *     tags:
 *       - PriceHistory
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
PriceHistoryRoutes.delete("/hard/:id", PriceHistoryController.hardDeletePriceHistory);

export default PriceHistoryRoutes;
