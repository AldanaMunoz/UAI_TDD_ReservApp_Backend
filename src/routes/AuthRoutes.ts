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
 *     summary: Inicio de sesión híbrido (local + Firebase)
 *     description: |
 *       Valida primero las credenciales contra la base local y luego contra Firebase.
 *       Si ambas validaciones son correctas, genera un sessionToken interno, registra la sesión
 *       en session_logs y devuelve los datos del usuario junto con los tokens de Firebase.
 *     tags:
 *       - Auth
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Correo electrónico del usuario.
 *                 example: "renzo.jrr10@gmail.com"
 *               password:
 *                 type: string
 *                 description: Contraseña del usuario.
 *                 example: "123456"
 *           examples:
 *             loginValido:
 *               summary: Login válido
 *               value:
 *                 email: "renzo.jrr10@gmail.com"
 *                 password: "123456"
 *             faltanCampos:
 *               summary: Faltan credenciales
 *               value:
 *                 email: ""
 *                 password: ""
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Inicio de sesión OK (local + firebase)"
 *                 sessionToken:
 *                   type: string
 *                   example: "2b5c1f3f8b4a7e9d1c0a6b3d5e7f9a11"
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     email:
 *                       type: string
 *                       format: email
 *                       example: "renzo.jrr10@gmail.com"
 *                     activo:
 *                       type: integer
 *                       example: 1
 *                     firebaseUID:
 *                       type: string
 *                       example: "nKJd82JHsa91KsPqwe12"
 *                 firebase:
 *                   type: object
 *                   properties:
 *                     idToken:
 *                       type: string
 *                       example: "eyJhbGciOiJSUzI1NiIsImtpZCI6Ij..."
 *                     refreshToken:
 *                       type: string
 *                       example: "AOEOulb..."
 *                     expiresIn:
 *                       type: string
 *                       example: "3600"
 *                     localId:
 *                       type: string
 *                       example: "nKJd82JHsa91KsPqwe12"
 *       400:
 *         description: Faltan email o password
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "email y contraseña son obligatorios"
 *       401:
 *         description: Credenciales inválidas en validación local o Firebase
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Credenciales inválidas (local)"
 *                 error:
 *                   nullable: true
 *                   description: Error devuelto por Firebase cuando corresponde.
 *                   oneOf:
 *                     - type: object
 *                     - type: string
 *             examples:
 *               localInvalido:
 *                 summary: Usuario inexistente o contraseña local incorrecta
 *                 value:
 *                   message: "Credenciales inválidas (local)"
 *               firebaseInvalido:
 *                 summary: Error devuelto por Firebase
 *                 value:
 *                   message: "Credenciales inválidas (firebase)"
 *                   error:
 *                     error:
 *                       message: "INVALID_LOGIN_CREDENTIALS"
 *       403:
 *         description: Usuario inactivo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Usuario inactivo"
 *       409:
 *         description: Inconsistencia entre el firebaseUID local y el devuelto por Firebase
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Inconsistencia de firebaseUID entre DB local y Firebase"
 *                 details:
 *                   type: object
 *                   properties:
 *                     localFirebaseUID:
 *                       type: string
 *                       example: "uid_local_123"
 *                     firebaseLocalId:
 *                       type: string
 *                       example: "uid_firebase_456"
 *       500:
 *         description: Error interno, falta configuración de Firebase o falla al registrar la sesión
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error durante el inicio de sesión"
 *                 error:
 *                   oneOf:
 *                     - type: string
 *                     - type: object
 *             examples:
 *               apiKeyFaltante:
 *                 summary: Firebase no configurado
 *                 value:
 *                   message: "FIREBASE_API_KEY no está configurada"
 *               falloRegistroSesion:
 *                 summary: Error registrando session_logs
 *                 value:
 *                   message: "Login correcto, pero falló el registro de la sesión"
 *                   error: "Database connection error"
 *               errorInterno:
 *                 summary: Error interno general
 *                 value:
 *                   message: "Error durante el inicio de sesión"
 *                   error: "Internal server error"
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
  controllers.logoutFirebase,
);

export default AuthRoutes;
