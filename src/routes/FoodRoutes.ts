// src/routes/FoodRoutes.ts
import express from "express";
import FoodController from "../controllers/FoodController";
import validationMiddleware from "../middleware/ValidatorMiddleware";
import {
    createFoodValidationSchema,
    updateFoodValidationSchema,
} from "../validators/FoodValidation";

const FoodRoutes = express.Router();

/* ===========================================================
   CRUD (PROTEGIDAS POR AUTH EN ROUTER PRINCIPAL)
   =========================================================== */

/**
 * @openapi
 * /foods:
 *   get:
 *     summary: Listar todas las comidas
 *     tags:
 *       - Foods
 *     responses:
 *       200:
 *         description: Lista de comidas
 */
FoodRoutes.get(
    "/",
    FoodController.getAllFoods
);

/**
 * @openapi
 * /foods/{id}:
 *   get:
 *     summary: Obtener una comida por ID
 *     tags:
 *       - Foods
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Comida encontrada
 *       404:
 *         description: Comida no encontrada
 */
FoodRoutes.get(
    "/:id",
    FoodController.getFoodById
);

/**
 * @openapi
 * /foods:
 *   post:
 *     summary: Crear una nueva comida
 *     tags:
 *       - Foods
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               foodTypeId:
 *                 type: integer
 *                 description: ID del tipo de comida (FK a FoodType)
 *               name:
 *                 type: string
 *               isSpecial:
 *                 type: boolean
 *               imageUrl:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *             required:
 *               - foodTypeId
 *               - name
 *     responses:
 *       201:
 *         description: Comida creada correctamente
 *       400:
 *         description: Error de validación
 */
FoodRoutes.post(
    "/",
    validationMiddleware(createFoodValidationSchema),
    FoodController.createFood
);

/**
 * @openapi
 * /foods/{id}:
 *   patch:
 *     summary: Actualizar parcialmente una comida
 *     tags:
 *       - Foods
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
 *               foodTypeId:
 *                 type: integer
 *               name:
 *                 type: string
 *               isSpecial:
 *                 type: boolean
 *               imageUrl:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Comida actualizada correctamente
 *       400:
 *         description: Error de validación
 *       404:
 *         description: Comida no encontrada
 */
FoodRoutes.patch(
    "/:id",
    validationMiddleware(updateFoodValidationSchema),
    FoodController.updateFood
);

/**
 * @openapi
 * /foods/hard/{id}:
 *   delete:
 *     summary: Eliminación física de una comida (hard delete)
 *     tags:
 *       - Foods
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Comida eliminada
 *       404:
 *         description: Comida no encontrada
 */
FoodRoutes.delete(
    "/hard/:id",
    FoodController.hardDeleteFood
);

export default FoodRoutes;
