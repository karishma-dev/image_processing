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

export const register = async (req: Request, res: Response) => {
	const { name, email, password, occupation } = req.body as RegisterInput;

	const existingUser = await prisma.user.findUnique({
		where: {
			email,
		},
	});

	if (existingUser) {
		res.status(400).json({
			status: "error",
			message: "User with this email already exists",
		});
		return;
	}

	const verificationToken = crypto.randomBytes(32).toString("hex");
	const verificationTokenExpiry = new Date();
	verificationTokenExpiry.setHours(verificationTokenExpiry.getHours() + 1); // Token valid for 1 hour

	const hashedPassword = await hashPassword(password);

	if (!hashedPassword) {
		res.status(500).json({
			status: "error",
			message: "Error hashing password",
		});
		return;
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

	res.status(201).json({
		status: "success",
		message: "Registration successful",
		data: {
			user,
		},
	});
	return;
};

export const verifyEmail = async (req: Request, res: Response) => {
	const { token } = req.params as VerifyEmailInput;

	const user = await prisma.user.findUnique({
		where: {
			verificationToken: token,
		},
	});

	if (!user) {
		res.status(400).json({
			status: "error",
			message: "Invalid or expired verification token",
		});
		return;
	}

	const currentTime = new Date();
	if (
		user.verificationTokenExpiresAt &&
		user.verificationTokenExpiresAt < currentTime
	) {
		res.status(400).json({
			status: "error",
			message: "Verification token has expired",
		});
		return;
	}
	if (user.isVerified) {
		res.status(400).json({
			status: "error",
			message: "Email is already verified",
		});
		return;
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

	res.status(200).json({
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
		res.status(400).json({
			status: "error",
			message: "Invalid email or password",
		});
		return;
	}
	if (!user.isVerified) {
		res.status(400).json({
			status: "error",
			message: "Email is not verified",
		});
		return;
	}
	const isPasswordValid = await comparePassword(password, user.password);
	if (!isPasswordValid) {
		res.status(400).json({
			status: "error",
			message: "Invalid email or password",
		});
		return;
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
			res.status(400).json({
				status: "error",
				message: "Invalid refresh token",
			});
			return;
		}

		refreshToken = existingToken.refreshToken;
		attachCookiesToResponse(res, tokenUser, refreshToken);
		res.status(200).json({
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

	res.status(200).json({
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

	res.status(200).json({
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
		res.status(400).json({
			status: "error",
			message: "User with this email does not exist",
		});
		return;
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

	res.status(200).json({
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
		res.status(400).json({
			status: "error",
			message: "Invalid or expired password reset token",
		});
		return;
	}

	const currentTime = new Date();
	if (
		user.passwordTokenExpiresAt &&
		user.passwordTokenExpiresAt < currentTime
	) {
		res.status(400).json({
			status: "error",
			message: "Password reset token has expired",
		});
		return;
	}

	const hashedPassword = await hashPassword(password);
	if (!hashedPassword) {
		res.status(500).json({
			status: "error",
			message: "Error hashing password",
		});
		return;
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

	res.status(200).json({
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
		res.status(400).json({
			status: "error",
			message: "User not found",
		});
		return;
	}

	const isCurrentPasswordValid = await comparePassword(
		currentPassword,
		user.password
	);

	if (!isCurrentPasswordValid) {
		res.status(400).json({
			status: "error",
			message: "Current password is incorrect",
		});
		return;
	}

	const hashedNewPassword = await hashPassword(newPassword);
	if (!hashedNewPassword) {
		res.status(500).json({
			status: "error",
			message: "Error hashing new password",
		});
		return;
	}

	await prisma.user.update({
		where: {
			id: user.id,
		},
		data: {
			password: hashedNewPassword,
		},
	});

	res.status(200).json({
		status: "success",
		message: "Password changed successfully",
	});
	return;
};
