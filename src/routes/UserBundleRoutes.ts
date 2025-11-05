import { Router } from "express";
import validationMiddleware from "../middleware/ValidatorMiddleware";
import { createUserBundleValidationSchema } from "../validators/UserBundleValidation";
import controllers from "../controllers/UserBundleController";
import { attachLocalUser, authenticateFirebase } from "../middleware/AuthMiddleware";

const router = Router();

router.post("/create", authenticateFirebase, attachLocalUser, validationMiddleware(createUserBundleValidationSchema), controllers.createUserBundleController);
router.get("/roles", authenticateFirebase, attachLocalUser, controllers.getRoles);
router.get("/users", authenticateFirebase, attachLocalUser, controllers.getAllUsersWithInfo);

export default router;
