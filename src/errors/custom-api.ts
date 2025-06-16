import { StatusCodes } from "http-status-codes";

class CustomAPIError extends Error {
	statusCode: number;

	constructor(error: string | undefined) {
		super(error);
		this.statusCode = StatusCodes.BAD_REQUEST;
	}
}
export default CustomAPIError;
