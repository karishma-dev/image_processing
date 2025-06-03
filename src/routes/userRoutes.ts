import { Router } from "express";
import {
	editUser,
	deleteUser,
	getUserById,
	getUsers,
} from "../controllers/userControllers";
import * as userValidator from "../validators/userValidator";
import { validateRequest } from "../middleware/validateRequest";

const router = Router();

router.put(
	"/edit/:id",
	validateRequest(userValidator.updateUserProfileSchema),
	editUser
);
router.get("/:id", validateRequest(userValidator.userByIdSchema), getUserById);
router.delete(
	"/:id",
	validateRequest(userValidator.userByIdSchema),
	deleteUser
);
router.get("/", getUsers);

export default router;
