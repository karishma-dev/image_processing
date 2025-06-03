import jwt from "jsonwebtoken";

export const createTokenUser = (user: { id: string }) => {
	return {
		id: user.id,
	};
};

export const createJWT = ({
	payload,
	lifetime = "1d",
}: {
	payload: object;
	lifetime?: any;
}) => {
	const token = jwt.sign(payload, process.env.JWT_SECRET as string, {
		expiresIn: lifetime,
	});
	return token;
};

export const createRefreshToken = ({ payload }: { payload: object }) => {
	return createJWT({ payload, lifetime: "30d" });
};

export const createAccessToken = ({ payload }: { payload: object }) => {
	return createJWT({ payload, lifetime: "1d" });
};

export const isTokenValid = (token: string) => {
	return jwt.verify(token, process.env.JWT_SECRET);
};

export const attachCookiesToResponse = (
	res: any,
	user: { id: string },
	refreshToken: string
) => {
	const accessTokenJWT = createAccessToken({
		payload: user,
	});
	const refreshTokenJWT = createRefreshToken({
		payload: {
			user,
			refreshToken,
		},
	});

	const oneDay = 1000 * 60 * 60 * 24;
	const oneMonth = 1000 * 60 * 60 * 24 * 30;

	res.cookie("accessToken", accessTokenJWT, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		signed: true,
		expires: new Date(Date.now() + oneDay),
		maxAge: oneDay,
	});

	res.cookie("refreshToken", refreshTokenJWT, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		signed: true,
		expires: new Date(Date.now() + oneMonth),
		maxAge: oneMonth,
	});
};
