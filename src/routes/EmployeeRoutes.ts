import express from "express";
import controllers from "../controllers/EmployeeController";
import { authenticateFirebase, attachLocalUser } from "../middleware/AuthMiddleware";
import validationMiddleware from "../middleware/ValidatorMiddleware";
import { createEmployeeValidationSchema, updateEmployeeValidationSchema } from "../validators/EmployeeValidation";

const EmployeeRoutes = express.Router();

/* ===========================================================
   CRUD (todas protegidas con auth híbrido)
   =========================================================== */

EmployeeRoutes.post("/", authenticateFirebase, attachLocalUser, validationMiddleware(createEmployeeValidationSchema), controllers.createEmployee);

EmployeeRoutes.get("/", authenticateFirebase, attachLocalUser, controllers.getAllEmployees);

EmployeeRoutes.get("/:id", authenticateFirebase, attachLocalUser, controllers.getEmployeeById);

EmployeeRoutes.get("/persona/:id_persona", authenticateFirebase, attachLocalUser, controllers.getEmployeesByPersona);

EmployeeRoutes.patch("/:id", authenticateFirebase, attachLocalUser, validationMiddleware(updateEmployeeValidationSchema), controllers.updateEmployee);

EmployeeRoutes.delete("/hard/:id", authenticateFirebase, attachLocalUser, controllers.hardDeleteEmployee);

export default EmployeeRoutes;
