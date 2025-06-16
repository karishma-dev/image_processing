import { Router } from "express";
import {
	editUser,
	deleteUser,
	getUserById,
	getUsers,
} from "../controllers/userControllers";
import * as userValidator from "../validators/userValidator";
import { validateRequest } from "../middleware/validateRequest";
import { authenticateUser } from "../middleware/authentication";

const router = Router();

router.put(
	"/edit/:id",
	authenticateUser,
	validateRequest(userValidator.updateUserProfileSchema),
	editUser
);
router.get(
	"/:id",
	authenticateUser,
	validateRequest(userValidator.userByIdSchema),
	getUserById
);
router.delete(
	"/:id",
	authenticateUser,
	validateRequest(userValidator.userByIdSchema),
	deleteUser
);
// router.get("/", getUsers);

export default router;
