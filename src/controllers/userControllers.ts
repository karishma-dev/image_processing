import { Request, Response } from "express";
import {
	UpdateUserProfileInput,
	UserByIdInput,
} from "../validators/userValidator";
import prisma from "../utils/client";
import { StatusCodes } from "http-status-codes";
import * as CustomError from "../errors";
import { cacheOrFetch, deleteMultipleKeys, redis } from "../utils/redisCache";

export const editUser = async (req: Request, res: Response) => {
	const { id, name, email, occupation } = req.body as UpdateUserProfileInput;

	const user = await prisma.user.update({
		where: { id },
		data: {
			name,
			email,
			occupation,
		},
	});

	if (!user) {
		throw new CustomError.NotFoundError("User not found");
	}

	await redis.del(`users:${id}`);
	await deleteMultipleKeys(`users:*`);

	res.status(StatusCodes.OK).json({
		message: "User profile updated successfully",
		data: {
			user,
		},
	});
	return;
};

export const getUserById = async (req: Request, res: Response) => {
	const { id } = req.params as UserByIdInput;

	const user = await prisma.user.findUnique({
		where: { id },
	});
	if (!user) {
		throw new CustomError.NotFoundError("User not found");
	}

	res.status(StatusCodes.OK).json({
		message: "User retrieved successfully",
		data: {
			user,
		},
	});
	return;
};

export const deleteUser = async (req: Request, res: Response) => {
	const { id } = req.params as UserByIdInput;

	const user = await prisma.user.delete({
		where: { id },
	});

	if (!user) {
		throw new CustomError.NotFoundError("User not found");
	}

	await redis.del(`users:${id}`);
	await deleteMultipleKeys(`users:*`);

	res.status(StatusCodes.OK).json({
		message: "User deleted successfully",
	});
	return;
};

export const getUsers = async (req: Request, res: Response) => {
	const { email, name, occupation } = req.body;
	const cacheKey = `users:${email}:${name}:${occupation}`;

	const users = await cacheOrFetch(cacheKey, async () => {
		return await prisma.user.findMany({
			select: {
				id: true,
				name: true,
				email: true,
				occupation: true,
			},
		});
	});

	res.status(StatusCodes.OK).json({
		message: "Users retrieved successfully",
		data: {
			users,
		},
	});
	return;
};
