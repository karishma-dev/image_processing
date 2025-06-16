import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { AnyZodObject } from "zod";

export const validateRequest = (schema: AnyZodObject) => {
	return async (
		req: Request,
		res: Response,
		next: NextFunction
	): Promise<void> => {
		try {
			await schema.parseAsync(req.body);

			next();
		} catch (error: Error | any) {
			res.status(StatusCodes.BAD_REQUEST).json({
				status: "error",
				message: error instanceof Error ? error.message : "Validation error",
				errors: error.errors || [],
			});
		}
	};
};
