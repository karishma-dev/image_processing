import { Request, Response } from "express";
import prisma from "../utils/client";
import { StatusCodes } from "http-status-codes";
import * as CustomError from "../errors";
import sharp from "sharp";
import { resizeImageService } from "../services/sharp/resize";
import { rotateImageService } from "../services/sharp/rotate";
import { flipImageService } from "../services/sharp/flip";
import { mirrorImageService } from "../services/sharp/mirror";
import { changeImageFormatService } from "../services/sharp/changeFormat";

interface CustomRequest extends Request {
	user?: { id: string };
}

export const getAllImages = async (req: CustomRequest, res: Response) => {
	if (!req.user) {
		throw new CustomError.UnauthenticatedError("Please login.");
	}

	const images = await prisma.image.findMany({
		where: {
			userId: req.user?.id,
		},
		orderBy: {
			createdAt: "desc",
		},
	});

	if (!images || images.length === 0) {
		throw new CustomError.NotFoundError("No images found");
	}

	res.status(StatusCodes.OK).json({
		status: "success",
		data: {
			images,
		},
	});
	return;
};

export const uploadImage = async (req: CustomRequest, res: Response) => {
	const { file } = req;
	if (!file) {
		throw new CustomError.BadRequest("No file uploaded");
	}

	if (!req.user) {
		throw new CustomError.UnauthenticatedError("Please login.");
	}

	const metadata = await sharp(file.path).metadata();

	const image = await prisma.image.create({
		data: {
			userId: req.user?.id,
			url: file.path,
			size: file.size,
			originalImageUrl: file.originalname,
			width: metadata.width,
			height: metadata.height,
		},
	});

	res.status(StatusCodes.CREATED).json({
		status: "success",
		data: {
			image,
		},
	});
	return;
};

export const resizeImage = async (req: Request, res: Response) => {
	const { id, width, height } = req.body;

	const image = await prisma.image.findUnique({
		where: {
			id,
		},
	});

	if (!image) {
		throw new CustomError.NotFoundError("Image not found!");
	}

	const inputPath = image.url;
	const outputPath = `uploads/modified-${image.id}.jpg`;

	const { success, message } = await resizeImageService(
		inputPath,
		outputPath,
		width,
		height
	);

	if (success) {
		const updatedImage = await prisma.image.update({
			where: {
				id,
			},
			data: {
				url: outputPath,
				width,
				height,
			},
		});

		res.status(StatusCodes.OK).json({
			status: "success",
			data: {
				image: updatedImage,
			},
		});
		return;
	} else {
		throw new CustomError.InternalServerError(message);
	}
};

export const rotateImage = async (req: Request, res: Response) => {
	const { id, degree } = req.body;

	const image = await prisma.image.findUnique({
		where: {
			id,
		},
	});

	if (!image) {
		throw new CustomError.NotFoundError("Image not found!");
	}

	const inputPath = image.url;
	const outputPath = `uploads/modified-${image.id}.jpg`;

	const { success, message } = await rotateImageService(
		inputPath,
		outputPath,
		degree
	);
	if (success) {
		const updatedImage = await prisma.image.update({
			where: {
				id,
			},
			data: {
				url: outputPath,
			},
		});
		res.status(StatusCodes.OK).json({
			status: "success",
			data: {
				image: updatedImage,
			},
		});
		return;
	} else {
		throw new CustomError.InternalServerError(message);
	}
};

export const watermarkImage = async (req: Request, res: Response) => {
	// const files = req.files as
	// 	| {
	// 			[fieldName: string]: Express.Multer.File[];
	// 	  }
	// 	| undefined;
};

export const flipImage = async (req: Request, res: Response) => {
	const { id } = req.body;

	const image = await prisma.image.findUnique({
		where: {
			id,
		},
	});

	if (!image) {
		throw new CustomError.NotFoundError("Image not found!");
	}

	const inputPath = image.url;
	const outputPath = `uploads/modified-${image.id}.jpg`;

	const { success, message } = await flipImageService(inputPath, outputPath);
	if (success) {
		const updatedImage = await prisma.image.update({
			where: {
				id,
			},
			data: {
				url: outputPath,
			},
		});
		res.status(StatusCodes.OK).json({
			status: "success",
			data: {
				image: updatedImage,
			},
		});
		return;
	} else {
		throw new CustomError.InternalServerError(message);
	}
};

export const mirrorImage = async (req: Request, res: Response) => {
	const { id } = req.body;

	const image = await prisma.image.findUnique({
		where: {
			id,
		},
	});

	if (!image) {
		throw new CustomError.NotFoundError("Image not found!");
	}

	const inputPath = image.url;
	const outputPath = `uploads/modified-${image.id}.jpg`;

	const { success, message } = await mirrorImageService(inputPath, outputPath);
	if (success) {
		const updatedImage = await prisma.image.update({
			where: {
				id,
			},
			data: {
				url: outputPath,
			},
		});
		res.status(StatusCodes.OK).json({
			status: "success",
			data: {
				image: updatedImage,
			},
		});
		return;
	} else {
		throw new CustomError.InternalServerError(message);
	}
};

export const grayscaleImage = async (req: Request, res: Response) => {
	try {
		// Logic to convert an image to grayscale
		res
			.status(200)
			.json({ message: "Image converted to grayscale successfully" });
	} catch (error) {
		res.status(500).json({ error: "Failed to convert image to grayscale" });
	}
};
export const invertImage = async (req: Request, res: Response) => {
	try {
		// Logic to invert the colors of an image
		res.status(200).json({ message: "Image colors inverted successfully" });
	} catch (error) {
		res.status(500).json({ error: "Failed to invert image colors" });
	}
};
export const adjustBrightness = async (req: Request, res: Response) => {
	try {
		// Logic to adjust the brightness of an image
		res.status(200).json({ message: "Image brightness adjusted successfully" });
	} catch (error) {
		res.status(500).json({ error: "Failed to adjust image brightness" });
	}
};
export const adjustContrast = async (req: Request, res: Response) => {
	try {
		// Logic to adjust the contrast of an image
		res.status(200).json({ message: "Image contrast adjusted successfully" });
	} catch (error) {
		res.status(500).json({ error: "Failed to adjust image contrast" });
	}
};
export const sharpenImage = async (req: Request, res: Response) => {
	try {
		// Logic to sharpen an image
		res.status(200).json({ message: "Image sharpened successfully" });
	} catch (error) {
		res.status(500).json({ error: "Failed to sharpen image" });
	}
};
export const blurImage = async (req: Request, res: Response) => {
	try {
		// Logic to blur an image
		res.status(200).json({ message: "Image blurred successfully" });
	} catch (error) {
		res.status(500).json({ error: "Failed to blur image" });
	}
};
export const createThumbnail = async (req: Request, res: Response) => {
	try {
		// Logic to create a thumbnail of an image
		res.status(200).json({ message: "Thumbnail created successfully" });
	} catch (error) {
		res.status(500).json({ error: "Failed to create thumbnail" });
	}
};
export const compressImage = async (req: Request, res: Response) => {
	try {
		// Logic to compress an image
		res.status(200).json({ message: "Image compressed successfully" });
	} catch (error) {
		res.status(500).json({ error: "Failed to compress image" });
	}
};

export const changeImageFormat = async (req: Request, res: Response) => {
	const { id, desiredFormat } = req.body;

	const image = await prisma.image.findUnique({
		where: {
			id,
		},
	});

	if (!image) {
		throw new CustomError.NotFoundError("Image not found!");
	}

	const inputPath = image.url;
	const outputPath = `uploads/modified-${image.id}.jpg`;

	const { success, message } = await changeImageFormatService(
		inputPath,
		outputPath,
		desiredFormat
	);

	if (success) {
		const updatedImage = await prisma.image.update({
			where: {
				id,
			},
			data: {
				url: outputPath,
			},
		});

		res.status(StatusCodes.OK).json({
			status: "success",
			data: {
				image: updatedImage,
			},
		});
		return;
	} else {
		throw new CustomError.InternalServerError(message);
	}
};

export const getImageById = async (req: Request, res: Response) => {
	const { id } = req.params;
	const image = await prisma.image.findUnique({
		where: {
			id,
		},
	});
	if (!image) {
		throw new CustomError.NotFoundError("Image not found!");
	}
	res.status(StatusCodes.OK).json({
		status: "success",
		data: {
			image,
		},
	});
	return;
};

export const deleteImageById = async (req: Request, res: Response) => {
	const { id } = req.params;

	const image = await prisma.image.delete({
		where: {
			id,
		},
	});

	if (!image) {
		throw new CustomError.NotFoundError("Image not found!");
	}
	res.status(StatusCodes.OK).json({
		status: "success",
		data: {
			message: "Image Deleted successfully",
		},
	});
	return;
};

export const cropImage = async (req: Request, res: Response) => {
	try {
		// Logic to crop an image
		res.status(200).json({ message: "Image cropped successfully" });
	} catch (error) {
		res.status(500).json({ error: "Failed to crop image" });
	}
};
