import express from "express";
import controllers from "../controllers/PersonController";
import { authenticateFirebase, attachLocalUser } from "../middleware/AuthMiddleware";
import validationMiddleware from "../middleware/ValidatorMiddleware";
import { createPersonValidationSchema, updatePersonValidationSchema, softDeleteValidationSchema } from "../validators/PersonValidation";

const PersonRoutes = express.Router();

/**
 * Todas las rutas están protegidas:
 *  1) authenticateFirebase  -> valida ID Token de Firebase
 *  2) attachLocalUser       -> busca usuario local por firebaseUID / email y verifica activo=1
 */

// Crear persona
PersonRoutes.post("/", authenticateFirebase, attachLocalUser, validationMiddleware(createPersonValidationSchema), controllers.createPerson);

// Listar personas
PersonRoutes.get("/", authenticateFirebase, attachLocalUser, controllers.getAllPersons);

// Obtener persona por ID
PersonRoutes.get("/:id", authenticateFirebase, attachLocalUser, controllers.getPersonById);

// Actualizar (PATCH parcial)
PersonRoutes.patch("/:id", authenticateFirebase, attachLocalUser, validationMiddleware(updatePersonValidationSchema), controllers.updatePerson);

// Soft delete / toggle activo
PersonRoutes.patch("/:id/activo", authenticateFirebase, attachLocalUser, validationMiddleware(softDeleteValidationSchema), controllers.softDeletePerson);

// Hard delete
PersonRoutes.delete("/hard/:id", authenticateFirebase, attachLocalUser, controllers.hardDeletePerson);

export default PersonRoutes;
