import { z } from "zod";
import { OccupationEnum } from "./enums";

export const registerSchema = z.object({
	name: z.string().min(1, "Name is required"),
	email: z.string().email("Invalid email address"),
	password: z.string().min(8, "Password must be at least 6 characters long"),
	occupation: OccupationEnum.optional().default("OTHER"),
});

export const verifyEmailSchema = z.object({
	token: z.string().min(1, "Token is required"),
});

export const loginSchema = z.object({
	email: z.string().email("Invalid email address"),
	password: z.string().min(8, "Password must be at least 6 characters long"),
});

export const forgotPasswordSchema = z.object({
	email: z.string().email("Invalid email address"),
});

export const resetPasswordSchema = z.object({
	token: z.string().min(1, "Token is required"),
	password: z.string().min(8, "Password must be at least 6 characters long"),
});

export const changePasswordSchema = z.object({
	id: z.string().min(1, "User ID is required"),
	currentPassword: z
		.string()
		.min(8, "Current password must be at least 6 characters long"),
	newPassword: z
		.string()
		.min(8, "New password must be at least 6 characters long"),
});

export const logoutSchema = z.object({
	id: z.string().min(1, "User ID is required"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type LogoutInput = z.infer<typeof logoutSchema>;
