// src/routes/PriceHistoryRoutes.ts
import express from "express";
import PriceHistoryController from "../controllers/PriceHistoryController";
import validationMiddleware from "../middleware/ValidatorMiddleware";
import {
  createPriceHistoryValidationSchema,
  updatePriceHistoryValidationSchema,
} from "../validators/PriceHistoryValidation";

const PriceHistoryRoutes = express.Router();

/* ===========================================================
   CRUD (PROTEGIDAS POR AUTH EN ROUTER PRINCIPAL)
   =========================================================== */

/**
 * @openapi
 * /price-history:
 *   get:
 *     summary: Listar todo el historial de precios
 *     tags:
 *       - PriceHistory
 *     responses:
 *       200:
 *         description: Lista de historiales de precios
 */
PriceHistoryRoutes.get("/", PriceHistoryController.getAllPriceHistory);

/* ===========================================================
   NEGOCIO
   =========================================================== */

/**
 * @openapi
 * /price-history/by-dates:
 *   get:
 *     summary: Obtener historiales de precios que se solapen con un mes/año
 *     tags:
 *       - PriceHistory
 *     parameters:
 *       - in: query
 *         name: month
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 12
 *         description: Mes (1-12)
 *       - in: query
 *         name: year
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1900
 *           maximum: 3000
 *         description: Año (YYYY)
 *     responses:
 *       200:
 *         description: Lista de historiales aplicables al rango
 *       400:
 *         description: Parámetros inválidos
 */
PriceHistoryRoutes.get(
  "/by-dates",
  PriceHistoryController.getAllPriceHistoryByDates
);

/**
 * @openapi
 * /price-history/{id}:
 *   get:
 *     summary: Obtener historial de precios por ID
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
 *         description: Historial encontrado
 *       404:
 *         description: Historial no encontrado
 */
PriceHistoryRoutes.get("/:id", PriceHistoryController.getPriceHistoryById);

/**
 * @openapi
 * /price-history:
 *   post:
 *     summary: Crear un historial de precio
 *     tags:
 *       - PriceHistory
 *     responses:
 *       201:
 *         description: Historial creado
 *       400:
 *         description: Error de validación
 */
PriceHistoryRoutes.post(
  "/",
  validationMiddleware(createPriceHistoryValidationSchema),
  PriceHistoryController.createPriceHistory
);

/**
 * @openapi
 * /price-history/{id}:
 *   patch:
 *     summary: Actualizar parcialmente un historial de precio
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
 *         description: Historial actualizado
 *       400:
 *         description: Error de validación
 *       404:
 *         description: Historial no encontrado
 *       409:
 *         description: Cambio no permitido por reglas de negocio
 */
PriceHistoryRoutes.patch(
  "/:id",
  validationMiddleware(updatePriceHistoryValidationSchema),
  PriceHistoryController.updatePriceHistory
);

/**
 * @openapi
 * /price-history/hard/{id}:
 *   delete:
 *     summary: Borrado físico de un historial de precio
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
 *         description: Historial eliminado
 *       404:
 *         description: Historial no encontrado
 */
PriceHistoryRoutes.delete(
  "/hard/:id",
  PriceHistoryController.hardDeletePriceHistory
);

export default PriceHistoryRoutes;