// src/routes/SeasonRoutes.ts
import express from "express";
import SeasonController from "../controllers/SeasonController";
import validationMiddleware from "../middleware/ValidatorMiddleware";
import {
    createSeasonValidationSchema,
    updateSeasonValidationSchema,
} from "../validators/SeasonValidation";

const SeasonRoutes = express.Router();

/* ===========================================================
   CRUD (PROTEGIDAS POR AUTH EN ROUTER PRINCIPAL)
   =========================================================== */

/**
 * @openapi
 * /seasons:
 *   get:
 *     summary: Listar todas las temporadas
 *     tags:
 *       - Seasons
 *     responses:
 *       200:
 *         description: Lista de temporadas
 *       500:
 *         description: Error interno al obtener temporadas
 */
SeasonRoutes.get(
    "/",
    SeasonController.getAllSeasons
);

/**
 * @openapi
 * /seasons/{id}:
 *   get:
 *     summary: Obtener una temporada por ID
 *     tags:
 *       - Seasons
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Temporada encontrada
 *       404:
 *         description: Temporada no encontrada
 *       500:
 *         description: Error interno al obtener temporada
 */
SeasonRoutes.get(
    "/:id",
    SeasonController.getSeasonById
);

/**
 * @openapi
 * /seasons:
 *   post:
 *     summary: Crear una nueva temporada
 *     tags:
 *       - Seasons
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               stationId:
 *                 type: integer
 *                 description: ID de la estacion
 *               year:
 *                 type: integer
 *                 description: Año de la temporada
 *               startDate:
 *                 type: string
 *                 format: date
 *                 description: Fecha de inicio (YYYY-MM-DD)
 *               endDate:
 *                 type: string
 *                 format: date
 *                 description: Fecha de fin (YYYY-MM-DD)
 *             required:
 *               - stationId
 *               - year
 *               - startDate
 *               - endDate
 *     responses:
 *       201:
 *         description: Temporada creada correctamente
 *       400:
 *         description: Error de validación o campos faltantes
 *       500:
 *         description: Error interno al crear temporada
 */
SeasonRoutes.post(
    "/",
    validationMiddleware(createSeasonValidationSchema),
    SeasonController.createSeason
);

/**
 * @openapi
 * /seasons/{id}:
 *   patch:
 *     summary: Actualizar parcialmente una temporada
 *     tags:
 *       - Seasons
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
 *               stationId:
 *                 type: integer
 *               year:
 *                 type: integer
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Temporada actualizada correctamente
 *       404:
 *         description: Temporada no encontrada o sin cambios
 *       500:
 *         description: Error interno al actualizar temporada
 */
SeasonRoutes.patch(
    "/:id",
    validationMiddleware(updateSeasonValidationSchema),
    SeasonController.updateSeason
);

/**
 * @openapi
 * /seasons/hard/{id}:
 *   delete:
 *     summary: Eliminación física de una temporada (hard delete)
 *     tags:
 *       - Seasons
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Temporada eliminada correctamente
 *       404:
 *         description: Temporada no encontrada
 *       500:
 *         description: Error interno al eliminar temporada
 */
SeasonRoutes.delete(
    "/hard/:id",
    SeasonController.hardDeleteSeason
);

export default SeasonRoutes;
