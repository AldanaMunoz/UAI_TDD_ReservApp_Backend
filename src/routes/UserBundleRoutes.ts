import { Router } from "express";
import validationMiddleware from "../middleware/ValidatorMiddleware";
import { createUserBundleValidationSchema } from "../validators/UserBundleValidation";
import controllers from "../controllers/UserBundleController";
import { attachLocalUser, authenticateFirebase } from "../middleware/AuthMiddleware";

const router = Router();

router.post("/create", authenticateFirebase, attachLocalUser, validationMiddleware(createUserBundleValidationSchema), controllers.createUserBundleController);

export default router;
