import CustomAPIError from "./custom-api";
import { StatusCodes } from "http-status-codes";

class InternalServerError extends CustomAPIError {
	constructor(message: string) {
		super(message);
		this.statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
	}
}

export default InternalServerError;
