import express from "express";
import controllers from "../controllers/EmployeeController";
import validationMiddleware from "../middleware/ValidatorMiddleware";
import { 
    createEmployeeValidationSchema,
    updateEmployeeValidationSchema
} from "../validators/EmployeeValidation";

const EmployeeRoutes = express.Router();

/* ===========================================================
   CRUD (PROTEGIDAS POR AUTH EN ROUTER PRINCIPAL)
   =========================================================== */

/**
 * @openapi
 * /employees:
 *   post:
 *     summary: Crear un empleado
 *     tags:
 *       - Employees
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id_persona:
 *                 type: integer
 *                 description: ID de la persona asociada
 *               turno:
 *                 type: string
 *                 description: Turno del empleado
 *               tipo:
 *                 type: string
 *                 description: Tipo de empleado
 *             required:
 *               - id_persona
 *               - turno
 *               - tipo
 *     responses:
 *       201:
 *         description: Empleado creado correctamente
 *       400:
 *         description: Faltan campos obligatorios
 *       500:
 *         description: Error interno al crear empleado
 */
EmployeeRoutes.post(
    "/",
    validationMiddleware(createEmployeeValidationSchema),
    controllers.createEmployee
);

/**
 * @openapi
 * /employees:
 *   get:
 *     summary: Listar todos los empleados
 *     tags:
 *       - Employees
 *     responses:
 *       200:
 *         description: Lista de empleados
 *       500:
 *         description: Error interno al obtener empleados
 */
EmployeeRoutes.get(
    "/",
    controllers.getAllEmployees
);

/**
 * @openapi
 * /employees/{id}:
 *   get:
 *     summary: Obtener un empleado por ID
 *     tags:
 *       - Employees
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Empleado encontrado
 *       404:
 *         description: Empleado no encontrado
 *       500:
 *         description: Error interno al obtener empleado
 */
EmployeeRoutes.get(
    "/:id",
    controllers.getEmployeeById
);

/**
 * @openapi
 * /employees/persona/{id_persona}:
 *   get:
 *     summary: Listar empleados por persona
 *     tags:
 *       - Employees
 *     parameters:
 *       - in: path
 *         name: id_persona
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de empleados de la persona
 *       500:
 *         description: Error interno al obtener empleados
 */
EmployeeRoutes.get(
    "/persona/:id_persona",
    controllers.getEmployeesByPersona
);

/**
 * @openapi
 * /employees/{id}:
 *   patch:
 *     summary: Actualizar parcialmente un empleado
 *     tags:
 *       - Employees
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
 *               id_persona:
 *                 type: integer
 *               turno:
 *                 type: string
 *               tipo:
 *                 type: string
 *     responses:
 *       200:
 *         description: Empleado actualizado correctamente
 *       404:
 *         description: Empleado no encontrado
 *       500:
 *         description: Error interno al actualizar empleado
 */
EmployeeRoutes.patch(
    "/:id",
    validationMiddleware(updateEmployeeValidationSchema),
    controllers.updateEmployee
);

/**
 * @openapi
 * /employees/hard/{id}:
 *   delete:
 *     summary: Eliminación física de un empleado (hard delete)
 *     tags:
 *       - Employees
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Empleado eliminado correctamente
 *       404:
 *         description: Empleado no encontrado
 *       500:
 *         description: Error interno al eliminar empleado
 */
EmployeeRoutes.delete(
    "/hard/:id",
    controllers.hardDeleteEmployee
);

export default EmployeeRoutes;
