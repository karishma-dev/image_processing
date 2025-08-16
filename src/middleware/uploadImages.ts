/*
	Why do we need to upload images to local directory first?
	- The S3 upload requires a file stream, which is easier to handle with multer's
	  disk storage.
	- We can use sharp to read the image metadata before uploading.
*/
import multer from "multer";

export const uploadSingleImage = multer({
	limits: { fileSize: 10 * 1024 * 1024 },
	dest: "uploads/",
}).single("file");

export const uploadMultipleImages = multer({
	limits: { fileSize: 10 * 1024 * 1024 },
	dest: "uploads/",
}).fields([
	{
		name: "file",
		maxCount: 1,
	},
	{
		name: "watermarkImage",
		maxCount: 1,
	},
]);
