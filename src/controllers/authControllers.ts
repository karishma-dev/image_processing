import { Request, Response } from "express";
import {
	ChangePasswordInput,
	ForgotPasswordInput,
	LoginInput,
	LogoutInput,
	RegisterInput,
	ResetPasswordInput,
	VerifyEmailInput,
} from "../validators/authValidator";
import prisma from "../utils/client";
import crypto from "crypto";
import { comparePassword, hashPassword } from "../utils/password";
import { attachCookiesToResponse, createTokenUser } from "../utils/jwt";
import sendVerificationEmail from "../utils/sendVerificationEmail";
import sendResetPasswordEmail from "../utils/sendResetPasswordEmail";
import * as CustomError from "../errors";
import { StatusCodes } from "http-status-codes";

export const register = async (req: Request, res: Response) => {
	const { name, email, password, occupation } = req.body as RegisterInput;

	const existingUser = await prisma.user.findUnique({
		where: {
			email,
		},
	});

	if (existingUser) {
		throw new CustomError.BadRequest("User with this email already exists");
	}

	const verificationToken = crypto.randomBytes(32).toString("hex");
	const verificationTokenExpiry = new Date();
	verificationTokenExpiry.setHours(verificationTokenExpiry.getHours() + 1); // Token valid for 1 hour

	const hashedPassword = await hashPassword(password);

	if (!hashedPassword) {
		throw new CustomError.InternalServerError("Error hashing password");
	}

	const user = await prisma.user.create({
		data: {
			name,
			email,
			password: hashedPassword,
			occupation,
			verificationToken,
			verificationTokenExpiresAt: verificationTokenExpiry,
		},
	});

	await sendVerificationEmail(email, verificationToken);

	res.status(StatusCodes.CREATED).json({
		status: "success",
		message: "Registration successful",
		data: {
			user,
		},
	});
	return;
};

export const verifyEmail = async (req: Request, res: Response) => {
	const { token } = req.body as VerifyEmailInput;

	const user = await prisma.user.findUnique({
		where: {
			verificationToken: token,
		},
	});

	if (!user) {
		throw new CustomError.BadRequest("Invalid or expired verification token");
	}

	const currentTime = new Date();
	if (
		user.verificationTokenExpiresAt &&
		user.verificationTokenExpiresAt < currentTime
	) {
		throw new CustomError.BadRequest("Verification token has expired");
	}
	if (user.isVerified) {
		throw new CustomError.BadRequest("Email is already verified");
	}

	user.isVerified = true;
	user.verificationToken = null;
	user.verificationTokenExpiresAt = null;
	await prisma.user.update({
		where: {
			id: user.id,
		},
		data: {
			isVerified: user.isVerified,
			verificationToken: user.verificationToken,
			verificationTokenExpiresAt: user.verificationTokenExpiresAt,
		},
	});

	res.status(StatusCodes.OK).json({
		status: "success",
		message: "Email verification successful",
		data: {
			user,
		},
	});
	return;
};

export const login = async (req: Request, res: Response) => {
	const { email, password } = req.body as LoginInput;

	const user = await prisma.user.findUnique({
		where: {
			email,
		},
	});
	if (!user) {
		throw new CustomError.BadRequest("Invalid email or password");
	}
	if (!user.isVerified) {
		throw new CustomError.BadRequest(
			"Please verify your email before logging in"
		);
	}
	const isPasswordValid = await comparePassword(password, user.password);
	if (!isPasswordValid) {
		throw new CustomError.BadRequest("Invalid email or password");
	}

	const tokenUser = createTokenUser(user);

	let refreshToken = "";

	const existingToken = await prisma.token.findFirst({
		where: {
			userId: user.id,
		},
	});

	if (existingToken) {
		const { isValid } = existingToken;

		if (!isValid) {
			throw new CustomError.UnauthenticatedError(
				"Invalid refresh token, please login again"
			);
		}

		refreshToken = existingToken.refreshToken;
		attachCookiesToResponse(res, tokenUser, refreshToken);
		res.status(StatusCodes.OK).json({
			status: "success",
			message: "Login successful",
			data: {
				user,
			},
		});
		return;
	}

	refreshToken = crypto.randomBytes(40).toString("hex");
	await prisma.token.create({
		data: {
			userId: user.id,
			refreshToken,
			isValid: true,
		},
	});

	attachCookiesToResponse(res, tokenUser, refreshToken);

	res.status(StatusCodes.OK).json({
		status: "success",
		message: "Login successful",
		data: {
			user,
		},
	});
	return;
};

export const logout = async (req: Request, res: Response) => {
	const { id } = req.body as LogoutInput;

	await prisma.token.deleteMany({
		where: {
			userId: id,
		},
	});

	res.cookie("accessToken", "", {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		signed: true,
		expires: new Date(Date.now() - 1000), // Set to past date to expire the cookie
		maxAge: 0,
	});
	res.cookie("refreshToken", "", {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		signed: true,
		expires: new Date(Date.now() - 1000), // Set to past date to expire the cookie
		maxAge: 0,
	});

	res.status(StatusCodes.OK).json({
		message: "Logout successful",
	});
	return;
};

export const forgotPassword = async (req: Request, res: Response) => {
	const { email } = req.body as ForgotPasswordInput;

	const user = await prisma.user.findUnique({
		where: {
			email,
		},
	});

	if (!user) {
		throw new CustomError.NotFoundError("User with this email does not exist");
	}

	const resetToken = crypto.randomBytes(32).toString("hex");
	const resetTokenExpiry = new Date();
	resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 1); // Token valid for 1 hour

	await prisma.user.update({
		where: {
			id: user.id,
		},
		data: {
			passwordToken: resetToken,
			passwordTokenExpiresAt: resetTokenExpiry,
		},
	});

	await sendResetPasswordEmail(user.name, email, resetToken);

	res.status(StatusCodes.OK).json({
		status: "success",
		message: "Password reset email sent successfully",
	});
};

export const resetPassword = async (req: Request, res: Response) => {
	const { token, password } = req.body as ResetPasswordInput;

	const user = await prisma.user.findUnique({
		where: {
			passwordToken: token,
		},
	});

	if (!user) {
		throw new CustomError.BadRequest("Invalid or expired password reset token");
	}

	const currentTime = new Date();
	if (
		user.passwordTokenExpiresAt &&
		user.passwordTokenExpiresAt < currentTime
	) {
		throw new CustomError.BadRequest("Password reset token has expired");
	}

	const hashedPassword = await hashPassword(password);
	if (!hashedPassword) {
		throw new CustomError.InternalServerError("Error hashing password");
	}

	await prisma.user.update({
		where: {
			id: user.id,
		},
		data: {
			password: hashedPassword,
			passwordToken: null,
			passwordTokenExpiresAt: null,
		},
	});

	res.status(StatusCodes.OK).json({
		status: "success",
		message: "Password reset successful",
	});
	return;
};

export const changePassword = async (req: Request, res: Response) => {
	const { id, currentPassword, newPassword } = req.body as ChangePasswordInput;

	const user = await prisma.user.findUnique({
		where: {
			id,
		},
	});

	if (!user) {
		throw new CustomError.NotFoundError("User not found");
	}

	const isCurrentPasswordValid = await comparePassword(
		currentPassword,
		user.password
	);

	if (!isCurrentPasswordValid) {
		throw new CustomError.BadRequest("Current password is incorrect");
	}

	const hashedNewPassword = await hashPassword(newPassword);
	if (!hashedNewPassword) {
		throw new CustomError.InternalServerError("Error hashing new password");
	}

	await prisma.user.update({
		where: {
			id: user.id,
		},
		data: {
			password: hashedNewPassword,
		},
	});

	res.status(StatusCodes.OK).json({
		status: "success",
		message: "Password changed successfully",
	});
	return;
};
