import express from "express";
import UserBundleController from "../controllers/UserBundleController";
import controllers from "../controllers/UserController"; // Solo login/logout
import validationMiddleware from "../middleware/ValidatorMiddleware";
import { authenticateFirebase, attachLocalUser } from "../middleware/AuthMiddleware";
import { 
    createUserBundleValidationSchema, 
} from "../validators/UserBundleValidation"; 
// 👆 OJO: ahora usa el schema del bundle

const AuthRoutes = express.Router();

/* ===========================================================
   AUTH (PÚBLICAS)
   =========================================================== */

/**
 * POST /auth/login
 * Login híbrido (LOCAL + Firebase)
 */
AuthRoutes.post(
    "/login",
    controllers.loginLocalFirebase
);

/**
 * POST /auth/logout
 * Requiere estar autenticado
 */
AuthRoutes.post(
    "/logout",
    authenticateFirebase,
    attachLocalUser,
    controllers.logoutFirebase
);

/**
 * POST /auth/register
 * Crea:
 *  - usuario en Firebase
 *  - usuario en DB
 *  - persona
 *  - empleado
 */
AuthRoutes.post(
    "/register",
    validationMiddleware(createUserBundleValidationSchema),
    UserBundleController.createUserBundleController
);

export default AuthRoutes;
