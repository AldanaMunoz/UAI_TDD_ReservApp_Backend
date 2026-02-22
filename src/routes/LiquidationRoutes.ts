// src/routes/LiquidationRoutes.ts
import express from "express";
import LiquidationController from "../controllers/LiquidationController";
import validationMiddleware from "../middleware/ValidatorMiddleware";
import {
  createLiquidationValidationSchema,
  updateLiquidationValidationSchema,
  generateLiquidationValidationSchema,
} from "../validators/LiquidationValidation";

const LiquidationRoutes = express.Router();

/* ===========================================================
   CRUD (PROTEGIDAS POR AUTH EN ROUTER PRINCIPAL)
   =========================================================== */

/**
 * @openapi
 * /liquidations:
 *   get:
 *     summary: Listar todas las liquidaciones
 *     tags:
 *       - Liquidations
 *     responses:
 *       200:
 *         description: Lista de liquidaciones
 */
LiquidationRoutes.get("/", LiquidationController.getAllLiquidations);

/**
 * @openapi
 * /liquidations/{id}:
 *   get:
 *     summary: Obtener una liquidación por ID
 *     tags:
 *       - Liquidations
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Liquidación encontrada
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Liquidación no encontrada
 */
LiquidationRoutes.get("/:id", LiquidationController.getLiquidationById);

/**
 * @openapi
 * /liquidations:
 *   post:
 *     summary: Crear una liquidación manualmente
 *     tags:
 *       - Liquidations
 *     responses:
 *       201:
 *         description: Liquidación creada
 *       400:
 *         description: Error de validación
 */
LiquidationRoutes.post(
  "/",
  validationMiddleware(createLiquidationValidationSchema),
  LiquidationController.createLiquidation
);

/**
 * @openapi
 * /liquidations/{id}:
 *   patch:
 *     summary: Actualizar parcialmente una liquidación
 *     tags:
 *       - Liquidations
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Liquidación actualizada
 *       400:
 *         description: Error de validación / ID inválido
 *       404:
 *         description: Liquidación no encontrada
 */
LiquidationRoutes.patch(
  "/:id",
  validationMiddleware(updateLiquidationValidationSchema),
  LiquidationController.updateLiquidation
);

/**
 * @openapi
 * /liquidations/hard/{id}:
 *   delete:
 *     summary: Borrado físico de una liquidación
 *     tags:
 *       - Liquidations
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Liquidación eliminada
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Liquidación no encontrada
 */
LiquidationRoutes.delete("/hard/:id", LiquidationController.hardDeleteLiquidation);

/* ===========================================================
   BUSINESS
   =========================================================== */

/**
 * @openapi
 * /liquidations/generate:
 *   post:
 *     summary: Generar una liquidación para un mes/año y asignar reservas (aplica id_historico_precio por reserva)
 *     tags:
 *       - Liquidations
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               month:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 12
 *                 example: 2
 *               year:
 *                 type: integer
 *                 minimum: 1900
 *                 maximum: 3000
 *                 example: 2026
 *             required:
 *               - month
 *               - year
 *     responses:
 *       201:
 *         description: Liquidación generada y reservas asignadas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Liquidación generada y reservas asignadas"
 *                 liquidation:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 123
 *                     month:
 *                       type: integer
 *                       example: 2
 *                     year:
 *                       type: integer
 *                       example: 2026
 *                     totalAmount:
 *                       type: number
 *                       example: 6700
 *                 reservationsCount:
 *                   type: integer
 *                   example: 90
 *                 reservationsUpdated:
 *                   type: integer
 *                   example: 90
 *                 totalAmount:
 *                   type: number
 *                   example: 6700
 *       400:
 *         description: Parámetros inválidos
 *       409:
 *         description: Conflicto por reglas de negocio o concurrencia
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 code:
 *                   type: string
 *                   example: "LIQUIDATION_EXISTS"
 *                 data:
 *                   type: object
 *             examples:
 *               liquidationExists:
 *                 summary: Ya existe la liquidación para ese mes/año
 *                 value:
 *                   message: "Ya existe una liquidación para ese mes/año"
 *                   code: "LIQUIDATION_EXISTS"
 *                   data:
 *                     liquidationId: 123
 *               reservationsChanged:
 *                 summary: Cambios concurrentes en reservas
 *                 value:
 *                   message: "No se pudieron actualizar todas las reservas (posible cambio concurrente)."
 *                   code: "RESERVATIONS_CHANGED"
 *                   data:
 *                     expected: 90
 *                     updated: 88
 *       422:
 *         description: No existe precio histórico aplicable para alguna reserva
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 code:
 *                   type: string
 *                   example: "MISSING_PRICE_FOR_DATE"
 *                 data:
 *                   type: object
 *             example:
 *               message: "No hay precio histórico que cubra la fecha de la reserva: 2026-02-05T12:30:00.000Z"
 *               code: "MISSING_PRICE_FOR_DATE"
 *               data:
 *                 reservationId: 501
 *                 reservedAt: "2026-02-05T12:30:00.000Z"
 *       500:
 *         description: Error interno
 */
LiquidationRoutes.post(
  "/generate",
  validationMiddleware(generateLiquidationValidationSchema),
  LiquidationController.generateLiquidation
);

export default LiquidationRoutes;