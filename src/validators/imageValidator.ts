import { z } from "zod";

export const resizeImageSchema = z.object({
	id: z.string().cuid(),
	width: z.number().int().positive(),
	height: z.number().int().positive(),
});

export type ResizeImageInput = z.infer<typeof resizeImageSchema>;
