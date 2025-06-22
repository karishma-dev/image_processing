import { Router } from "express";
import {
	adjustBrightness,
	adjustContrast,
	blurImage,
	changeImageFormat,
	compressImage,
	createThumbnail,
	cropImage,
	deleteImageById,
	flipImage,
	getAllImages,
	getImageById,
	grayscaleImage,
	invertImage,
	mirrorImage,
	resizeImage,
	rotateImage,
	sharpenImage,
	uploadImage,
	watermarkImage,
} from "../controllers/imageControllers";
import { uploadSingleImage } from "../middleware/uploadImages";
import { authenticateUser } from "../middleware/authentication";

const routes = Router();

routes.get("/", authenticateUser, getAllImages);

routes.post("/upload", authenticateUser, uploadSingleImage, uploadImage);

routes.post("/resize", authenticateUser, resizeImage);

// routes.post("/crop", authenticateUser, cropImage);

routes.post("/rotate", authenticateUser, rotateImage);

routes.post("/watermark", authenticateUser, uploadSingleImage, watermarkImage);
routes.post("/flip", authenticateUser, flipImage);
routes.post("/mirror", authenticateUser, mirrorImage);
routes.post("/grayscale", authenticateUser, grayscaleImage);
routes.post("/invert", authenticateUser, invertImage);
routes.post("/brightness", authenticateUser, adjustBrightness);
routes.post("/contrast", authenticateUser, adjustContrast);
routes.post("/sharpen", authenticateUser, sharpenImage);
routes.post("/blur", authenticateUser, blurImage);
routes.post("/thumbnail", authenticateUser, createThumbnail);
routes.post("/compress", authenticateUser, compressImage);
routes.post("/changeFormat", authenticateUser, changeImageFormat);

routes
	.route("/:id")
	.get(authenticateUser, getImageById)
	.put(authenticateUser, uploadImage)
	.delete(authenticateUser, deleteImageById);

export default routes;
