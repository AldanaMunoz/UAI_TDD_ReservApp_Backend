import express from "express";
import controllers from "../controllers/UserController"; // Solo login/logout
import {
  authenticateFirebase,
  attachLocalUser,
} from "../middleware/AuthMiddleware";

const AuthRoutes = express.Router();

/* ===========================================================
   AUTH (PÚBLICAS / SEMI-PÚBLICAS)
   =========================================================== */

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Login híbrido (LOCAL + Firebase)
 *     tags:
 *       - Auth
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *           examples:
 *             admin:
 *               summary: Admin demo
 *               value:
 *                 email: "renzo.jrr10@gmail.com"
 *                 password: "123456"
 *             employee:
 *               summary: Empleado demo
 *               value:
 *                 email: "empleado@tuapp.com"
 *                 password: "Empleado1234!"
 *     responses:
 *       200:
 *         description: Login OK
 */
AuthRoutes.post("/login", controllers.loginLocalFirebase);

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
 *               sessionToken:
 *                type: string
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

export default AuthRoutes;
