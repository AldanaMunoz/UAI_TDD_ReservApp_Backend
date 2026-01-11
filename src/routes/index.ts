import { Router } from "express";

// Importación estática de todas las rutas
import {
  attachLocalUser,
  authenticateFirebase,
} from "../middleware/AuthMiddleware";
import UserRoutes from "./UserRoutes";
import PersonRoutes from "./PersonRoutes";
import EmployeeRoutes from "./EmployeeRoutes";
import UserBundleRoutes from "./UserBundleRoutes";
import AuthRoutes from "./AuthRoutes";
import FoodRoutes from "./FoodRoutes";
import FoodTypeRoutes from "./FoodTypeRoutes";
import SeasonRoutes from "./SeasonRoutes";
import FoodRestrictionLinkRoutes from "./FoodRestrictionLinkRoutes";
import FoodRestrictionRoutes from "./FoodRestrictionRoutes";
import RoleRoutes from "./RoleRoutes";
import PermissionRoutes from "./PermissionRoutes";
import RolePermissionRoutes from "./RolePermissionRoutes";
import UserRoleRoutes from "./UserRoleRoutes";

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
router.use("/food-restrictions", authenticateFirebase, attachLocalUser, FoodRestrictionRoutes);
router.use("/food-restriction-links", authenticateFirebase, attachLocalUser, FoodRestrictionLinkRoutes);
router.use("/roles", authenticateFirebase, attachLocalUser, RoleRoutes);
router.use("/permissions", authenticateFirebase, attachLocalUser, PermissionRoutes);
router.use("/role-permissions", authenticateFirebase, attachLocalUser, RolePermissionRoutes);
router.use("/user-roles", authenticateFirebase, attachLocalUser, UserRoleRoutes);



export default router;
