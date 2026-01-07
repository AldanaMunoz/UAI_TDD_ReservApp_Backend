import express from "express";
import UserBundleController from "../controllers/UserBundleController";
import controllers from "../controllers/UserController"; // Solo login/logout
import validationMiddleware from "../middleware/ValidatorMiddleware";
import { authenticateFirebase, attachLocalUser } from "../middleware/AuthMiddleware";
import { 
    createUserBundleValidationSchema, 
} from "../validators/UserBundleValidation";

const AuthRoutes = express.Router();

/* ===========================================================
   AUTH (PÚBLICAS / SEMI-PÚBLICAS)
   =========================================================== */

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Login híbrido (LOCAL + Firebase)
 *     description: >
 *       1) Valida email/password contra la DB local.  
 *       2) Valida credenciales contra Firebase vía REST.  
 *       3) Sincroniza firebaseUID si faltaba.  
 *     tags:
 *       - Auth
 *     security: []   # Endpoint público (no requiere token previo)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *             required:
 *               - email
 *               - password
 *     responses:
 *       200:
 *         description: Login OK (local + firebase), devuelve tokens y usuario
 *       400:
 *         description: email y password son requeridos
 *       401:
 *         description: Credenciales inválidas (local o Firebase)
 *       403:
 *         description: Usuario inactivo (local)
 *       409:
 *         description: Inconsistencia entre firebaseUID local y el de Firebase
 *       500:
 *         description: Error interno durante el login
 */
AuthRoutes.post(
    "/login",
    controllers.loginLocalFirebase
);

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     summary: Logout del usuario autenticado (revocar tokens de Firebase)
 *     description: >
 *       Revoca los refresh tokens del usuario en Firebase (server-side).  
 *       Requiere autenticación por bearer token y enviar firebaseUID en el body.
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []   # Requiere token (authenticateFirebase + attachLocalUser)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firebaseUID:
 *                 type: string
 *             required:
 *               - firebaseUID
 *     responses:
 *       200:
 *         description: Logout exitoso, tokens de Firebase revocados
 *       400:
 *         description: firebaseUID es requerido
 *       500:
 *         description: Error interno al hacer logout
 */
AuthRoutes.post(
    "/logout",
    authenticateFirebase,
    attachLocalUser,
    controllers.logoutFirebase
);

/**
 * @openapi
 * /auth/register:
 *   post:
 *     summary: Registro completo (User + Person + Employee + Firebase)
 *     description: >
 *       Crea un usuario en Firebase, luego usuario local, persona y empleado
 *       en una operación orquestada a través del UserBundle.
 *     tags:
 *       - Auth
 *       - UserBundle
 *     security: []   # Público (alta inicial)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user:
 *                 type: object
 *                 description: Datos del usuario (credenciales y estado)
 *               person:
 *                 type: object
 *                 description: Datos personales
 *               employee:
 *                 type: object
 *                 description: Datos laborales
 *             required:
 *               - user
 *               - person
 *               - employee
 *     responses:
 *       201:
 *         description: Usuario registrado correctamente
 *       400:
 *         description: Error de validación en alguno de los bloques
 *       409:
 *         description: Conflicto (email ya registrado u otra colisión)
 *       500:
 *         description: Error interno al registrar el bundle
 */
AuthRoutes.post(
    "/register",
    validationMiddleware(createUserBundleValidationSchema),
    UserBundleController.createUserBundleController
);

export default AuthRoutes;
