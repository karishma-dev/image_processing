import { z } from "zod";
import { OccupationEnum } from "./enums";

export const userProfileSchema = z.object({
	id: z.string().min(1, "User ID is required"),
	name: z.string().min(1, "Name is required"),
	email: z.string().email("Invalid email address"),
	occupation: OccupationEnum.optional().default("OTHER"),
});

export const updateUserProfileSchema = userProfileSchema.partial();

export const userByIdSchema = z.object({
	id: z.string().min(1, "User ID is required"),
});

export type UserProfileInput = z.infer<typeof userProfileSchema>;
export type UpdateUserProfileInput = z.infer<typeof updateUserProfileSchema>;
export type UserByIdInput = z.infer<typeof userByIdSchema>;
