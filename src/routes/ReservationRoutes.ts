// src/routes/ReservationRoutes.ts
import express from "express";
import ReservationController from "../controllers/ReservationController";
import validationMiddleware from "../middleware/ValidatorMiddleware";
import {
    createReservationValidationSchema,
    updateReservationValidationSchema,
} from "../validators/ReservationValidation";

const ReservationRoutes = express.Router();

/* ===========================================================
   CRUD (PROTEGIDAS POR AUTH EN ROUTER PRINCIPAL)
   =========================================================== */

/**
 * @openapi
 * /reservations:
 *   get:
 *     summary: Listar todas las reservas
 *     tags:
 *       - Reservations
 *     responses:
 *       200:
 *         description: Lista de reservas
 */
ReservationRoutes.get("/", ReservationController.getAllReservations);

/**
 * @openapi
 * /reservations/{id}:
 *   get:
 *     summary: Obtener una reserva por ID
 *     tags:
 *       - Reservations
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Reserva encontrada
 *       404:
 *         description: Reserva no encontrada
 */
ReservationRoutes.get("/:id", ReservationController.getReservationById);

/**
 * @openapi
 * /reservations:
 *   post:
 *     summary: Crear una nueva reserva
 *     tags:
 *       - Reservations
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               employeeId:
 *                 type: integer
 *                 description: ID del empleado (FK a empleados)
 *               liquidationId:
 *                 type: integer
 *                 nullable: true
 *                 description: ID de la liquidación (FK a liquidaciones)
 *               reservedAt:
 *                 type: string
 *                 format: date-time
 *               cancelledAt:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *               starterFoodId:
 *                 type: integer
 *                 nullable: true
 *               mainFoodId:
 *                 type: integer
 *                 nullable: true
 *               dessertFoodId:
 *                 type: integer
 *                 nullable: true
 *               drinkFoodId:
 *                 type: integer
 *                 nullable: true
 *               qrCode:
 *                 type: string
 *                 nullable: true
 *               reservationStatus:
 *                 type: integer
 *               liquidationStatus:
 *                 type: integer
 *             required:
 *               - employeeId
 *               - reservedAt
 *     responses:
 *       201:
 *         description: Reserva creada correctamente
 *       400:
 *         description: Error de validación
 */
ReservationRoutes.post(
    "/",
    validationMiddleware(createReservationValidationSchema),
    ReservationController.createReservation
);

/**
 * @openapi
 * /reservations/{id}:
 *   patch:
 *     summary: Actualizar parcialmente una reserva
 *     tags:
 *       - Reservations
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
 *     responses:
 *       200:
 *         description: Reserva actualizada correctamente
 *       400:
 *         description: Error de validación
 *       404:
 *         description: Reserva no encontrada
 */
ReservationRoutes.patch(
    "/:id",
    validationMiddleware(updateReservationValidationSchema),
    ReservationController.updateReservation
);

/**
 * @openapi
 * /reservations/hard/{id}:
 *   delete:
 *     summary: Eliminación física de una reserva (hard delete)
 *     tags:
 *       - Reservations
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Reserva eliminada
 *       404:
 *         description: Reserva no encontrada
 */
ReservationRoutes.delete("/hard/:id", ReservationController.hardDeleteReservation);

export default ReservationRoutes;
