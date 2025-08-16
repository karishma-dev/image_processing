import { Request, Response } from "express";
import prisma from "../utils/client";
import { StatusCodes } from "http-status-codes";
import * as CustomError from "../errors";
import { CustomRequest } from "../types/common";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { HeadObjectCommand, S3Client } from "@aws-sdk/client-s3";
import {
	addResizeJob,
	allOperationsOnImageJob,
	changeImageFormatJob,
	flipImageJob,
	mirrorImageJob,
	rotateImageJob,
} from "../queues/imageQueue";
import { cacheOrFetch, deleteMultipleKeys, redis } from "../utils/redisCache";

const s3 = new S3Client({ region: process.env.AWS_REGION });

export const getAllImages = async (req: CustomRequest, res: Response) => {
	if (!req.user) {
		throw new CustomError.UnauthenticatedError("Please login.");
	}

	const { status, userId } = req.body;

	const cacheKey = `images:${userId || req.user.id}:${status || ""}`;

	const images = await cacheOrFetch(cacheKey, async () => {
		return await prisma.image.findMany({
			where: {
				userId: userId ? userId : req.user?.id,
				status,
			},
			orderBy: {
				createdAt: "desc",
			},
		});
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

export const presignUpload = async (req: CustomRequest, res: Response) => {
	if (!req.user) throw new CustomError.UnauthenticatedError("Please login.");

	const { fileName, contentType } = req.body || {};
	const ext = fileName ? path.extname(fileName) : ".jpg";
	const key = `uploads/${uuidv4()}${ext}`;

	const conditions: Array<
		["content-length-range", number, number] | ["eq", string, string]
	> = [
		["content-length-range", 0, 10 * 1024 * 1024], // 10 MB limit,
	];
	conditions.push(["eq", "$x-amz-meta-userid", req.user.id]);

	const fields: Record<string, string> = {};
	fields["x-amz-meta-userid"] = req.user.id;
	if (contentType) fields["Content-Type"] = contentType;

	const presigned = await createPresignedPost(s3, {
		Bucket: process.env.S3_BUCKET_NAME!,
		Key: key,
		Conditions: conditions,
		Fields: fields,
		Expires: 3600, // seconds
	});

	res.json({
		url: presigned.url,
		fields: presigned.fields,
		key,
	});
};

export const confirmUpload = async (req: CustomRequest, res: Response) => {
	if (!req.user) throw new CustomError.UnauthenticatedError("Please login!");

	const { key, width, height } = req.body;
	if (!key) throw new CustomError.BadRequest("Missing key");

	const head = await s3.send(
		new HeadObjectCommand({
			Bucket: process.env.S3_BUCKET_NAME!,
			Key: key,
		})
	);

	if (!head.ContentLength) {
		throw new CustomError.InternalServerError("Uploaded object missing size");
	}

	const ownerFromMeta = head.Metadata?.userId;
	if (ownerFromMeta && ownerFromMeta !== req.user.id) {
		throw new CustomError.UnauthorizedError("Upload owner mismatch");
	}

	const maxSize = 10 * 1024 * 1024;
	if (head.ContentLength > maxSize) {
		throw new CustomError.BadRequest("Uploaded file too large");
	}

	const image = await prisma.image.create({
		data: {
			userId: req.user.id,
			size: Number(head.ContentLength || 0),
			width: width || 0,
			height: height || 0,
			key: key,
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

	await addResizeJob({
		key: image.key,
		imageId: image.id,
		operationData: {
			width: width,
			height: height,
		},
		userId: image.userId,
	});
	res.status(StatusCodes.ACCEPTED).json({
		status: "accepted",
		message: "Resize job enqueued. Processing will happen in the background.",
		data: {
			imageId: id,
		},
	});
	return;
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

	await rotateImageJob({
		key: image.key,
		imageId: image.id,
		operationData: {
			degree: degree,
		},
		userId: image.userId,
	});

	res.status(StatusCodes.ACCEPTED).json({
		status: "accepted",
		message: "Rotate job enqueued. Processing will happen in the background.",
		data: {
			imageId: id,
		},
	});
	return;
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

	await flipImageJob({
		key: image.key,
		imageId: image.id,
		userId: image.userId,
	});

	res.status(StatusCodes.ACCEPTED).json({
		status: "accepted",
		message:
			"Flip Image job enqueued. Processing will happen in the background.",
		data: {
			imageId: id,
		},
	});
	return;
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

	await mirrorImageJob({
		key: image.key,
		imageId: image.id,
		userId: image.userId,
	});

	res.status(StatusCodes.ACCEPTED).json({
		status: "accepted",
		message:
			"Mirror Image job enqueued. Processing will happen in the background.",
		data: {
			imageId: id,
		},
	});
	return;
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

	await changeImageFormatJob({
		key: image.key,
		imageId: image.id,
		userId: image.userId,
		operationData: {
			desiredFormat,
		},
	});

	res.status(StatusCodes.ACCEPTED).json({
		status: "accepted",
		message:
			"Change Format Image job enqueued. Processing will happen in the background.",
		data: {
			imageId: id,
		},
	});
	return;
};

export const allOperationsOnImage = async (req: Request, res: Response) => {
	const { id, desiredFormat, width, height, degree } = req.body;

	const image = await prisma.image.findUnique({
		where: {
			id,
		},
	});

	if (!image) {
		throw new CustomError.NotFoundError("Image not found!");
	}

	await allOperationsOnImageJob({
		key: image.key,
		imageId: image.id,
		userId: image.userId,
		operationData: {
			desiredFormat,
			width,
			height,
			degree,
		},
	});

	res.status(StatusCodes.ACCEPTED).json({
		status: "accepted",
		message:
			"All Operations on Image job enqueued. Processing will happen in the background.",
		data: {
			imageId: id,
		},
	});
	return;
};

export const getImageById = async (req: Request, res: Response) => {
	const { id } = req.params;
	const cacheKey = `images:${id}`;

	const image = await cacheOrFetch(cacheKey, async () => {
		return await prisma.image.findUnique({
			where: {
				id,
			},
		});
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
	await redis.del(`images:${id}`);
	await deleteMultipleKeys(`images:${image.userId}:*`);

	res.status(StatusCodes.OK).json({
		status: "success",
		data: {
			message: "Image Deleted successfully",
		},
	});
	return;
};
