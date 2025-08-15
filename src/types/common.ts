import { Request } from "express";

export interface CustomRequest extends Request {
	user?: { id: string };
}

export interface AccessTokenPayload {
	user: { id: string };
}

export interface RefreshTokenPayload {
	user: { id: string };
	refreshToken: string;
}

export interface CustomError extends Error {
	statusCode?: number;
}
