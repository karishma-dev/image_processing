import { isTokenValid } from "../utils/jwt";

export const authenticateWebSocket = (message: string): string | null => {
	try {
		const { accessToken, refreshToken } = JSON.parse(message);
		let userId: string | null = null;
		if (accessToken) {
			const payload = isTokenValid(accessToken);
			userId = payload.user.id || null;
		} else if (refreshToken) {
			const payload = isTokenValid(refreshToken);
			userId = payload.user.id || null;
		}
		return userId;
	} catch (error) {
		return null;
	}
};
