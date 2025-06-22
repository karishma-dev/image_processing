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
