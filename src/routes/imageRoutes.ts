import { Router } from "express";
import {
	confirmUpload,
	presignUpload,
	resizeImage,
	getAllImages,
	getImageById,
	deleteImageById,
	// adjustBrightness,
	// adjustContrast,
	// blurImage,
	// changeImageFormat,
	// compressImage,
	// createThumbnail,
	// cropImage,
	// flipImage,
	// grayscaleImage,
	// invertImage,
	// mirrorImage,
	// rotateImage,
	// sharpenImage,
	// watermarkImage,
} from "../controllers/imageControllers";
import { uploadSingleImage } from "../middleware/uploadImages";
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

// routes.post("/crop", authenticateUser, cropImage);

// routes.post("/rotate", authenticateUser, rotateImage);

// routes.post("/watermark", authenticateUser, uploadSingleImage, watermarkImage);
// routes.post("/flip", authenticateUser, flipImage);
// routes.post("/mirror", authenticateUser, mirrorImage);
// routes.post("/grayscale", authenticateUser, grayscaleImage);
// routes.post("/invert", authenticateUser, invertImage);
// routes.post("/brightness", authenticateUser, adjustBrightness);
// routes.post("/contrast", authenticateUser, adjustContrast);
// routes.post("/sharpen", authenticateUser, sharpenImage);
// routes.post("/blur", authenticateUser, blurImage);
// routes.post("/thumbnail", authenticateUser, createThumbnail);
// routes.post("/compress", authenticateUser, compressImage);
// routes.post("/changeFormat", authenticateUser, changeImageFormat);

routes
	.route("/:id")
	.get(authenticateUser, getImageById)
	.delete(authenticateUser, deleteImageById);

export default routes;
