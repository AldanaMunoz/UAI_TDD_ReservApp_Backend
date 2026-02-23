import express from "express";
import SessionLogController from "../controllers/SessionLogController";

const SessionLogRoutes = express.Router();

/**
 * @openapi
 * /session-logs:
 *   get:
 *     summary: Listar logs de sesión (solo consulta)
 *     tags:
 *       - SessionLogs
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: false
 *         schema:
 *           type: integer
 *         description: Filtra por ID de usuario
 *     responses:
 *       200:
 *         description: Lista de logs
 */
SessionLogRoutes.get("/", SessionLogController.getAllSessionLogs);

/**
 * @openapi
 * /session-logs/{id}:
 *   get:
 *     summary: Obtener un log de sesión por ID
 *     tags:
 *       - SessionLogs
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Log encontrado
 *       404:
 *         description: Log no encontrado
 */
SessionLogRoutes.get("/:id", SessionLogController.getSessionLogById);

export default SessionLogRoutes;