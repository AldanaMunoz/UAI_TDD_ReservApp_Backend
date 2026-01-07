import express from "express";
import controllers from "../controllers/PersonController";
import validationMiddleware from "../middleware/ValidatorMiddleware";
import { 
    createPersonValidationSchema,
    updatePersonValidationSchema,
} from "../validators/PersonValidation";

const PersonRoutes = express.Router();

/* ===========================================================
   CRUD (PROTEGIDAS POR AUTH EN ROUTER PRINCIPAL)
   =========================================================== */

/**
 * @openapi
 * /persons:
 *   get:
 *     summary: Listar todas las personas
 *     tags:
 *       - Persons
 *     responses:
 *       200:
 *         description: Lista de personas
 *       500:
 *         description: Error interno al obtener personas
 */
PersonRoutes.get(
    "/",
    controllers.getAllPersons
);

/**
 * @openapi
 * /persons/{id}:
 *   get:
 *     summary: Obtener una persona por ID
 *     tags:
 *       - Persons
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Persona encontrada
 *       404:
 *         description: Persona no encontrada
 *       500:
 *         description: Error interno al obtener persona
 */
PersonRoutes.get(
    "/:id",
    controllers.getPersonById
);

/**
 * @openapi
 * /persons:
 *   post:
 *     summary: Crear una persona
 *     tags:
 *       - Persons
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id_usuario:
 *                 type: integer
 *                 nullable: true
 *               nombre:
 *                 type: string
 *               apellido:
 *                 type: string
 *               activo:
 *                 type: integer
 *                 enum: [0, 1]
 *             required:
 *               - nombre
 *               - apellido
 *     responses:
 *       201:
 *         description: Persona creada correctamente
 *       400:
 *         description: Faltan campos obligatorios
 *       500:
 *         description: Error interno al crear persona
 */
PersonRoutes.post(
    "/",
    validationMiddleware(createPersonValidationSchema),
    controllers.createPerson
);

/**
 * @openapi
 * /persons/{id}:
 *   patch:
 *     summary: Actualizar parcialmente una persona
 *     tags:
 *       - Persons
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
 *               id_usuario:
 *                 type: integer
 *                 nullable: true
 *               nombre:
 *                 type: string
 *               apellido:
 *                 type: string
 *               activo:
 *                 type: integer
 *                 enum: [0, 1]
 *     responses:
 *       200:
 *         description: Persona actualizada correctamente
 *       404:
 *         description: Persona no encontrada
 *       500:
 *         description: Error interno al actualizar persona
 */
PersonRoutes.patch(
    "/:id",
    validationMiddleware(updatePersonValidationSchema),
    controllers.updatePerson
);

/**
 * @openapi
 * /persons/hard/{id}:
 *   delete:
 *     summary: Eliminación física de una persona (hard delete)
 *     tags:
 *       - Persons
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Persona eliminada correctamente
 *       404:
 *         description: Persona no encontrada
 *       500:
 *         description: Error interno al eliminar persona
 */
PersonRoutes.delete(
    "/hard/:id",
    controllers.hardDeletePerson
);

export default PersonRoutes;
