import { Router } from "express";
import {
	confirmUpload,
	presignUpload,
	resizeImage,
	getAllImages,
	getImageById,
	deleteImageById,
	rotateImage,
	flipImage,
	mirrorImage,
	changeImageFormat,
} from "../controllers/imageControllers";
import { authenticateUser } from "../middleware/authentication";
import { validateRequest } from "../middleware/validateRequest";
import * as imageValidators from "../validators/imageValidator";

const routes = Router();

routes.get("/", authenticateUser, getAllImages);

routes.post("/presign", authenticateUser, presignUpload);
routes.post("/confirm", authenticateUser, confirmUpload);

routes.post(
	"/resize",
	authenticateUser,
	validateRequest(imageValidators.resizeImageSchema),
	resizeImage
);
routes.post("/rotate", authenticateUser, rotateImage);
routes.post("/flip", authenticateUser, flipImage);
routes.post("/mirror", authenticateUser, mirrorImage);
routes.post("/changeFormat", authenticateUser, changeImageFormat);

routes
	.route("/:id")
	.get(authenticateUser, getImageById)
	.delete(authenticateUser, deleteImageById);

export default routes;
