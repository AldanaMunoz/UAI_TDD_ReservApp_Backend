import { Router } from "express";
import validationMiddleware from "../middleware/ValidatorMiddleware";
import {
  createUserBundleValidationSchema,
  updateUserBundleValidationSchema,
} from "../validators/UserBundleValidation";
import controllers from "../controllers/UserBundleController";

const router = Router();

/* ===========================================================
   CRUD (PROTEGIDAS POR AUTH EN ROUTER PRINCIPAL)
   =========================================================== */

/**
 * @openapi
 * /user-bundle:
 *   post:
 *     summary: Crear usuario + persona + empleado (registro compuesto)
 *     description: >
 *       Crea el paquete completo: usuario (Firebase + DB),
 *       persona y empleado en una sola operación.
 *     tags:
 *       - UserBundle
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user:
 *                 type: object
 *                 description: Datos del usuario
 *               person:
 *                 type: object
 *                 description: Datos de la persona
 *               employee:
 *                 type: object
 *                 description: Datos del empleado
 *             required:
 *               - user
 *               - person
 *               - employee
 *     responses:
 *       201:
 *         description: Usuario, persona y empleado creados correctamente
 *       409:
 *         description: El email ya está registrado (duplicado)
 *       500:
 *         description: Error interno al crear el registro compuesto
 */
router.post(
  "/",
  validationMiddleware(createUserBundleValidationSchema),
  controllers.createUserBundleController
);

/**
 * @openapi
 * /user-bundle/{id}:
 *   put:
 *     summary: Actualizar usuario + persona + empleado (registro compuesto)
 *     description: >
 *       Actualiza el paquete completo asociado al ID.
 *       Puede actualizar uno o más bloques: user, person, employee.
 *     tags:
 *       - UserBundle
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
 *               user:
 *                 type: object
 *               person:
 *                 type: object
 *               employee:
 *                 type: object
 *     responses:
 *       200:
 *         description: Registro compuesto actualizado correctamente
 *       400:
 *         description: ID inválido
 *       409:
 *         description: Email o firebaseUID ya existe
 *       500:
 *         description: Error interno al actualizar el registro compuesto
 */
router.put(
  "/:id",
  validationMiddleware(updateUserBundleValidationSchema),
  controllers.updateUserBundleController
);

/**
 * @openapi
 * /user-bundle/{id}:
 *   delete:
 *     summary: Eliminar usuario + persona + empleado (registro compuesto)
 *     description: >
 *       Elimina todo el paquete asociado al ID en una sola operación.
 *     tags:
 *       - UserBundle
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Registro compuesto eliminado correctamente
 *       400:
 *         description: ID inválido
 *       500:
 *         description: Error interno al eliminar el registro compuesto
 */
router.delete(
  "/:id",
  controllers.deleteUserBundleController
);

export default router;
