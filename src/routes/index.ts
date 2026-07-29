import { Router } from "express";

import { attachLocalUser, authenticateFirebase, requireRole } from "../middleware/AuthMiddleware";

import AuthRoutes from "./AuthRoutes";
import EmployeeRoutes from "./EmployeeRoutes";
import FoodRestrictionLinkRoutes from "./FoodRestrictionLinkRoutes";
import FoodRestrictionRoutes from "./FoodRestrictionRoutes";
import FoodRoutes from "./FoodRoutes";
import FoodTypeRoutes from "./FoodTypeRoutes";
import LiquidationRoutes from "./LiquidationRoutes";
import MenuRoutes from "./MenuRoutes";
import MetricsRoutes from "./MetricsRoutes";
import PersonRoutes from "./PersonRoutes";
import PriceHistoryRoutes from "./PriceHistoryRoutes";
import ReservationRoutes from "./ReservationRoutes";
import RoleRoutes from "./RoleRoutes";
import SeasonRoutes from "./SeasonRoutes";
import SessionLogRoutes from "./SessionLogRoutes";
import UserBundleRoutes from "./UserBundleRoutes";
import UserRoleRoutes from "./UserRoleRoutes";
import UserRoutes from "./UserRoutes";
import WeeklyPlanningFoodRoutes from "./WeeklyPlanningFoodRoutes";
import WeeklyPlanningRoutes from "./WeeklyPlanningRoutes";

const router = Router();
const protectedRoute = [authenticateFirebase, attachLocalUser] as const;
const adminRoute = [...protectedRoute, requireRole("Administrador")] as const;

// Rutas públicas
router.use("/auth", AuthRoutes);

// Rutas protegidas
router.use("/employees", ...adminRoute, EmployeeRoutes);
router.use("/food-restriction-links", ...adminRoute, FoodRestrictionLinkRoutes);
router.use("/food-restrictions", ...adminRoute, FoodRestrictionRoutes);
router.use("/food-types", ...protectedRoute, FoodTypeRoutes);
router.use("/foods", ...protectedRoute, FoodRoutes);
router.use("/liquidations", ...adminRoute, LiquidationRoutes);
router.use("/menu", ...protectedRoute, MenuRoutes);
router.use("/metrics", ...adminRoute, MetricsRoutes);
router.use("/persons", ...adminRoute, PersonRoutes);
router.use("/price-history", ...adminRoute, PriceHistoryRoutes);
router.use("/reservations", ...adminRoute, ReservationRoutes);
router.use("/roles", ...adminRoute, RoleRoutes);
router.use("/seasons", ...adminRoute, SeasonRoutes);
router.use("/session-logs", ...adminRoute, SessionLogRoutes);
router.use("/user-bundle", ...adminRoute, UserBundleRoutes);
router.use("/user-roles", ...adminRoute, UserRoleRoutes);
router.use("/users", ...adminRoute, UserRoutes);
router.use("/weekly-planning-foods", ...adminRoute, WeeklyPlanningFoodRoutes);
router.use("/weekly-plannings", ...adminRoute, WeeklyPlanningRoutes);


export default router;
