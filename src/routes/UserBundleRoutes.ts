import { Router } from "express";
import validationMiddleware from "../middleware/ValidatorMiddleware";
import { createUserBundleValidationSchema } from "../validators/UserBundleValidation";
import controllers from "../controllers/UserBundleController";
import { attachLocalUser, authenticateFirebase } from "../middleware/AuthMiddleware";

const router = Router();

/**
 * CREAR UserBundle
 * POST /user-bundle
 */
router.post(
  "/",
  validationMiddleware(createUserBundleValidationSchema),
  controllers.createUserBundleController
);

/**
 * ACTUALIZAR UserBundle
 * PUT /user-bundle/:id
 */
router.put(
  "/:id",
  authenticateFirebase,
  attachLocalUser,
  // TODO: añadir validationMiddleware(updateUserBundleValidationSchema) cuando lo tengas
  controllers.updateUserBundleController
);

/**
 * ELIMINAR UserBundle
 * DELETE /user-bundle/:id
 */
router.delete(
  "/:id",
  authenticateFirebase,
  attachLocalUser,
  controllers.deleteUserBundleController
);

export default router;
