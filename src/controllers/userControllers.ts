import { Request, Response } from "express";
import {
	UpdateUserProfileInput,
	UserByIdInput,
} from "../validators/userValidator";
import prisma from "../utils/client";

export const editUser = async (req: Request, res: Response) => {
	const { id, name, email, occupation, bio } =
		req.body as UpdateUserProfileInput;

	const user = await prisma.user.update({
		where: { id },
		data: {
			name,
			email,
			occupation,
			bio,
		},
	});

	if (!user) {
		res.status(404).json({
			message: "User not found",
		});
		return;
	}

	res.status(200).json({
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
		res.status(404).json({
			message: "User not found",
		});
		return;
	}

	res.status(200).json({
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
		res.status(404).json({
			message: "User not found",
		});
		return;
	}

	res.status(200).json({
		message: "User deleted successfully",
	});
	return;
};

export const getUsers = async (req: Request, res: Response) => {
	const users = await prisma.user.findMany({
		select: {
			id: true,
			name: true,
			email: true,
			occupation: true,
			bio: true,
		},
	});

	res.status(200).json({
		message: "Users retrieved successfully",
		data: {
			users,
		},
	});
	return;
};
