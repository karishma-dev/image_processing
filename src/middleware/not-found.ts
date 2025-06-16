import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

const notFound = (req: Request, res: Response): void => {
	res.status(StatusCodes.NOT_FOUND).json({
		status: "error",
		message: "Not Found",
	});
	return;
};

export default notFound;
