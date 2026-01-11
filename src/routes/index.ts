/**
 * @fileoverview Main API router configuration for ReservApp backend.
 * Defines all application routes and applies authentication middleware to protected endpoints.
 *
 * @module routes/index
 *
 * @description
 * - Public routes: Authentication endpoints (login, register)
 * - Protected routes: All other endpoints require Firebase authentication and local user attachment
 *
 * @route {Router} /auth - Authentication routes (public)
 * @route {Router} /users - User management routes (protected)
 * @route {Router} /persons - Person management routes (protected)
 * @route {Router} /employees - Employee management routes (protected)
 * @route {Router} /user-bundle - User bundle routes (protected)
 * @route {Router} /foods - Food management routes (protected)
 * @route {Router} /food-types - Food type management routes (protected)
 * @route {Router} /seasons - Season management routes (protected)
 * @route {Router} /food-restrictions - Food restriction management routes (protected)
 *   Endpoints for CRUD operations on food restrictions
 * @route {Router} /food-restriction-links - Food restriction link management routes (protected)
 *   Endpoints for managing relationships between food items and food restrictions
 *
 * @middleware {Function} authenticateFirebase - Validates Firebase authentication token
 * @middleware {Function} attachLocalUser - Attaches authenticated user to request object
 *
 * @example
 * // Protected endpoint requires both middleware
 * // GET /foods/:id
 * // Headers: { Authorization: "Bearer <firebase-token>" }
 */
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
router.use(
  "/user-bundle",
  authenticateFirebase,
  attachLocalUser,
  UserBundleRoutes
);
router.use("/foods", authenticateFirebase, attachLocalUser, FoodRoutes);
router.use(
  "/food-types",
  authenticateFirebase,
  attachLocalUser,
  FoodTypeRoutes
);
router.use("/seasons", authenticateFirebase, attachLocalUser, SeasonRoutes);
router.use(
  "/food-restrictions",
  authenticateFirebase,
  attachLocalUser,
  FoodRestrictionRoutes
);
router.use(
  "/food-restriction-links",
  authenticateFirebase,
  attachLocalUser,
  FoodRestrictionLinkRoutes
);

export default router;
