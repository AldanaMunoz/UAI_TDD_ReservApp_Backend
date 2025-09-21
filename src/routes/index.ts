import { Router } from "express";
import UserRoutes from "./UserRoutes";

const router = Router();

// Todas las rutas de usuarios y auth bajo /users
router.use("/users", UserRoutes);

export default router;
