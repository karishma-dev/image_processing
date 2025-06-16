import { NextFunction, Request, Response } from "express";
import * as CustomError from "../errors";
import { attachCookiesToResponse, isTokenValid } from "../utils/jwt";
import prisma from "../utils/client";

interface AccessTokenPayload {
	user: { id: string };
	iat?: number;
	exp?: number;
}

interface RefreshTokenPayload {
	user: { id: string };
	refreshToken: string;
	iat?: number;
	exp?: number;
}

export const authenticateUser = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const { refreshToken, accessToken } = req.signedCookies;

	try {
		if (accessToken) {
			const payload = isTokenValid(accessToken) as AccessTokenPayload;
			if (!payload) {
				throw new CustomError.UnauthenticatedError(
					"Authentication failed. Please log in again."
				);
			}
			req.user = payload.user;
			return next();
		}
		const payload = isTokenValid(refreshToken) as RefreshTokenPayload;

		if (!payload) {
			throw new CustomError.UnauthenticatedError(
				"Authentication failed. Please log in again."
			);
		}

		const existingToken = await prisma.token.findFirst({
			where: {
				refreshToken: payload.refreshToken,
				userId: payload.user.id,
			},
		});
		if (!existingToken || !existingToken.isValid) {
			throw new CustomError.UnauthenticatedError(
				"Authentication failed. Please log in again."
			);
		}

		attachCookiesToResponse(res, payload.user, existingToken.refreshToken);
		req.user = payload.user;
		return next();
	} catch (error) {
		throw new CustomError.UnauthenticatedError(
			"Authentication failed. Please log in again."
		);
	}
};
