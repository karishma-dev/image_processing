import { Router } from "express";
import {
	register,
	verifyEmail,
	login,
	forgotPassword,
	resetPassword,
	logout,
	changePassword,
} from "../controllers/authControllers";
import { validateRequest } from "../middleware/validateRequest";
import * as authValidators from "../validators/authValidator";

const router = Router();

router.post(
	"/register",
	validateRequest(authValidators.registerSchema),
	register
);
router.post(
	"/verify-email",
	validateRequest(authValidators.verifyEmailSchema),
	verifyEmail
);
router.post("/login", validateRequest(authValidators.loginSchema), login);
router.post(
	"/forgot-password",
	validateRequest(authValidators.forgotPasswordSchema),
	forgotPassword
);
router.post(
	"/reset-password",
	validateRequest(authValidators.resetPasswordSchema),
	resetPassword
);
router.post("/logout", validateRequest(authValidators.logoutSchema), logout);
router.post(
	"/change-password",
	validateRequest(authValidators.changePasswordSchema),
	changePassword
);

export default router;
