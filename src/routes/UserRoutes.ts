import express from "express";
import controllers from "../controllers/UserController";
import { authenticateFirebase } from "../middleware/AuthMiddleware";
import validationMiddleware from "../middleware/ValidatorMiddleware";
import {
  createUserValidationSchema,
  updateUserValidationSchema,
  softDeleteValidationSchema,
  loginValidationSchema,
} from "../validators/UserValidation";

const UserRoutes = express.Router();

// AUTH (públicas)
UserRoutes.post("/login", validationMiddleware(loginValidationSchema), controllers.loginLocalFirebase);
UserRoutes.post("/logout", controllers.logoutFirebase);
UserRoutes.post("/register", validationMiddleware(createUserValidationSchema), controllers.createUser);

// CRUD (protegidas con Firebase)
UserRoutes.post("/", authenticateFirebase, validationMiddleware(createUserValidationSchema), controllers.createUser);
UserRoutes.get("/", authenticateFirebase, controllers.getAllUsers);
UserRoutes.get("/:id", authenticateFirebase, controllers.getUserById);
UserRoutes.patch("/:id", authenticateFirebase, validationMiddleware(updateUserValidationSchema), controllers.updateUser);
UserRoutes.patch("/:id/activo", authenticateFirebase, validationMiddleware(softDeleteValidationSchema), controllers.softDeleteUser);
UserRoutes.delete("/hard/:id", authenticateFirebase, controllers.hardDeleteUser);

export default UserRoutes;
