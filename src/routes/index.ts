import { Router } from "express";

import { attachLocalUser, authenticateFirebase } from "../middleware/AuthMiddleware";

import AuthRoutes from "./AuthRoutes";
import EmployeeRoutes from "./EmployeeRoutes";
import FoodRestrictionLinkRoutes from "./FoodRestrictionLinkRoutes";
import FoodRestrictionRoutes from "./FoodRestrictionRoutes";
import FoodRoutes from "./FoodRoutes";
import FoodTypeRoutes from "./FoodTypeRoutes";
import LiquidationRoutes from "./LiquidationRoutes";
import PermissionRoutes from "./PermissionRoutes";
import PersonRoutes from "./PersonRoutes";
import PriceHistoryRoutes from "./PriceHistoryRoutes";
import ReservationRoutes from "./ReservationRoutes";
import RolePermissionRoutes from "./RolePermissionRoutes";
import RoleRoutes from "./RoleRoutes";
import SeasonRoutes from "./SeasonRoutes";
import SessionLogRoutes from "./SessionLogRoutes";
import UserBundleRoutes from "./UserBundleRoutes";
import UserRoleRoutes from "./UserRoleRoutes";
import UserRoutes from "./UserRoutes";
import WeeklyPlanningFoodRoutes from "./WeeklyPlanningFoodRoutes";
import WeeklyPlanningRoutes from "./WeeklyPlanningRoutes";

const router = Router();

// Rutas públicas
router.use("/auth", AuthRoutes);

// Rutas protegidas
router.use("/employees", authenticateFirebase, attachLocalUser, EmployeeRoutes);
router.use("/food-restriction-links", authenticateFirebase, attachLocalUser, FoodRestrictionLinkRoutes);
router.use("/food-restrictions", authenticateFirebase, attachLocalUser, FoodRestrictionRoutes);
router.use("/food-types", authenticateFirebase, attachLocalUser, FoodTypeRoutes);
router.use("/foods", authenticateFirebase, attachLocalUser, FoodRoutes);
router.use("/liquidations", authenticateFirebase, attachLocalUser, LiquidationRoutes);
router.use("/permissions", authenticateFirebase, attachLocalUser, PermissionRoutes);
router.use("/persons", authenticateFirebase, attachLocalUser, PersonRoutes);
router.use("/price-history", authenticateFirebase, attachLocalUser, PriceHistoryRoutes);
router.use("/reservations", authenticateFirebase, attachLocalUser, ReservationRoutes);
router.use("/role-permissions", authenticateFirebase, attachLocalUser, RolePermissionRoutes);
router.use("/roles", authenticateFirebase, attachLocalUser, RoleRoutes);
router.use("/seasons", authenticateFirebase, attachLocalUser, SeasonRoutes);
router.use("/session-logs", authenticateFirebase, attachLocalUser, SessionLogRoutes);
router.use("/user-bundle", authenticateFirebase, attachLocalUser, UserBundleRoutes);
router.use("/user-roles", authenticateFirebase, attachLocalUser, UserRoleRoutes);
router.use("/users", authenticateFirebase, attachLocalUser, UserRoutes);
router.use("/weekly-planning-foods", authenticateFirebase, attachLocalUser, WeeklyPlanningFoodRoutes);
router.use("/weekly-plannings", authenticateFirebase, attachLocalUser, WeeklyPlanningRoutes);


export default router;
