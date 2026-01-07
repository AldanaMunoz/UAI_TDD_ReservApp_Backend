import { Router } from "express";

// Importación estática de todas las rutas
import { attachLocalUser, authenticateFirebase } from "../middleware/AuthMiddleware";
import UserRoutes from "./UserRoutes";
import PersonRoutes from "./PersonRoutes";
import EmployeeRoutes from "./EmployeeRoutes";
import UserBundleRoutes from "./UserBundleRoutes";
import AuthRoutes from "./AuthRoutes";
import FoodRoutes from "./FoodRoutes";
import FoodTypeRoutes from "./FoodTypeRoutes";
import SeasonRoutes from "./SeasonRoutes";

const router = Router();

// Enrutador principal de la API
router.use("/auth", AuthRoutes); // Rutas públicas: login + register

// ================================
// Rutas protegidas por Firebase
// ================================

// Todo lo que esté dentro de estos módulos requiere:
// 1) authenticateFirebase
// 2) attachLocalUser
router.use("/users", authenticateFirebase, attachLocalUser, UserRoutes);
router.use("/persons", authenticateFirebase, attachLocalUser, PersonRoutes);
router.use("/employees", authenticateFirebase, attachLocalUser, EmployeeRoutes);
router.use("/user-bundle", authenticateFirebase, attachLocalUser, UserBundleRoutes);
router.use("/foods", authenticateFirebase, attachLocalUser, FoodRoutes);
router.use("/food-types", authenticateFirebase, attachLocalUser, FoodTypeRoutes);
router.use("/seasons", authenticateFirebase, attachLocalUser, SeasonRoutes);

export default router;
