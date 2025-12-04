import { Router } from "express";

// Importación estática de todas las rutas
import UserRoutes from "./UserRoutes";
import PersonRoutes from "./PersonRoutes";
import EmployeeRoutes from "./EmployeeRoutes";
import UserBundleRoutes from "./UserBundleRoutes";
import AuthRoutes from "./AuthRoutes";

const router = Router();

/**
 * Enrutador principal de la API
 * Cada módulo se monta en su prefijo correspondiente.
 */
router.use("/auth", AuthRoutes); // /api/auth/...
router.use("/users", UserRoutes); // /api/users/...
router.use("/persons", PersonRoutes); // /api/persons/...
router.use("/employees", EmployeeRoutes); // /api/employees/...
router.use("/user-bundle", UserBundleRoutes); // /api/user-bundle/...

export default router;
