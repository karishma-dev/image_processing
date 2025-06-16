import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

interface CustomError extends Error {
	statusCode?: number;
}

const errorHandlerMiddleware = (
	err: CustomError,
	req: Request,
	res: Response,
	next: NextFunction
) => {
	let customError = {
		statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
		message: err.message || "Something went wrong. Please try again later.",
	};

	res.status(customError.statusCode).json({
		status: "error",
		message: customError.message,
	});
	return;
};

export default errorHandlerMiddleware;
