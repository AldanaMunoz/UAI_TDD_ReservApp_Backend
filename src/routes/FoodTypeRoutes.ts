// src/routes/FoodTypeRoutes.ts
import express from "express";
import FoodTypeController from "../controllers/FoodTypeController";
import validationMiddleware from "../middleware/ValidatorMiddleware";
import {
    createFoodTypeValidationSchema,
    updateFoodTypeValidationSchema,
} from "../validators/FoodTypeValidation";

const FoodTypeRoutes = express.Router();

/* ===========================================================
   CRUD (PROTEGIDAS POR AUTH EN ROUTER PRINCIPAL)
   =========================================================== */

/**
 * @openapi
 * /food-types:
 *   get:
 *     summary: Listar todos los tipos de comida
 *     tags:
 *       - FoodTypes
 *     responses:
 *       200:
 *         description: Lista de tipos de comida
 */
FoodTypeRoutes.get(
    "/",
    FoodTypeController.getAllFoodTypes
);

/**
 * @openapi
 * /food-types/{id}:
 *   get:
 *     summary: Obtener un tipo de comida por ID
 *     tags:
 *       - FoodTypes
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Tipo de comida encontrado
 *       404:
 *         description: Tipo de comida no encontrado
 */
FoodTypeRoutes.get(
    "/:id",
    FoodTypeController.getFoodTypeById
);

/**
 * @openapi
 * /food-types:
 *   post:
 *     summary: Crear un tipo de comida
 *     tags:
 *       - FoodTypes
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *                 nullable: true
 *             required:
 *               - name
 *     responses:
 *       201:
 *         description: Tipo de comida creado correctamente
 *       400:
 *         description: Error de validación
 */
FoodTypeRoutes.post(
    "/",
    validationMiddleware(createFoodTypeValidationSchema),
    FoodTypeController.createFoodType
);

/**
 * @openapi
 * /food-types/{id}:
 *   patch:
 *     summary: Actualizar parcialmente un tipo de comida
 *     tags:
 *       - FoodTypes
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
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Tipo de comida actualizado correctamente
 *       400:
 *         description: Error de validación
 *       404:
 *         description: Tipo de comida no encontrado
 */
FoodTypeRoutes.patch(
    "/:id",
    validationMiddleware(updateFoodTypeValidationSchema),
    FoodTypeController.updateFoodType
);

/**
 * @openapi
 * /food-types/hard/{id}:
 *   delete:
 *     summary: Eliminación física de un tipo de comida (hard delete)
 *     tags:
 *       - FoodTypes
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Tipo de comida eliminado correctamente
 *       404:
 *         description: Tipo de comida no encontrado
 */
FoodTypeRoutes.delete(
    "/hard/:id",
    FoodTypeController.hardDeleteFoodType
);

export default FoodTypeRoutes;
